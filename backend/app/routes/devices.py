from fastapi import APIRouter
from app.config.database import get_db

router = APIRouter(prefix="/api/devices", tags=["Devices"])

KNOWN = {
    "esp32-001": {
        "name": "Main Tank Sensor",
        "location": "Main Tank",
        "firmware": "1.0.0",
        "sensors": ["pH", "TDS", "Turbidity", "Temperature", "DO"],
    },
    "esp32-002": {
        "name": "Rooftop Reservoir",
        "location": "Rooftop Reservoir",
        "firmware": "1.0.0",
        "sensors": ["pH", "TDS", "Turbidity", "Temperature", "DO"],
    },
}


@router.get("")
def list_devices():
    db = get_db()
    seen = {}
    for doc in db.readings.find({}).sort("timestamp", -1):
        did = doc.get("device_id")
        if not did or did in seen:
            continue
        meta = KNOWN.get(did, {
            "name": did,
            "location": doc.get("location") or "Unknown",
            "firmware": "1.0.0",
            "sensors": ["pH", "TDS", "Turbidity", "Temperature", "DO"],
        })
        seen[did] = {
            "id": did,
            "name": meta["name"],
            "location": doc.get("location") or meta["location"],
            "status": "online",
            "firmware": meta["firmware"],
            "sensors": meta["sensors"],
            "protocol": "HTTP/JSON",
            "last_quality": doc.get("quality"),
            "last_seen": doc.get("timestamp"),
            "ph": doc.get("ph"),
            "tds": doc.get("tds"),
            "turbidity": doc.get("turbidity"),
            "temperature": doc.get("temperature"),
            "do_level": doc.get("do_level"),
        }
    # include known devices even if they have not posted yet
    for did, meta in KNOWN.items():
        if did not in seen:
            seen[did] = {
                "id": did,
                **meta,
                "status": "offline",
                "protocol": "HTTP/JSON",
                "last_quality": None,
                "last_seen": None,
                "ph": None,
                "tds": None,
                "turbidity": None,
                "temperature": None,
                "do_level": None,
            }
    return list(seen.values())
