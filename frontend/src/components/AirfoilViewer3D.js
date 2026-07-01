import { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import * as THREE from "three";
import { generateNacaCoords } from "./nacaMath";

/**
 * Extrudes an airfoil 2D profile into a 3D wing.
 */
function AirfoilMesh({ airfoilName, color = "#00d9ff" }) {
  const meshRef = useRef();

  // Auto-rotate the wing slowly for that hero-shot feel
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const geometry = useMemo(() => {
    const coords = generateNacaCoords(airfoilName, 80);

    // Build a Shape from the 2D coordinates (centered at chord midpoint)
    const shape = new THREE.Shape();
    coords.forEach(([x, y], i) => {
      const cx = x - 0.5;  // center along chord
      const cy = y;
      if (i === 0) shape.moveTo(cx, cy);
      else shape.lineTo(cx, cy);
    });
    shape.closePath();

    // Extrude into 3D (wingspan direction)
    const extrudeSettings = {
      depth: 2.5,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 24
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [airfoilName]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        metalness={0.4}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

/**
 * Grid floor with subtle glow
 */
function GridFloor() {
  return (
    <gridHelper args={[10, 20, "#00d9ff", "#1a1a2e"]} position={[0, -1.2, 0]} />
  );
}

function AirfoilViewer3D({ airfoils }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = airfoils[selectedIdx];

  const colors = ["#00d9ff", "#a855f7", "#ff006e"];

  return (
    <div className="viewer-3d">
      <div className="viewer-header">
        <div>
          <h2>🛩️ 3D Airfoil Viewer</h2>
          <p className="viewer-subtitle">Drag to rotate · Scroll to zoom · Right-click to pan</p>
        </div>

        <div className="airfoil-selector">
          {airfoils.map((af, idx) => (
            <button
              key={af.name}
              className={`airfoil-tab ${selectedIdx === idx ? "active" : ""}`}
              style={{
                borderColor: selectedIdx === idx ? colors[idx] : "transparent",
                color: selectedIdx === idx ? colors[idx] : "#888"
              }}
              onClick={() => setSelectedIdx(idx)}
            >
              {af.name}
            </button>
          ))}
        </div>
      </div>

      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [3, 2, 4], fov: 45 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#0a0919"]} />

          {/* Lighting */}
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-3, 2, -3]} intensity={0.5} color="#a855f7" />
          <pointLight position={[3, -2, 3]} intensity={0.4} color="#00d9ff" />

          {/* Airfoil */}
          <AirfoilMesh airfoilName={selected.name} color={colors[selectedIdx]} />

          {/* Environment */}
          <GridFloor />

          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={2}
            maxDistance={12}
          />
        </Canvas>
      </div>

      <div className="viewer-info">
        <div className="viewer-info-card">
          <span className="viewer-label">Selected</span>
          <span className="viewer-value">{selected.name}</span>
        </div>
        <div className="viewer-info-card">
          <span className="viewer-label">Cl max</span>
          <span className="viewer-value">{selected.cl_max}</span>
        </div>
        <div className="viewer-info-card">
          <span className="viewer-label">Cd min</span>
          <span className="viewer-value">{selected.cd_min}</span>
        </div>
        <div className="viewer-info-card">
          <span className="viewer-label">Best L/D</span>
          <span className="viewer-value">{selected.best_cl_cd}</span>
        </div>
      </div>
    </div>
  );
}

export default AirfoilViewer3D;