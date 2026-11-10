import React, { useState, useEffect } from 'react';
import { CircadianSimulation } from '../circadianSimulation';
import { Activity, Thermometer, Moon, Sun, Clock, Shield, AlertTriangle, Play, Pause, RefreshCw, User, TrendingUp, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function Dashboard() {
  const [simulation] = useState(new CircadianSimulation());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRunning, setIsRunning] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentReadings, setCurrentReadings] = useState({ cortisol: 0, melatonin: 0, temperature: 0, vulnerability: 0 });
  const [forecast, setForecast] = useState([]);
  const [optimalWindows, setOptimalWindows] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('patient-1');

  const patients = {
    'patient-1': { name: 'Sarah Chen', age: 54, diagnosis: 'Stage III Colorectal Cancer', phaseOffset: 0 },
    'patient-2': { name: 'James Wilson', age: 62, diagnosis: 'Stage II Colorectal Cancer', phaseOffset: -2 },
    'patient-3': { name: 'Maria Garcia', age: 48, diagnosis: 'Stage IV Colorectal Cancer', phaseOffset: 3 }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 60000 * simulationSpeed));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed]);

  useEffect(() => {
    simulation.setPhaseOffset(patients[selectedPatient].phaseOffset);
    const cortisol = simulation.getCortisol(currentTime);
    const melatonin = simulation.getMelatonin(currentTime);
    const temperature = simulation.getTemperature(currentTime);
    const vulnerability = simulation.getBoneMarrowVulnerability(currentTime);
    setCurrentReadings({ cortisol, melatonin, temperature, vulnerability });
    
    const newForecast = simulation.generate24HourForecast(currentTime);
    setForecast(newForecast.map(d => ({
      time: format(d.time, 'HH:mm'),
      cortisol: d.cortisol.toFixed(1),
      melatonin: d.melatonin.toFixed(0),
      temperature: d.temperature.toFixed(1),
      vulnerability: d.vulnerability.toFixed(2)
    })));

    const windows = simulation.getOptimalTimingWindows(currentTime);
    setOptimalWindows(windows);
  }, [currentTime, selectedPatient, simulation]);

  const getVulnerabilityColor = (vulnerability) => {
    if (vulnerability < 0.3) return 'text-green-600 bg-green-50';
    if (vulnerability < 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getVulnerabilityLabel = (vulnerability) => {
    if (vulnerability < 0.3) return 'Low Risk';
    if (vulnerability < 0.6) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinician Dashboard</h1>
        <p className="text-gray-600">Real-time circadian monitoring and chronotherapy insights</p>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Patient Profile</h2>
            </div>
            <select 
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {Object.entries(patients).map(([id, patient]) => (
                <option key={id} value={id}>{patient.name}</option>
              ))}
            </select>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Age:</span><span className="font-medium">{patients[selectedPatient].age} years</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Diagnosis:</span><span className="font-medium">{patients[selectedPatient].diagnosis}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Circadian Phase:</span><span className="font-medium">{patients[selectedPatient].phaseOffset}h offset</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Simulation Controls</h2>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setIsRunning(!isRunning)} className="flex-1 px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                {isRunning ? <Pause className="w-4 h-4 inline" /> : <Play className="w-4 h-4 inline" />} {isRunning ? 'Pause' : 'Start'}
              </button>
              <button onClick={() => setCurrentTime(new Date())} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Simulation Speed: {simulationSpeed}x</label>
              <input type="range" min="1" max="60" value={simulationSpeed} onChange={(e) => setSimulationSpeed(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Bone Marrow Status</h2>
            </div>
            <div className={`p-4 rounded-lg ${getVulnerabilityColor(currentReadings.vulnerability)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Vulnerability</span>
                <span className="text-2xl font-bold">{(currentReadings.vulnerability * 100).toFixed(0)}%</span>
              </div>
              <div className="text-sm font-medium mb-2">{getVulnerabilityLabel(currentReadings.vulnerability)}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${currentReadings.vulnerability < 0.3 ? 'bg-green-500' : currentReadings.vulnerability < 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${currentReadings.vulnerability * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3"><Sun className="w-5 h-5 text-yellow-500" /><span className="font-semibold">Cortisol</span></div>
            <div className="text-3xl font-bold">{currentReadings.cortisol.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Normal: 5-20 μg/dL</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3"><Moon className="w-5 h-5 text-indigo-500" /><span className="font-semibold">Melatonin</span></div>
            <div className="text-3xl font-bold">{currentReadings.melatonin.toFixed(0)}</div>
            <div className="text-sm text-gray-500">Normal: 10-70 pg/mL</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3"><Thermometer className="w-5 h-5 text-red-500" /><span className="font-semibold">Temperature</span></div>
            <div className="text-3xl font-bold">{currentReadings.temperature.toFixed(1)}°C</div>
            <div className="text-sm text-gray-500">Normal: 35.5-37.5 °C</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-blue-600" /><h2 className="font-semibold">24-Hour Circadian Forecast</h2></div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cortisol" stroke="#eab308" fill="#eab308" fillOpacity={0.3} name="Cortisol" />
                <Area type="monotone" dataKey="melatonin" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="Melatonin" />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Temperature" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-blue-600" /><h2 className="font-semibold">Bone Marrow Vulnerability</h2></div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(value) => [`${(value * 100).toFixed(0)}%`, 'Vulnerability']} />
                  <Area type="monotone" dataKey="vulnerability" stroke="#dc2626" fill="#dc2626" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-blue-600" /><h2 className="font-semibold">Optimal Chemotherapy Windows</h2></div>
            <div className="space-y-3">
              {optimalWindows.map((window, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{index === 0 ? '⭐ Best Window' : `Alternative #${index}`}</span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Safety: {(window.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-sm text-gray-600">{format(window.start, 'HH:mm')} - {format(window.end, 'HH:mm')} | Vulnerability: {(window.avgVulnerability * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-blue-600" /><h2 className="font-semibold">Wearable Device Status</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Device ID</div><div className="font-medium">CSO-2024-0847</div></div>
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Battery</div><div className="font-medium text-green-600">87%</div></div>
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Signal Quality</div><div className="font-medium text-green-600">Excellent</div></div>
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Last Sync</div><div className="font-medium">2 min ago</div></div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Cortisol Sensor</div><div className="font-medium text-green-600">Active</div></div>
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Melatonin Sensor</div><div className="font-medium text-green-600">Active</div></div>
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Temperature Sensor</div><div className="font-medium text-green-600">Active</div></div>
            <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-500">Patch Adhesion</div><div className="font-medium text-green-600">Secure</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
