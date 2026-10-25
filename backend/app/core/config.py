from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = Field(min_length=1)
    SECRET_KEY: str = Field(min_length=1)
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    @field_validator("DATABASE_URL")
    @classmethod
    def postgres_driver(cls, value):
        for prefix in ("postgresql://", "postgres://"):
            if value.startswith(prefix):
                return "postgresql+psycopg2://" + value[len(prefix):]
        return value

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
