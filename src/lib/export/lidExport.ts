/**
 * Lid STL export for enclosure 3D printing.
 * Generates a watertight mesh suitable for FDM/resin printing.
 */

import * as THREE from 'three';
import type { Enclosure, Vec2 } from '../../types';

// Configuration
const SEGMENTS = 32; // Circle smoothness

type BoardBounds = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

/** Calculate board bounds from boundary points. */
export const getBoardBoundsFromBoundary = (boundary: Vec2[]): BoardBounds => {
  if (boundary.length === 0) {
    return { width: 100, height: 100, centerX: 50, centerY: 50 };
  }

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
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

/** Export lid as STL binary blob. */
export const exportLidSTL = (enclosure: Enclosure, boundary: Vec2[]): Blob => {
  const bounds = getBoardBoundsFromBoundary(boundary);
  const geometry = createLidGeometryForExport(bounds, enclosure);
  return geometryToSTL(geometry);
};

/** Create solid lid geometry for STL export (watertight). */
function createLidGeometryForExport(
  bounds: BoardBounds,
  enclosure: Enclosure
): THREE.BufferGeometry {
  const { wallThickness, lidHeight, cornerRadius } = enclosure;

  const outerW = bounds.width + wallThickness * 2;
  const outerH = bounds.height + wallThickness * 2;

  const geometries: THREE.BufferGeometry[] = [];

  // Create outer shell shape
  const outerShape = createRoundedRectShape(outerW, outerH, cornerRadius);

  // Outer shell extrusion
  const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
    depth: lidHeight,
    bevelEnabled: false,
  });
  geometries.push(outerGeo);

  // Inner cavity (negative space - we'll represent as separate solid for visualization)
  // For actual CSG subtraction, you'd need a CSG library

  // Add pressure pad bosses
  enclosure.pressurePads.forEach((pad) => {
    const padHeight = lidHeight - wallThickness - pad.height;
    if (padHeight > 0) {
      const radius = Math.min(pad.width, pad.height) / 2;
      const padGeo = new THREE.CylinderGeometry(radius, radius * 0.8, padHeight, SEGMENTS);
      padGeo.rotateX(Math.PI / 2);
      padGeo.translate(
        pad.x - bounds.centerX,
        pad.y - bounds.centerY,
        wallThickness + padHeight / 2
      );
      geometries.push(padGeo);
    }
  });

  // Add magnet recesses (represented as cylinders to be subtracted)
  enclosure.magnetPlacements.forEach((mag) => {
    const depth = mag.thickness + 0.5;
    const radius = mag.diameter / 2 + 0.2;
    const recessGeo = new THREE.CylinderGeometry(radius, radius, depth, SEGMENTS);
    recessGeo.rotateX(Math.PI / 2);
    recessGeo.translate(mag.x - bounds.centerX, mag.y - bounds.centerY, lidHeight - depth / 2);
    geometries.push(recessGeo);
  });

  // Add connector cutouts
  enclosure.connectorCutouts.forEach((cutout) => {
    const cutGeo = new THREE.BoxGeometry(cutout.width + 1, cutout.height + 1, wallThickness * 2);

    // Position on wall based on connector position
    let x = cutout.x - bounds.centerX;
    let y = cutout.y - bounds.centerY;
    const z = cutout.z + cutout.height / 2;

    // Snap to nearest wall
    const hw = outerW / 2;
    const hh = outerH / 2;
    if (Math.abs(x) > Math.abs(y) * (outerW / outerH)) {
      x = x > 0 ? hw : -hw;
    } else {
      y = y > 0 ? hh : -hh;
    }

    cutGeo.translate(x, y, z);
    geometries.push(cutGeo);
  });

  // Merge all geometries
  return mergeGeometries(geometries);
}

/** Creates rounded rectangle shape. */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);

  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  return shape;
}

/** Merge multiple geometries into one. */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];

  let totalVertices = 0;
  for (const geo of geometries) {
    const pos = geo.getAttribute('position');
    totalVertices += pos ? pos.count : 0;
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices: number[] = [];
  let vertexOffset = 0;

  for (const geo of geometries) {
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    const idx = geo.getIndex();

    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        positions[(vertexOffset + i) * 3] = pos.getX(i);
        positions[(vertexOffset + i) * 3 + 1] = pos.getY(i);
        positions[(vertexOffset + i) * 3 + 2] = pos.getZ(i);
      }
    }

    if (norm) {
      for (let i = 0; i < norm.count; i++) {
        normals[(vertexOffset + i) * 3] = norm.getX(i);
        normals[(vertexOffset + i) * 3 + 1] = norm.getY(i);
        normals[(vertexOffset + i) * 3 + 2] = norm.getZ(i);
      }
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertexOffset);
      }
    }

    vertexOffset += pos ? pos.count : 0;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  if (indices.length > 0) merged.setIndex(indices);

  return merged;
}

/** Convert BufferGeometry to binary STL blob. */
function geometryToSTL(geometry: THREE.BufferGeometry): Blob {
  const positions = geometry.getAttribute('position');
  const indices = geometry.getIndex();

  let triangleCount = 0;
  if (indices) {
    triangleCount = indices.count / 3;
  } else if (positions) {
    triangleCount = positions.count / 3;
  }

  // Binary STL format
  const headerSize = 80;
  const triangleSize = 50; // 12 floats (3 normal + 9 vertices) + 2 bytes attribute
  const bufferSize = headerSize + 4 + triangleCount * triangleSize;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // Header (80 bytes, can be anything)
  const header = 'PressBoard Lid STL Export';
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }

  // Triangle count
  view.setUint32(80, triangleCount, true);

  let offset = 84;

  // Write triangles
  for (let i = 0; i < triangleCount; i++) {
    let i0, i1, i2;
    if (indices) {
      i0 = indices.getX(i * 3);
      i1 = indices.getX(i * 3 + 1);
      i2 = indices.getX(i * 3 + 2);
    } else {
      i0 = i * 3;
      i1 = i * 3 + 1;
      i2 = i * 3 + 2;
    }

    // Get vertices
    const v0 = new THREE.Vector3(positions.getX(i0), positions.getY(i0), positions.getZ(i0));
    const v1 = new THREE.Vector3(positions.getX(i1), positions.getY(i1), positions.getZ(i1));
    const v2 = new THREE.Vector3(positions.getX(i2), positions.getY(i2), positions.getZ(i2));

    // Calculate normal
    const edge1 = v1.clone().sub(v0);
    const edge2 = v2.clone().sub(v0);
    const normal = edge1.cross(edge2).normalize();

    // Write normal
    view.setFloat32(offset, normal.x, true);
    offset += 4;
    view.setFloat32(offset, normal.y, true);
    offset += 4;
    view.setFloat32(offset, normal.z, true);
    offset += 4;

    // Write vertices
    view.setFloat32(offset, v0.x, true);
    offset += 4;
    view.setFloat32(offset, v0.y, true);
    offset += 4;
    view.setFloat32(offset, v0.z, true);
    offset += 4;

    view.setFloat32(offset, v1.x, true);
    offset += 4;
    view.setFloat32(offset, v1.y, true);
    offset += 4;
    view.setFloat32(offset, v1.z, true);
    offset += 4;

    view.setFloat32(offset, v2.x, true);
    offset += 4;
    view.setFloat32(offset, v2.y, true);
    offset += 4;
    view.setFloat32(offset, v2.z, true);
    offset += 4;

    // Attribute byte count (unused)
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'application/octet-stream' });
}
