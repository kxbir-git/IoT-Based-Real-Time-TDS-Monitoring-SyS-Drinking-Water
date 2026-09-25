from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config.settings import settings
from app.config.database import connect_db, disconnect_db
from app.routes import auth, readings, predict, alerts, devices
from app.services.seed import seed_demo_data
from app.services.simulator import start_simulator, stop_simulator


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_db()
    seed_demo_data()
    start_simulator(interval_seconds=20)
    yield
    stop_simulator()
    disconnect_db()


app = FastAPI(
    title="AquaSense API",
    description="🌊 Smart Water Quality Monitoring System — Real-time IoT sensor data, ML predictions, and alerts.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(readings.router)
app.include_router(predict.router)
app.include_router(alerts.router)
app.include_router(devices.router)


@app.get("/")
def root():
    return {
        "message": "🌊 AquaSense API is running!",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "AquaSense API"}


@app.post("/api/demo/start")
def start_demo():
    start_simulator(interval_seconds=10)
    return {"status": "ok", "message": "Demo mode (simulator) started"}


@app.post("/api/demo/stop")
def stop_demo():
    stop_simulator()
    return {"status": "ok", "message": "Demo mode (simulator) stopped"}