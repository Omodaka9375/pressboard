import * as THREE from 'three';
import { Brush, Evaluator, ADDITION } from 'three-bvh-csg';
import type { Via, Vec2, Component } from '../../types';
import { createCylinder, subtractMesh } from './boardGeometry';

const evaluator = new Evaluator();

/**
 * Create via hole with chamfer and optional anchor recess
 */
export const createViaGeometry = (via: Via, boardThickness: number): THREE.Mesh => {
  // Main hole
  let viaGeometry = createCylinder(via.pos, via.dia / 2, boardThickness + 0.2);

  // Add chamfer if specified
  if (via.chamfer && via.chamfer > 0) {
    const chamferMesh = createChamfer(via.pos, via.dia / 2, via.chamfer);
    viaGeometry = unionMesh(viaGeometry, chamferMesh);
  }

  // Add anchor recess if specified
  if (via.anchorRecess && via.anchorRecess > 0) {
    const anchorMesh = createAnchorRecess(via.pos, via.dia / 2, via.anchorRecess);
    viaGeometry = unionMesh(viaGeometry, anchorMesh);
  }

  return viaGeometry;
};

/**
 * Create chamfer cone at top of via
 */
const createChamfer = (center: Vec2, holeRadius: number, chamferDepth: number): THREE.Mesh => {
  const topRadius = holeRadius + chamferDepth;
  const geometry = new THREE.ConeGeometry(topRadius, chamferDepth, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const mesh = new THREE.Mesh(geometry, material);

  // Position at top of hole
  mesh.rotation.x = Math.PI;
  mesh.position.set(center[0], center[1], chamferDepth / 2);

  return mesh;
};

/**
 * Create shallow circular recess around via for tape anchor
 */
const createAnchorRecess = (center: Vec2, holeRadius: number, recessDepth: number): THREE.Mesh => {
  const recessRadius = holeRadius * 2;
  const geometry = new THREE.CylinderGeometry(recessRadius, recessRadius, recessDepth, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(center[0], center[1], recessDepth / 2);

  return mesh;
};

/**
 * Union two meshes
 */
const unionMesh = (mesh1: THREE.Mesh, mesh2: THREE.Mesh): THREE.Mesh => {
  mesh1.updateMatrixWorld(true);
  mesh2.updateMatrixWorld(true);

  const brush1 = new Brush(mesh1.geometry.clone());
  brush1.applyMatrix4(mesh1.matrixWorld);

  const brush2 = new Brush(mesh2.geometry.clone());
  brush2.applyMatrix4(mesh2.matrixWorld);

  const result = evaluator.evaluate(brush1, brush2, ADDITION);
  const material = mesh1.material as THREE.Material;
  return new THREE.Mesh(result.geometry, material);
};

/**
 * Apply all vias to board mesh
 */
export const applyViasToBoard = (
  boardMesh: THREE.Mesh,
  vias: Via[],
  boardThickness: number
): THREE.Mesh => {
  let result = boardMesh;

  for (const via of vias) {
    try {
      const viaGeometry = createViaGeometry(via, boardThickness);
      result = subtractMesh(result, viaGeometry);
    } catch (error) {
      console.error('Failed to apply via:', error);
    }
  }

  return result;
};

/**
 * Apply component holes to board mesh
 */
export const applyComponentHoles = (
  boardMesh: THREE.Mesh,
  components: Component[],
  boardThickness: number
): THREE.Mesh => {
  let result = boardMesh;

  for (const component of components) {
    for (const hole of component.holes) {
      try {
        const transformedPos = transformPoint(hole.pos, component.pos, component.rotation);
        const holeGeometry = createCylinder(transformedPos, hole.dia / 2, boardThickness + 0.2);
        result = subtractMesh(result, holeGeometry);
      } catch (error) {
        console.error('Failed to apply component hole:', error);
      }
    }
  }

  return result;
};

/**
 * Transform point by position and rotation
 */
const transformPoint = (point: Vec2, offset: Vec2, rotation: number): Vec2 => {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  const rotatedX = point[0] * cos - point[1] * sin;
  const rotatedY = point[0] * sin + point[1] * cos;

  return [rotatedX + offset[0], rotatedY + offset[1]];
};
