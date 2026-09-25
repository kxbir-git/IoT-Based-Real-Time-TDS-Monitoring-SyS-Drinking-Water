from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://127.0.0.1:27017"
    database_name: str = "aquasense"
    jwt_secret: str = "replace-with-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours
    frontend_url: str = "http://localhost:5173"

    # Sensor thresholds for alerts
    ph_min: float = 6.5
    ph_max: float = 8.5
    tds_max: float = 500.0       # mg/L
    turbidity_max: float = 4.0   # NTU
    temperature_min: float = 10.0
    temperature_max: float = 35.0
    do_min: float = 6.0          # mg/L

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
