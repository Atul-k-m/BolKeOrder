import strawberry
from typing import Optional
from graphql_schema.types.user import UserType

@strawberry.type
class UserQuery:
    @strawberry.field
    async def get_user(self, id: str) -> Optional[UserType]:
        # TODO: Implement DB session retrieval
        # Mock for now
        return UserType(id=id, phone="+919876543210", name="Test User", email="test@bko.com", lang_pref="english", created_at="2026-04-16T00:00:00")
