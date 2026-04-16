import strawberry
from typing import List

@strawberry.type
class PlatformType:
    id: str
    name: str

@strawberry.type
class PriceDetailType:
    platform: PlatformType
    price: float

@strawberry.type
class PriceComparisonType:
    item_name: str
    prices: List[PriceDetailType]
    best_platform: str
    best_price: float
