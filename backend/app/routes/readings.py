from fastapi import APIRouter, Query
from typing import Optional

from app.schemas.reading import ReadingCreate, ReadingListResponse, ReadingResponse
from app.services import reading_service
from app.ml.predictor import predict

router = APIRouter(prefix="/api/readings", tags=["Readings"])


@router.post("", response_model=ReadingResponse)
def ingest_reading(data: ReadingCreate):
    """ESP32 or any device posts sensor data here."""
    quality, confidence = predict(data.ph, data.tds, data.turbidity, data.temperature, data.do_level)
    doc = reading_service.save_reading(
        device_id=data.device_id,
        ph=data.ph,
        tds=data.tds,
        turbidity=data.turbidity,
        temperature=data.temperature,
        do_level=data.do_level,
        location=data.location or "default",
        quality=quality,
        confidence=confidence,
    )
    return doc


@router.get("", response_model=ReadingListResponse)
def list_readings(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    device_id: Optional[str] = None,
):
    return reading_service.get_readings(page=page, page_size=page_size, device_id=device_id)


@router.get("/latest", response_model=Optional[ReadingResponse])
def latest_reading(device_id: Optional[str] = None):
    return reading_service.get_latest_reading(device_id=device_id)


@router.get("/stats")
def stats():
    return reading_service.get_stats()
