import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

import jwt
from app.config.settings import settings


# ─── Password hashing (using hashlib sha256 + salt — no bcrypt dependency needed) ───

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(plain: str, hashed_stored: str) -> bool:
    try:
        salt, hashed = hashed_stored.split(":")
        check = hashlib.sha256((salt + plain).encode()).hexdigest()
        return hmac.compare_digest(check, hashed)
    except Exception:
        return False


# ─── JWT ───

def create_access_token(payload: dict, expires_minutes: Optional[int] = None) -> str:
    data = payload.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes or settings.jwt_expire_minutes
    )
    data["exp"] = expire
    return jwt.encode(data, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
