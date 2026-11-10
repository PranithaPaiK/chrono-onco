import React, { useState, useEffect, useRef } from 'react';
import { Activity, Thermometer, Moon, Sun, Play, Pause, RefreshCw, User, ArrowRight, ArrowLeft, Zap, Cpu, Radio, Waves, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function DeviceSimulation() {
  const [stage, setStage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState('patient-1');
  const [patients, setPatients] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readings, setReadings] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [chronotherapy, setChronotherapy] = useState(null);
  const [signalData, setSignalData] = useState([]);
  const [processingStep, setProcessingStep] = useState(0);
  const intervalRef = useRef(null);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Poll for readings when monitoring
  useEffect(() => {
    if (isMonitoring && !isPaused && sessionId) {
      intervalRef.current = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE}/monitoring/${sessionId}/latest`);
          setCurrentReading(response.data.reading);
          setReadings(prev => [...prev.slice(-50), response.data.reading]);
        } catch (error) {
          console.error('Error fetching reading:', error);
        }
      }, 2000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isMonitoring, isPaused, sessionId]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/monitoring/patients/list`);
      setPatients(response.data.patients);
    } catch (error) {
      // Fallback to mock data if backend not running
      setPatients([
        { id: 'patient-1', name: 'Sarah Chen', age: 54, diagnosis: 'Stage III Colorectal Cancer', circadian_phase_offset: 0 },
        { id: 'patient-2', name: 'James Wilson', age: 62, diagnosis: 'Stage II Colorectal Cancer', circadian_phase_offset: -2 },
        { id: 'patient-3', name: 'Maria Garcia', age: 48, diagnosis: 'Stage IV Colorectal Cancer', circadian_phase_offset: 3 }
      ]);
    }
  };

  const startMonitoring = async () => {
    try {
      const response = await axios.post(`${API_BASE}/monitoring/start`, null, {
        params: { patient_id: selectedPatient }
      });
      setSessionId(response.data.session_id);
      setIsMonitoring(true);
      setReadings([]);
      setCurrentReading(null);
    } catch (error) {
      console.error('Error starting monitoring:', error);
      // Fallback to frontend simulation
      setSessionId('mock-session');
      setIsMonitoring(true);
      simulateReadings();
    }
  };

  const simulateReadings = () => {
    // Frontend fallback simulation
    const interval = setInterval(() => {
      const patient = patients.find(p => p.id === selectedPatient) || patients[0];
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      const adjustedHour = (hour + (patient.circadian_phase_offset || 0)) % 24;
      
      const cortisol = 5 + 15 * Math.cos(2 * Math.PI * (adjustedHour - 8) / 24) + (Math.random() - 0.5);
      const melatonin = 10 + 60 * Math.cos(2 * Math.PI * (adjustedHour - 2) / 24) + (Math.random() - 0.5) * 5;
      const temperature = 36.5 + 1.2 * Math.cos(2 * Math.PI * (adjustedHour - 17) / 24) + (Math.random() - 0.5) * 0.1;
      
      const reading = {
        timestamp: now,
        cortisol: Math.max(0, cortisol),
        melatonin: Math.max(0, melatonin),
        temperature: temperature,
        signal_quality: 'excellent'
      };
      
      setCurrentReading(reading);
      setReadings(prev => [...prev.slice(-50), reading]);
    }, 2000);
    
    intervalRef.current = interval;
  };

  const stopMonitoring = async () => {
    if (sessionId && sessionId !== 'mock-session') {
      try {
        await axios.post(`${API_BASE}/monitoring/${sessionId}/stop`);
      } catch (error) {
        console.error('Error stopping monitoring:', error);
      }
    }
    clearInterval(intervalRef.current);
    setIsMonitoring(false);
    setIsPaused(false);
  };

  const pauseMonitoring = async () => {
    if (sessionId && sessionId !== 'mock-session') {
      try {
        await axios.post(`${API_BASE}/monitoring/${sessionId}/pause`);
      } catch (error) {
        console.error('Error pausing monitoring:', error);
      }
    }
    clearInterval(intervalRef.current);
    setIsPaused(true);
  };

  const resumeMonitoring = async () => {
    if (sessionId && sessionId !== 'mock-session') {
      try {
        await axios.post(`${API_BASE}/monitoring/${sessionId}/resume`);
      } catch (error) {
        console.error('Error resuming monitoring:', error);
      }
    }
    setIsPaused(false);
  };

  const runAnalysis = async () => {
    try {
      const response = await axios.get(`${API_BASE}/analysis/${sessionId}`);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error running analysis:', error);
      // Fallback
      setAnalysis({
        cortisol_peak_time: 8,
        melatonin_peak_time: 2,
        temp_peak_time: 17,
        estimated_phase: 0.5,
        rhythm_stability: 0.85,
        data_quality: 0.9,
        phase_shift_detected: false,
        confidence: 0.8
      });
    }
  };

  const getChronotherapyInsights = async () => {
    try {
      const response = await axios.get(`${API_BASE}/chronotherapy/${sessionId}`);
      setChronotherapy(response.data);
    } catch (error) {
      console.error('Error getting chronotherapy insights:', error);
      // Fallback
      setChronotherapy({
        planned_infusion_time: '10:00',
        biological_phase_at_infusion: 0.42,
        vulnerability_at_infusion: 0.35,
        alignment_score: 0.65,
        clinician_note: 'Moderate alignment with circadian rhythm.',
        optimal_windows: [
          { start: '14:00', end: '18:00', score: 0.85, avg_vulnerability: 0.15 },
          { start: '10:00', end: '14:00', score: 0.65, avg_vulnerability: 0.35 },
          { start: '06:00', end: '10:00', score: 0.55, avg_vulnerability: 0.45 }
        ]
      });
    }
  };

  const resetSimulation = () => {
    stopMonitoring();
    setStage(1);
    setSessionId(null);
    setReadings([]);
    setCurrentReading(null);
    setAnalysis(null);
    setChronotherapy(null);
    setSignalData([]);
    setProcessingStep(0);
  };

  const generateSignalData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      const raw = Math.sin(i * 0.2) * 10 + (Math.random() - 0.5) * 5;
      const processed = Math.sin(i * 0.2) * 10;
      data.push({ index: i, raw, processed });
    }
    setSignalData(data);
  };

  const nextStage = () => {
    if (stage === 2 && !isMonitoring) {
      alert('Please start monitoring first');
      return;
    }
    if (stage === 3) {
      generateSignalData();
    }
    if (stage === 4) {
      runAnalysis();
    }
    if (stage === 5) {
      getChronotherapyInsights();
    }
    setStage(stage + 1);
  };

  const prevStage = () => {
    setStage(stage - 1);
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Simulation</h1>
        <p className="text-gray-600">Interactive demonstration of the ChronoSync-Onco wearable device workflow</p>
      </header>

      {/* Stage Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                stage >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 5 && <div className={`w-16 h-1 mx-2 ${stage > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-2">
          <span>Patient Selection</span>
          <span>Signal Collection</span>
          <span>Signal Processing</span>
          <span>Circadian Analysis</span>
          <span>Clinical Insights</span>
        </div>
      </div>

      {/* Stage 1: Patient Selection */}
      {stage === 1 && (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Stage 1: Patient Selection & Wearable Application</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Patient</h3>
              <div className="space-y-3">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPatient === patient.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="font-semibold">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.diagnosis}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Wearable Device Visualization</h3>
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-8 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl relative">
                    <div className="absolute top-2 left-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse" />
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-1 h-6 bg-gray-300 rounded" />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="w-12 h-12 text-white opacity-50" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Wireless Module</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Battery Indicator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span>Microneedle Array</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Gold-plated microneedle arrays with electrochemical aptamer-based biosensors
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={nextStage}
              disabled={!selectedPatient}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Start Monitoring <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: Biological Signal Collection */}
      {stage === 2 && (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Stage 2: Biological Signal Collection</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-8 h-8 text-yellow-600" />
                <h3 className="font-semibold">Cortisol</h3>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {currentReading ? currentReading.cortisol.toFixed(1) : '--'}
              </div>
              <div className="text-sm text-gray-600">μg/dL</div>
              <div className="mt-4 text-xs text-gray-500">
                {currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : '--'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-8 h-8 text-indigo-600" />
                <h3 className="font-semibold">Melatonin</h3>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {currentReading ? currentReading.melatonin.toFixed(0) : '--'}
              </div>
              <div className="text-sm text-gray-600">pg/mL</div>
              <div className="mt-4 text-xs text-gray-500">
                {currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : '--'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="w-8 h-8 text-red-600" />
                <h3 className="font-semibold">Temperature</h3>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {currentReading ? currentReading.temperature.toFixed(1) : '--'}
              </div>
              <div className="text-sm text-gray-600">°C</div>
              <div className="mt-4 text-xs text-gray-500">
                {currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : '--'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
              <Radio className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Connected</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Battery: 87%</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
              <Waves className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Signal: {currentReading?.signal_quality || 'excellent'}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            {!isMonitoring ? (
              <button
                onClick={startMonitoring}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
              >
                <Play className="w-5 h-5" /> Start Monitoring
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseMonitoring}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <Pause className="w-5 h-5" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeMonitoring}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" /> Resume
                  </button>
                )}
                <button
                  onClick={stopMonitoring}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" /> Stop
                </button>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>DISCLAIMER:</strong> SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS. 
              This is a research prototype demonstrating proposed device functionality.
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={prevStage} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button onClick={nextStage} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
              Next: Signal Processing <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 3: Signal Processing */}
      {stage === 3 && (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Stage 3: Signal Acquisition & Processing</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Processing Workflow</h3>
              <div className="space-y-3">
                {[
                  { icon: <Waves />, title: 'Interstitial Fluid Sampling', desc: 'Microneedle array samples dermal interstitial fluid' },
                  { icon: <Zap />, title: 'Biomarker Interaction', desc: 'Cortisol/melatonin bind to aptamer sensing surface' },
                  { icon: <Radio />, title: 'Electrochemical Signal', desc: 'Redox reaction generates measurable current' },
                  { icon: <Cpu />, title: 'Analog Acquisition', desc: 'Signal amplified and digitized by microcontroller' },
                  { icon: <Activity />, title: 'Filtering & Calibration', desc: 'Noise reduction and baseline correction' },
                  { icon: <Radio />, title: 'Wireless Transmission', desc: 'Processed data transmitted to backend' }
                ].map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      processingStep >= index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${processingStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-sm text-gray-500">{step.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setProcessingStep(Math.min(5, processingStep + 1))}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Animate Processing
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Raw vs Processed Signal</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={signalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="raw" stroke="#ef4444" name="Raw Signal" dot={false} />
                    <Line type="monotone" dataKey="processed" stroke="#22c55e" name="Processed Signal" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Technical Note:</strong> This visualization demonstrates the signal processing pipeline. 
                    The red line shows raw sensor data with noise, while the green line shows the filtered, 
                    calibrated output after processing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={prevStage} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button onClick={nextStage} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
              Next: Circadian Analysis <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 4: Circadian Analysis */}
      {stage === 4 && (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Stage 4: AI-Based Circadian Analysis</h2>
          
          {!analysis ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Running circadian rhythm analysis...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Cortisol Peak</div>
                  <div className="text-2xl font-bold">{analysis.cortisol_peak_time.toFixed(1)}h</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <div className="text-sm text-gray-600 mb-1">Melatonin Peak</div>
                  <div className="text-2xl font-bold">{analysis.melatonin_peak_time.toFixed(1)}h</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-sm text-gray-600 mb-1">Temperature Peak</div>
                  <div className="text-2xl font-bold">{analysis.temp_peak_time.toFixed(1)}h</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Estimated Biological Phase</div>
                  <div className="text-2xl font-bold">{(analysis.estimated_phase * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Rhythm Stability</div>
                  <div className="text-2xl font-bold">{(analysis.rhythm_stability * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-sm text-gray-600 mb-1">Data Quality</div>
                  <div className="text-2xl font-bold">{(analysis.data_quality * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-gray-600 mb-1">Analysis Confidence</div>
                  <div className="text-2xl font-bold">{(analysis.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">Analysis Limitations</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Based on simulated synthetic data, not real patient measurements</li>
                  <li>Circadian phase estimation requires longer monitoring periods for clinical accuracy</li>
                  <li>Individual biomarker variability not fully captured in this prototype</li>
                  <li>Does not replace comprehensive clinical circadian assessment</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button onClick={prevStage} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button onClick={nextStage} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
              Next: Clinical Insights <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 5: Clinical Decision Support */}
      {stage === 5 && (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Stage 5: Clinical Decision-Support Dashboard</h2>
          
          {!chronotherapy ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Generating chronotherapy insights...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4">5-Fluorouracil (5-FU) Chemotherapy Timing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Planned Infusion Time</div>
                    <div className="text-2xl font-bold">{chronotherapy.planned_infusion_time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Alignment Score</div>
                    <div className="text-2xl font-bold">{(chronotherapy.alignment_score * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Biological Phase at Infusion</div>
                    <div className="text-2xl font-bold">{(chronotherapy.biological_phase_at_infusion * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Bone Marrow Vulnerability</div>
                    <div className="text-2xl font-bold">{(chronotherapy.vulnerability_at_infusion * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Optimal Chemotherapy Windows</h3>
                <div className="space-y-3">
                  {chronotherapy.optimal_windows.map((window, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">
                          {index === 0 ? '⭐ Best Window' : `Alternative #${index}`}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          Safety: {(window.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {window.start} - {window.end} | Avg Vulnerability: {(window.avg_vulnerability * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-800 mb-2">Clinician Note</div>
                    <p className="text-sm text-yellow-800">{chronotherapy.clinician_note}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-800 mb-2">⚠️ IMPORTANT DISCLAIMER</div>
                    <p className="text-sm text-red-800">
                      This system does NOT prescribe chemotherapy timing, dosage, or treatment changes. 
                      All insights are based on simulated synthetic data and must be reviewed by a qualified oncologist 
                      before any clinical decision-making. This is a research prototype for demonstration purposes only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button onClick={prevStage} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button onClick={resetSimulation} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> Reset Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceSimulation;
