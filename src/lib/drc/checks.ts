import type { Project, DRCViolation, Vec2, Route } from '../../types';
import { distance } from '../routing/routingUtils';

/**
 * Run all DRC checks on project
 */
export const runDRCChecks = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];

  violations.push(...checkMinSpacing(project));
  violations.push(...checkMinWallThickness(project));
  violations.push(...checkBendRadius(project));
  violations.push(...checkPadClearance(project));
  violations.push(...checkOverhangs(project));
  violations.push(...checkHoleCollisions(project));
  violations.push(...checkTapeOverlap(project));
  violations.push(...checkUnconnectedPads(project));
  violations.push(...checkPowerConnections(project));
  violations.push(...checkComponentOverlap(project));

  return violations;
};

/**
 * Check minimum spacing between routes
 */
const checkMinSpacing = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { routes, rules } = project;

  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      const route1 = routes[i];
      const route2 = routes[j];

      const minDist = findMinDistanceBetweenRoutes(route1, route2);

      if (minDist < rules.minSpacing) {
        const midPoint = findMidpointBetweenRoutes(route1, route2);
        violations.push({
          type: 'spacing',
          message: `Routes too close: ${minDist.toFixed(2)}mm (min: ${rules.minSpacing}mm)`,
          position: midPoint,
          severity: 'error',
        });
      }
    }
  }

  return violations;
};

/**
 * Check minimum wall thickness between adjacent channels
 */
const checkMinWallThickness = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { routes, rules } = project;

  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      const route1 = routes[i];
      const route2 = routes[j];

      const minDist = findMinDistanceBetweenRoutes(route1, route2);
      const wallThickness = minDist - (route1.width + route2.width) / 2;

      if (wallThickness < rules.minWall) {
        const midPoint = findMidpointBetweenRoutes(route1, route2);
        violations.push({
          type: 'wall',
          message: `Wall too thin: ${wallThickness.toFixed(2)}mm (min: ${rules.minWall}mm)`,
          position: midPoint,
          severity: 'error',
        });
      }
    }
  }

  return violations;
};

/**
 * Check bend radius violations
 */
const checkBendRadius = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { routes, rules } = project;

  for (const route of routes) {
    for (let i = 1; i < route.polyline.length - 1; i++) {
      const p0 = route.polyline[i - 1];
      const p1 = route.polyline[i];
      const p2 = route.polyline[i + 1];

      const angle = calculateAngle(p0, p1, p2);
      const requiredRadius = calculateRequiredRadius(angle, route.width);

      if (requiredRadius > rules.minBendRadius) {
        violations.push({
          type: 'bend',
          message: `Bend too sharp: requires ${requiredRadius.toFixed(2)}mm radius (min: ${rules.minBendRadius}mm)`,
          position: p1,
          severity: 'warning',
        });
      }
    }
  }

  return violations;
};

/**
 * Check pad clearance
 */
const checkPadClearance = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { components, routes, rules } = project;

  for (const component of components) {
    for (const pad of component.pads) {
      const padPos = transformPoint(pad.pos, component.pos, component.rotation);
      const padRadius = (pad.dia || pad.width || 1.0) / 2;

      for (const route of routes) {
        const distToRoute = findMinDistanceToRoute(padPos, route);

        if (distToRoute < rules.minPadClearance + padRadius) {
          violations.push({
            type: 'pad',
            message: `Route too close to pad ${pad.id}: ${distToRoute.toFixed(2)}mm (min: ${rules.minPadClearance}mm)`,
            position: padPos,
            severity: 'error',
          });
        }
      }
    }
  }

  return violations;
};

/**
 * Check for overhangs that cannot be printed
 */
const checkOverhangs = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { routes, board } = project;

  // Check if routes extend beyond board boundary
  for (const route of routes) {
    for (const point of route.polyline) {
      if (!isPointInBoundary(point, board.boundary)) {
        violations.push({
          type: 'overhang',
          message: 'Route extends beyond board boundary',
          position: point,
          severity: 'error',
        });
      }
    }
  }

  return violations;
};

/**
 * Check for hole collisions
 */
const checkHoleCollisions = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { components, vias } = project;

  const allHoles: Array<{ pos: Vec2; dia: number }> = [];

  // Collect all holes
  for (const component of components) {
    for (const hole of component.holes) {
      const holePos = transformPoint(hole.pos, component.pos, component.rotation);
      allHoles.push({ pos: holePos, dia: hole.dia });
    }
  }

  for (const via of vias) {
    allHoles.push({ pos: via.pos, dia: via.dia });
  }

  // Check for collisions
  for (let i = 0; i < allHoles.length; i++) {
    for (let j = i + 1; j < allHoles.length; j++) {
      const hole1 = allHoles[i];
      const hole2 = allHoles[j];

      const dist = distance(hole1.pos, hole2.pos);
      const minDist = (hole1.dia + hole2.dia) / 2;

      if (dist < minDist) {
        violations.push({
          type: 'collision',
          message: `Holes collide: ${dist.toFixed(2)}mm apart (min: ${minDist.toFixed(2)}mm)`,
          position: hole1.pos,
          severity: 'error',
        });
      }
    }
  }

  return violations;
};

/**
 * Check tape overlap at vias
 */
const checkTapeOverlap = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { routes, vias } = project;

  for (const via of vias) {
    let hasOverlap = false;

    for (const route of routes) {
      const distToRoute = findMinDistanceToRoute(via.pos, route);

      if (distToRoute < route.width / 2) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      violations.push({
        type: 'overlap',
        message: 'Via not connected to any tape route',
        position: via.pos,
        severity: 'warning',
      });
    }
  }

  return violations;
};

/**
 * Check for unconnected pads (pads not touched by any route)
 */
const checkUnconnectedPads = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { components, routes } = project;

  for (const component of components) {
    // Skip magnets and mounting features
    if (component.type.startsWith('magnet_')) continue;

    for (let padIdx = 0; padIdx < component.pads.length; padIdx++) {
      const pad = component.pads[padIdx];
      const padPos = transformPoint(pad.pos, component.pos, component.rotation);
      const padRadius = (pad.dia || pad.width || 1.5) / 2;

      let isConnected = false;

      for (const route of routes) {
        const distToRoute = findMinDistanceToRoute(padPos, route);
        // Consider connected if route touches or overlaps pad
        if (distToRoute < padRadius + route.width / 2 + 1) {
          isConnected = true;
          break;
        }
      }

      if (!isConnected) {
        violations.push({
          type: 'pad',
          message: `Unconnected pad on ${component.type} (pad ${padIdx + 1}) - may need a trace`,
          position: padPos,
          severity: 'warning',
        });
      }
    }
  }

  return violations;
};

/**
 * Check for common power connection mistakes
 */
const checkPowerConnections = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { components, routes } = project;

  // Find power-related components
  const powerComponents = components.filter(
    (c) =>
      c.type.includes('regulator') ||
      c.type.includes('connector_barrel') ||
      c.type.includes('terminal')
  );

  // Find MCU/IC components that need power
  const icComponents = components.filter(
    (c) =>
      c.type.includes('mcu_') ||
      c.type.includes('ic_') ||
      c.type.includes('opamp_') ||
      c.type.includes('mux_') ||
      c.type.includes('shift_')
  );

  // Warn if ICs exist but no power source
  if (icComponents.length > 0 && powerComponents.length === 0) {
    violations.push({
      type: 'pad',
      message: `ICs/MCUs detected but no power source (regulator/barrel connector) - add power input`,
      position: icComponents[0].pos,
      severity: 'warning',
    });
  }

  // Check if power components have routes connected
  for (const powerComp of powerComponents) {
    let hasOutput = false;
    for (const pad of powerComp.pads) {
      const padPos = transformPoint(pad.pos, powerComp.pos, powerComp.rotation);
      for (const route of routes) {
        if (findMinDistanceToRoute(padPos, route) < 3) {
          hasOutput = true;
          break;
        }
      }
      if (hasOutput) break;
    }

    if (!hasOutput) {
      violations.push({
        type: 'pad',
        message: `Power component ${powerComp.type} has no connections - route power to other components`,
        position: powerComp.pos,
        severity: 'warning',
      });
    }
  }

  return violations;
};

/**
 * Check for overlapping components
 */
const checkComponentOverlap = (project: Project): DRCViolation[] => {
  const violations: DRCViolation[] = [];
  const { components } = project;

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const c1 = components[i];
      const c2 = components[j];

      // Simple distance check between component centers
      const dist = distance(c1.pos, c2.pos);

      // Estimate component sizes from pad positions
      const size1 = estimateComponentSize(c1);
      const size2 = estimateComponentSize(c2);
      const minDist = (size1 + size2) / 2 + 2; // 2mm clearance

      if (dist < minDist) {
        violations.push({
          type: 'collision',
          message: `Components overlap: ${c1.type} and ${c2.type} - move them apart`,
          position: [(c1.pos[0] + c2.pos[0]) / 2, (c1.pos[1] + c2.pos[1]) / 2],
          severity: 'error',
        });
      }
    }
  }

  return violations;
};

/**
 * Helper: Estimate component size from pad spread
 */
const estimateComponentSize = (component: { pads: { pos: Vec2 }[] }): number => {
  if (component.pads.length === 0) return 5;

  const xs = component.pads.map((p) => p.pos[0]);
  const ys = component.pads.map((p) => p.pos[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);

  return Math.max(width, height, 5) + 4; // Add margin
};

/**
 * Helper: Find minimum distance between two routes
 */
const findMinDistanceBetweenRoutes = (route1: Route, route2: Route): number => {
  let minDist = Infinity;

  for (const p1 of route1.polyline) {
    for (const p2 of route2.polyline) {
      const dist = distance(p1, p2);
      minDist = Math.min(minDist, dist);
    }
  }

  return minDist;
};

/**
 * Helper: Find midpoint between two routes
 */
const findMidpointBetweenRoutes = (route1: Route, route2: Route): Vec2 => {
  const p1 = route1.polyline[0];
  const p2 = route2.polyline[0];
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
};

/**
 * Helper: Find minimum distance from point to route
 */
const findMinDistanceToRoute = (point: Vec2, route: Route): number => {
  let minDist = Infinity;

  for (let i = 0; i < route.polyline.length - 1; i++) {
    const p1 = route.polyline[i];
    const p2 = route.polyline[i + 1];
    const dist = distanceToSegment(point, p1, p2);
    minDist = Math.min(minDist, dist);
  }

  return minDist;
};

/**
 * Helper: Calculate angle between three points
 */
const calculateAngle = (p0: Vec2, p1: Vec2, p2: Vec2): number => {
  const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
  const v2 = [p2[0] - p1[0], p2[1] - p1[1]];

  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
};

/**
 * Helper: Calculate required radius for bend
 */
const calculateRequiredRadius = (angle: number, tapeWidth: number): number => {
  // Simple heuristic: tighter angles require larger radii
  const factor = 1 + Math.PI / (angle + 0.1);
  return tapeWidth * factor;
};

/**
 * Helper: Distance from point to line segment
 */
const distanceToSegment = (point: Vec2, p1: Vec2, p2: Vec2): number => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return distance(point, p1);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point[0] - p1[0]) * dx + (point[1] - p1[1]) * dy) / lengthSq)
  );

  const projX = p1[0] + t * dx;
  const projY = p1[1] + t * dy;

  return distance(point, [projX, projY]);
};

/**
 * Helper: Check if point is inside boundary polygon
 */
const isPointInBoundary = (point: Vec2, boundary: Vec2[]): boolean => {
  let inside = false;

  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    const xi = boundary[i][0];
    const yi = boundary[i][1];
    const xj = boundary[j][0];
    const yj = boundary[j][1];

    const intersect =
      yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};

/**
 * Helper: Transform point by position and rotation
 */
const transformPoint = (point: Vec2, offset: Vec2, rotation: number): Vec2 => {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  const rotatedX = point[0] * cos - point[1] * sin;
  const rotatedY = point[0] * sin + point[1] * cos;

  return [rotatedX + offset[0], rotatedY + offset[1]];
};
