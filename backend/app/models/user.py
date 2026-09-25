"""
MongoDB document helpers for User collection.
We store documents as plain dicts; these are schema reference definitions.
"""
from datetime import datetime


def new_user_doc(email: str, hashed_password: str, name: str) -> dict:
    return {
        "email": email.lower().strip(),
        "hashed_password": hashed_password,
        "name": name,
        "role": "user",
        "created_at": datetime.utcnow(),
        "devices": [],
    }
