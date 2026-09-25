from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.config.database import get_db
from app.config.settings import settings
from app.models.reading import new_reading_doc


def _check_alerts(ph: float, tds: float, turbidity: float, temperature: float, do_level: float) -> List[str]:
    """Generate alert messages based on sensor thresholds."""
    alerts = []
    if ph < settings.ph_min:
        alerts.append(f"⚠️ pH too LOW: {ph:.2f} (min {settings.ph_min})")
    if ph > settings.ph_max:
        alerts.append(f"⚠️ pH too HIGH: {ph:.2f} (max {settings.ph_max})")
    if tds > settings.tds_max:
        alerts.append(f"⚠️ TDS too HIGH: {tds:.1f} mg/L (max {settings.tds_max})")
    if turbidity > settings.turbidity_max:
        alerts.append(f"⚠️ Turbidity too HIGH: {turbidity:.2f} NTU (max {settings.turbidity_max})")
    if temperature < settings.temperature_min:
        alerts.append(f"⚠️ Temperature too LOW: {temperature:.1f}°C")
    if temperature > settings.temperature_max:
        alerts.append(f"⚠️ Temperature too HIGH: {temperature:.1f}°C")
    if do_level < settings.do_min:
        alerts.append(f"⚠️ DO Level too LOW: {do_level:.1f} mg/L (min {settings.do_min})")
    return alerts


def _serialize(doc: dict) -> dict:
    """Convert MongoDB doc to JSON-serialisable dict."""
    doc["id"] = str(doc.pop("_id"))
    return doc


def save_reading(
    device_id: str,
    ph: float,
    tds: float,
    turbidity: float,
    temperature: float,
    do_level: float,
    location: str,
    quality: str,
    confidence: float,
) -> dict:
    db = get_db()
    alert_list = _check_alerts(ph, tds, turbidity, temperature, do_level)
    doc = new_reading_doc(device_id, ph, tds, turbidity, temperature, do_level, quality, confidence, location)
    doc["alerts"] = alert_list
    result = db.readings.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_readings(
    page: int = 1,
    page_size: int = 20,
    device_id: Optional[str] = None,
) -> dict:
    db = get_db()
    query: dict = {}
    if device_id:
        query["device_id"] = device_id

    total = db.readings.count_documents(query)
    skip = (page - 1) * page_size
    cursor = db.readings.find(query).sort("timestamp", -1).skip(skip).limit(page_size)
    docs = [_serialize(d) for d in cursor]
    return {"total": total, "page": page, "page_size": page_size, "data": docs}


def get_latest_reading(device_id: Optional[str] = None) -> Optional[dict]:
    db = get_db()
    query: dict = {}
    if device_id:
        query["device_id"] = device_id
    doc = db.readings.find_one(query, sort=[("timestamp", -1)])
    if doc:
        return _serialize(doc)
    return None


def get_all_alerts(limit: int = 50) -> List[dict]:
    db = get_db()
    cursor = db.readings.find(
        {"alerts": {"$ne": []}},
        sort=[("timestamp", -1)],
    ).limit(limit)
    result = []
    for doc in cursor:
        serialised = _serialize(doc)
        result.append({
            "reading_id": serialised["id"],
            "device_id": serialised["device_id"],
            "location": serialised.get("location") or "Main Tank",
            "timestamp": serialised["timestamp"],
            "alerts": serialised["alerts"],
            "ph": serialised["ph"],
            "tds": serialised["tds"],
            "turbidity": serialised["turbidity"],
            "temperature": serialised["temperature"],
            "do_level": serialised["do_level"],
            "quality": serialised["quality"],
        })
    return result


def get_stats() -> dict:
    """Return aggregated stats for the dashboard."""
    db = get_db()
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_readings": {"$sum": 1},
                "avg_ph": {"$avg": "$ph"},
                "avg_tds": {"$avg": "$tds"},
                "avg_turbidity": {"$avg": "$turbidity"},
                "avg_temperature": {"$avg": "$temperature"},
                "avg_do_level": {"$avg": "$do_level"},
                "safe_count": {"$sum": {"$cond": [{"$eq": ["$quality", "safe"]}, 1, 0]}},
                "unsafe_count": {"$sum": {"$cond": [{"$eq": ["$quality", "unsafe"]}, 1, 0]}},
            }
        }
    ]
    result = list(db.readings.aggregate(pipeline))
    if not result:
        return {
            "total_readings": 0,
            "avg_ph": 0, "avg_tds": 0,
            "avg_turbidity": 0, "avg_temperature": 0,
            "avg_do_level": 0,
            "safe_count": 0, "unsafe_count": 0,
        }
    r = result[0]
    r.pop("_id", None)
    return {k: round(v, 3) if isinstance(v, float) else v for k, v in r.items()}
