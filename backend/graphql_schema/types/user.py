import strawberry
from typing import Optional
from datetime import datetime

@strawberry.type
class UserType:
    id: str
    phone: str
    name: Optional[str]
    email: Optional[str]
    lang_pref: str
    created_at: datetime
    # Further properties skipped for brevity for MVP
