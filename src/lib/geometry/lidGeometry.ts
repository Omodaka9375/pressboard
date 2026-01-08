/**
 * Lid geometry generation for press-fit enclosures.
 * Creates hollow lid shells with pressure pads, magnet recesses, ventilation,
 * screw bosses, feet, and base shells for split-case/tray styles.
 */

import * as THREE from 'three';
import type {
  Enclosure,
  PressurePad,
  MagnetPlacement,
  ScrewBoss,
  EnclosureFoot,
  VentPattern,
} from '../../types';

// Configuration constants
const SNAP_FIT_DEPTH = 1.5;
const SNAP_FIT_WIDTH = 3;
const MAGNET_RECESS_EXTRA = 0.2; // Extra clearance for magnet fit

type BoardBounds = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

/** Creates the main lid shell geometry. */
export function createLidGeometry(bounds: BoardBounds, enclosure: Enclosure): THREE.BufferGeometry {
  const { wallThickness, lidHeight, cornerRadius, snapFitTolerance } = enclosure;
  const outerW = bounds.width + wallThickness * 2;
  const outerH = bounds.height + wallThickness * 2;
  const innerW = bounds.width + snapFitTolerance;
  const innerH = bounds.height + snapFitTolerance;

  // Create outer shell
  const outerShape = createRoundedRectShape(outerW, outerH, cornerRadius);
  const innerShape = createRoundedRectShape(
    innerW,
    innerH,
    Math.max(0, cornerRadius - wallThickness)
  );

  // Create lid as extrusion
  const extrudeSettings = {
    depth: lidHeight,
    bevelEnabled: false,
  };

  // Create outer geometry
  const outerGeo = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);

  // Create inner cavity (subtract from outer)
  const innerExtrudeSettings = {
    depth: lidHeight - wallThickness,
    bevelEnabled: false,
  };
  const innerGeo = new THREE.ExtrudeGeometry(innerShape, innerExtrudeSettings);
  innerGeo.translate(0, 0, wallThickness);

  // For now, return outer shell - CSG subtraction would require external library
  // The visual representation shows the lid box
  outerGeo.translate(bounds.centerX, bounds.centerY, 0);

  return outerGeo;
}

/** Creates rounded rectangle shape for extrusion. */
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

/** Creates pressure pad geometry as cylinders or boxes inside lid. */
export function createPressurePadGeometry(
  pad: PressurePad,
  lidHeight: number,
  wallThickness: number
): THREE.BufferGeometry {
  const padHeight = lidHeight - wallThickness - pad.height;

  if (padHeight <= 0) {
    // Component is taller than lid cavity - create minimal pad
    const minGeo = new THREE.CylinderGeometry(1, 1, 0.5, 16);
    minGeo.rotateX(Math.PI / 2);
    minGeo.translate(pad.x, pad.y, wallThickness + 0.25);
    return minGeo;
  }

  // Create cylindrical pad
  const radius = Math.min(pad.width, pad.height) / 2;
  const geometry = new THREE.CylinderGeometry(radius, radius * 0.8, padHeight, 16);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(pad.x, pad.y, wallThickness + padHeight / 2);

  return geometry;
}

/** Creates all pressure pads as merged geometry. */
export function createAllPressurePads(
  pads: PressurePad[],
  lidHeight: number,
  wallThickness: number
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  for (const pad of pads) {
    const padGeo = createPressurePadGeometry(pad, lidHeight, wallThickness);
    geometries.push(padGeo);
  }

  if (geometries.length === 0) {
    return new THREE.BufferGeometry();
  }

  // Merge all pad geometries
  return mergeGeometries(geometries);
}

/** Creates magnet recess as cylindrical cavity. */
export function createMagnetRecessGeometry(
  magnet: MagnetPlacement,
  lidHeight: number
): THREE.BufferGeometry {
  const radius = magnet.diameter / 2 + MAGNET_RECESS_EXTRA;
  const depth = magnet.thickness + 0.3; // Extra depth for easy insertion

  const geometry = new THREE.CylinderGeometry(radius, radius, depth, 24);
  geometry.rotateX(Math.PI / 2);
  // Position at top surface of lid (recessed from outside)
  geometry.translate(magnet.x, magnet.y, lidHeight - depth / 2);

  return geometry;
}

/** Creates all magnet recesses as merged geometry. */
export function createAllMagnetRecesses(
  magnets: MagnetPlacement[],
  lidHeight: number
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  for (const magnet of magnets) {
    const recessGeo = createMagnetRecessGeometry(magnet, lidHeight);
    geometries.push(recessGeo);
  }

  if (geometries.length === 0) {
    return new THREE.BufferGeometry();
  }

  return mergeGeometries(geometries);
}

/** Creates ventilation pattern geometry. */
export function createVentilationGeometry(
  bounds: BoardBounds,
  pattern: VentPattern,
  position: 'top' | 'sides' | 'both',
  lidHeight: number,
  wallThickness: number,
  slotWidth: number,
  slotSpacing: number
): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];

  if (pattern === 'none') return geometries;

  const ventArea = {
    width: bounds.width * 0.6,
    height: bounds.height * 0.6,
  };

  if (position === 'top' || position === 'both') {
    const topVents = createVentPattern(
      pattern,
      ventArea.width,
      ventArea.height,
      slotWidth,
      slotSpacing,
      wallThickness + 0.5
    );
    topVents.forEach((g) => g.translate(bounds.centerX, bounds.centerY, lidHeight));
    geometries.push(...topVents);
  }

  if (position === 'sides' || position === 'both') {
    // Add side vents (simplified - just on longer sides)
    const sideVentHeight = lidHeight * 0.4;
    const sideVentY = lidHeight * 0.5;

    // Front and back side vents
    const frontVent = createSideVentSlots(
      bounds.width * 0.5,
      sideVentHeight,
      slotWidth,
      slotSpacing
    );
    frontVent.translate(
      bounds.centerX,
      bounds.centerY - bounds.height / 2 - wallThickness / 2,
      sideVentY
    );
    frontVent.rotateX(Math.PI / 2);
    geometries.push(frontVent);

    const backVent = createSideVentSlots(
      bounds.width * 0.5,
      sideVentHeight,
      slotWidth,
      slotSpacing
    );
    backVent.translate(
      bounds.centerX,
      bounds.centerY + bounds.height / 2 + wallThickness / 2,
      sideVentY
    );
    backVent.rotateX(-Math.PI / 2);
    geometries.push(backVent);
  }

  return geometries;
}

/** Creates vent pattern for top surface. */
function createVentPattern(
  pattern: VentPattern,
  width: number,
  height: number,
  slotWidth: number,
  slotSpacing: number,
  depth: number
): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];

  switch (pattern) {
    case 'slots': {
      const numSlots = Math.floor(height / (slotWidth + slotSpacing));
      const startY = -((numSlots - 1) * (slotWidth + slotSpacing)) / 2;

      for (let i = 0; i < numSlots; i++) {
        const slot = new THREE.BoxGeometry(width, slotWidth, depth);
        slot.translate(0, startY + i * (slotWidth + slotSpacing), 0);
        geometries.push(slot);
      }
      break;
    }

    case 'grid': {
      const cols = Math.floor(width / (slotWidth + slotSpacing));
      const rows = Math.floor(height / (slotWidth + slotSpacing));
      const startX = -((cols - 1) * (slotWidth + slotSpacing)) / 2;
      const startY = -((rows - 1) * (slotWidth + slotSpacing)) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hole = new THREE.CylinderGeometry(slotWidth / 2, slotWidth / 2, depth, 8);
          hole.rotateX(Math.PI / 2);
          hole.translate(
            startX + c * (slotWidth + slotSpacing),
            startY + r * (slotWidth + slotSpacing),
            0
          );
          geometries.push(hole);
        }
      }
      break;
    }

    case 'honeycomb': {
      const hexRadius = slotWidth;
      const hexSpacing = slotSpacing + hexRadius * 2;
      const cols = Math.floor(width / hexSpacing);
      const rows = Math.floor(height / (hexSpacing * 0.866));

      for (let r = 0; r < rows; r++) {
        const offset = r % 2 === 0 ? 0 : hexSpacing / 2;
        const startX = -((cols - 1) * hexSpacing) / 2 + offset;
        const y = -((rows - 1) * hexSpacing * 0.866) / 2 + r * hexSpacing * 0.866;

        for (let c = 0; c < cols; c++) {
          const x = startX + c * hexSpacing;
          if (Math.abs(x) > width / 2 - hexRadius) continue;

          const hex = new THREE.CylinderGeometry(hexRadius, hexRadius, depth, 6);
          hex.rotateX(Math.PI / 2);
          hex.translate(x, y, 0);
          geometries.push(hex);
        }
      }
      break;
    }
  }

  return geometries;
}

/** Creates simple slot vents for side walls. */
function createSideVentSlots(
  width: number,
  height: number,
  slotWidth: number,
  slotSpacing: number
): THREE.BufferGeometry {
  const numSlots = Math.floor(width / (slotWidth + slotSpacing));
  const geometries: THREE.BufferGeometry[] = [];
  const startX = -((numSlots - 1) * (slotWidth + slotSpacing)) / 2;

  for (let i = 0; i < numSlots; i++) {
    const slot = new THREE.BoxGeometry(slotWidth, height * 0.6, 2);
    slot.translate(startX + i * (slotWidth + slotSpacing), 0, 0);
    geometries.push(slot);
  }

  return geometries.length > 0 ? mergeGeometries(geometries) : new THREE.BufferGeometry();
}

/** Creates snap-fit ridge geometry around lid perimeter. */
export function createSnapFitRidge(
  bounds: BoardBounds,
  wallThickness: number,
  tolerance: number
): THREE.BufferGeometry {
  const innerW = bounds.width + tolerance - 0.5;
  const innerH = bounds.height + tolerance - 0.5;

  // Create a thin ridge around the inside bottom of lid
  const ridgeShape = new THREE.Shape();
  const hw = innerW / 2;
  const hh = innerH / 2;

  // Outer rectangle
  ridgeShape.moveTo(-hw, -hh);
  ridgeShape.lineTo(hw, -hh);
  ridgeShape.lineTo(hw, hh);
  ridgeShape.lineTo(-hw, hh);
  ridgeShape.closePath();

  // Inner cutout
  const cutout = new THREE.Path();
  const hwInner = hw - SNAP_FIT_WIDTH;
  const hhInner = hh - SNAP_FIT_WIDTH;
  cutout.moveTo(-hwInner, -hhInner);
  cutout.lineTo(hwInner, -hhInner);
  cutout.lineTo(hwInner, hhInner);
  cutout.lineTo(-hwInner, hhInner);
  cutout.closePath();
  ridgeShape.holes.push(cutout);

  const extrudeSettings = {
    depth: SNAP_FIT_DEPTH,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(ridgeShape, extrudeSettings);
  geometry.translate(bounds.centerX, bounds.centerY, wallThickness);

  return geometry;
}

/** Creates screw boss geometry - cylindrical post with central hole. */
export function createScrewBossGeometry(boss: ScrewBoss): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Outer cylinder
  const outer = new THREE.CylinderGeometry(
    boss.outerDiameter / 2,
    boss.outerDiameter / 2,
    boss.height,
    20
  );
  outer.rotateX(Math.PI / 2);
  outer.translate(boss.x, boss.y, boss.height / 2);
  geometries.push(outer);

  // Top flange for visual
  const flange = new THREE.CylinderGeometry(
    boss.outerDiameter / 2 + 1,
    boss.outerDiameter / 2,
    1,
    20
  );
  flange.rotateX(Math.PI / 2);
  flange.translate(boss.x, boss.y, boss.height - 0.5);
  geometries.push(flange);

  return mergeGeometries(geometries);
}

/** Creates all screw bosses as merged geometry. */
export function createAllScrewBosses(bosses: ScrewBoss[]): THREE.BufferGeometry {
  if (bosses.length === 0) return new THREE.BufferGeometry();

  const geometries: THREE.BufferGeometry[] = [];
  for (const boss of bosses) {
    geometries.push(createScrewBossGeometry(boss));
  }

  return mergeGeometries(geometries);
}

/** Creates foot geometry. */
export function createFootGeometry(foot: EnclosureFoot): THREE.BufferGeometry {
  if (foot.style === 'square') {
    const geo = new THREE.BoxGeometry(foot.diameter, foot.diameter, foot.height);
    geo.translate(foot.x, foot.y, -foot.height / 2);
    return geo;
  }

  // Round or rubber-pad style
  const geo = new THREE.CylinderGeometry(foot.diameter / 2, foot.diameter / 2, foot.height, 16);
  geo.rotateX(Math.PI / 2);
  geo.translate(foot.x, foot.y, -foot.height / 2);
  return geo;
}

/** Creates all feet as merged geometry. */
export function createAllFeet(feet: EnclosureFoot[]): THREE.BufferGeometry {
  if (feet.length === 0) return new THREE.BufferGeometry();

  const geometries: THREE.BufferGeometry[] = [];
  for (const foot of feet) {
    geometries.push(createFootGeometry(foot));
  }

  return mergeGeometries(geometries);
}

/** Creates base shell geometry for split-case or tray style. */
export function createBaseGeometry(
  bounds: BoardBounds,
  enclosure: Enclosure
): THREE.BufferGeometry {
  const { wallThickness, baseHeight, cornerRadius } = enclosure;
  const outerW = bounds.width + wallThickness * 2;
  const outerH = bounds.height + wallThickness * 2;

  // Create outer shell
  const outerShape = createRoundedRectShape(outerW, outerH, cornerRadius);

  const extrudeSettings = {
    depth: baseHeight,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
  geometry.translate(bounds.centerX, bounds.centerY, -baseHeight);

  return geometry;
}

/** Creates polarity indicator geometry (N or S mark on magnet recess). */
export function createPolarityIndicator(
  magnet: MagnetPlacement,
  lidHeight: number
): THREE.BufferGeometry {
  const size = magnet.diameter * 0.3;
  const depth = 0.5;

  if (magnet.polarity === 'N') {
    // N shape - two vertical bars with diagonal
    const geometries: THREE.BufferGeometry[] = [];

    const bar1 = new THREE.BoxGeometry(size * 0.2, size, depth);
    bar1.translate(-size * 0.3, 0, 0);
    geometries.push(bar1);

    const bar2 = new THREE.BoxGeometry(size * 0.2, size, depth);
    bar2.translate(size * 0.3, 0, 0);
    geometries.push(bar2);

    const diag = new THREE.BoxGeometry(size * 0.2, size * 1.2, depth);
    diag.rotateZ(Math.PI / 6);
    geometries.push(diag);

    const merged = mergeGeometries(geometries);
    merged.translate(magnet.x, magnet.y, lidHeight + depth / 2);
    return merged;
  } else {
    // S shape - simplified as curved path
    const curve = new THREE.Shape();
    curve.moveTo(size * 0.3, size * 0.4);
    curve.quadraticCurveTo(size * 0.3, size * 0.5, 0, size * 0.5);
    curve.quadraticCurveTo(-size * 0.3, size * 0.5, -size * 0.3, size * 0.2);
    curve.quadraticCurveTo(-size * 0.3, 0, 0, 0);
    curve.quadraticCurveTo(size * 0.3, 0, size * 0.3, -size * 0.2);
    curve.quadraticCurveTo(size * 0.3, -size * 0.5, 0, -size * 0.5);
    curve.quadraticCurveTo(-size * 0.3, -size * 0.5, -size * 0.3, -size * 0.4);

    const extrudeSettings = {
      depth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(curve, extrudeSettings);
    geometry.translate(magnet.x, magnet.y, lidHeight);
    return geometry;
  }
}

/** Merges multiple BufferGeometries into one. */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];

  // Simple merge by concatenating attributes
  let totalVertices = 0;
  let totalIndices = 0;

  for (const geo of geometries) {
    const pos = geo.getAttribute('position');
    totalVertices += pos ? pos.count : 0;
    const idx = geo.getIndex();
    totalIndices += idx ? idx.count : totalVertices;
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
    } else if (pos) {
      for (let i = 0; i < pos.count; i++) {
        indices.push(vertexOffset + i);
      }
    }

    vertexOffset += pos ? pos.count : 0;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);

  return merged;
}

/** Creates complete lid mesh with all features. */
export function createCompleteLid(bounds: BoardBounds, enclosure: Enclosure): THREE.Group {
  const group = new THREE.Group();

  // Main lid shell
  const lidGeo = createLidGeometry(bounds, enclosure);
  const lidMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a9eff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const lidMesh = new THREE.Mesh(lidGeo, lidMaterial);
  group.add(lidMesh);

  // Base shell for split-case or tray styles
  if (enclosure.style !== 'lid-only') {
    const baseGeo = createBaseGeometry(bounds, enclosure);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d8bfd,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMaterial);
    group.add(baseMesh);
  }

  // Pressure pads
  if (enclosure.pressurePads.length > 0) {
    const padsGeo = createAllPressurePads(
      enclosure.pressurePads,
      enclosure.lidHeight,
      enclosure.wallThickness
    );
    const padsMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d7dd2,
      transparent: true,
      opacity: 0.8,
    });
    const padsMesh = new THREE.Mesh(padsGeo, padsMaterial);
    group.add(padsMesh);
  }

  // Magnet recesses (shown as different color)
  if (enclosure.magnetPlacements.length > 0) {
    const recessGeo = createAllMagnetRecesses(enclosure.magnetPlacements, enclosure.lidHeight);
    const recessMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.9,
    });
    const recessMesh = new THREE.Mesh(recessGeo, recessMaterial);
    group.add(recessMesh);

    // Polarity indicators
    for (const magnet of enclosure.magnetPlacements) {
      const indicatorGeo = createPolarityIndicator(magnet, enclosure.lidHeight);
      const indicatorMaterial = new THREE.MeshStandardMaterial({
        color: magnet.polarity === 'N' ? 0xe53935 : 0x1e88e5,
      });
      const indicatorMesh = new THREE.Mesh(indicatorGeo, indicatorMaterial);
      group.add(indicatorMesh);
    }
  }

  // Snap-fit ridge (only for lid-only style)
  if (enclosure.style === 'lid-only') {
    const ridgeGeo = createSnapFitRidge(
      bounds,
      enclosure.wallThickness,
      enclosure.snapFitTolerance
    );
    const ridgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a7bd5,
    });
    const ridgeMesh = new THREE.Mesh(ridgeGeo, ridgeMaterial);
    group.add(ridgeMesh);
  }

  // Screw bosses (for split-case and tray styles)
  if (
    enclosure.style !== 'lid-only' &&
    enclosure.showScrewBosses &&
    enclosure.screwBosses.length > 0
  ) {
    const bossGeo = createAllScrewBosses(enclosure.screwBosses);
    const bossMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c9aff,
      transparent: true,
      opacity: 0.85,
    });
    const bossMesh = new THREE.Mesh(bossGeo, bossMaterial);
    group.add(bossMesh);

    // Screw holes in base (visual indicator)
    for (const boss of enclosure.screwBosses) {
      const holeGeo = new THREE.CylinderGeometry(
        boss.innerDiameter / 2,
        boss.innerDiameter / 2,
        enclosure.baseHeight + 1,
        12
      );
      holeGeo.rotateX(Math.PI / 2);
      holeGeo.translate(boss.x, boss.y, -enclosure.baseHeight / 2);
      const holeMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
      });
      const holeMesh = new THREE.Mesh(holeGeo, holeMaterial);
      group.add(holeMesh);
    }
  }

  // Feet (for split-case and tray styles)
  if (enclosure.style !== 'lid-only' && enclosure.showFeet && enclosure.feet.length > 0) {
    const feetGeo = createAllFeet(enclosure.feet);
    const footMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
    });
    const feetMesh = new THREE.Mesh(feetGeo, footMaterial);
    // Position feet relative to base bottom
    feetMesh.position.z = -enclosure.baseHeight;
    group.add(feetMesh);
  }

  return group;
}
