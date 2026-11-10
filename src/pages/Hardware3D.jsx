import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useAnimations } from '@react-three/drei';
import { Activity, Box, Cpu, Radio, Thermometer, Zap, AlertCircle } from 'lucide-react';

// Model component
function Model({ url }) {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);
  
  return <primitive object={scene} />;
}

// Loading fallback
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-600">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

// Annotation component
function Annotation({ position, title, description, icon: Icon }) {
  const [visible, setVisible] = useState(false);
  
  return (
    <group position={position}>
      <mesh
        onClick={() => setVisible(!visible)}
        onPointerOver={() => setVisible(true)}
        onPointerOut={() => setVisible(false)}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>
      {visible && (
        <Html position={[0, 0.3, 0]} center distanceFactor={3}>
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{title}</span>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Hardware3D() {
  const [selectedPart, setSelectedPart] = useState(null);
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">3D Hardware Simulation</h1>
        <p className="text-gray-600">Interactive 3D model of the ChronoSync-Onco wearable device</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3D Viewer */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shadow-xl" style={{ height: '600px' }}>
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              <Model url="/ChronoSync_Onco.glb" />
              
              {/* Annotations */}
              <Annotation 
                position={[0.5, 0.5, 0.5]} 
                title="Microneedle Array" 
                description="Gold-plated microneedles for interstitial fluid sampling"
                icon={Zap}
              />
              <Annotation 
                position={[-0.5, 0.3, 0.3]} 
                title="Electrochemical Sensors" 
                description="Aptamer-based biosensors for cortisol and melatonin detection"
                icon={Activity}
              />
              <Annotation 
                position={[0, 0.8, 0]} 
                title="Wireless Module" 
                description="Bluetooth Low Energy for data transmission"
                icon={Radio}
              />
              <Annotation 
                position={[0.3, -0.3, 0.3]} 
                title="Temperature Sensor" 
                description="Skin temperature monitoring for circadian phase estimation"
                icon={Thermometer}
              />
              <Annotation 
                position={[-0.3, 0.2, -0.3]} 
                title="Microcontroller" 
                description="Signal processing and data acquisition unit"
                icon={Cpu}
              />
              
              <Environment preset="city" />
              <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} />
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              Device Components
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Microneedle Array</div>
                  <div className="text-sm text-gray-600">Gold-plated needles for ISF sampling</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">E-AB Sensors</div>
                  <div className="text-sm text-gray-600">Electrochemical aptamer biosensors</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Radio className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Wireless Module</div>
                  <div className="text-sm text-gray-600">BLE 5.0 for data transmission</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <Thermometer className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Temperature Sensor</div>
                  <div className="text-sm text-gray-600">Skin temperature monitoring</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Cpu className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Microcontroller</div>
                  <div className="text-sm text-gray-600">Signal processing unit</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              How to Interact
            </h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Rotate:</strong> Click and drag to rotate the model</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Zoom:</strong> Scroll to zoom in/out</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Pan:</strong> Right-click and drag to pan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Annotations:</strong> Hover over blue markers to see component details</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-800 mb-2">⚠️ Disclaimer</div>
                <p className="text-sm text-yellow-800">
                  This is a 3D visualization of a proposed device design. 
                  The actual hardware is still in development and has not been clinically validated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hardware3D;
