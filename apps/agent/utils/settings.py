from typing import Annotated
from uuid import UUID

from pydantic import AfterValidator, Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


def _validate_openai_api_key(v: str | None) -> str | None:
    """Validate that the OpenAI API key starts with 'sk-proj-'."""
    if v and not v.startswith("sk-proj-"):
        raise ValueError("OpenAI API key must start with 'sk-proj-'")
    return v


def _validate_exa_api_key(v: str | None) -> str | None:
    """Validate that the Exa API key is a valid UUID4."""
    if v:
        try:
            UUID(v, version=4)
        except ValueError:
            raise ValueError("Exa API key must be a valid UUID4") from None
    return v


OpenAIAPIKey = Annotated[str | None, AfterValidator(_validate_openai_api_key)]
ExaAPIKey = Annotated[str | None, AfterValidator(_validate_exa_api_key)]


class Settings(BaseSettings):
    """Manages application settings and environment variables."""

    openai_api_key: OpenAIAPIKey = Field(default=None, alias="OPENAI_API_KEY")
    exa_api_key: ExaAPIKey = Field(default=None, alias="EXA_API_KEY")
    database_url: PostgresDsn | None = Field(default=None, alias="DATABASE_URL")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
