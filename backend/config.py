from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    app_env: str = "development"
    secret_key: str = "your-secret-key-here"
    allowed_origins: str = "http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/bolkeorder"
    redis_url: str = "redis://localhost:6379"

    # Vapi
    vapi_api_key: Optional[str] = None
    vapi_webhook_secret: Optional[str] = None
    vapi_phone_number_id: Optional[str] = None

    # LLM
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    gemini_api_key: Optional[str] = None

    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None

    # External APIs
    swiggy_api_key: str = "mock"
    zomato_api_key: str = "mock"
    zepto_api_key: str = "mock"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
