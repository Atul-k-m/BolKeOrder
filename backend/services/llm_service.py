import httpx
import logging
from config import settings
from services.qdrant_service import search_menu

logger = logging.getLogger(__name__)

MINIMAX_API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2"

SYSTEM_PROMPT = """
You are BolkeOrder, a friendly voice assistant for taking food orders at a restaurant.

Your rules:
- Keep responses SHORT and conversational — under 60 words. This is voice.
- When customer mentions a food item, confirm the name and price clearly.
- Always ask "Anything else?" after adding an item.
- When customer says "that's all" or "confirm" or "done", summarize the order and total.
- Be warm and helpful. Speak naturally.
- Never make up items or prices. Only use what's in the menu context.
- If item is not found, say sorry and suggest similar items from the menu.
"""


async def extract_intent(transcript: str, language: str = "english") -> dict:
    """
    Real intent extraction using MiniMax M2.7 + Qdrant menu search.
    """
    # Step 1: Search Qdrant for relevant menu items
    menu_results = await search_menu(transcript, top_k=3)

    # Step 2: Build context from search results
    if menu_results:
        menu_context = "\n".join([
            f"- {item['name']}: ₹{item['price']} — {item['description']}"
            for item in menu_results
        ])
    else:
        menu_context = "No matching items found in menu."

    # Step 3: Call MiniMax M2.7
    user_prompt = f"""
Menu items relevant to customer's request:
{menu_context}

Customer said: "{transcript}"

Respond as the BolkeOrder voice assistant.
"""

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            MINIMAX_API_URL,
            headers={
                "Authorization": f"Bearer {settings.minimax_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "MiniMax-M2.7",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": 100,
                "temperature": 0.4
            }
        )
        response.raise_for_status()
        data = response.json()

    reply = data["choices"][0]["message"]["content"]

    return {
        "intent": "place_order",
        "response": reply,
        "matched_items": menu_results,
        "confidence": menu_results[0]["score"] if menu_results else 0.0
    }