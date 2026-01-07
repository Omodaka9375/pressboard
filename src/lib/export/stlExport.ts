import * as THREE from 'three';
import { createBoardGeometry } from '../geometry/boardGeometry';
import { applyChannelsToBoard } from '../geometry/channelGeometry';
import { applyViasToBoard, applyComponentHoles } from '../geometry/viaGeometry';
import type { Project } from '../../types';

/**
 * Generate complete board geometry with all features
 */
export const generateCompleteGeometry = (project: Project): THREE.Mesh => {
  // Create base board
  let geometry = createBoardGeometry(project.board);

  // Apply channels
  if (project.routes.length > 0) {
    geometry = applyChannelsToBoard(geometry, project.routes, project.rules.minBendRadius);
  }

  // Apply vias
  if (project.vias.length > 0) {
    geometry = applyViasToBoard(geometry, project.vias, project.board.thickness);
  }

  // Apply component holes
  if (project.components.length > 0) {
    geometry = applyComponentHoles(geometry, project.components, project.board.thickness);
  }

  return geometry;
};

/**
 * Export board geometry as STL file
 */
export const exportSTL = (project: Project): Blob => {
  try {
    const mesh = generateCompleteGeometry(project);
    const stlContent = generateSTLContent(mesh);
    return new Blob([stlContent], { type: 'model/stl' });
  } catch (error) {
    console.error('STL export failed:', error);
    throw new Error('Failed to export STL');
  }
};

/**
 * Generate ASCII STL content from Three.js mesh
 */
const generateSTLContent = (mesh: THREE.Mesh): string => {
  mesh.updateMatrixWorld(true);

  const geometry = mesh.geometry;
  const positions = geometry.attributes.position;
  const indices = geometry.index;

  let stl = 'solid exported\n';

  if (indices) {
    // Indexed geometry
    for (let i = 0; i < indices.count; i += 3) {
      const i1 = indices.getX(i);
      const i2 = indices.getX(i + 1);
      const i3 = indices.getX(i + 2);

      const v1 = new THREE.Vector3().fromBufferAttribute(positions, i1);
      const v2 = new THREE.Vector3().fromBufferAttribute(positions, i2);
      const v3 = new THREE.Vector3().fromBufferAttribute(positions, i3);

      // Apply mesh transform
      v1.applyMatrix4(mesh.matrixWorld);
      v2.applyMatrix4(mesh.matrixWorld);
      v3.applyMatrix4(mesh.matrixWorld);

      stl += writeTriangle(v1, v2, v3);
    }
  } else {
    // Non-indexed geometry
    for (let i = 0; i < positions.count; i += 3) {
      const v1 = new THREE.Vector3().fromBufferAttribute(positions, i);
      const v2 = new THREE.Vector3().fromBufferAttribute(positions, i + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(positions, i + 2);

      v1.applyMatrix4(mesh.matrixWorld);
      v2.applyMatrix4(mesh.matrixWorld);
      v3.applyMatrix4(mesh.matrixWorld);

      stl += writeTriangle(v1, v2, v3);
    }
  }

  stl += 'endsolid exported\n';
  return stl;
};

/**
 * Write single triangle to STL format
 */
const writeTriangle = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3): string => {
  // Calculate normal
  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

  let str = `  facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
  str += `    outer loop\n`;
  str += `      vertex ${v1.x} ${v1.y} ${v1.z}\n`;
  str += `      vertex ${v2.x} ${v2.y} ${v2.z}\n`;
  str += `      vertex ${v3.x} ${v3.y} ${v3.z}\n`;
  str += `    endloop\n`;
  str += `  endfacet\n`;

  return str;
};

/**
 * Download STL file
 */
export const downloadSTL = (project: Project): void => {
  const blob = exportSTL(project);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_')}.stl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
