import strawberry
from typing import List
from graphql_schema.types.platform import PriceComparisonType, PriceDetailType, PlatformType
import random

MOCK_PLATFORMS = [
    PlatformType(id="zomato", name="Zomato"),
    PlatformType(id="swiggy", name="Swiggy"),
    PlatformType(id="zepto", name="Zepto")
]

BASE_PRICES = {
    "chicken biryani": 250.0,
    "butter naan": 45.0,
    "masala dosa": 80.0,
    "dal makhani": 180.0,
    "filter coffee": 30.0
}

@strawberry.type
class PlatformQuery:
    @strawberry.field
    def compare_prices(self, items: List[str]) -> List[PriceComparisonType]:
        results = []
        for item in items:
            item_lower = item.lower()
            base_price = BASE_PRICES.get(item_lower, 100.0)
            
            prices = []
            best_price = float('inf')
            best_platform = ""
            
            for platform in MOCK_PLATFORMS:
                # Add some random variance to mock different platforms
                variance = random.uniform(-0.15, 0.15)
                # Ensure Zomato and Swiggy are the main contenders
                if platform.id == "zepto":
                    variance += 0.2 # Zepto is usually more expensive for restaurant food
                    
                price = round(base_price * (1 + variance))
                prices.append(PriceDetailType(platform=platform, price=price))
                
                if price < best_price:
                    best_price = price
                    best_platform = platform.name
            
            results.append(PriceComparisonType(
                item_name=item,
                prices=prices,
                best_platform=best_platform,
                best_price=best_price
            ))
            
        return results
