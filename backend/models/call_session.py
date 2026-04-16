from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey
from datetime import datetime
import uuid
from models.database import Base

class CallSession(Base):
    __tablename__ = "call_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    vapi_call_id = Column(String, unique=True, index=True)
    duration_secs = Column(Integer, default=0)
    transcript = Column(String, nullable=True)
    intent = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)
    language = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
