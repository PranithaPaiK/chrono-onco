import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import monitoring, analysis, chronotherapy

app = FastAPI(title="ChronoSync-Onco API", version="1.0.0")

# Configure CORS - Allow both localhost and deployed frontend
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),
]
allowed_origins = [origin for origin in allowed_origins if origin]  # Remove empty strings

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(chronotherapy.router, prefix="/chronotherapy", tags=["chronotherapy"])

@app.get("/")
async def root():
    return {
        "message": "ChronoSync-Onco API",
        "version": "1.0.0",
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
