from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Cấu hình bảo mật JWT và Multi-tenant
    SECRET_KEY: str = "super-secret-key-smarttax-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 giờ
    
    # Supabase / PostgreSQL Credentials
    SUPABASE_URL: str = "https://zdfutrckmadorhrmzsaz.supabase.co"
    SUPABASE_KEY: str = "your-supabase-anon-key"
    DATABASE_URL: Optional[str] = None
    
    # Telegram Bot Alerts (Hobby 0đ Notifications)
    TELEGRAM_BOT_TOKEN: Optional[str] = "7234567890:AAH-MockTokenForDemoAlertsTax"
    TELEGRAM_CHAT_ID: Optional[str] = "123456789"
    
    # LLM & RAG Configuration
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
