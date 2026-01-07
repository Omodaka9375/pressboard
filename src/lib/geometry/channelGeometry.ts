import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import type { Route, Vec2 } from '../../types';
import { filletPolyline } from '../routing/routingUtils';

const evaluator = new Evaluator();

/**
 * Generate channel geometry from route
 */
export const generateChannelGeometry = (route: Route, minBendRadius: number): THREE.Mesh => {
  const filletedPolyline = filletPolyline(route.polyline, minBendRadius);

  switch (route.profile) {
    case 'U':
      return createUChannelGeometry(filletedPolyline, route.width, route.depth);
    case 'V':
      return createVChannelGeometry(filletedPolyline, route.width, route.depth);
    case 'flat':
      return createFlatChannelGeometry(filletedPolyline, route.width, route.depth);
    default:
      throw new Error(`Unsupported channel profile: ${route.profile}`);
  }
};

/**
 * Create U-profile channel using tube geometry segments
 */
const createUChannelGeometry = (polyline: Vec2[], width: number, depth: number): THREE.Mesh => {
  return createChannelFromPolyline(polyline, width, depth, 'U');
};

/**
 * Create V-profile channel
 */
const createVChannelGeometry = (polyline: Vec2[], width: number, depth: number): THREE.Mesh => {
  return createChannelFromPolyline(polyline, width, depth, 'V');
};

/**
 * Create flat-bottom channel
 */
const createFlatChannelGeometry = (polyline: Vec2[], width: number, depth: number): THREE.Mesh => {
  return createChannelFromPolyline(polyline, width, depth, 'flat');
};

/**
 * Create channel mesh from polyline using extruded shape
 */
const createChannelFromPolyline = (
  polyline: Vec2[],
  width: number,
  depth: number,
  profile: string
): THREE.Mesh => {
  if (polyline.length < 2) {
    throw new Error('Polyline must have at least 2 points');
  }

  // Create path from polyline
  const path = new THREE.CurvePath<THREE.Vector3>();

  for (let i = 0; i < polyline.length - 1; i++) {
    const start = new THREE.Vector3(polyline[i][0], polyline[i][1], 0);
    const end = new THREE.Vector3(polyline[i + 1][0], polyline[i + 1][1], 0);
    path.add(new THREE.LineCurve3(start, end));
  }

  // Create profile shape based on type
  const shape = createProfileShape(width, depth, profile);

  // Extrude shape along path
  const extrudeSettings = {
    steps: Math.max(polyline.length * 10, 20),
    bevelEnabled: false,
    extrudePath: path,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown for channels

  return new THREE.Mesh(geometry, material);
};

/**
 * Create profile shape for channel cross-section
 */
const createProfileShape = (width: number, depth: number, profile: string): THREE.Shape => {
  const shape = new THREE.Shape();
  const halfWidth = width / 2;

  switch (profile) {
    case 'U': {
      // U-profile: rounded bottom
      shape.moveTo(-halfWidth, 0);
      shape.lineTo(-halfWidth, -depth + halfWidth);
      shape.absarc(0, -depth + halfWidth, halfWidth, Math.PI, 0, true);
      shape.lineTo(halfWidth, 0);
      shape.lineTo(-halfWidth, 0);
      break;
    }
    case 'V': {
      // V-profile: triangular
      shape.moveTo(-halfWidth, 0);
      shape.lineTo(0, -depth);
      shape.lineTo(halfWidth, 0);
      shape.lineTo(-halfWidth, 0);
      break;
    }
    case 'flat':
    default: {
      // Flat profile: rectangular
      shape.moveTo(-halfWidth, 0);
      shape.lineTo(-halfWidth, -depth);
      shape.lineTo(halfWidth, -depth);
      shape.lineTo(halfWidth, 0);
      shape.lineTo(-halfWidth, 0);
      break;
    }
  }

  return shape;
};

/**
 * Apply all channels to board mesh
 */
export const applyChannelsToBoard = (
  boardMesh: THREE.Mesh,
  routes: Route[],
  minBendRadius: number
): THREE.Mesh => {
  let result = boardMesh;

  for (const route of routes) {
    try {
      const channel = generateChannelGeometry(route, minBendRadius);

      // Update matrices
      result.updateMatrixWorld(true);
      channel.updateMatrixWorld(true);

      const baseBrush = new Brush(result.geometry.clone());
      baseBrush.applyMatrix4(result.matrixWorld);

      const toolBrush = new Brush(channel.geometry.clone());
      toolBrush.applyMatrix4(channel.matrixWorld);

      const csgResult = evaluator.evaluate(baseBrush, toolBrush, SUBTRACTION);
      const material = result.material as THREE.Material;
      result = new THREE.Mesh(csgResult.geometry, material);
    } catch (error) {
      console.error('Failed to apply channel:', error);
    }
  }

  return result;
};
