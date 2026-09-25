from fastapi import APIRouter
from app.services import reading_service

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
def get_alerts(limit: int = 50):
    """Get all readings that have triggered alerts."""
    return reading_service.get_all_alerts(limit=limit)


@router.get("/count")
def alert_count():
    alerts = reading_service.get_all_alerts(limit=1000)
    return {"count": len(alerts)}
