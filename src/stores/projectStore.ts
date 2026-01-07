import { create } from 'zustand';
import { aStarPathfind, splineRoute } from '../lib/routing/routingUtils';
import { getFootprint } from '../data/footprints';
import type {
  Project,
  Component,
  Route,
  Via,
  DRCViolation,
  Board,
  Vec2,
  ChannelProfile,
  Layer,
  Annotation,
} from '../types';

type RoutingMode = 'manual' | 'manhattan' | 'spline' | 'auto';

const MAX_HISTORY = 50;

type ProjectState = {
  project: Project;
  selectedComponent: string | null;
  selectedRoute: number | null;
  violations: DRCViolation[];
  isDrawingRoute: boolean;
  currentRoutePoints: Vec2[];
  isPlacingVia: boolean;
  routeWidth: number;
  routeProfile: ChannelProfile;
  routingMode: RoutingMode;
  activeLayer: Layer;

  // History for undo/redo
  history: Project[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Board actions
  setBoard: (board: Board) => void;
  updateBoardThickness: (thickness: number) => void;
  addMountingHole: (pos: Vec2, dia: number) => void;

  // Component actions
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, pos: Vec2) => void;
  updateComponentRotation: (id: string, rotation: number) => void;
  selectComponent: (id: string | null) => void;

  // Routing actions
  startRoute: () => void;
  addRoutePoint: (point: Vec2) => void;
  finishRoute: () => void;
  cancelRoute: () => void;
  removeRoute: (index: number) => void;
  selectRoute: (index: number | null) => void;
  setRouteWidth: (width: number) => void;
  setRouteProfile: (profile: ChannelProfile) => void;
  setRoutingMode: (mode: RoutingMode) => void;
  setActiveLayer: (layer: Layer) => void;
  updateRoutePoint: (routeIndex: number, pointIndex: number, pos: Vec2) => void;
  removeRoutePoint: (routeIndex: number, pointIndex: number) => void;

  // Via actions
  addVia: (via: Via) => void;
  removeVia: (index: number) => void;
  setPlacingVia: (placing: boolean) => void;

  // Annotation actions
  selectedAnnotation: string | null;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  selectAnnotation: (id: string | null) => void;
  generateDesignators: () => void;

  // Auto-route state
  isAutoRouting: boolean;
  autoRouteStart: Vec2 | null;
  setAutoRouting: (active: boolean) => void;
  setAutoRouteStart: (pos: Vec2 | null) => void;

  // DRC actions
  setViolations: (violations: DRCViolation[]) => void;
  clearViolations: () => void;

  // Project actions
  loadProject: (project: Project) => void;
  resetProject: () => void;
  updateProjectName: (name: string) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Auto-routing
  autoRoute: (startPos: Vec2, endPos: Vec2) => boolean;
};

const createDefaultProject = (): Project => ({
  name: 'Untitled Project',
  units: 'mm',
  tape: {
    widths: [3.0, 5.0],
    thickness: 0.05,
    minBendRadius: 2.0,
  },
  board: {
    shape: 'rectangular',
    thickness: 2.0,
    boundary: [
      [0, 0],
      [100, 0],
      [100, 60],
      [0, 60],
    ],
    features: [],
  },
  components: [],
  nets: [],
  routes: [],
  vias: [],
  annotations: [],
  rules: {
    minSpacing: 1.0,
    minWall: 0.8,
    nozzleWidth: 0.4,
    layerHeight: 0.2,
    minBendRadius: 2.0,
    minPadClearance: 0.5,
  },
});

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createDefaultProject(),
  selectedComponent: null,
  selectedRoute: null,
  violations: [],
  isDrawingRoute: false,
  currentRoutePoints: [],
  isPlacingVia: false,
  routeWidth: 5.0,
  routeProfile: 'U' as ChannelProfile,
  routingMode: 'manual' as RoutingMode,
  activeLayer: 'top' as Layer,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  isAutoRouting: false,
  autoRouteStart: null,
  selectedAnnotation: null,

  setBoard: (board) => {
    get().pushHistory();
    set((state) => ({ project: { ...state.project, board } }));
  },

  updateBoardThickness: (thickness) =>
    set((state) => ({
      project: {
        ...state.project,
        board: { ...state.project.board, thickness },
      },
    })),

  addMountingHole: (pos, dia) =>
    set((state) => ({
      project: {
        ...state.project,
        board: {
          ...state.project.board,
          features: [...state.project.board.features, { type: 'mount', pos, dia }],
        },
      },
    })),

  addComponent: (component) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        components: [...state.project.components, component],
      },
    }));
  },

  removeComponent: (id) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        components: state.project.components.filter((c) => c.id !== id),
      },
      selectedComponent: state.selectedComponent === id ? null : state.selectedComponent,
    }));
  },

  updateComponentPosition: (id, pos) =>
    set((state) => ({
      project: {
        ...state.project,
        components: state.project.components.map((c) => (c.id === id ? { ...c, pos } : c)),
      },
    })),

  updateComponentRotation: (id, rotation) =>
    set((state) => ({
      project: {
        ...state.project,
        components: state.project.components.map((c) => (c.id === id ? { ...c, rotation } : c)),
      },
    })),

  selectComponent: (id) => set({ selectedComponent: id }),

  startRoute: () => {
    set({
      isDrawingRoute: true,
      currentRoutePoints: [],
    });
  },

  addRoutePoint: (point) =>
    set((state) => ({
      currentRoutePoints: [...state.currentRoutePoints, point],
    })),

  finishRoute: () => {
    const state = get();
    if (state.currentRoutePoints.length < 2) {
      set({ isDrawingRoute: false, currentRoutePoints: [] });
      return;
    }

    get().pushHistory();

    // Convert to spline if in spline mode
    const polyline =
      state.routingMode === 'spline' && state.currentRoutePoints.length >= 2
        ? splineRoute(state.currentRoutePoints, 10)
        : state.currentRoutePoints;

    const newRoute: Route = {
      net: 'NET_' + (state.project.routes.length + 1),
      layer: state.activeLayer,
      polyline,
      width: state.routeWidth,
      profile: state.routeProfile,
      depth: 0.6,
    };

    set((s) => ({
      project: {
        ...s.project,
        routes: [...s.project.routes, newRoute],
      },
      isDrawingRoute: false,
      currentRoutePoints: [],
    }));
  },

  cancelRoute: () => set({ isDrawingRoute: false, currentRoutePoints: [] }),

  setRouteWidth: (width) => set({ routeWidth: width }),

  setRouteProfile: (profile) => set({ routeProfile: profile }),

  setRoutingMode: (mode) => set({ routingMode: mode }),

  setActiveLayer: (layer) => set({ activeLayer: layer }),

  removeRoute: (index) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        routes: state.project.routes.filter((_, i) => i !== index),
      },
      selectedRoute: state.selectedRoute === index ? null : state.selectedRoute,
    }));
  },

  selectRoute: (index) => set({ selectedRoute: index }),

  updateRoutePoint: (routeIndex, pointIndex, pos) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        routes: state.project.routes.map((route, rIdx) =>
          rIdx === routeIndex
            ? {
                ...route,
                polyline: route.polyline.map((pt, pIdx) => (pIdx === pointIndex ? pos : pt)),
              }
            : route
        ),
      },
    }));
  },

  removeRoutePoint: (routeIndex, pointIndex) => {
    const route = get().project.routes[routeIndex];
    // Don't allow removing if only 2 points remain
    if (route && route.polyline.length <= 2) return;

    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        routes: state.project.routes.map((r, rIdx) =>
          rIdx === routeIndex
            ? { ...r, polyline: r.polyline.filter((_, pIdx) => pIdx !== pointIndex) }
            : r
        ),
      },
    }));
  },

  addVia: (via) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        vias: [...state.project.vias, via],
      },
    }));
  },

  removeVia: (index) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        vias: state.project.vias.filter((_, i) => i !== index),
      },
    }));
  },

  setPlacingVia: (placing) => set({ isPlacingVia: placing }),

  // Annotation actions
  addAnnotation: (annotation) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        annotations: [...state.project.annotations, annotation],
      },
    }));
  },

  removeAnnotation: (id) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        annotations: state.project.annotations.filter((a) => a.id !== id),
      },
      selectedAnnotation: state.selectedAnnotation === id ? null : state.selectedAnnotation,
    }));
  },

  updateAnnotation: (id, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        annotations: state.project.annotations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      },
    })),

  selectAnnotation: (id) => set({ selectedAnnotation: id }),

  generateDesignators: () => {
    const state = get();
    const { project } = state;

    // Count components by type prefix for designator assignment
    const counters: Record<string, number> = {};
    const newAnnotations: Annotation[] = [];

    // Remove existing designators first
    const existingNonDesignators = project.annotations.filter((a) => a.type !== 'designator');

    for (const comp of project.components) {
      // Determine prefix based on component type
      let prefix = 'U';
      const type = comp.type.toLowerCase();

      if (type.includes('resistor') || type.includes('pot') || type.includes('trimpot')) {
        prefix = 'R';
      } else if (type.includes('capacitor') || type.includes('cap')) {
        prefix = 'C';
      } else if (type.includes('led')) {
        prefix = 'D';
      } else if (type.includes('diode')) {
        prefix = 'D';
      } else if (type.includes('transistor') || type.includes('mosfet')) {
        prefix = 'Q';
      } else if (type.includes('inductor') || type.includes('coil')) {
        prefix = 'L';
      } else if (type.includes('switch') || type.includes('button')) {
        prefix = 'SW';
      } else if (type.includes('jack') || type.includes('connector') || type.includes('header')) {
        prefix = 'J';
      } else if (type.includes('crystal') || type.includes('oscillator')) {
        prefix = 'Y';
      } else if (type.includes('fuse')) {
        prefix = 'F';
      } else if (type.includes('relay')) {
        prefix = 'K';
      } else if (type.includes('transformer')) {
        prefix = 'T';
      } else if (type.includes('encoder')) {
        prefix = 'ENC';
      } else if (type.includes('display') || type.includes('lcd') || type.includes('oled')) {
        prefix = 'DSP';
      } else if (type.includes('ic') || type.includes('chip') || type.includes('micro')) {
        prefix = 'U';
      }

      counters[prefix] = (counters[prefix] || 0) + 1;
      const designator = `${prefix}${counters[prefix]}`;

      newAnnotations.push({
        id: `des_${comp.id}`,
        type: 'designator',
        pos: [comp.pos[0], comp.pos[1] - 8] as Vec2,
        text: designator,
        fontSize: 3,
        rotation: 0,
        color: '#2563eb',
      });
    }

    get().pushHistory();
    set((s) => ({
      project: {
        ...s.project,
        annotations: [...existingNonDesignators, ...newAnnotations],
      },
    }));
  },

  setAutoRouting: (active) =>
    set({
      isAutoRouting: active,
      autoRouteStart: null,
      isDrawingRoute: false,
      isPlacingVia: false,
    }),

  setAutoRouteStart: (pos) => set({ autoRouteStart: pos }),

  setViolations: (violations) => set({ violations }),

  clearViolations: () => set({ violations: [] }),

  loadProject: (project) =>
    set({
      project,
      selectedComponent: null,
      selectedRoute: null,
      violations: [],
      isDrawingRoute: false,
      currentRoutePoints: [],
    }),

  resetProject: () =>
    set({
      project: createDefaultProject(),
      selectedComponent: null,
      selectedRoute: null,
      violations: [],
      isDrawingRoute: false,
      currentRoutePoints: [],
    }),

  updateProjectName: (name) =>
    set((state) => ({
      project: { ...state.project, name },
    })),

  // History management
  pushHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.project)));

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;

    // Save current state if this is the first undo
    let newHistory = state.history;
    let newIndex = state.historyIndex;

    if (state.historyIndex === state.history.length - 1) {
      // Push current state to allow redo back to it
      newHistory = [...state.history, JSON.parse(JSON.stringify(state.project))];
      newIndex = state.historyIndex;
    } else {
      newIndex = state.historyIndex - 1;
    }

    if (newIndex < 0) return;

    const previousProject = newHistory[newIndex];

    set({
      project: JSON.parse(JSON.stringify(previousProject)),
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      selectedComponent: null,
      selectedRoute: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const nextIndex = state.historyIndex + 1;
    const nextProject = state.history[nextIndex];

    set({
      project: JSON.parse(JSON.stringify(nextProject)),
      historyIndex: nextIndex,
      canUndo: true,
      canRedo: nextIndex < state.history.length - 1,
      selectedComponent: null,
      selectedRoute: null,
    });
  },

  autoRoute: (startPos, endPos) => {
    const state = get();
    const { project, routeWidth, routeProfile, activeLayer } = state;

    // Build obstacle list from components
    const obstacles: Vec2[][] = [];

    for (const comp of project.components) {
      const footprint = getFootprint(comp.type);
      if (!footprint) continue;

      // Calculate bounding box from pads and outline
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      for (const pad of footprint.pads) {
        const r = (pad.dia || pad.width || 2) / 2;
        minX = Math.min(minX, pad.pos[0] - r);
        maxX = Math.max(maxX, pad.pos[0] + r);
        minY = Math.min(minY, pad.pos[1] - r);
        maxY = Math.max(maxY, pad.pos[1] + r);
      }

      if (footprint.outline) {
        for (const pt of footprint.outline) {
          minX = Math.min(minX, pt[0]);
          maxX = Math.max(maxX, pt[0]);
          minY = Math.min(minY, pt[1]);
          maxY = Math.max(maxY, pt[1]);
        }
      }

      // Create bounding box for component with margin
      const margin = 3;
      const [cx, cy] = comp.pos;

      // Simple axis-aligned bounding box (ignoring rotation for simplicity)
      obstacles.push([
        [cx + minX - margin, cy + minY - margin],
        [cx + maxX + margin, cy + minY - margin],
        [cx + maxX + margin, cy + maxY + margin],
        [cx + minX - margin, cy + maxY + margin],
      ]);
    }

    // Get board bounds
    const boundary = project.board.boundary;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const [x, y] of boundary) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    // Run A* pathfinding
    const path = aStarPathfind(
      startPos,
      endPos,
      obstacles,
      { minX, minY, maxX, maxY },
      5, // gridSize
      routeWidth
    );

    if (!path || path.length < 2) {
      return false;
    }

    // Create route from path
    get().pushHistory();

    const newRoute: Route = {
      net: 'NET_' + (project.routes.length + 1),
      layer: activeLayer,
      polyline: path,
      width: routeWidth,
      profile: routeProfile,
      depth: 0.6,
    };

    set((s) => ({
      project: {
        ...s.project,
        routes: [...s.project.routes, newRoute],
      },
    }));

    return true;
  },
}));
