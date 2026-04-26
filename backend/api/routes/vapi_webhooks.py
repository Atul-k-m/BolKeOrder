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

logger = logging.getLogger(__name__)
router = APIRouter()

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