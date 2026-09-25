"""Background ESP32 simulator — posts live readings so the dashboard stays alive."""
import random
import threading
from datetime import datetime
from typing import Optional

from app.ml.predictor import predict
from app.services import reading_service

_stop = threading.Event()
_thread: Optional[threading.Thread] = None

DEVICES = [
    ("esp32-001", "Main Tank"),
    ("esp32-002", "Rooftop Reservoir"),
]


def _tick():
    device_id, location = random.choice(DEVICES)
    spike = random.random() < 0.12
    ph = round(random.uniform(5.4, 9.2) if spike else random.uniform(6.8, 7.8), 2)
    tds = round(random.uniform(540, 900) if spike else random.uniform(140, 320), 1)
    turbidity = round(random.uniform(4.5, 11.0) if spike else random.uniform(0.5, 2.8), 2)
    temperature = round(random.uniform(16, 30), 1)
    do_level = round(random.uniform(2.5, 5.5) if spike else random.uniform(6.5, 9.5), 1)
    quality, confidence = predict(ph, tds, turbidity, temperature, do_level)
    reading_service.save_reading(
        device_id=device_id,
        ph=ph,
        tds=tds,
        turbidity=turbidity,
        temperature=temperature,
        do_level=do_level,
        location=location,
        quality=quality,
        confidence=confidence,
    )
    print(f"[SIM] reading @ {datetime.utcnow().strftime('%H:%M:%S')} {device_id} q={quality}")


def _loop(interval_seconds: int):
    # first tick after a short delay so startup seed finishes
    if _stop.wait(8):
        return
    while not _stop.is_set():
        try:
            _tick()
        except Exception as exc:
            print(f"[WARN] Simulator error: {exc}")
        if _stop.wait(interval_seconds):
            break


def start_simulator(interval_seconds: int = 20):
    global _thread
    if _thread and _thread.is_alive():
        return
    _stop.clear()
    _thread = threading.Thread(target=_loop, args=(interval_seconds,), daemon=True)
    _thread.start()
    print(f"[OK] Live sensor simulator started (every {interval_seconds}s)")


def stop_simulator():
    _stop.set()
