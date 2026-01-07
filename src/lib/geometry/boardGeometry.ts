import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import type { Board, Vec2 } from '../../types';

const evaluator = new Evaluator();

/**
 * Create board base geometry from board definition
 */
export const createBoardGeometry = (board: Board): THREE.Mesh => {
  let baseMesh: THREE.Mesh;

  switch (board.shape) {
    case 'rectangular':
      baseMesh = createRectangularBoard(board.boundary, board.thickness);
      break;
    case 'circular':
      baseMesh = createCircularBoard(board.boundary, board.thickness);
      break;
    case 'freeform':
      baseMesh = createFreeformBoard(board.boundary, board.thickness);
      break;
    default:
      throw new Error(`Unsupported board shape: ${board.shape}`);
  }

  // Subtract mounting holes
  for (const feature of board.features) {
    if (feature.type === 'mount') {
      const hole = createCylinder(feature.pos, feature.dia / 2, board.thickness + 0.1);
      baseMesh = subtractMesh(baseMesh, hole);
    }
  }

  return baseMesh;
};

/**
 * Create rectangular board
 */
const createRectangularBoard = (boundary: Vec2[], thickness: number): THREE.Mesh => {
  if (boundary.length !== 4) {
    throw new Error('Rectangular board requires exactly 4 boundary points');
  }

  // Use extrusion for rectangular boards too for consistency
  const shape = new THREE.Shape();
  shape.moveTo(boundary[0][0], boundary[0][1]);
  for (let i = 1; i < boundary.length; i++) {
    shape.lineTo(boundary[i][0], boundary[i][1]);
  }
  shape.closePath();

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0x228b22 });

  return new THREE.Mesh(geometry, material);
};

/**
 * Create circular board
 */
const createCircularBoard = (boundary: Vec2[], thickness: number): THREE.Mesh => {
  if (boundary.length < 3) {
    throw new Error('Circular board requires at least 3 boundary points');
  }

  const center = calculateCenter(boundary);
  const radius = calculateRadius(center, boundary);

  // Create circular shape for extrusion
  const shape = new THREE.Shape();
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = center[0] + Math.cos(angle) * radius;
    const y = center[1] + Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0x228b22 });

  return new THREE.Mesh(geometry, material);
};

/**
 * Create freeform polygon board using extrusion
 */
const createFreeformBoard = (boundary: Vec2[], thickness: number): THREE.Mesh => {
  if (boundary.length < 3) {
    throw new Error('Freeform board requires at least 3 boundary points');
  }

  const shape = new THREE.Shape();
  shape.moveTo(boundary[0][0], boundary[0][1]);

  for (let i = 1; i < boundary.length; i++) {
    shape.lineTo(boundary[i][0], boundary[i][1]);
  }

  shape.closePath();

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0x228b22 });

  return new THREE.Mesh(geometry, material);
};

/**
 * Create cylinder (for holes)
 */
export const createCylinder = (center: Vec2, radius: number, height: number): THREE.Mesh => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const mesh = new THREE.Mesh(geometry, material);

  // Rotate to align with Z axis and position
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(center[0], center[1], height / 2);

  return mesh;
};

/**
 * Subtract one mesh from another using CSG
 */
export const subtractMesh = (base: THREE.Mesh, tool: THREE.Mesh): THREE.Mesh => {
  // Update matrices
  base.updateMatrixWorld(true);
  tool.updateMatrixWorld(true);

  const baseBrush = new Brush(base.geometry.clone());
  baseBrush.applyMatrix4(base.matrixWorld);

  const toolBrush = new Brush(tool.geometry.clone());
  toolBrush.applyMatrix4(tool.matrixWorld);

  const result = evaluator.evaluate(baseBrush, toolBrush, SUBTRACTION);

  const material = base.material as THREE.Material;
  return new THREE.Mesh(result.geometry, material);
};

/**
 * Calculate center from boundary points
 */
const calculateCenter = (points: Vec2[]): Vec2 => {
  const sumX = points.reduce((sum, p) => sum + p[0], 0);
  const sumY = points.reduce((sum, p) => sum + p[1], 0);
  return [sumX / points.length, sumY / points.length];
};

/**
 * Calculate radius from center to boundary points (average)
 */
const calculateRadius = (center: Vec2, points: Vec2[]): number => {
  const distances = points.map((p) => {
    const dx = p[0] - center[0];
    const dy = p[1] - center[1];
    return Math.sqrt(dx * dx + dy * dy);
  });
  return distances.reduce((sum, d) => sum + d, 0) / distances.length;
};
