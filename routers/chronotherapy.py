from fastapi import APIRouter, HTTPException
from datetime import datetime
import math

router = APIRouter()

@router.get("/{session_id}")
async def get_chronotherapy_insights(session_id: str, planned_infusion_time: str = "10:00") -> dict:
    """
    Generate chronotherapy insights for chemotherapy timing.
    
    DISCLAIMER: This is for demonstration and research purposes only.
    The system does NOT prescribe chemotherapy timing, dosage, or treatment changes.
    All insights should be reviewed by a qualified oncologist.
    """
    from routers.monitoring import sessions
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    patient_id = session["patient_id"]
    from routers.monitoring import patients
    patient = patients[patient_id]
    
    # Parse planned infusion time
    try:
        infusion_hour = int(planned_infusion_time.split(":")[0])
        infusion_minute = int(planned_infusion_time.split(":")[1])
    except:
        infusion_hour = 10
        infusion_minute = 0
    
    # Calculate biological phase at infusion time
    adjusted_infusion_hour = (infusion_hour + patient["circadian_phase_offset"]) % 24
    biological_phase = adjusted_infusion_hour / 24
    
    # Calculate vulnerability at infusion time
    # Bone marrow is most vulnerable during circadian night
    vulnerability = math.sin(2 * math.pi * (biological_phase - 0.8))
    vulnerability = max(0, min(1, (vulnerability + 1) / 2))
    
    # Calculate alignment score (higher = better alignment with low vulnerability)
    alignment_score = 1 - vulnerability
    
    # Generate clinician note based on alignment
    if alignment_score > 0.7:
        note = "The planned infusion time aligns well with the patient's estimated circadian rhythm. Bone marrow vulnerability appears to be relatively low during this period."
    elif alignment_score > 0.5:
        note = "The planned infusion time shows moderate alignment with the patient's circadian rhythm. Consider reviewing alternative timing windows if clinically appropriate."
    else:
        note = "The planned infusion time may coincide with a period of higher bone marrow vulnerability based on circadian estimates. Consider discussing alternative timing with the oncology team."
    
    # Find optimal 4-hour windows
    optimal_windows = []
    for hour in range(24):
        window_start = hour
        window_end = (hour + 4) % 24
        
        # Calculate average vulnerability over the window
        avg_vulnerability = 0
        for h in range(4):
            adjusted_h = ((hour + h) + patient["circadian_phase_offset"]) % 24
            phase = adjusted_h / 24
            vuln = math.sin(2 * math.pi * (phase - 0.8))
            vuln = max(0, min(1, (vuln + 1) / 2))
            avg_vulnerability += vuln
        avg_vulnerability /= 4
        
        window_score = 1 - avg_vulnerability
        optimal_windows.append({
            "start": f"{window_start:02d}:00",
            "end": f"{window_end:02d}:00",
            "score": round(window_score, 2),
            "avg_vulnerability": round(avg_vulnerability, 2)
        })
    
    # Sort and return top 3
    optimal_windows.sort(key=lambda x: x["score"], reverse=True)
    top_windows = optimal_windows[:3]
    
    return {
        "session_id": session_id,
        "planned_infusion_time": planned_infusion_time,
        "biological_phase_at_infusion": round(biological_phase, 2),
        "vulnerability_at_infusion": round(vulnerability, 2),
        "alignment_score": round(alignment_score, 2),
        "clinician_note": note,
        "optimal_windows": top_windows,
        "patient_circadian_offset": patient["circadian_phase_offset"],
        "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS. This system does NOT prescribe chemotherapy timing, dosage, or treatment changes. All insights must be reviewed by a qualified oncologist."
    }
