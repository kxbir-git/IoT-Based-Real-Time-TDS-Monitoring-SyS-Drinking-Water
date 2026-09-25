from fastapi import APIRouter
from pydantic import BaseModel

from app.ml.predictor import predict

router = APIRouter(prefix="/api/predict", tags=["ML Prediction"])


class PredictRequest(BaseModel):
    ph: float
    tds: float
    turbidity: float
    temperature: float
    do_level: float


class PredictResponse(BaseModel):
    quality: str
    confidence: float
    label: str


@router.post("", response_model=PredictResponse)
def predict_quality(data: PredictRequest):
    quality, confidence = predict(data.ph, data.tds, data.turbidity, data.temperature, data.do_level)
    label = "✅ Safe to Drink" if quality == "safe" else "🚫 Unsafe — Do Not Drink"
    return PredictResponse(quality=quality, confidence=confidence, label=label)
