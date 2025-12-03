# app/config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    PORT = int(os.getenv("PORT", 8000))
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    POSTGRES_USERNAME = os.getenv("POSTGRES_USERNAME", "postgres")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOSTNAME = os.getenv("POSTGRES_HOSTNAME", "localhost")
    POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5432))
    DATABASE_NAME = os.getenv("DATABASE_NAME", "tododb")
    SESSION_SECRET = os.getenv("SESSION_SECRET", "secret")

    @property
    def db_url(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USERNAME}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOSTNAME}:"
            f"{self.POSTGRES_PORT}/{self.DATABASE_NAME}"
        )

settings = Settings()
