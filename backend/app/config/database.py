from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError
from app.config.settings import settings
from app.config.memory_db import MemoryDatabase

_client: Optional[MongoClient] = None
_db = None
_using_memory = False


def connect_db():
    global _client, _db, _using_memory
    try:
        client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=1500)
        client.admin.command("ping")
        _client = client
        _db = _client[settings.database_name]
        _db.readings.create_index([("device_id", 1), ("timestamp", -1)])
        _db.readings.create_index("timestamp")
        _db.users.create_index("email", unique=True)
        _using_memory = False
        print(f"[OK] Connected to MongoDB: {settings.database_name}")
    except (PyMongoError, Exception) as exc:
        _client = None
        _db = MemoryDatabase(settings.database_name)
        _using_memory = True
        print(f"[WARN] MongoDB unavailable ({exc}). Using in-memory store for demo.")


def disconnect_db():
    global _client
    if _client:
        _client.close()
        print("[OK] MongoDB disconnected")


def get_db():
    if _db is None:
        raise RuntimeError("Database not initialised. Call connect_db() first.")
    return _db


def is_memory_db() -> bool:
    return _using_memory
