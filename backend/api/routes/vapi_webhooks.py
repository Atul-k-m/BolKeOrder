"""
vapi_webhooks.py — BolKeOrder
Handles all Vapi event types with HMAC verification, rate limiting,
and a real-time speech pipeline using Gemini.
"""

import hmac
import hashlib
import logging
import time
from collections import defaultdict
from fastapi import APIRouter, Request, HTTPException, Depends
from config import settings
from agents.intent_agent import IntentAgent

from core.session_store import get_session, save_session

logger = logging.getLogger(__name__)
router = APIRouter()
intent_agent = IntentAgent()

# ---------------------------------------------------------------------------
# Simple in-memory rate limiter (replace with Redis in production)
# ---------------------------------------------------------------------------
_rate_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 60   # seconds
RATE_LIMIT_MAX    = 120  # requests per window per IP


def _check_rate_limit(ip: str) -> None:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    hits = [t for t in _rate_store[ip] if t > window_start]
    if len(hits) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    hits.append(now)
    _rate_store[ip] = hits


# ---------------------------------------------------------------------------
# HMAC signature verification
# ---------------------------------------------------------------------------
async def verify_vapi_signature(request: Request) -> bytes:
    print("\n" + "="*60)
    print("🚀 [BACKEND LOG] VAPI WEBHOOK REQUEST RECEIVED!")
    print("="*60 + "\n")
    body = await request.body()
    if settings.vapi_webhook_secret:
        sig = request.headers.get("x-vapi-signature", "")
        expected = hmac.new(
            settings.vapi_webhook_secret.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(sig, expected):
            logger.warning("Vapi HMAC verification failed")
            raise HTTPException(status_code=403, detail="Invalid signature")
    return body


# ---------------------------------------------------------------------------
# Main webhook endpoint
# ---------------------------------------------------------------------------
@router.get("/webhook/vapi")
async def vapi_webhook_get():
    return {"status": "ok", "message": "Vapi webhook endpoint is active. Use POST for events."}

@router.post("/webhook/vapi")
async def vapi_webhook(request: Request, body: bytes = Depends(verify_vapi_signature)):
    print("\n" + "="*60)
    print("🚀 [BACKEND LOG] VAPI WEBHOOK ENDPOINT EXECUTING!")
    print("="*60 + "\n")
    # Rate limit by client IP
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    import json
    payload = json.loads(body)
    message  = payload.get("message", {})
    event    = message.get("type", "")
    call_id  = message.get("call", {}).get("id", "unknown")

    logger.info(f"[{call_id}] Vapi event: {event}")

    # -----------------------------------------------------------------------
    # call.started — greet and initialise session
    # -----------------------------------------------------------------------
    if event == "call.started":
        session = {
            "call_id":    call_id,
            "started_at": time.time(),
            "transcript_parts": [],
            "slots": {},
            "turn_count": 0,
        }
        await save_session(call_id, session)
        logger.info(f"[{call_id}] Session initialised")
        return {"message": "ok"}

    # -----------------------------------------------------------------------
    # assistant-request — Vapi asks us what the assistant should say NEXT.
    # This is the real-time hook that makes it feel like a live call.
    # -----------------------------------------------------------------------
    elif event == "assistant-request":
        # Vapi sends this at call start asking for assistant config.
        # Return full assistant config so every call uses fresh settings.
        return _build_assistant_config()

    # -----------------------------------------------------------------------
    # function-call — user triggered a tool (e.g. confirm_order)
    # -----------------------------------------------------------------------
    elif event == "function-call":
        fn_name = message.get("functionCall", {}).get("name", "")
        fn_params = message.get("functionCall", {}).get("parameters", {})
        session = await get_session(call_id)

        if fn_name == "extract_order_intent":
            result = await intent_agent.run(
                transcript=fn_params.get("transcript", ""),
                session=session or {},
            )
            session = session or {}
            session["slots"].update(result.get("slots", {}))
            session["turn_count"] = session.get("turn_count", 0) + 1
            await save_session(call_id, session)

            return {
                "result": result.get("assistant_reply", "Ek second, samajh raha hoon...")
            }

        if fn_name == "confirm_order":
            # Trigger actual order placement pipeline here
            logger.info(f"[{call_id}] Order confirmed: {fn_params}")
            return {"result": "Aapka order place ho gaya! Delivery 30-45 minutes mein aayegi."}

        return {"result": ""}

    # -----------------------------------------------------------------------
    # speech-update — accumulate real-time partial transcript for logging
    # -----------------------------------------------------------------------
    elif event == "speech-update":
        role      = message.get("role", "")
        status    = message.get("status", "")
        if role == "user" and status == "stopped":
            transcript = message.get("transcript", "")
            session = await get_session(call_id)
            if session and transcript:
                session.setdefault("transcript_parts", []).append(transcript)
                await save_session(call_id, session)
        return {"message": "ok"}

    # -----------------------------------------------------------------------
    # transcript — full turn transcript (after user finishes speaking)
    # -----------------------------------------------------------------------
    elif event == "transcript":
        role = message.get("role", "")
        text = message.get("transcript", "")
        if role == "user" and text:
            logger.info(f"[{call_id}] User said: {text}")
        return {"message": "ok"}

    # -----------------------------------------------------------------------
    # call.ended — persist final transcript, cleanup
    # -----------------------------------------------------------------------
    elif event == "call-end":
        session = await get_session(call_id)
        artifact = message.get("artifact", {})
        full_transcript = artifact.get("transcript", "")
        logger.info(f"[{call_id}] Call ended. Transcript length: {len(full_transcript)}")
        # TODO: persist to DB, trigger post-call analytics
        return {"message": "ok"}

    logger.debug(f"[{call_id}] Unhandled event: {event}")
    return {"message": "ignored"}


# ---------------------------------------------------------------------------
# Vapi assistant config — the heart of the call feel
# ---------------------------------------------------------------------------
def _build_assistant_config() -> dict:
    """
    Returns a full Vapi assistant config that makes BolKeOrder feel like
    a real Indian call-center agent, not a chatbot.
    """
    return {
        "assistant": {
            # --- Identity ---
            "name": "BolKeOrder Assistant",
            "firstMessage": (
                "Namaste! Main BolKeOrder se bol raha hoon. "
                "Aaj aap kya order karna chahte hain?"
            ),
            "firstMessageMode": "assistant-speaks-first",

            # --- Voice (Indian accent) ---
            # Option 1: ElevenLabs with Indian voice
            "voice": {
                "provider": "11labs",
                "voiceId": "pNInz6obpgDQGcFmaJgB",  # swap with Sarvam or Hindi voice ID
                "stability": 0.4,
                "similarityBoost": 0.8,
                "speed": 1.1,          # slightly faster = more natural call pace
                "style": 0.2,
            },

            # --- Speech-to-text (must support Hindi) ---
            "transcriber": {
                "provider": "deepgram",
                "model": "nova-2",
                "language": "hi",       # Hindi primary; Deepgram handles Hinglish well
                "smartFormat": True,
                "keywords": [           # boost delivery-related words
                    "biryani", "pizza", "burger", "chai", "dosa",
                    "Zomato", "Swiggy", "Zepto", "order", "delivery",
                    "ghar", "address", "cancel", "confirm",
                ],
            },

            # --- LLM (your Gemini backend via server-url) ---
            # Vapi will call YOUR backend for the LLM response.
            # This lets you use Gemini instead of OpenAI.
            "model": {
                "provider": "custom-llm",
                "url": "https://bathymetric-lightheadedly-cliff.ngrok-free.dev/api/v1/chat",  # update this
                "model": "gemini-2.0-flash",
                "temperature": 0.3,   # low = consistent, predictable ordering flow
                "maxTokens": 150,     # keep responses SHORT for a call
                "systemPrompt": _system_prompt(),
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "extract_order_intent",
                            "description": (
                                "Call this whenever the user mentions food, restaurant, "
                                "or wants to place/modify an order."
                            ),
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "transcript": {
                                        "type": "string",
                                        "description": "The user's message verbatim",
                                    }
                                },
                                "required": ["transcript"],
                            },
                        },
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "confirm_order",
                            "description": "Call this when the user confirms their order.",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "items":      {"type": "string"},
                                    "restaurant": {"type": "string"},
                                    "address":    {"type": "string"},
                                },
                                "required": ["items", "restaurant", "address"],
                            },
                        },
                    },
                ],
            },

            # --- Call feel tweaks (the most important section) ---
            "silenceTimeoutSeconds": 8,          # hang up after 8s of silence
            "maxDurationSeconds": 300,            # 5 min max call
            "backgroundDenoisingEnabled": True,
            "modelOutputInRealtime": True,        # stream response as it's generated

            # Backchannel = "haan", "theek hai" while thinking — CRITICAL for call feel
            "backchannel": {
                "enabled": True,
                "responses": [
                    "haan",
                    "theek hai",
                    "ek second",
                    "samajh gaya",
                    "acha",
                    "ji haan",
                ],
            },

            # End-of-speech detection — lower = more responsive, less awkward silences
            "endpointing": {
                "type": "VAD",
                "threshold": 0.6,
                "silenceDurationMs": 400,    # cut off after 400ms silence
            },

            # Allow user to interrupt the assistant mid-sentence
            "clientMessages": ["transcript", "function-call", "speech-update"],
            "serverMessages": [
                "assistant-request",
                "function-call",
                "speech-update",
                "transcript",
                "call-end",
            ],
        }
    }


def _system_prompt() -> str:
    return """
Tu BolKeOrder ka voice assistant hai. Tera kaam hai Indian users ki food delivery 
orders lena — phone call pe, Hindi ya Hinglish mein.

## Personality
- Tu ek helpful, warm Indian call center agent hai
- Chhoti, natural sentences use kar — max 2 sentences per response
- Kabhi "I am an AI" mat bol
- Filler words use kar jaise "theek hai", "bilkul", "ek second"

## Ordering Flow
1. Pehle poochh: kya order karna hai?
2. Phir: kaunse restaurant se? (agar nahi bataya)
3. Phir: delivery address confirm karo
4. Finally: repeat order back + confirm karo

## Rules
- Ek baar mein ek hi sawaal poochh
- Short rakho — yeh ek phone call hai, essay nahi
- Agar samajh nahi aaya: "Zara dubara bata sakte hain?"
- Numbers Hindi mein bol: "teen sau chalis rupaye"
- Kabhi English-only mat bolo — Hinglish preferred

## Examples
User: "mujhe biryani chahiye"
You: "Bilkul! Kaunse restaurant se mangwana hai?"

User: "Meghana Foods se"  
You: "Theek hai — Meghana Foods ki biryani. Aur kuch chahiye, ya sirf yahi?"

User: "bas yahi"
You: "Delivery kahan karni hai?"
""".strip()