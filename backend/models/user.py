from sqlalchemy import Column, String, JSON, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from models.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    lang_pref = Column(String, default="english")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Stores flags like: { "vision_impaired": True, "elderly_mode": True }
    accessibility_flags = Column(JSON, default=dict)
    
    # Store settings like speed, volume, dialect
    preferences = Column(JSON, default=dict)
