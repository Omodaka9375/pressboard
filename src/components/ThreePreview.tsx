import { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useProjectStore } from '../stores/projectStore';
import { useEnclosureStore } from '../stores/enclosureStore';
import { createBoardGeometry } from '../lib/geometry/boardGeometry';
import { createCompleteLid } from '../lib/geometry/lidGeometry';
import { getFootprint } from '../data/footprints';
import type { Vec2, Component } from '../types';

/** Calculate center of bounding box for any polygon */
const getBoundsCenter = (boundary: Vec2[]): { x: number; y: number } => {
  if (boundary.length === 0) return { x: 0, y: 0 };

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  boundary.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
};

type BoardMeshProps = {
  clippingPlane?: THREE.Plane | null;
};

const BoardMesh = ({ clippingPlane }: BoardMeshProps) => {
  const { project } = useProjectStore();
  const meshRef = useRef<THREE.Mesh>(null);

  const boardMesh = useMemo(() => {
    try {
      return createBoardGeometry(project.board);
    } catch (error) {
      console.error('Failed to create board geometry:', error);
      return null;
    }
  }, [project.board]);

  if (!boardMesh) {
    return null;
  }

  // Center the board in view
  const { x: centerX, y: centerY } = getBoundsCenter(project.board.boundary);

  return (
    <mesh ref={meshRef} geometry={boardMesh.geometry} position={[-centerX, -centerY, 0]}>
      <meshStandardMaterial
        color="#228B22"
        roughness={0.6}
        metalness={0.1}
        clippingPlanes={clippingPlane ? [clippingPlane] : []}
        clipShadows
      />
    </mesh>
  );
};

const RouteLines = () => {
  const { project } = useProjectStore();
  const { x: centerX, y: centerY } = getBoundsCenter(project.board.boundary);
  const thickness = project.board.thickness;

  // Separate routes by layer
  const topRoutes = project.routes.filter((r) => r.layer === 'top');
  const bottomRoutes = project.routes.filter((r) => r.layer === 'bottom');

  return (
    <>
      {/* Top layer routes - above the board */}
      <group position={[-centerX, -centerY, thickness + 0.1]}>
        {topRoutes.map((route, index) => {
          const points = route.polyline.map((p) => [p[0], p[1], 0] as [number, number, number]);
          return <Line key={`top-${index}`} points={points} color="#B87333" lineWidth={3} />;
        })}
      </group>

      {/* Bottom layer routes - below the board */}
      <group position={[-centerX, -centerY, -0.1]}>
        {bottomRoutes.map((route, index) => {
          const points = route.polyline.map((p) => [p[0], p[1], 0] as [number, number, number]);
          return <Line key={`bottom-${index}`} points={points} color="#CD853F" lineWidth={3} />;
        })}
      </group>
    </>
  );
};

type Component3DProps = {
  component: Component;
  boardThickness: number;
};

/** Create resistor 3D model with realistic color bands. */
const Resistor3D = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Body - horizontal along Y axis */}
      <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 7, 16]} />
        <meshStandardMaterial color="#c4a484" roughness={0.6} />
      </mesh>
      {/* End caps - tapered ends */}
      <mesh position={[0, -3.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 1.2, 0.6, 12]} />
        <meshStandardMaterial color="#c4a484" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 0.6, 0.6, 12]} />
        <meshStandardMaterial color="#c4a484" roughness={0.6} />
      </mesh>
      {/* Color bands - positioned along the body */}
      {[-2.5, -1.5, -0.5, 1.5].map((yOffset, i) => (
        <mesh key={i} position={[0, yOffset, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.21, 0.15, 8, 16]} />
          <meshStandardMaterial color={['#a52a2a', '#000000', '#ff8c00', '#ffd700'][i]} />
        </mesh>
      ))}
      {/* Tolerance band (gold) */}
      <mesh position={[0, 2.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.21, 0.15, 8, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} />
      </mesh>
      {/* Leads - extending from both ends */}
      <mesh position={[0, -5.5, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 5.5, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

/** Create capacitor 3D model with K-groove marking. */
const Capacitor3D = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Body - electrolytic cap style, upright */}
      <mesh position={[0, 0, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 6, 20]} />
        <meshStandardMaterial color="#1a1a3a" roughness={0.4} />
      </mesh>
      {/* Top vent (K-groove pattern) */}
      <mesh position={[0, 0, 7.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.2, 20]} />
        <meshStandardMaterial color="#333355" roughness={0.5} />
      </mesh>
      {/* K-groove lines on top */}
      <mesh position={[0, 0, 7.25]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshStandardMaterial color="#222244" />
      </mesh>
      <mesh position={[1, 0.8, 7.25]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[2, 0.2, 0.1]} />
        <meshStandardMaterial color="#222244" />
      </mesh>
      <mesh position={[1, -0.8, 7.25]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[2, 0.2, 0.1]} />
        <meshStandardMaterial color="#222244" />
      </mesh>
      {/* Polarity stripe (negative side) */}
      <mesh position={[2.3, 0, 4]}>
        <boxGeometry args={[0.3, 0.8, 6]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      {/* Minus signs on stripe */}
      <mesh position={[2.45, 0, 5.5]}>
        <boxGeometry args={[0.05, 0.5, 0.15]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[2.45, 0, 3.5]}>
        <boxGeometry args={[0.05, 0.5, 0.15]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      {/* Leads - going down through board */}
      <mesh position={[-1.25, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 2, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      <mesh position={[1.25, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 2, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
    </group>
  );
};

/** Create LED 3D model. */
const LED3D = ({
  position,
  rotation,
  color = '#ff0000',
}: {
  position: [number, number, number];
  rotation: number;
  color?: string;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Dome - hemisphere on top */}
      <mesh position={[0, 0, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[2.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Base - cylindrical body */}
      <mesh position={[0, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 3, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Rim - flange at bottom */}
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 0.5, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>
      {/* Leads - going down */}
      <mesh position={[-0.6, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      <mesh position={[0.6, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
    </group>
  );
};

/** Create DIP IC/MCU 3D model. */
const DIPIC3D = ({
  position,
  rotation,
  width,
  length,
  pinCount,
  hasChip = true,
}: {
  position: [number, number, number];
  rotation: number;
  width: number;
  length: number;
  pinCount: number;
  hasChip?: boolean;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const pinsPerSide = pinCount / 2;
  const pinSpacing = 2.54;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Main body */}
      <mesh position={[width / 2 - 0.5, ((pinsPerSide - 1) * pinSpacing) / 2, 2]}>
        <boxGeometry args={[width, length, 3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Pin 1 notch */}
      <mesh position={[-0.5, -1, 3.5]}>
        <sphereGeometry args={[0.8, 12, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Text/chip marking */}
      {hasChip && (
        <mesh position={[width / 2 - 0.5, ((pinsPerSide - 1) * pinSpacing) / 2, 3.6]}>
          <boxGeometry args={[width * 0.6, length * 0.4, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      )}
      {/* Pins - with gull-wing shape */}
      {Array.from({ length: pinsPerSide }).map((_, i) => (
        <group key={`left-${i}`}>
          {/* Horizontal part from body */}
          <mesh position={[-1.5, i * pinSpacing, 1.5]}>
            <boxGeometry args={[2, 0.4, 0.2]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Vertical part going down */}
          <mesh position={[-2.3, i * pinSpacing, 0.8]}>
            <boxGeometry args={[0.4, 0.4, 1.6]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Foot */}
          <mesh position={[-2.8, i * pinSpacing, 0.1]}>
            <boxGeometry args={[1.4, 0.4, 0.2]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: pinsPerSide }).map((_, i) => (
        <group key={`right-${i}`}>
          {/* Horizontal part from body */}
          <mesh position={[width + 0.5, i * pinSpacing, 1.5]}>
            <boxGeometry args={[2, 0.4, 0.2]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Vertical part going down */}
          <mesh position={[width + 1.3, i * pinSpacing, 0.8]}>
            <boxGeometry args={[0.4, 0.4, 1.6]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Foot */}
          <mesh position={[width + 1.8, i * pinSpacing, 0.1]}>
            <boxGeometry args={[1.4, 0.4, 0.2]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Create MCU board 3D model (Arduino, ESP32, etc). */
const MCUBoard3D = ({
  position,
  rotation,
  width,
  length,
  pinCount,
  color = '#0066cc',
}: {
  position: [number, number, number];
  rotation: number;
  width: number;
  length: number;
  pinCount: number;
  color?: string;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const pinsPerSide = pinCount / 2;
  const pinSpacing = 2.54;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* PCB */}
      <mesh position={[width / 2 - 1, ((pinsPerSide - 1) * pinSpacing) / 2, 0.8]}>
        <boxGeometry args={[width + 2, length + 4, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Main chip */}
      <mesh position={[width / 2 - 1, ((pinsPerSide - 1) * pinSpacing) / 2, 2.5]}>
        <boxGeometry args={[8, 8, 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* USB connector */}
      <mesh position={[width / 2 - 1, -3, 2]}>
        <boxGeometry args={[8, 6, 2.5]} />
        <meshStandardMaterial color="#888888" metalness={0.6} />
      </mesh>
      {/* Pin headers */}
      {Array.from({ length: pinsPerSide }).map((_, i) => (
        <mesh key={`left-${i}`} position={[0, i * pinSpacing, 3]}>
          <boxGeometry args={[2.54, 2.54, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {Array.from({ length: pinsPerSide }).map((_, i) => (
        <mesh key={`right-${i}`} position={[width - 2.54, i * pinSpacing, 3]}>
          <boxGeometry args={[2.54, 2.54, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* Gold pins - upright */}
      {Array.from({ length: pinsPerSide }).map((_, i) => (
        <mesh
          key={`pin-left-${i}`}
          position={[0, i * pinSpacing, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: pinsPerSide }).map((_, i) => (
        <mesh
          key={`pin-right-${i}`}
          position={[width - 2.54, i * pinSpacing, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Create audio jack 3D model. */
const AudioJack3D = ({
  position,
  rotation,
  is635 = false,
}: {
  position: [number, number, number];
  rotation: number;
  is635?: boolean;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const scale = is635 ? 1.5 : 1;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Housing */}
      <mesh position={[5 * scale, 1.5 * scale, 3 * scale]}>
        <boxGeometry args={[12 * scale, 6 * scale, 5 * scale]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Jack opening - facing outward along X axis */}
      <mesh position={[11.5 * scale, 1.5 * scale, 3 * scale]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[2 * scale, 2 * scale, 2, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Metal ring - around the opening */}
      <mesh position={[12.5 * scale, 1.5 * scale, 3 * scale]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2.2 * scale, 0.3, 8, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
    </group>
  );
};

/** Create tactile button 3D model. */
const Button3D = ({
  position,
  rotation,
  size = 6,
}: {
  position: [number, number, number];
  rotation: number;
  size?: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const isArcade = size > 12;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Base housing */}
      <mesh position={[size / 2, size / 2, 1.5]}>
        <boxGeometry args={[size, size, 3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* Inner recess */}
      <mesh position={[size / 2, size / 2, 3.1]}>
        <boxGeometry args={[size * 0.7, size * 0.7, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Button cap - upright cylinder */}
      <mesh position={[size / 2, size / 2, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size / 3, size / 3, 2, 16]} />
        <meshStandardMaterial color={isArcade ? '#dd3333' : '#444444'} roughness={0.5} />
      </mesh>
      {/* Cap highlight ring */}
      <mesh position={[size / 2, size / 2, 5.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size / 3.5, 0.1, 8, 16]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Legs (for tactile buttons) */}
      {!isArcade && (
        <>
          <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[0.5, 0.5, 1.5]} />
            <meshStandardMaterial color="#888888" metalness={0.7} />
          </mesh>
          <mesh position={[size, 0, -0.5]}>
            <boxGeometry args={[0.5, 0.5, 1.5]} />
            <meshStandardMaterial color="#888888" metalness={0.7} />
          </mesh>
          <mesh position={[0, size, -0.5]}>
            <boxGeometry args={[0.5, 0.5, 1.5]} />
            <meshStandardMaterial color="#888888" metalness={0.7} />
          </mesh>
          <mesh position={[size, size, -0.5]}>
            <boxGeometry args={[0.5, 0.5, 1.5]} />
            <meshStandardMaterial color="#888888" metalness={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
};

/** Create potentiometer 3D model with knurled shaft. */
const Potentiometer3D = ({
  position,
  rotation,
  size = 9,
}: {
  position: [number, number, number];
  rotation: number;
  size?: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Body - upright cylinder */}
      <mesh position={[2.5, 2.5, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size / 2, size / 2, 4, 20]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.7} />
      </mesh>
      {/* Body ring detail */}
      <mesh position={[2.5, 2.5, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size / 2 - 0.2, 0.3, 8, 20]} />
        <meshStandardMaterial color="#4d4d4d" />
      </mesh>
      {/* Threaded bushing */}
      <mesh position={[2.5, 2.5, 4.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 1, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.7} />
      </mesh>
      {/* Shaft - with knurling effect */}
      <mesh position={[2.5, 2.5, 7.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3, 3, 5, 24]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Knurling rings */}
      {[6, 7, 8, 9].map((z) => (
        <mesh key={z} position={[2.5, 2.5, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.05, 0.08, 4, 24]} />
          <meshStandardMaterial color="#666666" metalness={0.6} />
        </mesh>
      ))}
      {/* Knob indicator - on top of shaft */}
      <mesh position={[2.5, 4.5, 10.5]}>
        <boxGeometry args={[0.5, 2, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Mounting nut */}
      <mesh position={[2.5, 2.5, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4, 4, 0.8, 6]} />
        <meshStandardMaterial color="#999999" metalness={0.8} />
      </mesh>
    </group>
  );
};

/** Create encoder 3D model with knurled shaft. */
const Encoder3D = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Body - square metal housing */}
      <mesh position={[2.5, 3.5, 2]}>
        <boxGeometry args={[11, 11, 4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
      {/* Push button on top of body */}
      <mesh position={[6, 3.5, 4.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.4, 12]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Shaft base */}
      <mesh position={[2.5, 3.5, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 2, 20]} />
        <meshStandardMaterial color="#555555" metalness={0.6} />
      </mesh>
      {/* Shaft - knurled knob */}
      <mesh position={[2.5, 3.5, 9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3, 3, 6, 24]} />
        <meshStandardMaterial color="#777777" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Knurling rings */}
      {[7, 8, 9, 10, 11].map((z) => (
        <mesh key={z} position={[2.5, 3.5, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.05, 0.06, 4, 24]} />
          <meshStandardMaterial color="#555555" metalness={0.6} />
        </mesh>
      ))}
      {/* D-shaft flat indicator - on side of shaft */}
      <mesh position={[2.5, 5.8, 9]}>
        <boxGeometry args={[1, 0.8, 6]} />
        <meshStandardMaterial color="#666666" metalness={0.6} />
      </mesh>
      {/* Mounting tabs */}
      <mesh position={[-3, 3.5, 0]}>
        <boxGeometry args={[2, 2, 0.5]} />
        <meshStandardMaterial color="#888888" metalness={0.6} />
      </mesh>
      <mesh position={[8, 3.5, 0]}>
        <boxGeometry args={[2, 2, 0.5]} />
        <meshStandardMaterial color="#888888" metalness={0.6} />
      </mesh>
    </group>
  );
};

/** Create OLED display 3D model. */
const OLEDDisplay3D = ({
  position,
  rotation,
  width,
  height,
}: {
  position: [number, number, number];
  rotation: number;
  width: number;
  height: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* PCB */}
      <mesh position={[width / 2 - 3, height / 2 - 2, 0.8]}>
        <boxGeometry args={[width, height, 1.6]} />
        <meshStandardMaterial color="#0066aa" roughness={0.7} />
      </mesh>
      {/* Display glass */}
      <mesh position={[width / 2 - 3, height / 2, 2]}>
        <boxGeometry args={[width - 4, height - 4, 1.5]} />
        <meshStandardMaterial color="#000011" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Active display area */}
      <mesh position={[width / 2 - 3, height / 2, 2.8]}>
        <boxGeometry args={[width - 8, height - 8, 0.1]} />
        <meshStandardMaterial color="#001133" emissive="#003366" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

/** Create MIDI DIN connector 3D model. */
const MIDIDIN3D = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Housing - upright cylinder */}
      <mesh position={[2.54, 2.54, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6, 6, 8, 20]} />
        <meshStandardMaterial color="#333333" roughness={0.6} />
      </mesh>
      {/* Face plate - on top */}
      <mesh position={[2.54, 2.54, 8.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[5.5, 5.5, 0.2, 20]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Pin holes - arranged in arc pattern on face */}
      {[
        [0, -2],
        [0, 2],
        [-2, -1],
        [-2, 1],
        [2, 0],
      ].map(([x, y], i) => (
        <mesh key={i} position={[2.54 + x, 2.54 + y, 8.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.3, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      ))}
    </group>
  );
};

/** Create LED matrix 3D model. */
const LEDMatrix3D = ({
  position,
  rotation,
  size,
}: {
  position: [number, number, number];
  rotation: number;
  size: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* PCB */}
      <mesh position={[size / 2, size / 2, 0.8]}>
        <boxGeometry args={[size, size, 1.6]} />
        <meshStandardMaterial color="#1a0000" roughness={0.7} />
      </mesh>
      {/* LED matrix grid */}
      <mesh position={[size / 2, size / 2, 2]}>
        <boxGeometry args={[size - 4, size - 4, 2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* LEDs (8x8 grid simplified) - upright cylinders */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[4 + (col * (size - 8)) / 7, 4 + (row * (size - 8)) / 7, 3.1]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[1, 1, 0.2, 8]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={Math.random() * 0.3}
            />
          </mesh>
        ))
      )}
    </group>
  );
};

/** Create header pin 3D model. */
const HeaderPin3D = ({
  position,
  rotation,
  rows,
  cols,
}: {
  position: [number, number, number];
  rotation: number;
  rows: number;
  cols: number;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const spacing = 2.54;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Plastic housing */}
      <mesh position={[((cols - 1) * spacing) / 2, ((rows - 1) * spacing) / 2, 1.25]}>
        <boxGeometry args={[cols * spacing, rows * spacing, 2.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Pins - centered in housing, extending up and down */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[col * spacing, row * spacing, 2]}>
            <boxGeometry args={[0.6, 0.6, 9]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}
    </group>
  );
};

/** Create switch 3D model. */
const Switch3D = ({
  position,
  rotation,
  isPDT = false,
}: {
  position: [number, number, number];
  rotation: number;
  isPDT?: boolean;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const width = isPDT ? 8 : 6;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Body */}
      <mesh position={[width / 2 - 2.5, 0, 2]}>
        <boxGeometry args={[width, 6, 4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
      {/* Lever - tilted forward */}
      <mesh position={[width / 2 - 2.5, 0.5, 5.5]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>
    </group>
  );
};

/** Create joystick 3D model. */
const Joystick3D = ({
  position,
  rotation,
  isThumb = false,
}: {
  position: [number, number, number];
  rotation: number;
  isThumb?: boolean;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const scale = isThumb ? 1.5 : 1;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Base housing */}
      <mesh position={[5 * scale, 10 * scale, 2]}>
        <boxGeometry args={[15 * scale, 20 * scale, 4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
      {/* Gimbal mount */}
      <mesh position={[5 * scale, 10 * scale, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6 * scale, 6 * scale, 2, 16]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Stick shaft */}
      <mesh position={[5 * scale, 10 * scale, 12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2 * scale, 2 * scale, 12, 12]} />
        <meshStandardMaterial color="#555555" metalness={0.3} />
      </mesh>
      {/* Stick cap */}
      <mesh position={[5 * scale, 10 * scale, 18]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[4 * scale, 16, 16]} />
        <meshStandardMaterial color={isThumb ? '#333333' : '#1a1a1a'} roughness={0.5} />
      </mesh>
      {/* Grip texture on cap */}
      {isThumb && (
        <mesh position={[5 * scale, 10 * scale, 22]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5 * scale, 0.3, 6, 20]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      )}
    </group>
  );
};

/** Create battery holder 3D model. */
const Battery3D = ({
  position,
  rotation,
  type,
}: {
  position: [number, number, number];
  rotation: number;
  type: 'cr2032' | 'aa' | 'aaa' | '9v';
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  if (type === 'cr2032') {
    return (
      <group position={position} rotation={[0, 0, rotRad]}>
        {/* Holder base */}
        <mesh position={[10, 10, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[11, 11, 3, 20]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Battery recess */}
        <mesh position={[10, 10, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[10.2, 10.2, 3.5, 20]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Battery (silver) */}
        <mesh position={[10, 10, 3.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[10, 10, 3.2, 20]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* + marking */}
        <mesh position={[10, 10, 5.2]}>
          <boxGeometry args={[8, 1, 0.1]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        <mesh position={[10, 10, 5.2]}>
          <boxGeometry args={[1, 8, 0.1]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </group>
    );
  }

  if (type === '9v') {
    return (
      <group position={position} rotation={[0, 0, rotRad]}>
        {/* Holder base */}
        <mesh position={[13, 24, 4]}>
          <boxGeometry args={[28, 50, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Battery body */}
        <mesh position={[13, 24, 15]}>
          <boxGeometry args={[26, 48, 17]} />
          <meshStandardMaterial color="#2b5f2b" roughness={0.5} />
        </mesh>
        {/* Top terminals */}
        <mesh position={[8, 24, 24]}>
          <cylinderGeometry args={[3, 3, 2, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.6} />
        </mesh>
        <mesh position={[18, 24, 24]}>
          <cylinderGeometry args={[2, 2, 2, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // AA or AAA battery holder
  const isAA = type === 'aa';
  const length = isAA ? 50 : 44;
  const diameter = isAA ? 14 : 10;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Holder base */}
      <mesh position={[diameter / 2 + 2, length / 2, 3]}>
        <boxGeometry args={[diameter + 6, length + 4, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Battery - lying horizontal */}
      <mesh
        position={[diameter / 2 + 2, length / 2, diameter / 2 + 3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[diameter / 2, diameter / 2, length - 4, 16]} />
        <meshStandardMaterial color="#2b5f2b" roughness={0.5} />
      </mesh>
      {/* Positive terminal */}
      <mesh
        position={[diameter / 2 + 2, length - 2, diameter / 2 + 3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[2.5, 2.5, 2, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} />
      </mesh>
      {/* Spring contact (negative) */}
      <mesh position={[diameter / 2 + 2, 2, diameter / 2 + 3]}>
        <torusGeometry args={[3, 0.5, 4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>
    </group>
  );
};

/** Create Bluetooth module 3D model. */
const Bluetooth3D = ({
  position,
  rotation,
  moduleType,
}: {
  position: [number, number, number];
  rotation: number;
  moduleType: 'hc05' | 'hc06' | 'hm10' | 'rn42' | 'nrf52840';
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  // Module dimensions based on type
  const dims: Record<string, { w: number; h: number; d: number }> = {
    hc05: { w: 15, h: 36, d: 5 },
    hc06: { w: 15, h: 36, d: 5 },
    hm10: { w: 15, h: 28, d: 4 },
    rn42: { w: 15.5, h: 26, d: 3 },
    nrf52840: { w: 17.24, h: 30.48, d: 4 },
  };
  const { w, h, d } = dims[moduleType] || dims.hc05;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* PCB base */}
      <mesh position={[w / 2 - 2, h / 2, 1]}>
        <boxGeometry args={[w, h, 1.6]} />
        <meshStandardMaterial color="#1a5c1a" roughness={0.7} />
      </mesh>
      {/* Main IC/module */}
      <mesh position={[w / 2 - 2, h / 2 - 5, d / 2 + 1.8]}>
        <boxGeometry args={[w - 4, h * 0.6, d]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      {/* Antenna section */}
      <mesh position={[w / 2 - 2, h - 6, 2]}>
        <boxGeometry args={[10, 8, 1]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.3} />
      </mesh>
      {/* Status LED */}
      <mesh position={[w - 5, 3, 2.5]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      {/* Crystal */}
      {(moduleType === 'hc05' || moduleType === 'hc06') && (
        <mesh position={[4, h / 2, 2.5]}>
          <boxGeometry args={[4, 2, 1.5]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.6} />
        </mesh>
      )}
    </group>
  );
};

/** Create SD card module 3D model. */
const SDCard3D = ({
  position,
  rotation,
  isMicro,
}: {
  position: [number, number, number];
  rotation: number;
  isMicro: boolean;
}) => {
  const rotRad = (rotation * Math.PI) / 180;
  const w = isMicro ? 18 : 24;
  const h = isMicro ? 22 : 32;

  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* PCB base */}
      <mesh position={[w / 2 - 2, h / 2, 1]}>
        <boxGeometry args={[w, h, 1.6]} />
        <meshStandardMaterial color="#1a1a5c" roughness={0.7} />
      </mesh>
      {/* Card slot housing */}
      <mesh position={[w / 2 - 2, h / 2 + 3, 4]}>
        <boxGeometry args={[w - 4, h * 0.6, 4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      {/* Card slot opening */}
      <mesh position={[w / 2 - 2, h - 2, 4]}>
        <boxGeometry args={[isMicro ? 12 : 26, 2, 2.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Sample card sticking out */}
      <mesh position={[w / 2 - 2, h + 2, 4]}>
        <boxGeometry args={[isMicro ? 11 : 24, 6, isMicro ? 1 : 2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Voltage regulator */}
      <mesh position={[4, 4, 2.5]}>
        <boxGeometry args={[5, 4, 2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

/** Create connector 3D model. */
const Connector3D = ({
  position,
  rotation,
  type,
}: {
  position: [number, number, number];
  rotation: number;
  type: 'barrel' | 'usb';
}) => {
  const rotRad = (rotation * Math.PI) / 180;

  if (type === 'barrel') {
    return (
      <group position={position} rotation={[0, 0, rotRad]}>
        {/* Housing */}
        <mesh position={[3, 2, 4]}>
          <boxGeometry args={[10, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Jack opening - facing outward */}
        <mesh position={[8.5, 2, 4]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[3, 3, 2, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Center pin */}
        <mesh position={[8.5, 2, 4]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[1, 1, 4, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.7} />
        </mesh>
      </group>
    );
  }

  // USB
  return (
    <group position={position} rotation={[0, 0, rotRad]}>
      {/* Housing */}
      <mesh position={[3.75, 2, 3]}>
        <boxGeometry args={[10, 6, 5]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Opening */}
      <mesh position={[3.75, 2, 5.6]}>
        <boxGeometry args={[8, 3, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

/** Render a single 3D component based on its footprint. */
const Component3D = ({ component, boardThickness }: Component3DProps) => {
  const footprint = getFootprint(component.type);
  const type = component.type;
  const pos: [number, number, number] = [component.pos[0], component.pos[1], boardThickness];

  // Resistor
  if (type === 'resistor_th') {
    return <Resistor3D position={pos} rotation={component.rotation} />;
  }

  // Capacitor
  if (type === 'capacitor_th') {
    return <Capacitor3D position={pos} rotation={component.rotation} />;
  }

  // LED
  if (type === 'led_th') {
    return <LED3D position={pos} rotation={component.rotation} color="#ff0000" />;
  }

  // Headers
  if (type.startsWith('header_')) {
    const match = type.match(/header_(\d+)x(\d+)/);
    if (match) {
      const cols = parseInt(match[1]);
      const rows = parseInt(match[2]);
      return <HeaderPin3D position={pos} rotation={component.rotation} rows={rows} cols={cols} />;
    }
  }

  // MCU boards
  if (type.startsWith('mcu_')) {
    const pinCounts: Record<string, number> = {
      mcu_attiny85: 8,
      mcu_atmega328: 28,
      mcu_arduino_nano: 30,
      mcu_arduino_uno: 28,
      mcu_pro_micro: 24,
      mcu_esp32_devkit: 30,
      mcu_esp32_s3: 44,
      mcu_raspberry_pico: 40,
      mcu_daisy_seed: 40,
      mcu_teensy41: 48,
    };
    const pinCount = pinCounts[type] || 30;
    const colors: Record<string, string> = {
      mcu_arduino_nano: '#008080',
      mcu_arduino_uno: '#008080',
      mcu_pro_micro: '#aa0000',
      mcu_esp32_devkit: '#333333',
      mcu_esp32_s3: '#222222',
      mcu_raspberry_pico: '#00aa55',
      mcu_daisy_seed: '#ffffff',
      mcu_teensy41: '#008800',
    };

    if (type === 'mcu_attiny85' || type === 'mcu_atmega328') {
      return (
        <DIPIC3D
          position={pos}
          rotation={component.rotation}
          width={9.62}
          length={(pinCount / 2) * 2.54}
          pinCount={pinCount}
          hasChip
        />
      );
    }

    const pinsPerSide = pinCount / 2;
    const widths: Record<string, number> = {
      mcu_esp32_devkit: 24.86,
      mcu_esp32_s3: 24.86,
      mcu_arduino_nano: 17.24,
      mcu_arduino_uno: 53.34,
      mcu_pro_micro: 17.24,
      mcu_raspberry_pico: 19.78,
      mcu_daisy_seed: 17.24,
      mcu_teensy41: 17.24,
    };
    return (
      <MCUBoard3D
        position={pos}
        rotation={component.rotation}
        width={widths[type] || 18}
        length={pinsPerSide * 2.54}
        pinCount={pinCount}
        color={colors[type] || '#0066cc'}
      />
    );
  }

  // ICs and Audio Amps
  if (type.startsWith('ic_') || type.startsWith('amp_')) {
    const pinCounts: Record<string, number> = {
      ic_dip8: 8,
      ic_dip14: 14,
      ic_dip16: 16,
      amp_lm386: 8,
      amp_pam8403: 8,
      amp_tda2030: 5,
    };
    const pinCount = pinCounts[type] || 8;
    const length = type === 'amp_tda2030' ? 10 : (pinCount / 2) * 2.54;
    return (
      <DIPIC3D
        position={pos}
        rotation={component.rotation}
        width={9.62}
        length={length}
        pinCount={pinCount}
      />
    );
  }

  // Audio jacks
  if (type.startsWith('jack_')) {
    return (
      <AudioJack3D position={pos} rotation={component.rotation} is635={type === 'jack_trs_635mm'} />
    );
  }

  // MIDI
  if (type === 'midi_din5') {
    return <MIDIDIN3D position={pos} rotation={component.rotation} />;
  }
  if (type === 'midi_trs_type_a') {
    return <AudioJack3D position={pos} rotation={component.rotation} />;
  }

  // Buttons
  if (type.startsWith('button_')) {
    const sizes: Record<string, number> = { button_6mm: 6, button_12mm: 12, button_arcade: 24 };
    return <Button3D position={pos} rotation={component.rotation} size={sizes[type] || 6} />;
  }

  // Potentiometers
  if (type.startsWith('pot_')) {
    if (type === 'pot_slide_45mm') {
      // Slide pot - horizontal track with slider
      const rotRad = (component.rotation * Math.PI) / 180;
      return (
        <group position={pos} rotation={[0, 0, rotRad]}>
          {/* Track housing */}
          <mesh position={[2.5, 22.5, 2.5]}>
            <boxGeometry args={[8, 45, 4]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
          </mesh>
          {/* Slot */}
          <mesh position={[2.5, 22.5, 4.6]}>
            <boxGeometry args={[2, 40, 0.3]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Slider knob */}
          <mesh position={[2.5, 22.5, 6]}>
            <boxGeometry args={[6, 8, 4]} />
            <meshStandardMaterial color="#666666" metalness={0.3} />
          </mesh>
        </group>
      );
    }
    const size = type === 'pot_16mm' ? 16 : 9;
    return <Potentiometer3D position={pos} rotation={component.rotation} size={size} />;
  }

  // Encoders
  if (type.startsWith('encoder_')) {
    return <Encoder3D position={pos} rotation={component.rotation} />;
  }

  // Displays
  if (type.startsWith('display_')) {
    const sizes: Record<string, [number, number]> = {
      display_oled_128x32: [14, 14],
      display_oled_128x64: [18, 27],
      display_oled_spi: [25, 32],
    };
    const [w, h] = sizes[type] || [18, 25];
    return <OLEDDisplay3D position={pos} rotation={component.rotation} width={w} height={h} />;
  }

  // LED Matrix
  if (type === 'led_matrix_8x8') {
    return <LEDMatrix3D position={pos} rotation={component.rotation} size={32} />;
  }
  if (type === 'led_matrix_4x4_btn') {
    return <LEDMatrix3D position={pos} rotation={component.rotation} size={70} />;
  }
  if (type.startsWith('led_neopixel') || type.startsWith('led_ws2812')) {
    // Simplified ring/strip
    const rotRad = (component.rotation * Math.PI) / 180;
    const isRing = type.includes('ring');
    return (
      <group position={pos} rotation={[0, 0, rotRad]}>
        {/* PCB base - upright */}
        <mesh position={[2.54, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[isRing ? 20 : 4, isRing ? 20 : 4, 2, 20]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {isRing &&
          Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            return (
              <mesh key={i} position={[2.54 + Math.cos(angle) * 17, Math.sin(angle) * 17, 2.2]}>
                <boxGeometry args={[3, 3, 0.5]} />
                <meshStandardMaterial
                  color={`hsl(${(i / 16) * 360}, 100%, 50%)`}
                  emissive={`hsl(${(i / 16) * 360}, 100%, 30%)`}
                  emissiveIntensity={0.5}
                />
              </mesh>
            );
          })}
      </group>
    );
  }

  // Switches
  if (type.startsWith('switch_')) {
    return <Switch3D position={pos} rotation={component.rotation} isPDT={type === 'switch_spdt'} />;
  }

  // Joysticks
  if (type === 'joystick_psp') {
    return <Joystick3D position={pos} rotation={component.rotation} isThumb={false} />;
  }
  if (type === 'joystick_thumb') {
    return <Joystick3D position={pos} rotation={component.rotation} isThumb={true} />;
  }

  // Battery holders
  if (type === 'battery_cr2032') {
    return <Battery3D position={pos} rotation={component.rotation} type="cr2032" />;
  }
  if (type === 'battery_aa' || type === 'battery_aa_holder') {
    return <Battery3D position={pos} rotation={component.rotation} type="aa" />;
  }
  if (type === 'battery_aaa' || type === 'battery_aaa_holder') {
    return <Battery3D position={pos} rotation={component.rotation} type="aaa" />;
  }
  if (type === 'battery_9v' || type === 'battery_9v_holder') {
    return <Battery3D position={pos} rotation={component.rotation} type="9v" />;
  }

  // Bluetooth modules
  if (type.startsWith('bt_')) {
    const btTypes: Record<string, 'hc05' | 'hc06' | 'hm10' | 'rn42' | 'nrf52840'> = {
      bt_hc05: 'hc05',
      bt_hc06: 'hc06',
      bt_hm10: 'hm10',
      bt_rn42: 'rn42',
      bt_nrf52840: 'nrf52840',
    };
    return (
      <Bluetooth3D
        position={pos}
        rotation={component.rotation}
        moduleType={btTypes[type] || 'hc05'}
      />
    );
  }

  // SD Card modules
  if (type.startsWith('sdcard_')) {
    return (
      <SDCard3D position={pos} rotation={component.rotation} isMicro={type.includes('micro')} />
    );
  }

  // Connectors
  if (type === 'connector_barrel' || type === 'connector_dc_barrel') {
    return <Connector3D position={pos} rotation={component.rotation} type="barrel" />;
  }
  if (type === 'connector_usb' || type === 'connector_usb_b') {
    return <Connector3D position={pos} rotation={component.rotation} type="usb" />;
  }

  // Fallback: generic component from footprint
  const geometry = useMemo(() => {
    if (footprint?.outline && footprint.outline.length >= 3) {
      const shape = new THREE.Shape();
      shape.moveTo(footprint.outline[0][0], footprint.outline[0][1]);
      for (let i = 1; i < footprint.outline.length; i++) {
        shape.lineTo(footprint.outline[i][0], footprint.outline[i][1]);
      }
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: 3, bevelEnabled: false });
    }
    return new THREE.BoxGeometry(8, 8, 3);
  }, [footprint]);

  const rotationRad = (component.rotation * Math.PI) / 180;

  return (
    <group position={pos} rotation={[0, 0, rotationRad]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#4169E1" roughness={0.7} metalness={0.1} />
      </mesh>
      {footprint?.pads.map((pad, i) => (
        <mesh key={i} position={[pad.pos[0], pad.pos[1], -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[(pad.dia || 1.5) / 2, (pad.dia || 1.5) / 2, 0.2, 16]} />
          <meshStandardMaterial color="#B87333" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const ComponentMarkers = () => {
  const { project } = useProjectStore();
  const { x: centerX, y: centerY } = getBoundsCenter(project.board.boundary);

  return (
    <group position={[-centerX, -centerY, 0]}>
      {project.components.map((comp) => (
        <Component3D key={comp.id} component={comp} boardThickness={project.board.thickness} />
      ))}
    </group>
  );
};

const ViaMarkers = () => {
  const { project } = useProjectStore();
  const { x: centerX, y: centerY } = getBoundsCenter(project.board.boundary);

  return (
    <group position={[-centerX, -centerY, 0]}>
      {project.vias.map((via, index) => (
        <mesh
          key={index}
          position={[via.pos[0], via.pos[1], project.board.thickness / 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[via.dia / 2, via.dia / 2, project.board.thickness + 0.2, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
};

/** Renders the enclosure lid above the board. */
const LidMesh = () => {
  const { project } = useProjectStore();
  const { enclosure, showLid } = useEnclosureStore();

  const lidGroup = useMemo(() => {
    if (!enclosure.enabled || !showLid) return null;

    const boundary = project.board.boundary;
    if (boundary.length === 0) return null;

    // Calculate board bounds
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    boundary.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    const bounds = {
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };

    return createCompleteLid(bounds, enclosure);
  }, [enclosure, showLid, project.board.boundary]);

  if (!lidGroup) return null;

  const { x: centerX, y: centerY } = getBoundsCenter(project.board.boundary);
  const lidZ = project.board.thickness + enclosure.lidHeight + 5; // Float above board

  return (
    <group position={[-centerX, -centerY, lidZ]}>
      <primitive object={lidGroup} />
    </group>
  );
};

type SceneProps = {
  clipEnabled: boolean;
  clipPosition: number;
  explodedView: boolean;
  explodeOffset: number;
  showLid: boolean;
};

const ClippingPlane = ({ position }: { position: number }) => {
  return (
    <mesh position={[position, 0, 5]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial color="#ff6b6b" opacity={0.15} transparent side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Animated loading spinner for 3D scene. */
const LoadingSpinner = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <Html center>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: '#888',
          fontSize: '14px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #6c63ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span>Loading 3D Preview...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
};

const Scene = ({ clipEnabled, clipPosition, explodedView, explodeOffset, showLid }: SceneProps) => {
  const clippingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipPosition),
    [clipPosition]
  );

  // Exploded view offsets
  const boardZ = explodedView ? 0 : 0;
  const routeZ = explodedView ? explodeOffset : 0;
  const componentZ = explodedView ? explodeOffset * 2 : 0;
  const lidZ = explodedView ? explodeOffset * 3 : 0;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 50, 50]} intensity={1} castShadow />
      <directionalLight position={[-50, -50, 50]} intensity={0.3} />

      <Suspense fallback={<LoadingSpinner />}>
        {/* Board layer */}
        <group position={[0, 0, boardZ]}>
          <BoardMesh clippingPlane={clipEnabled ? clippingPlane : null} />
        </group>

        {/* Routes layer */}
        <group position={[0, 0, routeZ]}>
          <RouteLines />
          <ViaMarkers />
        </group>

        {/* Components layer */}
        <group position={[0, 0, componentZ]}>
          <ComponentMarkers />
        </group>

        {/* Lid layer */}
        {showLid && (
          <group position={[0, 0, lidZ]}>
            <LidMesh />
          </group>
        )}
      </Suspense>

      {clipEnabled && <ClippingPlane position={clipPosition} />}

      {/* Exploded view guide line */}
      {explodedView && (
        <Line
          points={[
            [0, 0, 0],
            [0, 0, componentZ + 30],
          ]}
          color="#666666"
          lineWidth={1}
          dashed
          dashScale={10}
        />
      )}

      <Grid
        position={[0, 0, -0.1]}
        args={[200, 200]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#444"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#666"
        fadeDistance={400}
        fadeStrength={1}
        followCamera={false}
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={20}
        maxDistance={500}
      />
    </>
  );
};

type ThreePreviewProps = {
  expanded?: boolean;
};

const ThreePreview = ({ expanded = false }: ThreePreviewProps) => {
  const { enclosure, showLid, setShowLid } = useEnclosureStore();
  const [clipEnabled, setClipEnabled] = useState(false);
  const [clipPosition, setClipPosition] = useState(50);
  const [explodedView, setExplodedView] = useState(false);
  const [explodeOffset, setExplodeOffset] = useState(30);

  return (
    <div
      style={{
        width: '100%',
        height: expanded ? '100%' : '250px',
        minHeight: expanded ? '400px' : '250px',
        background: '#1a1a2e',
        border: expanded ? 'none' : '1px solid #444',
        borderRadius: expanded ? '0' : '4px',
        position: 'relative',
      }}
    >
      {expanded && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 10,
            background: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <label
            style={{
              color: '#fff',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <input
              type="checkbox"
              checked={clipEnabled}
              onChange={(e) => setClipEnabled(e.target.checked)}
            />
            Section Plane
          </label>
          {clipEnabled && (
            <input
              type="range"
              min={-50}
              max={150}
              value={clipPosition}
              onChange={(e) => setClipPosition(Number(e.target.value))}
              style={{ width: '120px' }}
            />
          )}
          <label
            style={{
              color: '#fff',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <input
              type="checkbox"
              checked={explodedView}
              onChange={(e) => setExplodedView(e.target.checked)}
            />
            Exploded View
          </label>
          {explodedView && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#888', fontSize: '10px' }}>Spacing:</span>
              <input
                type="range"
                min={10}
                max={80}
                value={explodeOffset}
                onChange={(e) => setExplodeOffset(Number(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>
          )}
          {enclosure.enabled && (
            <label
              style={{
                color: '#fff',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <input
                type="checkbox"
                checked={showLid}
                onChange={(e) => setShowLid(e.target.checked)}
              />
              Show Lid
            </label>
          )}
        </div>
      )}
      <Canvas
        camera={{ position: [80, -80, 80], fov: 50, near: 1, far: 1000 }}
        gl={{ localClippingEnabled: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene
          clipEnabled={clipEnabled}
          clipPosition={clipPosition}
          explodedView={explodedView}
          explodeOffset={explodeOffset}
          showLid={enclosure.enabled && showLid}
        />
      </Canvas>
    </div>
  );
};

export default ThreePreview;
