from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReadingCreate(BaseModel):
    device_id: str = Field(default="esp32-001")
    ph: float = Field(..., ge=0, le=14)
    tds: float = Field(..., ge=0)
    turbidity: float = Field(..., ge=0)
    temperature: float = Field(..., ge=-10, le=100)
    do_level: float = Field(..., ge=0)
    location: Optional[str] = "default"


class ReadingResponse(BaseModel):
    id: str
    device_id: str
    ph: float
    tds: float
    turbidity: float
    temperature: float
    do_level: float
    quality: str
    confidence: float
    location: str
    alerts: List[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class ReadingListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[ReadingResponse]
