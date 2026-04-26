"""
custom_llm.py — BolKeOrder
Exposes an OpenAI-compatible /chat/completions endpoint so Vapi can
use your Gemini backend as a "custom LLM provider".

Mount this router at: /api/v1/chat
Vapi model config:
  provider: "custom-llm"
  url: "https://YOUR_BACKEND/api/v1/chat"
"""

import json
import logging
import time
import uuid
from typing import AsyncIterator

import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

genai.configure(api_key=settings.gemini_api_key)


# ---------------------------------------------------------------------------
# Request/response models (OpenAI-compatible schema that Vapi expects)
# ---------------------------------------------------------------------------
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str = "gemini-2.0-flash"
    messages: list[Message]
    stream: bool = True
    max_tokens: int = 150
    temperature: float = 0.3


# ---------------------------------------------------------------------------
# Streaming response generator
# ---------------------------------------------------------------------------
async def _stream_gemini(messages: list[Message], max_tokens: int, temperature: float) -> AsyncIterator[str]:
    """Convert Vapi's OpenAI message format → Gemini → stream SSE chunks."""
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        ),
    )

    # Separate system prompt from conversation history
    system_prompt = ""
    history = []
    for msg in messages:
        if msg.role == "system":
            system_prompt = msg.content
        elif msg.role == "user":
            history.append({"role": "user", "parts": [msg.content]})
        elif msg.role == "assistant":
            history.append({"role": "model", "parts": [msg.content]})

    # Prepend system prompt to first user message if present
    if system_prompt and history and history[0]["role"] == "user":
        history[0]["parts"][0] = f"{system_prompt}\n\n{history[0]['parts'][0]}"

    # Last message is the current user turn
    last_user = history.pop() if history and history[-1]["role"] == "user" else None
    if not last_user:
        yield _sse_done()
        return

    chat = model.start_chat(history=history)
    response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
    created = int(time.time())

    try:
        # Stream Gemini response
        for chunk in chat.send_message(last_user["parts"][0], stream=True):
            text = chunk.text or ""
            if text:
                data = {
                    "id": response_id,
                    "object": "chat.completion.chunk",
                    "created": created,
                    "model": "gemini-2.0-flash",
                    "choices": [{
                        "index": 0,
                        "delta": {"role": "assistant", "content": text},
                        "finish_reason": None,
                    }],
                }
                yield f"data: {json.dumps(data)}\n\n"

        # Send final chunk
        final = {
            "id": response_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": "gemini-2.0-flash",
            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
        }
        yield f"data: {json.dumps(final)}\n\n"
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Gemini streaming error: {e}", exc_info=True)
        # Graceful fallback — Vapi needs SOMETHING back
        fallback = {
            "id": response_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": "gemini-2.0-flash",
            "choices": [{
                "index": 0,
                "delta": {"role": "assistant", "content": "Ek second, thoda problem hai."},
                "finish_reason": "stop",
            }],
        }
        yield f"data: {json.dumps(fallback)}\n\n"
        yield "data: [DONE]\n\n"


def _sse_done() -> str:
    return "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.post("/chat/completions")
async def chat_completions(req: ChatRequest):
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    if req.stream:
        return StreamingResponse(
            _stream_gemini(req.messages, req.max_tokens, req.temperature),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",  # disable nginx buffering
            },
        )

    # Non-streaming fallback
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=req.max_tokens,
            temperature=req.temperature,
        ),
    )
    last_user = next(
        (m.content for m in reversed(req.messages) if m.role == "user"), ""
    )
    response = model.generate_content(last_user)
    text = response.text or ""
    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "model": "gemini-2.0-flash",
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": text},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }