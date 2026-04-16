class LLMService:
    @staticmethod
    async def extract_intent(transcript: str, language: str = "english") -> dict:
        """
        Mock intent extraction. In production, this uses GPT-4o or Gemini.
        """
        # Mock payload returned to simulate food order intent
        return {
            "intent": "place_order",
            "entities": {
                "restaurant": "Meghana Foods",
                "items": ["Chicken Biryani", "Naan"],
                "quantities": [1, 2]
            },
            "confidence": 0.95
        }
