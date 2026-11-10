import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Box } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DeviceSimulation from './pages/DeviceSimulation';
import Hardware3D from './pages/Hardware3D';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ChronoSync-Onco</h1>
            <p className="text-xs text-gray-400">Circadian Monitoring</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Clinician Dashboard</span>
          </Link>
          <Link
            to="/device-simulation"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/device-simulation' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Device Simulation</span>
          </Link>
          <Link
            to="/hardware-3d"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/hardware-3d' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <Box className="w-5 h-5" />
            <span>3D Hardware</span>
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-slate-800 rounded-lg text-xs text-gray-400">
            <p className="font-semibold text-yellow-400 mb-2">⚠️ DISCLAIMER</p>
            <p>SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/device-simulation" element={<DeviceSimulation />} />
          <Route path="/hardware-3d" element={<Hardware3D />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
