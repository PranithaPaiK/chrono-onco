from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List
import uuid
import random
import math

from models import PatientProfile, BiomarkerReading, MonitoringSession

router = APIRouter()

# In-memory storage (for hackathon demo - would use database in production)
sessions: dict = {}
patients: dict = {
    "patient-1": {
        "id": "patient-1",
        "name": "Sarah Chen",
        "age": 54,
        "diagnosis": "Stage III Colorectal Cancer",
        "circadian_phase_offset": 0,
        "cortisol_amplitude": 15,
        "melatonin_amplitude": 60,
        "temp_amplitude": 1.2
    },
    "patient-2": {
        "id": "patient-2",
        "name": "James Wilson",
        "age": 62,
        "diagnosis": "Stage II Colorectal Cancer",
        "circadian_phase_offset": -2,
        "cortisol_amplitude": 12,
        "melatonin_amplitude": 55,
        "temp_amplitude": 1.0
    },
    "patient-3": {
        "id": "patient-3",
        "name": "Maria Garcia",
        "age": 48,
        "diagnosis": "Stage IV Colorectal Cancer",
        "circadian_phase_offset": 3,
        "cortisol_amplitude": 18,
        "melatonin_amplitude": 65,
        "temp_amplitude": 1.4
    }
}

def generate_synthetic_reading(
    timestamp: datetime, 
    patient: dict,
    session_start: datetime
) -> BiomarkerReading:
    """
    Generate synthetic biomarker reading based on circadian rhythm model.
    
    DISCLAIMER: This is simulated data for demonstration purposes only.
    """
    # Calculate hours from session start
    hours_elapsed = (timestamp - session_start).total_seconds() / 3600
    current_hour = timestamp.hour + timestamp.minute / 60
    
    # Apply patient's circadian phase offset
    adjusted_hour = (current_hour + patient["circadian_phase_offset"]) % 24
    
    # Cortisol: peaks around 8 AM, baseline ~5 μg/dL
    cortisol_phase = 2 * math.pi * (adjusted_hour - 8) / 24
    cortisol = 5 + patient["cortisol_amplitude"] * math.cos(cortisol_phase)
    cortisol += random.gauss(0, 0.5)  # Add sensor noise
    
    # Melatonin: peaks around 2 AM, baseline ~10 pg/mL
    melatonin_phase = 2 * math.pi * (adjusted_hour - 2) / 24
    melatonin = 10 + patient["melatonin_amplitude"] * math.cos(melatonin_phase)
    melatonin += random.gauss(0, 3)  # Add sensor noise
    
    # Temperature: peaks around 5 PM, baseline ~36.5°C
    temp_phase = 2 * math.pi * (adjusted_hour - 17) / 24
    temperature = 36.5 + patient["temp_amplitude"] * math.cos(temp_phase)
    temperature += random.gauss(0, 0.05)  # Add sensor noise
    
    # Signal quality (occasionally degrade)
    quality_roll = random.random()
    if quality_roll > 0.95:
        signal_quality = "fair"
    elif quality_roll > 0.85:
        signal_quality = "good"
    else:
        signal_quality = "excellent"
    
    return BiomarkerReading(
        timestamp=timestamp,
        cortisol=max(0, cortisol),
        melatonin=max(0, melatonin),
        temperature=temperature,
        signal_quality=signal_quality
    )

@router.post("/start")
async def start_monitoring(patient_id: str) -> dict:
    """Start a new monitoring session."""
    if patient_id not in patients:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    session_id = str(uuid.uuid4())
    session_start = datetime.now()
    
    sessions[session_id] = {
        "session_id": session_id,
        "patient_id": patient_id,
        "start_time": session_start,
        "end_time": None,
        "status": "running",
        "readings": []
    }
    
    return {
        "session_id": session_id,
        "patient": patients[patient_id],
        "start_time": session_start.isoformat(),
        "status": "running",
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
    }

@router.post("/{session_id}/stop")
async def stop_monitoring(session_id: str) -> dict:
    """Stop a monitoring session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions[session_id]["end_time"] = datetime.now()
    sessions[session_id]["status"] = "stopped"
    
    return {
        "session_id": session_id,
        "status": "stopped",
        "end_time": sessions[session_id]["end_time"].isoformat()
    }

@router.post("/{session_id}/pause")
async def pause_monitoring(session_id: str) -> dict:
    """Pause a monitoring session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions[session_id]["status"] = "paused"
    
    return {"session_id": session_id, "status": "paused"}

@router.post("/{session_id}/resume")
async def resume_monitoring(session_id: str) -> dict:
    """Resume a paused monitoring session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions[session_id]["status"] = "running"
    
    return {"session_id": session_id, "status": "running"}

@router.get("/{session_id}")
async def get_session(session_id: str) -> dict:
    """Get session details."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    patient = patients[session["patient_id"]]
    
    return {
        "session": session,
        "patient": patient,
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
    }

@router.get("/{session_id}/readings")
async def get_readings(session_id: str, limit: int = 100) -> dict:
    """Get readings from a session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    readings = session["readings"][-limit:]
    
    # Generate new reading if session is running
    if session["status"] == "running" and len(readings) > 0:
        last_reading = readings[-1]
        patient = patients[session["patient_id"]]
        new_timestamp = datetime.now()
        new_reading = generate_synthetic_reading(new_timestamp, patient, session["start_time"])
        session["readings"].append(new_reading)
        readings.append(new_reading)
    
    return {
        "session_id": session_id,
        "readings": readings,
        "count": len(readings),
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
    }

@router.get("/{session_id}/latest")
async def get_latest_reading(session_id: str) -> dict:
    """Get the latest reading from a session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    # Generate new reading if session is running
    if session["status"] == "running":
        patient = patients[session["patient_id"]]
        new_timestamp = datetime.now()
        new_reading = generate_synthetic_reading(new_timestamp, patient, session["start_time"])
        session["readings"].append(new_reading)
        return {
            "session_id": session_id,
            "reading": new_reading,
            "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
        }
    
    if session["readings"]:
        return {
            "session_id": session_id,
            "reading": session["readings"][-1],
            "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
        }
    
    raise HTTPException(status_code=404, detail="No readings available")

@router.get("/patients/list")
async def list_patients() -> dict:
    """List all available patients."""
    return {
        "patients": list(patients.values()),
        "count": len(patients),
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
    }
