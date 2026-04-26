"""
intent_agent.py — BolKeOrder
Multi-step intent pipeline using Gemini 2.0 Flash.
Steps: detect language → extract entities → find gaps → build reply
"""

import json
import logging
import re
from typing import Any

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from config import settings

logger = logging.getLogger(__name__)

# Configure Gemini once at import
genai.configure(api_key=settings.gemini_api_key)


# ---------------------------------------------------------------------------
# Token budget guard — prevents runaway costs per call session
# ---------------------------------------------------------------------------
MAX_TOKENS_PER_SESSION = 2000
_session_token_usage: dict[str, int] = {}


def _check_token_budget(call_id: str, used: int) -> None:
    _session_token_usage[call_id] = _session_token_usage.get(call_id, 0) + used
    if _session_token_usage[call_id] > MAX_TOKENS_PER_SESSION:
        logger.warning(f"[{call_id}] Token budget exceeded: {_session_token_usage[call_id]}")
        raise BudgetExceededError(call_id)


class BudgetExceededError(Exception):
    def __init__(self, call_id: str):
        self.call_id = call_id


# ---------------------------------------------------------------------------
# Gemini call wrapper with retry + circuit breaker
# ---------------------------------------------------------------------------
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(min=1, max=8),
    retry=retry_if_exception_type(Exception),
    reraise=False,
)
def _call_gemini(prompt: str, max_tokens: int = 400) -> str:
    """Call Gemini Flash with retries. Returns raw text."""
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.2,
        ),
    )
    response = model.generate_content(prompt)
    return response.text or ""


# ---------------------------------------------------------------------------
# Step 1: Lightweight language detection (no LLM needed for most cases)
# ---------------------------------------------------------------------------
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
_COMMON_HINDI = {
    "mujhe", "chahiye", "karo", "hai", "hain", "kya", "nahi",
    "ek", "do", "teen", "aur", "se", "ka", "ki", "ke", "bhi",
    "order", "karna", "lena", "dena", "batao", "theek", "acha",
}


def detect_language(text: str) -> str:
    """Returns 'hi', 'en', or 'hinglish'."""
    if _DEVANAGARI_RE.search(text):
        return "hi"
    words = set(text.lower().split())
    hindi_hits = len(words & _COMMON_HINDI)
    if hindi_hits >= 2:
        return "hinglish"
    if hindi_hits == 1:
        return "hinglish"
    return "en"


# ---------------------------------------------------------------------------
# Step 2: Entity extraction via Gemini (structured JSON output)
# ---------------------------------------------------------------------------
_EXTRACT_PROMPT = """
You are an order extraction engine for an Indian food delivery service.

Extract structured data from the user's voice message. Respond with ONLY valid JSON.
No markdown, no explanation. If a field is unknown, use null.

User message: "{transcript}"

Required JSON format:
{{
  "items": [
    {{"name": "item name in English", "qty": 1, "unit": null}}
  ],
  "restaurant": "restaurant name or null",
  "delivery_address": "address or null",
  "is_repeat_order": false,
  "special_instructions": null,
  "detected_language": "hi|en|hinglish"
}}
""".strip()


def _extract_entities(transcript: str) -> dict[str, Any]:
    prompt = _EXTRACT_PROMPT.format(transcript=transcript)
    raw = _call_gemini(prompt, max_tokens=300)

    # Strip markdown fences if Gemini adds them
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning(f"Gemini returned non-JSON: {raw[:200]}")
        return {
            "items": [],
            "restaurant": None,
            "delivery_address": None,
            "is_repeat_order": False,
            "special_instructions": None,
            "detected_language": detect_language(transcript),
        }


# ---------------------------------------------------------------------------
# Step 3: Gap detection — what slots are still missing?
# ---------------------------------------------------------------------------
def _find_missing_slots(slots: dict[str, Any]) -> list[str]:
    missing = []
    if not slots.get("items"):
        missing.append("items")
    if not slots.get("restaurant"):
        missing.append("restaurant")
    if not slots.get("delivery_address"):
        missing.append("delivery_address")
    return missing


# ---------------------------------------------------------------------------
# Step 4: Build assistant reply (short, natural, in the right language)
# ---------------------------------------------------------------------------
_REPLY_PROMPT = """
You are a warm Indian food delivery call center agent.
Speak in {language}. Max 2 sentences. Never sound robotic.

Current order state:
{slots_json}

Missing information: {missing}

Generate the next thing the agent should SAY on the phone.
Rules:
- Ask for only ONE missing piece of information
- If nothing is missing, confirm the order back to the user and ask them to say "haan" to confirm
- Keep it under 20 words
- Use Hinglish naturally (mix Hindi and English)
- Do NOT use bullet points or lists
""".strip()


def _build_reply(slots: dict[str, Any], missing: list[str], language: str) -> str:
    if not missing:
        items_str = ", ".join(
            f"{i.get('qty', 1)} {i.get('name', '')}" for i in (slots.get("items") or [])
        )
        restaurant = slots.get("restaurant", "")
        address = slots.get("delivery_address", "")
        return (
            f"Theek hai — {items_str} from {restaurant}, "
            f"{address} pe delivery. Confirm karna hai?"
        )

    prompt = _REPLY_PROMPT.format(
        language="Hinglish (mix of Hindi and English)" if language != "en" else "English",
        slots_json=json.dumps(slots, ensure_ascii=False),
        missing=", ".join(missing),
    )
    reply = _call_gemini(prompt, max_tokens=80)
    return reply.strip() or "Kya order karna chahte hain aap?"


# ---------------------------------------------------------------------------
# Public interface: IntentAgent
# ---------------------------------------------------------------------------
class IntentAgent:
    """
    Orchestrates the full intent pipeline for one user turn.
    Call `run()` with the latest user transcript and current session.
    """

    async def run(self, transcript: str, session: dict[str, Any]) -> dict[str, Any]:
        print("\n" + "="*60)
        print(f"🧠 [BACKEND LOG] INTENT AGENT RUNNING ON TRANSCRIPT: {transcript}")
        print("="*60 + "\n")
        call_id = session.get("call_id", "unknown")

        try:
            # Step 1: Detect language
            lang = detect_language(transcript)
            logger.info(f"[{call_id}] Detected language: {lang}")

            # Step 2: Extract entities from this turn
            extracted = _extract_entities(transcript)
            token_estimate = len(transcript.split()) * 2  # rough estimate
            _check_token_budget(call_id, token_estimate)

            # Step 3: Merge with existing session slots (don't overwrite good data)
            existing_slots = session.get("slots", {})
            merged_slots = {**existing_slots}
            if extracted.get("items"):
                merged_slots["items"] = extracted["items"]
            if extracted.get("restaurant"):
                merged_slots["restaurant"] = extracted["restaurant"]
            if extracted.get("delivery_address"):
                merged_slots["delivery_address"] = extracted["delivery_address"]
            if extracted.get("special_instructions"):
                merged_slots["special_instructions"] = extracted["special_instructions"]

            # Step 4: Find gaps
            missing = _find_missing_slots(merged_slots)

            # Step 5: Build reply
            reply = _build_reply(merged_slots, missing, lang)

            is_complete = len(missing) == 0

            logger.info(
                f"[{call_id}] Slots: {merged_slots} | Missing: {missing} | Complete: {is_complete}"
            )

            return {
                "slots":           merged_slots,
                "missing":         missing,
                "is_complete":     is_complete,
                "assistant_reply": reply,
                "language":        lang,
            }

        except BudgetExceededError:
            return {
                "slots":           session.get("slots", {}),
                "missing":         [],
                "is_complete":     False,
                "assistant_reply": (
                    "Maafi chahta hoon, abhi kuch takneeki samasya aa gayi. "
                    "Kripya thodi der mein dobara call karein."
                ),
                "language":        "hinglish",
            }

        except Exception as e:
            logger.error(f"[{call_id}] IntentAgent error: {e}", exc_info=True)
            return {
                "slots":           session.get("slots", {}),
                "missing":         ["items"],
                "is_complete":     False,
                "assistant_reply": "Zara dubara bata sakte hain? Samajh nahi aaya.",
                "language":        "hinglish",
            }