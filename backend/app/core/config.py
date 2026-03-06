from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str = "your_openai_api_key_here"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }


settings = Settings()