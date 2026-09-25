"""Seed a demo user and historical sensor readings so the UI is never empty."""
from datetime import datetime, timedelta
import random

from app.config.database import get_db
from app.services.auth_service import hash_password
from app.models.user import new_user_doc
from app.ml.predictor import predict
from app.services.reading_service import _check_alerts
from bson import ObjectId

DEMO_EMAIL = "admin@aquasense.io"
DEMO_PASSWORD = "admin123"
DEMO_NAME = "Aqua Admin"

DEVICES = [
    {"id": "esp32-001", "location": "Main Tank"},
    {"id": "esp32-002", "location": "Rooftop Reservoir"},
]


def _make_sample(i: int, device: dict) -> dict:
    unsafe = i % 9 == 0
    if unsafe:
        ph = round(random.choice([5.2, 5.8, 9.1, 9.4]), 2)
        tds = round(random.uniform(620, 980), 1)
        turbidity = round(random.uniform(5.2, 14.0), 2)
        temperature = round(random.choice([8.5, 38.2, 41.0]), 1)
        do_level = round(random.uniform(2.0, 5.5), 1)
    else:
        ph = round(random.uniform(6.7, 8.1), 2)
        tds = round(random.uniform(120, 380), 1)
        turbidity = round(random.uniform(0.4, 3.2), 2)
        temperature = round(random.uniform(18, 28), 1)
        do_level = round(random.uniform(6.5, 9.5), 1)

    quality, confidence = predict(ph, tds, turbidity, temperature, do_level)
    ts = datetime.utcnow() - timedelta(minutes=15 * i)
    return {
        "_id": ObjectId(),
        "device_id": device["id"],
        "ph": ph,
        "tds": tds,
        "turbidity": turbidity,
        "temperature": temperature,
        "do_level": do_level,
        "quality": quality,
        "confidence": round(confidence, 4),
        "location": device["location"],
        "alerts": _check_alerts(ph, tds, turbidity, temperature, do_level),
        "timestamp": ts,
    }


def seed_demo_data():
    db = get_db()

    if not db.users.find_one({"email": DEMO_EMAIL}):
        db.users.insert_one(new_user_doc(DEMO_EMAIL, hash_password(DEMO_PASSWORD), DEMO_NAME))
        print(f"[OK] Demo user ready: {DEMO_EMAIL} / {DEMO_PASSWORD}")

    if db.readings.count_documents({}) == 0:
        for i in range(48):
            device = DEVICES[i % len(DEVICES)]
            db.readings.insert_one(_make_sample(i, device))
        print("[OK] Seeded 48 demo sensor readings")
