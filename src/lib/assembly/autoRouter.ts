import type { Vec2, Board, Component, Route, ConnectionDef, ArrangementOption } from '../../types';
import { getFootprint } from '../../data/footprints';
import {
  aStarPathfind,
  manhattanRouteWithAvoidance,
  filletPolyline,
} from '../routing/routingUtils';

// =====================
// CONFIGURATION
// =====================

const DEFAULT_ROUTE_WIDTH = 5; // mm (copper tape width)
const DEFAULT_ROUTE_DEPTH = 0.8; // mm (channel depth)
const ROUTE_SPACING = 3; // mm between parallel routes
const GRID_SIZE = 2.5; // A* grid resolution
const MIN_BEND_RADIUS = 5; // mm

// =====================
// TYPES
// =====================

type RouteResult = {
  success: boolean;
  route: Route | null;
  error?: string;
};

type RoutingContext = {
  board: Board;
  components: Component[];
  existingRoutes: Route[];
  obstacles: Vec2[][];
};

// =====================
// MAIN ENTRY POINT
// =====================

/** Route all connections for an arrangement. */
export const routeAllConnections = (
  arrangement: ArrangementOption,
  connections: ConnectionDef[],
  board: Board
): Route[] => {
  if (connections.length === 0 || arrangement.components.length === 0) {
    return [];
  }

  const routes: Route[] = [];
  const context: RoutingContext = {
    board,
    components: arrangement.components,
    existingRoutes: [],
    obstacles: buildComponentObstacles(arrangement.components),
  };

  // Order connections by priority (shorter first)
  const ordered = orderConnections(connections, arrangement.components);

  for (const conn of ordered) {
    const result = routeConnection(conn, context);
    if (result.success && result.route) {
      routes.push(result.route);
      context.existingRoutes.push(result.route);
      // Add route as obstacle for subsequent routes
      context.obstacles.push(routeToObstacle(result.route));
    }
  }

  return routes;
};

/** Order connections by estimated length (shortest first for best results). */
export const orderConnections = (
  connections: ConnectionDef[],
  components: Component[]
): ConnectionDef[] => {
  return [...connections].sort((a, b) => {
    const distA = estimateConnectionLength(a, components);
    const distB = estimateConnectionLength(b, components);

    // Power connections first (they're typically longer runs)
    if (a.isPower && !b.isPower) return -1;
    if (!a.isPower && b.isPower) return 1;

    return distA - distB;
  });
};

/** Estimate manhattan distance for a connection. */
const estimateConnectionLength = (conn: ConnectionDef, components: Component[]): number => {
  const fromComp = components[conn.from.componentIndex];
  const toComp = components[conn.to.componentIndex];
  if (!fromComp || !toComp) return Infinity;

  const fromPad = fromComp.pads[conn.from.padIndex];
  const toPad = toComp.pads[conn.to.padIndex];
  if (!fromPad || !toPad) return Infinity;

  const start = getPadWorldPos(fromComp, fromPad);
  const end = getPadWorldPos(toComp, toPad);

  return Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1]);
};

// =====================
// SINGLE ROUTE
// =====================

/** Route a single connection. */
export const routeConnection = (conn: ConnectionDef, context: RoutingContext): RouteResult => {
  const { components, board, obstacles } = context;

  const fromComp = components[conn.from.componentIndex];
  const toComp = components[conn.to.componentIndex];

  if (!fromComp || !toComp) {
    return { success: false, route: null, error: 'Invalid component index' };
  }

  const fromPad = fromComp.pads[conn.from.padIndex];
  const toPad = toComp.pads[conn.to.padIndex];

  if (!fromPad || !toPad) {
    return { success: false, route: null, error: 'Invalid pad index' };
  }

  const start = getPadWorldPos(fromComp, fromPad);
  const end = getPadWorldPos(toComp, toPad);

  // Get board bounds for A*
  const bounds = getBoardBounds(board);

  // Try A* pathfinding first
  let path = aStarPathfind(start, end, obstacles, bounds, GRID_SIZE, DEFAULT_ROUTE_WIDTH);

  // Fallback to simple manhattan if A* fails
  if (!path || path.length === 0) {
    path = manhattanRouteWithAvoidance(start, end, obstacles);
  }

  // Apply filleting for smooth bends
  const filleted = filletPolyline(path, MIN_BEND_RADIUS);

  const route: Route = {
    net: conn.netName || `net_${conn.id}`,
    layer: 'top',
    polyline: filleted,
    width: DEFAULT_ROUTE_WIDTH,
    profile: 'U',
    depth: DEFAULT_ROUTE_DEPTH,
  };

  return { success: true, route };
};

// =====================
// CONFLICT RESOLUTION
// =====================

/** Resolve routing conflicts by re-routing with updated obstacles. */
export const resolveConflicts = (
  routes: Route[],
  connections: ConnectionDef[],
  context: RoutingContext
): Route[] => {
  const conflictPairs: [number, number][] = [];

  // Find conflicting route pairs
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      if (routesIntersect(routes[i], routes[j])) {
        conflictPairs.push([i, j]);
      }
    }
  }

  if (conflictPairs.length === 0) {
    return routes;
  }

  // Try to resolve by re-routing the shorter route around the longer one
  const routesCopy = [...routes];

  for (const [i, j] of conflictPairs) {
    const len1 = calculateRouteLength(routesCopy[i]);
    const len2 = calculateRouteLength(routesCopy[j]);

    // Re-route the shorter one
    const rerouteIdx = len1 < len2 ? i : j;

    // Build obstacles excluding the route being re-routed
    const newObstacles = [
      ...context.obstacles,
      ...routesCopy.filter((_, idx) => idx !== rerouteIdx).map(routeToObstacle),
    ];

    const conn = connections[rerouteIdx];
    if (!conn) continue;

    const newContext: RoutingContext = {
      ...context,
      obstacles: newObstacles,
    };

    const result = routeConnection(conn, newContext);
    if (result.success && result.route) {
      routesCopy[rerouteIdx] = result.route;
    }
  }

  return routesCopy;
};

/** Check if two routes intersect. */
const routesIntersect = (r1: Route, r2: Route): boolean => {
  const poly1 = r1.polyline;
  const poly2 = r2.polyline;

  for (let i = 0; i < poly1.length - 1; i++) {
    for (let j = 0; j < poly2.length - 1; j++) {
      if (segmentsIntersect(poly1[i], poly1[i + 1], poly2[j], poly2[j + 1])) {
        return true;
      }
    }
  }
  return false;
};

/** Check if two segments intersect. */
const segmentsIntersect = (p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2): boolean => {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
};

const direction = (p1: Vec2, p2: Vec2, p3: Vec2): number => {
  return (p3[0] - p1[0]) * (p2[1] - p1[1]) - (p2[0] - p1[0]) * (p3[1] - p1[1]);
};

// =====================
// HELPERS
// =====================

/** Get pad position in world coordinates. */
const getPadWorldPos = (component: Component, pad: { pos: Vec2 }): Vec2 => {
  // Apply rotation
  const rad = (component.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotatedX = pad.pos[0] * cos - pad.pos[1] * sin;
  const rotatedY = pad.pos[0] * sin + pad.pos[1] * cos;

  return [component.pos[0] + rotatedX, component.pos[1] + rotatedY];
};

/** Build obstacle polygons from components. */
const buildComponentObstacles = (components: Component[]): Vec2[][] => {
  const obstacles: Vec2[][] = [];

  for (const comp of components) {
    const fp = getFootprint(comp.type);
    if (!fp) continue;

    // Use outline if available, otherwise create from pads
    let outline: Vec2[];
    if (fp.outline && fp.outline.length >= 3) {
      outline = fp.outline;
    } else {
      // Create bounding box from pads
      const xs = fp.pads.map((p) => p.pos[0]);
      const ys = fp.pads.map((p) => p.pos[1]);
      const minX = Math.min(...xs) - 2;
      const maxX = Math.max(...xs) + 2;
      const minY = Math.min(...ys) - 2;
      const maxY = Math.max(...ys) + 2;
      outline = [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
      ];
    }

    // Transform outline to world coordinates
    const worldOutline = outline.map((p) => {
      const rad = (comp.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = p[0] * cos - p[1] * sin;
      const ry = p[0] * sin + p[1] * cos;
      return [comp.pos[0] + rx, comp.pos[1] + ry] as Vec2;
    });

    obstacles.push(worldOutline);
  }

  return obstacles;
};

/** Convert route to obstacle polygon (expanded by width). */
const routeToObstacle = (route: Route): Vec2[] => {
  const poly = route.polyline;
  if (poly.length < 2) return [];

  const halfWidth = route.width / 2 + ROUTE_SPACING / 2;

  // Create expanded polygon by offsetting each segment
  // Simplified: just create bounding box
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const minX = Math.min(...xs) - halfWidth;
  const maxX = Math.max(...xs) + halfWidth;
  const minY = Math.min(...ys) - halfWidth;
  const maxY = Math.max(...ys) + halfWidth;

  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
};

/** Calculate total route length. */
const calculateRouteLength = (route: Route): number => {
  let length = 0;
  const poly = route.polyline;
  for (let i = 0; i < poly.length - 1; i++) {
    const dx = poly[i + 1][0] - poly[i][0];
    const dy = poly[i + 1][1] - poly[i][1];
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

/** Get board bounding box. */
const getBoardBounds = (
  board: Board
): { minX: number; minY: number; maxX: number; maxY: number } => {
  if (board.boundary.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }

  const xs = board.boundary.map((p) => p[0]);
  const ys = board.boundary.map((p) => p[1]);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

/** Route connections and apply to arrangement. */
export const routeArrangement = (
  arrangement: ArrangementOption,
  connections: ConnectionDef[],
  board: Board
): ArrangementOption => {
  const routes = routeAllConnections(arrangement, connections, board);

  // Try to resolve any conflicts
  const context: RoutingContext = {
    board,
    components: arrangement.components,
    existingRoutes: [],
    obstacles: buildComponentObstacles(arrangement.components),
  };

  const resolved = resolveConflicts(routes, connections, context);

  return {
    ...arrangement,
    routes: resolved,
  };
};
