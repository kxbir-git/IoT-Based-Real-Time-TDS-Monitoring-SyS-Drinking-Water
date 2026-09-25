"""
ML Predictor — loads a trained RandomForest model and predicts water quality.
Falls back to rule-based prediction if model file is not found.
"""
import os
from typing import Tuple
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "models", "water_quality_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "models", "scaler.joblib")

_model = None
_scaler = None


def _load():
    global _model, _scaler
    try:
        import joblib
        _model = joblib.load(os.path.abspath(MODEL_PATH))
        _scaler = joblib.load(os.path.abspath(SCALER_PATH))
        print("[OK] ML model loaded successfully")
    except Exception as e:
        print(f"[WARN] ML model not found, using rule-based fallback: {e}")
        _model = None
        _scaler = None


def _rule_based(ph: float, tds: float, turbidity: float, temperature: float, do_level: float) -> Tuple[str, float]:
    """Simple threshold-based fallback predictor."""
    score = 0
    max_score = 5

    if 6.5 <= ph <= 8.5:
        score += 1
    if tds <= 500:
        score += 1
    if turbidity <= 4.0:
        score += 1
    if 10.0 <= temperature <= 35.0:
        score += 1
    if do_level >= 6.0:
        score += 1

    confidence = score / max_score
    quality = "safe" if confidence >= 0.75 else "unsafe"
    return quality, round(confidence, 4)


def predict(ph: float, tds: float, turbidity: float, temperature: float, do_level: float) -> Tuple[str, float]:
    """
    Predict water quality.
    Returns: (quality: str, confidence: float)
    """
    if _model is None:
        _load()

    if _model is not None and _scaler is not None:
        try:
            features = np.array([[ph, tds, turbidity, temperature]])
            features_scaled = _scaler.transform(features)
            prediction = _model.predict(features_scaled)[0]
            proba = _model.predict_proba(features_scaled)[0]
            confidence = float(np.max(proba))
            quality = "safe" if prediction == 1 else "unsafe"
            return quality, round(confidence, 4)
        except Exception as e:
            print(f"[WARN] ML prediction error: {e}")

    # Fallback
    return _rule_based(ph, tds, turbidity, temperature, do_level)
