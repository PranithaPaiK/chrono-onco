from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PatientProfile(BaseModel):
    id: str
    name: str
    age: int
    diagnosis: str
    circadian_phase_offset: float  # hours from standard
    cortisol_amplitude: float
    melatonin_amplitude: float
    temp_amplitude: float

class BiomarkerReading(BaseModel):
    timestamp: datetime
    cortisol: float  # μg/dL
    melatonin: float  # pg/mL
    temperature: float  # °C
    signal_quality: str  # "excellent", "good", "fair", "poor"

class MonitoringSession(BaseModel):
    session_id: str
    patient_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str  # "running", "paused", "stopped"
    readings: List[BiomarkerReading] = []

class CircadianAnalysis(BaseModel):
    session_id: str
    cortisol_peak_time: float  # hours from midnight
    melatonin_peak_time: float  # hours from midnight
    temp_peak_time: float  # hours from midnight
    estimated_phase: float  # 0-1 scale
    rhythm_stability: float  # 0-1 scale
    data_quality: float  # 0-1 scale
    phase_shift_detected: bool
    confidence: float  # 0-1 scale

class ChemotherapyInsight(BaseModel):
    session_id: str
    planned_infusion_time: str  # HH:mm
    biological_phase_at_infusion: float
    vulnerability_at_infusion: float  # 0-1 scale
    alignment_score: float  # 0-1 scale
    clinician_note: str
