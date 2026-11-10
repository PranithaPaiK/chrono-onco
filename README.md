# ChronoSync-Onco: Wearable Circadian Monitoring for Personalised Chronotherapy

**Seva First Hackathon 2024 Project**

A comprehensive prototype demonstrating a wearable circadian monitoring platform for personalized chemotherapy timing in colorectal cancer patients.

---

## ⚠️ IMPORTANT DISCLAIMER

**THIS IS A RESEARCH PROTOTYPE FOR DEMONSTRATION PURPOSES ONLY.**

- All data displayed is **SIMULATED SYNTHETIC DATA** — NOT REAL PATIENT MEASUREMENTS
- The proposed microneedle aptamer sensors are **NOT clinically validated**
- The system does **NOT prescribe** chemotherapy timing, dosage, or treatment changes
- All insights must be reviewed by a qualified oncologist before any clinical decision-making
- This is a hackathon demonstration project, not a medical device

---

## 📋 Project Overview

ChronoSync-Onco is a wearable, patient-centric assistive monitoring platform designed to provide oncology teams with continuous, objective circadian telemetry. The prototype demonstrates:

1. **Wearable Device Simulation** - Interactive 5-stage workflow showing device operation
2. **Circadian Rhythm Monitoring** - Real-time cortisol, melatonin, and temperature tracking
3. **Signal Processing Pipeline** - Visualization of electrochemical sensor data processing
4. **AI-Based Analysis** - Circadian rhythm analysis using NumPy/SciPy signal processing
5. **Clinical Decision Support** - Chemotherapy timing recommendations for oncologist review

---

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Styling**: TailwindCSS
- **HTTP Client**: Axios

### Backend (Python + FastAPI)
- **Framework**: FastAPI
- **Signal Processing**: NumPy, SciPy
- **Data Models**: Pydantic
- **Server**: Uvicorn

### Data Flow
```
Frontend → API Request → FastAPI Backend → CircadianAnalyzer (NumPy/SciPy) → Response → Frontend
```

---

## 📁 Files Created/Modified

### Backend Files
- `main.py` - FastAPI application entry point
- `models.py` - Pydantic data models
- `circadian_analyzer.py` - Circadian rhythm analysis engine
- `routers/monitoring.py` - Monitoring session endpoints
- `routers/analysis.py` - Circadian analysis endpoints
- `routers/chronotherapy.py` - Chemotherapy timing insights
- `requirements.txt` - Python dependencies

### Frontend Files
- `src/App.jsx` - Main application with navigation sidebar
- `src/pages/Dashboard.jsx` - Clinician dashboard with real-time monitoring
- `src/pages/DeviceSimulation.jsx` - 5-stage interactive device simulation
- `src/circadianSimulation.js` - Frontend circadian simulation (fallback)
- `package.json` - Updated with new dependencies

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- npm or yarn

### Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
pip install -r backend/requirements.txt
```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 🎯 Demonstration Guide for Hackathon Judges

### Step 1: Overview (1 minute)
- Show the navigation sidebar with two main sections
- Explain the disclaimer prominently displayed
- Navigate to "Device Simulation"

### Step 2: Device Simulation (3-4 minutes)

**Stage 1: Patient Selection & Wearable Application**
- Select a patient (Sarah Chen, James Wilson, or Maria Garcia)
- Show the wearable device visualization
- Explain the microneedle array concept
- Click "Start Monitoring"

**Stage 2: Biological Signal Collection**
- Watch live-updating cortisol, melatonin, and temperature readings
- Explain the circadian rhythm patterns
- Show connection status and battery indicator
- Pause/Resume/Stop controls
- Click "Next: Signal Processing"

**Stage 3: Signal Acquisition & Processing**
- Click "Animate Processing" to show the workflow
- Explain each step: fluid sampling → biomarker interaction → electrochemical signal → acquisition → filtering → transmission
- Show raw vs processed signal chart
- Click "Next: Circadian Analysis"

**Stage 4: AI-Based Circadian Analysis**
- Wait for analysis to complete
- Show peak times for each biomarker
- Explain estimated biological phase
- Discuss rhythm stability and data quality metrics
- Highlight analysis limitations
- Click "Next: Clinical Insights"

**Stage 5: Clinical Decision-Support Dashboard**
- Show 5-FU chemotherapy timing analysis
- Explain alignment score and vulnerability metrics
- Show optimal chemotherapy windows
- Emphasize the clinician note and disclaimer
- Click "Reset Simulation" to demonstrate again

### Step 3: Patient Comparison (2 minutes)
- Reset the simulation
- Select a different patient with different circadian phase offset
- Run through the simulation again
- Compare the different optimal timing windows
- Explain how individual circadian phases affect recommendations

### Step 4: Clinician Dashboard (1-2 minutes)
- Navigate to "Clinician Dashboard"
- Show the real-time monitoring view
- Explain the 24-hour circadian forecast
- Show bone marrow vulnerability curve
- Discuss optimal chemotherapy windows
- Mention wearable device status

### Step 5: Q&A (Remaining time)
- Be prepared to discuss:
  - Technical implementation details
  - Signal processing algorithms
  - Limitations of the prototype
  - Future development needs
  - Clinical validation requirements

---

## 🔬 Technical Details

### Synthetic Sensor Simulation

The simulation generates realistic 24-hour circadian patterns using cosinor models:

**Cortisol**: Peaks at 8 AM, baseline ~5 μg/dL
```
cortisol = baseline + amplitude × cos(2π × (hour - 8) / 24)
```

**Melatonin**: Peaks at 2 AM, baseline ~10 pg/mL
```
melatonin = baseline + amplitude × cos(2π × (hour - 2) / 24)
```

**Temperature**: Peaks at 5 PM, baseline ~36.5°C
```
temperature = baseline + amplitude × cos(2π × (hour - 17) / 24)
```

Each patient has a unique circadian phase offset, simulating individual differences.

### Signal Processing Algorithms

The `CircadianAnalyzer` class implements:

1. **Cosinor Fitting** - Fits sinusoidal models to time-series data using scipy.optimize
2. **Moving Average Smoothing** - Reduces sensor noise
3. **Peak Detection** - Identifies rhythm peaks using scipy.signal.find_peaks
4. **Autocorrelation Analysis** - Calculates rhythm stability
5. **Data Quality Estimation** - Combines signal quality indicators with noise metrics

### API Endpoints

**Monitoring:**
- `POST /monitoring/start` - Start a new monitoring session
- `POST /monitoring/{session_id}/stop` - Stop monitoring
- `POST /monitoring/{session_id}/pause` - Pause monitoring
- `POST /monitoring/{session_id}/resume` - Resume monitoring
- `GET /monitoring/{session_id}` - Get session details
- `GET /monitoring/{session_id}/readings` - Get all readings
- `GET /monitoring/{session_id}/latest` - Get latest reading
- `GET /monitoring/patients/list` - List all patients

**Analysis:**
- `GET /analysis/{session_id}` - Perform circadian analysis
- `GET /analysis/{session_id}/forecast` - Generate 24-hour forecast

**Chronotherapy:**
- `GET /chronotherapy/{session_id}` - Get chemotherapy timing insights

---

## ⚠️ Limitations & Future Work

### Current Limitations
1. **Simulated Data Only** - No real sensor integration
2. **Simplified Analysis** - Single-biomarker phase estimation
3. **No Database** - In-memory storage only
4. **No Authentication** - No user management
5. **Limited Validation** - No clinical validation

### Required for Real Implementation
1. **Hardware Development** - Actual microneedle aptamer sensor fabrication
2. **Clinical Validation** - IRB-approved studies with real patients
3. **Regulatory Approval** - FDA/CE medical device certification
4. **Database Integration** - Secure patient data storage (HIPAA compliant)
5. **Advanced Algorithms** - Multi-biomarker fusion, machine learning models
6. **Mobile App** - Patient-facing application for data review
7. **Cloud Infrastructure** - Scalable backend deployment
8. **Security** - End-to-end encryption, audit logging

---

## 📊 Key Features Implemented

✅ **5-Stage Interactive Device Simulation**
- Patient selection with wearable visualization
- Live biomarker readings with pause/resume/stop controls
- Animated signal processing workflow
- AI-based circadian analysis
- Clinical decision-support dashboard

✅ **Realistic Circadian Simulation**
- Cosinor-based rhythm modeling
- Patient-specific phase offsets
- Sensor noise simulation
- Signal quality indicators

✅ **Professional Medical UI**
- Dark navy sidebar navigation
- Clean white dashboard cards
- Blue/cyan accent colors
- Responsive design
- Smooth animations

✅ **Complete Backend API**
- FastAPI with automatic documentation
- NumPy/SciPy signal processing
- Pydantic data validation
- CORS configuration

✅ **Comprehensive Disclaimers**
- Prominent warnings throughout
- Clear labeling of simulated data
- Clinical decision-support framing (not prescribing)

---

## 🛠️ Troubleshooting

**Frontend not loading:**
- Ensure npm dependencies are installed
- Check that Vite dev server is running on port 3000
- Clear browser cache

**Backend not responding:**
- Ensure Python dependencies are installed
- Check that uvicorn is running on port 8000
- Verify file structure (main.py, routers/, models.py in root)

**API errors:**
- Check browser console for CORS errors
- Verify backend is running
- Check API documentation at http://localhost:8000/docs

---

## 📝 Development Notes

- The frontend includes a fallback simulation that works without the backend
- All timestamps are in local time
- Signal processing is performed on-demand when analysis is requested
- The simulation can run indefinitely with continuous data generation

---

## 🙏 Acknowledgments

Built for Seva First Hackathon 2024

**Technologies Used:**
- React, Vite, TailwindCSS
- FastAPI, NumPy, SciPy
- Recharts, Lucide React
- Axios, Pydantic

---

## 📞 Contact

For questions about this prototype, please contact the development team during the hackathon.

**Remember: This is a demonstration prototype only. Not for clinical use.**
