import type { Vec2 } from '../../types';

/**
 * Fillet corners of polyline to enforce minimum bend radius
 */
export const filletPolyline = (points: Vec2[], minBendRadius: number): Vec2[] => {
  if (points.length < 3) {
    return points;
  }

  const filleted: Vec2[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];

    const angle = calculateAngle(p0, p1, p2);

    // Only fillet if angle is sharp enough
    if (angle < Math.PI - 0.1) {
      const arcPoints = createArcFillet(p0, p1, p2, minBendRadius);
      filleted.push(...arcPoints);
    } else {
      filleted.push(p1);
    }
  }

  filleted.push(points[points.length - 1]);
  return filleted;
};

/**
 * Calculate angle between three points
 */
const calculateAngle = (p0: Vec2, p1: Vec2, p2: Vec2): number => {
  const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
  const v2 = [p2[0] - p1[0], p2[1] - p1[1]];

  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

  return Math.acos(dot / (mag1 * mag2));
};

/**
 * Create arc fillet between three points
 */
const createArcFillet = (p0: Vec2, p1: Vec2, p2: Vec2, radius: number): Vec2[] => {
  const v1 = normalize([p0[0] - p1[0], p0[1] - p1[1]]);

  const angle = calculateAngle(p0, p1, p2);
  const halfAngle = (Math.PI - angle) / 2;

  const offset = radius / Math.tan(halfAngle);

  // Generate arc points
  const segments = Math.max(3, Math.floor((angle * 8) / Math.PI));
  const arcPoints: Vec2[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const currentAngle = angle * t;

    const rotatedV = rotateVector(v1, -currentAngle);
    const point: Vec2 = [p1[0] + rotatedV[0] * offset, p1[1] + rotatedV[1] * offset];

    arcPoints.push(point);
  }

  return arcPoints;
};

/**
 * Normalize vector
 */
const normalize = (v: number[]): number[] => {
  const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return mag > 0 ? [v[0] / mag, v[1] / mag] : v;
};

/**
 * Rotate 2D vector
 */
const rotateVector = (v: number[], angle: number): number[] => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
};

/**
 * Calculate distance between two points
 */
export const distance = (p1: Vec2, p2: Vec2): number => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate polyline length
 */
export const calculatePolylineLength = (points: Vec2[]): number => {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += distance(points[i], points[i + 1]);
  }
  return length;
};

/**
 * Snap point to grid
 */
export const snapToGrid = (point: Vec2, gridSize: number): Vec2 => {
  return [Math.round(point[0] / gridSize) * gridSize, Math.round(point[1] / gridSize) * gridSize];
};

/**
 * Check if point is on polyline segment
 */
export const isPointOnSegment = (point: Vec2, p1: Vec2, p2: Vec2, tolerance: number): boolean => {
  const d1 = distance(point, p1);
  const d2 = distance(point, p2);
  const lineLen = distance(p1, p2);

  return Math.abs(d1 + d2 - lineLen) < tolerance;
};

/**
 * Generate Manhattan (L-shaped) route between two points.
 * Returns array of points forming 90-degree turns only.
 */
export const manhattanRoute = (start: Vec2, end: Vec2, preferHorizontalFirst = true): Vec2[] => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  // Direct horizontal or vertical - no bend needed
  if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
    return [start, end];
  }

  // Create L-shaped route with one bend
  if (preferHorizontalFirst) {
    const mid: Vec2 = [end[0], start[1]];
    return [start, mid, end];
  } else {
    const mid: Vec2 = [start[0], end[1]];
    return [start, mid, end];
  }
};

/**
 * Generate Manhattan route avoiding obstacles.
 * Uses simple A* pathfinding on a grid.
 */
export const manhattanRouteWithAvoidance = (
  start: Vec2,
  end: Vec2,
  obstacles: Vec2[][]
): Vec2[] => {
  // Simple implementation - try both L-shapes and pick shorter valid one
  const route1 = manhattanRoute(start, end, true);
  const route2 = manhattanRoute(start, end, false);

  const valid1 = !routeIntersectsObstacles(route1, obstacles);
  const valid2 = !routeIntersectsObstacles(route2, obstacles);

  if (valid1 && valid2) {
    return calculatePolylineLength(route1) <= calculatePolylineLength(route2) ? route1 : route2;
  }
  if (valid1) return route1;
  if (valid2) return route2;

  // If both intersect, try Z-shaped route
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const zRoute1: Vec2[] = [start, [midX, start[1]], [midX, end[1]], end];
  const zRoute2: Vec2[] = [start, [start[0], midY], [end[0], midY], end];

  if (!routeIntersectsObstacles(zRoute1, obstacles)) return zRoute1;
  if (!routeIntersectsObstacles(zRoute2, obstacles)) return zRoute2;

  // Fallback to direct route
  return [start, end];
};

/**
 * Check if route intersects any obstacles
 */
const routeIntersectsObstacles = (route: Vec2[], obstacles: Vec2[][]): boolean => {
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i + 1];

    for (const obstacle of obstacles) {
      if (segmentIntersectsPolygon(p1, p2, obstacle)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Check if line segment intersects polygon
 */
const segmentIntersectsPolygon = (p1: Vec2, p2: Vec2, polygon: Vec2[]): boolean => {
  for (let i = 0; i < polygon.length; i++) {
    const q1 = polygon[i];
    const q2 = polygon[(i + 1) % polygon.length];
    if (segmentsIntersect(p1, p2, q1, q2)) {
      return true;
    }
  }
  return false;
};

/**
 * Check if two line segments intersect
 */
const segmentsIntersect = (p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2): boolean => {
  const d1 = direction(q1, q2, p1);
  const d2 = direction(q1, q2, p2);
  const d3 = direction(p1, p2, q1);
  const d4 = direction(p1, p2, q2);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
};

const direction = (p1: Vec2, p2: Vec2, p3: Vec2): number => {
  return (p3[0] - p1[0]) * (p2[1] - p1[1]) - (p2[0] - p1[0]) * (p3[1] - p1[1]);
};

/** Priority queue node for A* */
type AStarNode = {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // Total cost (g + h)
  parent: AStarNode | null;
};

/** Simple priority queue using sorted array. */
class PriorityQueue {
  private items: AStarNode[] = [];

  push(node: AStarNode): void {
    this.items.push(node);
    this.items.sort((a, b) => a.f - b.f);
  }

  pop(): AStarNode | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * Check if point is inside a polygon (axis-aligned bounding box test + ray casting).
 */
const pointInPolygon = (point: Vec2, polygon: Vec2[]): boolean => {
  let inside = false;
  const x = point[0];
  const y = point[1];

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

/**
 * Check if point is blocked by any obstacle (with margin).
 */
const isBlocked = (x: number, y: number, obstacles: Vec2[][], margin: number): boolean => {
  const testPoints: Vec2[] = [
    [x, y],
    [x - margin, y - margin],
    [x + margin, y - margin],
    [x - margin, y + margin],
    [x + margin, y + margin],
  ];

  for (const obstacle of obstacles) {
    for (const pt of testPoints) {
      if (pointInPolygon(pt, obstacle)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * A* pathfinding algorithm for auto-routing.
 * Returns array of points from start to end avoiding obstacles.
 */
export const aStarPathfind = (
  start: Vec2,
  end: Vec2,
  obstacles: Vec2[][],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  gridSize: number = 5,
  routeWidth: number = 5
): Vec2[] | null => {
  const margin = routeWidth / 2 + 1;

  // Snap start/end to grid
  const startX = Math.round(start[0] / gridSize) * gridSize;
  const startY = Math.round(start[1] / gridSize) * gridSize;
  const endX = Math.round(end[0] / gridSize) * gridSize;
  const endY = Math.round(end[1] / gridSize) * gridSize;

  // Heuristic: Manhattan distance
  const heuristic = (x: number, y: number): number => {
    return Math.abs(x - endX) + Math.abs(y - endY);
  };

  const openSet = new PriorityQueue();
  const closedSet = new Set<string>();
  const nodeKey = (x: number, y: number) => `${x},${y}`;

  const startNode: AStarNode = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY),
    f: heuristic(startX, startY),
    parent: null,
  };
  openSet.push(startNode);

  // 4-direction movement (Manhattan style)
  const directions = [
    [gridSize, 0],
    [-gridSize, 0],
    [0, gridSize],
    [0, -gridSize],
  ];

  let iterations = 0;
  const maxIterations = 10000;

  while (!openSet.isEmpty() && iterations < maxIterations) {
    iterations++;
    const current = openSet.pop()!;
    const currentKey = nodeKey(current.x, current.y);

    // Goal reached?
    if (current.x === endX && current.y === endY) {
      // Reconstruct path
      const path: Vec2[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.unshift([node.x, node.y]);
        node = node.parent;
      }
      return simplifyPath(path);
    }

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    for (const [dx, dy] of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const neighborKey = nodeKey(nx, ny);

      // Skip if out of bounds
      if (nx < bounds.minX || nx > bounds.maxX || ny < bounds.minY || ny > bounds.maxY) {
        continue;
      }

      // Skip if already visited
      if (closedSet.has(neighborKey)) continue;

      // Skip if blocked (unless it's the end point)
      if (!(nx === endX && ny === endY) && isBlocked(nx, ny, obstacles, margin)) {
        continue;
      }

      const g = current.g + gridSize;
      const h = heuristic(nx, ny);
      const f = g + h;

      const neighbor: AStarNode = {
        x: nx,
        y: ny,
        g,
        h,
        f,
        parent: current,
      };

      openSet.push(neighbor);
    }
  }

  // No path found
  return null;
};

/**
 * Simplify path by removing collinear points.
 */
const simplifyPath = (path: Vec2[]): Vec2[] => {
  if (path.length < 3) return path;

  const simplified: Vec2[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = path[i];
    const next = path[i + 1];

    // Check if direction changes
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];

    // Not collinear - keep point
    if (dx1 !== dx2 || dy1 !== dy2) {
      simplified.push(curr);
    }
  }

  simplified.push(path[path.length - 1]);
  return simplified;
};

/**
 * Catmull-Rom spline interpolation between control points.
 * Generates smooth curves through all control points.
 */
export const splineRoute = (controlPoints: Vec2[], segmentsPerCurve: number = 10): Vec2[] => {
  if (controlPoints.length < 2) return controlPoints;
  if (controlPoints.length === 2) return controlPoints;

  const result: Vec2[] = [];

  // Add phantom points at start and end for smooth endpoints
  const points: Vec2[] = [
    [
      controlPoints[0][0] - (controlPoints[1][0] - controlPoints[0][0]),
      controlPoints[0][1] - (controlPoints[1][1] - controlPoints[0][1]),
    ],
    ...controlPoints,
    [
      controlPoints[controlPoints.length - 1][0] +
        (controlPoints[controlPoints.length - 1][0] - controlPoints[controlPoints.length - 2][0]),
      controlPoints[controlPoints.length - 1][1] +
        (controlPoints[controlPoints.length - 1][1] - controlPoints[controlPoints.length - 2][1]),
    ],
  ];

  // Catmull-Rom interpolation
  for (let i = 1; i < points.length - 2; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];

    for (let j = 0; j < segmentsPerCurve; j++) {
      const t = j / segmentsPerCurve;
      const t2 = t * t;
      const t3 = t2 * t;

      // Catmull-Rom basis functions
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);

      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

      result.push([x, y]);
    }
  }

  // Add final point
  result.push(controlPoints[controlPoints.length - 1]);

  return result;
};
