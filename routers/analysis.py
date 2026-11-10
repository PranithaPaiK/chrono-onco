from fastapi import APIRouter, HTTPException
from circadian_analyzer import CircadianAnalyzer
from models import CircadianAnalysis
from typing import List

router = APIRouter()
analyzer = CircadianAnalyzer()

@router.get("/{session_id}")
async def analyze_session(session_id: str) -> dict:
    """
    Perform circadian analysis on a monitoring session.
    
    DISCLAIMER: This analysis is based on simulated synthetic data and
    does not represent clinically validated circadian phase estimation.
    """
    from routers.monitoring import sessions
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    readings = session["readings"]
    
    if len(readings) < 12:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient data for analysis. Need at least 12 readings."
        )
    
    # Extract data arrays
    cortisol_data = [(r.timestamp, r.cortisol) for r in readings]
    melatonin_data = [(r.timestamp, r.melatonin) for r in readings]
    temp_data = [(r.timestamp, r.temperature) for r in readings]
    signal_qualities = [r.signal_quality for r in readings]
    
    # Perform analysis
    results = analyzer.analyze_comprehensive(
        cortisol_data,
        melatonin_data,
        temp_data,
        signal_qualities
    )
    
    results["session_id"] = session_id
    
    return results

@router.get("/{session_id}/forecast")
async def generate_forecast(session_id: str, hours: int = 24) -> dict:
    """
    Generate a 24-hour forecast based on current circadian patterns.
    
    DISCLAIMER: This is a simulated forecast for demonstration purposes.
    """
    from routers.monitoring import sessions
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    patient_id = session["patient_id"]
    from routers.monitoring import patients
    patient = patients[patient_id]
    
    from datetime import datetime, timedelta
    import math
    import random
    
    forecast = []
    base_time = datetime.now()
    
    for i in range(hours):
        forecast_time = base_time + timedelta(hours=i)
        hour = forecast_time.hour + forecast_time.minute / 60
        adjusted_hour = (hour + patient["circadian_phase_offset"]) % 24
        
        # Cortisol forecast
        cortisol_phase = 2 * math.pi * (adjusted_hour - 8) / 24
        cortisol = 5 + patient["cortisol_amplitude"] * math.cos(cortisol_phase)
        
        # Melatonin forecast
        melatonin_phase = 2 * math.pi * (adjusted_hour - 2) / 24
        melatonin = 10 + patient["melatonin_amplitude"] * math.cos(melatonin_phase)
        
        # Temperature forecast
        temp_phase = 2 * math.pi * (adjusted_hour - 17) / 24
        temperature = 36.5 + patient["temp_amplitude"] * math.cos(temp_phase)
        
        # Vulnerability (bone marrow)
        # Higher during circadian night (phase 0.7-0.9)
        phase = adjusted_hour / 24
        vulnerability = math.sin(2 * math.pi * (phase - 0.8))
        vulnerability = max(0, min(1, (vulnerability + 1) / 2))
        
        forecast.append({
            "time": forecast_time.strftime("%H:%M"),
            "cortisol": round(cortisol, 1),
            "melatonin": round(melatonin, 0),
            "temperature": round(temperature, 1),
            "vulnerability": round(vulnerability, 2)
        })
    
    return {
        "session_id": session_id,
        "forecast_hours": hours,
        "forecast": forecast,
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
    }
