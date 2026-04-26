# from fastapi import APIRouter, Request
# from services.llm_service import extract_intent
# import logging

# logger = logging.getLogger(__name__)
# router = APIRouter()

# @router.post("/webhook/vapi")
# async def vapi_webhook(request: Request):
#     payload = await request.json()
#     event = payload.get("message", {}).get("type")

#     logger.info(f"Received Vapi Event: {event}")

#     if event == "call.started":
#         return {"message": "Call started handled successfully"}

#     elif event == "call.ended":
#         transcript = payload.get("message", {}).get("transcript", "")
#         logger.info(f"Final Transcript: {transcript}")
#         return {"message": "Call ended handled successfully"}

#     elif event == "speech.update":
#         # Real-time: extract transcript and run through Qdrant + MiniMax
#         transcript = payload.get("message", {}).get("transcript", "")

#         if not transcript:
#             return {"response": "Sorry, I didn't catch that."}

#         result = await extract_intent(transcript)

#         logger.info(f"Matched items: {result['matched_items']}")

#         # Return response to Vapi — it will speak this back to customer
#         return {"response": result["response"]}

#     return {"message": "Event ignored", "event": event}

from fastapi import APIRouter, Request
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
async def vapi_webhook(request: Request):
    try:
        payload = await request.json()
        event = payload.get("message", {}).get("type", "unknown")
        logger.info(f"Vapi webhook: {event}")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "ok"}