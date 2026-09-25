"""
MongoDB document helpers for SensorReading collection.
"""
from datetime import datetime


def new_reading_doc(
    device_id: str,
    ph: float,
    tds: float,
    turbidity: float,
    temperature: float,
    do_level: float,
    quality: str = "unknown",
    confidence: float = 0.0,
    location: str = "default",
) -> dict:
    return {
        "device_id": device_id,
        "ph": round(ph, 3),
        "tds": round(tds, 3),
        "turbidity": round(turbidity, 3),
        "temperature": round(temperature, 3),
        "do_level": round(do_level, 3),
        "quality": quality,         # "safe" | "unsafe" | "unknown"
        "confidence": round(confidence, 4),
        "location": location,
        "alerts": [],               # list of alert strings
        "timestamp": datetime.utcnow(),
    }
