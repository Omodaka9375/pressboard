import type {
  Vec2,
  Board,
  Component,
  AssemblyComponent,
  ConnectionDef,
  ArrangementOption,
  ArrangementMetrics,
  FootprintDefinition,
} from '../../types';
import { getFootprint } from '../../data/footprints';
import { expandComponents } from '../../stores/autoAssemblyStore';

// =====================
// CONFIGURATION
// =====================

const GRID_SIZE = 2.54; // Standard 0.1" pitch in mm
const COMPONENT_SPACING = 5; // Min spacing between components (mm)
const BOARD_MARGIN = 10; // Min distance from board edge (mm)
const MAX_OPTIMIZER_ITERATIONS = 500;
const INITIAL_TEMP = 100;
const COOLING_RATE = 0.95;

// =====================
// TYPES
// =====================

type PlacedComponent = {
  type: string;
  instanceIndex: number;
  pos: Vec2;
  rotation: number;
  bounds: BoundingBox;
};

type BoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

type PlacementStrategy = 'grid' | 'compact' | 'symmetric' | 'flow' | 'radial';

// =====================
// BOUNDS CALCULATION
// =====================

/** Get bounding box for a footprint at origin with rotation. */
export const calculateComponentBounds = (
  footprint: FootprintDefinition,
  rotation: number = 0
): BoundingBox => {
  const points: Vec2[] = [];

  // Collect all pad positions
  footprint.pads.forEach((pad) => {
    const x = pad.pos[0];
    const y = pad.pos[1];
    const r = (pad.dia || pad.width || 2) / 2;
    points.push([x - r, y - r], [x + r, y + r]);
  });

  // Collect hole positions
  footprint.holes.forEach((hole) => {
    const r = hole.dia / 2;
    points.push([hole.pos[0] - r, hole.pos[1] - r], [hole.pos[0] + r, hole.pos[1] + r]);
  });

  // Include outline if present
  if (footprint.outline) {
    points.push(...footprint.outline);
  }

  // If no points, default small box
  if (points.length === 0) {
    return { minX: -2, minY: -2, maxX: 2, maxY: 2, width: 4, height: 4 };
  }

  // Apply rotation
  const rotatedPoints = points.map((p) => rotatePoint(p, rotation));

  const xs = rotatedPoints.map((p) => p[0]);
  const ys = rotatedPoints.map((p) => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/** Rotate point around origin. */
const rotatePoint = (p: Vec2, angleDeg: number): Vec2 => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [p[0] * cos - p[1] * sin, p[0] * sin + p[1] * cos];
};

/** Get bounds for placed component (translated to position). */
const getPlacedBounds = (comp: PlacedComponent): BoundingBox => {
  return {
    minX: comp.bounds.minX + comp.pos[0],
    minY: comp.bounds.minY + comp.pos[1],
    maxX: comp.bounds.maxX + comp.pos[0],
    maxY: comp.bounds.maxY + comp.pos[1],
    width: comp.bounds.width,
    height: comp.bounds.height,
  };
};

// =====================
// COLLISION DETECTION
// =====================

/** Check if two placed components overlap (with spacing). */
export const checkOverlap = (
  comp1: PlacedComponent,
  comp2: PlacedComponent,
  spacing: number = COMPONENT_SPACING
): boolean => {
  const b1 = getPlacedBounds(comp1);
  const b2 = getPlacedBounds(comp2);

  return !(
    b1.maxX + spacing < b2.minX ||
    b2.maxX + spacing < b1.minX ||
    b1.maxY + spacing < b2.minY ||
    b2.maxY + spacing < b1.minY
  );
};

/** Get board bounding box. */
const getBoardBounds = (board: Board): BoundingBox => {
  if (board.boundary.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  }

  const xs = board.boundary.map((p) => p[0]);
  const ys = board.boundary.map((p) => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};

// =====================
// PLACEMENT STRATEGIES
// =====================

/** Grid placement - arrange components in rows/columns. */
const placeGrid = (
  components: { type: string; instanceIndex: number }[],
  board: Board
): PlacedComponent[] => {
  const boardBounds = getBoardBounds(board);

  const placed: PlacedComponent[] = [];
  let currentX = boardBounds.minX + BOARD_MARGIN;
  let currentY = boardBounds.minY + BOARD_MARGIN;
  let rowHeight = 0;

  for (const comp of components) {
    const fp = getFootprint(comp.type);
    if (!fp) continue;

    const bounds = calculateComponentBounds(fp, 0);

    // Check if fits in current row
    if (currentX + bounds.width > boardBounds.maxX - BOARD_MARGIN) {
      // Move to next row
      currentX = boardBounds.minX + BOARD_MARGIN;
      currentY += rowHeight + COMPONENT_SPACING;
      rowHeight = 0;
    }

    // Place component (center at currentX + width/2)
    const pos: Vec2 = [
      snapToGrid(currentX + bounds.width / 2 - bounds.minX),
      snapToGrid(currentY + bounds.height / 2 - bounds.minY),
    ];

    placed.push({
      type: comp.type,
      instanceIndex: comp.instanceIndex,
      pos,
      rotation: 0,
      bounds,
    });

    currentX += bounds.width + COMPONENT_SPACING;
    rowHeight = Math.max(rowHeight, bounds.height);
  }

  return placed;
};

/** Compact placement - minimize total area used. */
const placeCompact = (
  components: { type: string; instanceIndex: number }[],
  board: Board
): PlacedComponent[] => {
  const boardBounds = getBoardBounds(board);
  const placed: PlacedComponent[] = [];

  // Sort by area (largest first for better packing)
  const sorted = [...components].sort((a, b) => {
    const fpA = getFootprint(a.type);
    const fpB = getFootprint(b.type);
    const areaA = fpA
      ? calculateComponentBounds(fpA).width * calculateComponentBounds(fpA).height
      : 0;
    const areaB = fpB
      ? calculateComponentBounds(fpB).width * calculateComponentBounds(fpB).height
      : 0;
    return areaB - areaA;
  });

  for (const comp of sorted) {
    const fp = getFootprint(comp.type);
    if (!fp) continue;

    const bounds = calculateComponentBounds(fp, 0);
    const pos = findCompactPosition(placed, bounds, boardBounds);

    placed.push({
      type: comp.type,
      instanceIndex: comp.instanceIndex,
      pos,
      rotation: 0,
      bounds,
    });
  }

  return placed;
};

/** Find best compact position using bottom-left placement. */
const findCompactPosition = (
  placed: PlacedComponent[],
  bounds: BoundingBox,
  boardBounds: BoundingBox
): Vec2 => {
  const startX = boardBounds.minX + BOARD_MARGIN - bounds.minX;
  const startY = boardBounds.minY + BOARD_MARGIN - bounds.minY;

  // Try positions in grid pattern
  for (let y = startY; y < boardBounds.maxY - BOARD_MARGIN; y += GRID_SIZE * 2) {
    for (let x = startX; x < boardBounds.maxX - BOARD_MARGIN; x += GRID_SIZE * 2) {
      const testComp: PlacedComponent = {
        type: '',
        instanceIndex: 0,
        pos: [snapToGrid(x), snapToGrid(y)],
        rotation: 0,
        bounds,
      };

      const overlaps = placed.some((p) => checkOverlap(testComp, p));
      if (!overlaps) {
        return [snapToGrid(x), snapToGrid(y)];
      }
    }
  }

  // Fallback
  return [snapToGrid(startX), snapToGrid(startY)];
};

/** Symmetric placement - mirror components around center axis. */
const placeSymmetric = (
  components: { type: string; instanceIndex: number }[],
  board: Board
): PlacedComponent[] => {
  const boardBounds = getBoardBounds(board);
  const centerX = (boardBounds.minX + boardBounds.maxX) / 2;
  const placed: PlacedComponent[] = [];

  let currentY = boardBounds.minY + BOARD_MARGIN;
  let i = 0;

  while (i < components.length) {
    const comp = components[i];
    const fp = getFootprint(comp.type);
    if (!fp) {
      i++;
      continue;
    }

    const bounds = calculateComponentBounds(fp, 0);

    if (i + 1 < components.length) {
      // Place pair symmetrically
      const offset = bounds.width / 2 + COMPONENT_SPACING;
      placed.push({
        type: comp.type,
        instanceIndex: comp.instanceIndex,
        pos: [
          snapToGrid(centerX - offset - bounds.width / 2),
          snapToGrid(currentY + bounds.height / 2),
        ],
        rotation: 0,
        bounds,
      });

      const comp2 = components[i + 1];
      const fp2 = getFootprint(comp2.type);
      if (fp2) {
        const bounds2 = calculateComponentBounds(fp2, 0);
        placed.push({
          type: comp2.type,
          instanceIndex: comp2.instanceIndex,
          pos: [
            snapToGrid(centerX + offset + bounds2.width / 2),
            snapToGrid(currentY + bounds2.height / 2),
          ],
          rotation: 0,
          bounds: bounds2,
        });
        currentY += Math.max(bounds.height, bounds2.height) + COMPONENT_SPACING;
      }
      i += 2;
    } else {
      // Odd component - place at center
      placed.push({
        type: comp.type,
        instanceIndex: comp.instanceIndex,
        pos: [snapToGrid(centerX), snapToGrid(currentY + bounds.height / 2)],
        rotation: 0,
        bounds,
      });
      currentY += bounds.height + COMPONENT_SPACING;
      i++;
    }
  }

  return placed;
};

/** Flow placement - arrange in signal flow (input → processing → output). */
const placeFlow = (
  components: { type: string; instanceIndex: number }[],
  board: Board
): PlacedComponent[] => {
  const boardBounds = getBoardBounds(board);
  const placed: PlacedComponent[] = [];

  // Group by inferred role
  const inputs: typeof components = [];
  const processing: typeof components = [];
  const outputs: typeof components = [];

  for (const comp of components) {
    const type = comp.type.toLowerCase();
    if (
      type.includes('button') ||
      type.includes('pot') ||
      type.includes('encoder') ||
      type.includes('sensor')
    ) {
      inputs.push(comp);
    } else if (
      type.includes('led') ||
      type.includes('display') ||
      type.includes('speaker') ||
      type.includes('buzzer')
    ) {
      outputs.push(comp);
    } else {
      processing.push(comp);
    }
  }

  // Place in three columns: input | processing | output
  const colWidth = (boardBounds.width - 2 * BOARD_MARGIN) / 3;
  const columns = [inputs, processing, outputs];
  const colStarts = [
    boardBounds.minX + BOARD_MARGIN,
    boardBounds.minX + BOARD_MARGIN + colWidth,
    boardBounds.minX + BOARD_MARGIN + colWidth * 2,
  ];

  for (let col = 0; col < 3; col++) {
    let currentY = boardBounds.minY + BOARD_MARGIN;
    const centerX = colStarts[col] + colWidth / 2;

    for (const comp of columns[col]) {
      const fp = getFootprint(comp.type);
      if (!fp) continue;

      const bounds = calculateComponentBounds(fp, 0);
      placed.push({
        type: comp.type,
        instanceIndex: comp.instanceIndex,
        pos: [snapToGrid(centerX), snapToGrid(currentY + bounds.height / 2)],
        rotation: 0,
        bounds,
      });
      currentY += bounds.height + COMPONENT_SPACING;
    }
  }

  return placed;
};

/** Radial placement - arrange components in circular pattern. */
const placeRadial = (
  components: { type: string; instanceIndex: number }[],
  board: Board
): PlacedComponent[] => {
  const boardBounds = getBoardBounds(board);
  const centerX = (boardBounds.minX + boardBounds.maxX) / 2;
  const centerY = (boardBounds.minY + boardBounds.maxY) / 2;
  const placed: PlacedComponent[] = [];

  const count = components.length;
  if (count === 0) return placed;

  // Calculate radius based on board size and component count
  const maxRadius = Math.min(boardBounds.width, boardBounds.height) / 2 - BOARD_MARGIN - 15;
  const radius = Math.min(maxRadius, count * 8);

  for (let i = 0; i < count; i++) {
    const comp = components[i];
    const fp = getFootprint(comp.type);
    if (!fp) continue;

    const angle = (2 * Math.PI * i) / count - Math.PI / 2; // Start from top
    const bounds = calculateComponentBounds(fp, 0);

    placed.push({
      type: comp.type,
      instanceIndex: comp.instanceIndex,
      pos: [
        snapToGrid(centerX + radius * Math.cos(angle)),
        snapToGrid(centerY + radius * Math.sin(angle)),
      ],
      rotation: Math.round((angle * 180) / Math.PI + 90) % 360,
      bounds,
    });
  }

  return placed;
};

// =====================
// SCORING
// =====================

/** Calculate quality score for an arrangement. */
export const scoreArrangement = (
  placement: PlacedComponent[],
  connections: ConnectionDef[],
  board: Board
): { score: number; metrics: ArrangementMetrics } => {
  const metrics = calculateMetrics(placement, connections, board);

  // Weighted scoring (higher is better)
  const routeScore = Math.max(0, 100 - metrics.totalRouteLength / 10);
  const crossingScore = Math.max(0, 100 - metrics.routeCrossings * 20);
  const utilizationScore = metrics.boardUtilization * 50; // Prefer compact
  const symmetryScore = metrics.symmetryScore * 30;

  const score = Math.round(
    routeScore * 0.4 + crossingScore * 0.3 + utilizationScore * 0.15 + symmetryScore * 0.15
  );

  return { score: Math.min(100, Math.max(0, score)), metrics };
};

/** Calculate arrangement metrics. */
const calculateMetrics = (
  placement: PlacedComponent[],
  connections: ConnectionDef[],
  board: Board
): ArrangementMetrics => {
  // Estimate total route length
  let totalRouteLength = 0;
  const routes: { start: Vec2; end: Vec2 }[] = [];

  for (const conn of connections) {
    if (conn.from.componentIndex >= placement.length || conn.to.componentIndex >= placement.length)
      continue;

    const fromComp = placement[conn.from.componentIndex];
    const toComp = placement[conn.to.componentIndex];

    const fp1 = getFootprint(fromComp.type);
    const fp2 = getFootprint(toComp.type);
    if (!fp1 || !fp2) continue;

    const pad1 = fp1.pads[conn.from.padIndex];
    const pad2 = fp2.pads[conn.to.padIndex];
    if (!pad1 || !pad2) continue;

    const start: Vec2 = [fromComp.pos[0] + pad1.pos[0], fromComp.pos[1] + pad1.pos[1]];
    const end: Vec2 = [toComp.pos[0] + pad2.pos[0], toComp.pos[1] + pad2.pos[1]];

    const dist = Math.hypot(end[0] - start[0], end[1] - start[1]);
    totalRouteLength += dist;
    routes.push({ start, end });
  }

  // Count route crossings (simplified)
  let routeCrossings = 0;
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      if (segmentsIntersect(routes[i].start, routes[i].end, routes[j].start, routes[j].end)) {
        routeCrossings++;
      }
    }
  }

  // Board utilization
  const boardBounds = getBoardBounds(board);
  const boardArea = boardBounds.width * boardBounds.height;
  let componentArea = 0;
  for (const p of placement) {
    componentArea += p.bounds.width * p.bounds.height;
  }
  const boardUtilization = Math.min(1, componentArea / boardArea);

  // Symmetry score (measure deviation from center)
  const centerX = (boardBounds.minX + boardBounds.maxX) / 2;
  let symmetryDeviation = 0;
  for (const p of placement) {
    symmetryDeviation += Math.abs(p.pos[0] - centerX);
  }
  const avgDeviation = placement.length > 0 ? symmetryDeviation / placement.length : 0;
  const symmetryScore = Math.max(0, 1 - avgDeviation / (boardBounds.width / 4));

  return {
    totalRouteLength: Math.round(totalRouteLength),
    routeCrossings,
    boardUtilization: Math.round(boardUtilization * 100) / 100,
    symmetryScore: Math.round(symmetryScore * 100) / 100,
  };
};

/** Check if two line segments intersect. */
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
// OPTIMIZER
// =====================

/** Optimize placement using simulated annealing. */
export const optimizePlacement = (
  initial: PlacedComponent[],
  connections: ConnectionDef[],
  board: Board
): PlacedComponent[] => {
  if (initial.length === 0) return initial;

  let current = structuredClone(initial);
  let currentScore = scoreArrangement(current, connections, board).score;
  let best = structuredClone(current);
  let bestScore = currentScore;

  let temp = INITIAL_TEMP;
  const boardBounds = getBoardBounds(board);

  for (let i = 0; i < MAX_OPTIMIZER_ITERATIONS; i++) {
    // Generate neighbor by moving a random component
    const neighbor = structuredClone(current);
    const idx = Math.floor(Math.random() * neighbor.length);

    // Random move
    const moveX = (Math.random() - 0.5) * 20;
    const moveY = (Math.random() - 0.5) * 20;
    neighbor[idx].pos = [
      snapToGrid(neighbor[idx].pos[0] + moveX),
      snapToGrid(neighbor[idx].pos[1] + moveY),
    ];

    // Clamp to board bounds
    const bounds = neighbor[idx].bounds;
    neighbor[idx].pos[0] = Math.max(
      boardBounds.minX + BOARD_MARGIN - bounds.minX,
      Math.min(boardBounds.maxX - BOARD_MARGIN - bounds.maxX, neighbor[idx].pos[0])
    );
    neighbor[idx].pos[1] = Math.max(
      boardBounds.minY + BOARD_MARGIN - bounds.minY,
      Math.min(boardBounds.maxY - BOARD_MARGIN - bounds.maxY, neighbor[idx].pos[1])
    );

    // Check validity (no overlaps)
    let valid = true;
    for (let j = 0; j < neighbor.length; j++) {
      if (j !== idx && checkOverlap(neighbor[idx], neighbor[j])) {
        valid = false;
        break;
      }
    }

    if (valid) {
      const neighborScore = scoreArrangement(neighbor, connections, board).score;
      const delta = neighborScore - currentScore;

      // Accept if better, or probabilistically if worse
      if (delta > 0 || Math.random() < Math.exp(delta / temp)) {
        current = neighbor;
        currentScore = neighborScore;

        if (currentScore > bestScore) {
          best = structuredClone(current);
          bestScore = currentScore;
        }
      }
    }

    temp *= COOLING_RATE;
  }

  return best;
};

// =====================
// MAIN ENTRY POINT
// =====================

/** Generate multiple placement options for assembly components. */
export const generatePlacements = (
  assemblyComponents: AssemblyComponent[],
  board: Board,
  connections: ConnectionDef[]
): ArrangementOption[] => {
  const expanded = expandComponents(assemblyComponents, board);

  if (expanded.length === 0) {
    return [];
  }

  const strategies: { name: PlacementStrategy; label: string; description: string }[] = [
    { name: 'grid', label: 'Grid', description: 'Components arranged in rows and columns' },
    { name: 'compact', label: 'Compact', description: 'Minimizes board space usage' },
    { name: 'symmetric', label: 'Symmetric', description: 'Balanced layout around center axis' },
    { name: 'flow', label: 'Signal Flow', description: 'Input → Processing → Output layout' },
    { name: 'radial', label: 'Radial', description: 'Circular arrangement around center' },
  ];

  const options: ArrangementOption[] = [];

  for (const strategy of strategies) {
    // Generate initial placement
    let placement: PlacedComponent[];
    switch (strategy.name) {
      case 'grid':
        placement = placeGrid(expanded, board);
        break;
      case 'compact':
        placement = placeCompact(expanded, board);
        break;
      case 'symmetric':
        placement = placeSymmetric(expanded, board);
        break;
      case 'flow':
        placement = placeFlow(expanded, board);
        break;
      case 'radial':
        placement = placeRadial(expanded, board);
        break;
    }

    // Optimize placement
    const optimized = optimizePlacement(placement, connections, board);

    // Score and create option
    const { score, metrics } = scoreArrangement(optimized, connections, board);

    // Convert to Component[] format
    const components = placedToComponents(optimized);

    options.push({
      id: `arr_${strategy.name}_${Date.now()}`,
      name: strategy.label,
      description: strategy.description,
      components,
      routes: [], // Routes generated separately by autoRouter
      score,
      metrics,
    });
  }

  // Sort by score (best first)
  options.sort((a, b) => b.score - a.score);

  return options;
};

/** Convert PlacedComponent[] to Component[]. */
const placedToComponents = (placed: PlacedComponent[]): Component[] => {
  return placed.map((p, i) => {
    const fp = getFootprint(p.type);
    return {
      id: `comp_${p.type}_${p.instanceIndex}_${i}`,
      type: p.type,
      pos: p.pos,
      rotation: p.rotation,
      pads:
        fp?.pads.map((pad, j) => ({
          id: `pad_${i}_${j}`,
          pos: pad.pos,
          dia: pad.dia,
          width: pad.width,
          height: pad.height,
        })) || [],
      holes: fp?.holes || [],
    };
  });
};

/** Snap value to grid. */
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};
