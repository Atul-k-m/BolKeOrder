from fastapi import APIRouter, Request, HTTPException
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/webhook/vapi")
async def vapi_webhook(request: Request):
    payload = await request.json()
    event = payload.get("message", {}).get("type")

    logger.info(f"Received Vapi Event: {event}")

    if event == "call.started":
        # Handle call started
        return {"message": "Call started handled successfully"}
        
    elif event == "call.ended":
        # Trigger intent pipeline
        transcript = payload.get("message", {}).get("transcript", "")
        logger.info(f"Final Transcript: {transcript}")
        return {"message": "Call ended handled successfully"}
        
    elif event == "speech.update":
        # Real-time transcript tracking
        return {"message": "Speech update handled successfully"}

    return {"message": "Event ignored", "event": event}
