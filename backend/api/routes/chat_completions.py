from fastapi import APIRouter, Request
from services.qdrant_service import search_menu
import httpx
import os

router = APIRouter()

@router.post("/api/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    tools = body.get("tools", [])

    # Get latest user message for Qdrant search
    user_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            user_message = msg.get("content", "")
            break

    # Only search Qdrant if there's a user message
    if user_message:
        menu_results = await search_menu(user_message, top_k=3)
    if menu_results:
        menu_context = "\n".join([
            f"- {item['name']}: ₹{item['price']} — {item['description']}"
            for item in menu_results
        ])
        # Append to the existing system message so it's one unified instruction
        if messages and messages[0].get("role") == "system":
            messages[0]["content"] += f"\n\nRelevant menu items from our database (use ONLY these prices):\n{menu_context}"
        else:
            messages.insert(0, {
                "role": "system",
                "content": f"Relevant menu items from our database (use ONLY these prices):\n{menu_context}"
            })

    # Build MiniMax request — pass tools through if present
    request_body = {
        "model": "MiniMax-M2.7",
        "messages": messages,
        "max_tokens": 150,
        "temperature": 0.4,
        "stream": False
    }
    if tools:
        request_body["tools"] = tools

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.minimax.io/v1/text/chatcompletion_v2",
            headers={
                "Authorization": f"Bearer {os.getenv('MINIMAX_API_KEY')}",
                "Content-Type": "application/json"
            },
            json=request_body
        )
        data = response.json()

    # Return in OpenAI format
    choice = data["choices"][0]
    message = choice["message"]

    return {
        "id": "chatcmpl-bolkeorder",
        "object": "chat.completion",
        "choices": [{
            "index": 0,
            "message": message,
            "finish_reason": choice.get("finish_reason", "stop")
        }]
    }