/**
 * Core types for DIYPCB Designer
 */

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type ChannelProfile = 'U' | 'V' | 'flat';
export type BoardShape = 'rectangular' | 'circular' | 'freeform';
export type Layer = 'top' | 'bottom';

export type TapeSpec = {
  widths: number[];
  thickness: number;
  minBendRadius: number;
};

export type MountFeature = {
  type: 'mount';
  pos: Vec2;
  dia: number;
};

export type Board = {
  shape: BoardShape;
  thickness: number;
  boundary: Vec2[];
  features: MountFeature[];
  fillet?: number;
};

export type Pad = {
  id: string;
  pos: Vec2;
  dia?: number;
  width?: number;
  height?: number;
};

export type Hole = {
  pos: Vec2;
  dia: number;
};

export type Component = {
  id: string;
  type: string;
  pos: Vec2;
  rotation: number;
  pads: Pad[];
  holes: Hole[];
};

export type Net = {
  name: string;
  nodes: string[];
};

export type Route = {
  net: string;
  layer: Layer;
  polyline: Vec2[];
  width: number;
  profile: ChannelProfile;
  depth: number;
};

export type Via = {
  pos: Vec2;
  dia: number;
  chamfer: number;
  anchorRecess?: number;
};

export type AnnotationType = 'text' | 'designator' | 'netLabel' | 'refMark';

export type Annotation = {
  id: string;
  type: AnnotationType;
  pos: Vec2;
  text: string;
  fontSize?: number;
  rotation?: number;
  color?: string;
};

export type DRCRules = {
  minSpacing: number;
  minWall: number;
  nozzleWidth: number;
  layerHeight: number;
  minBendRadius: number;
  minPadClearance: number;
};

export type Project = {
  name: string;
  units: 'mm' | 'in';
  tape: TapeSpec;
  board: Board;
  components: Component[];
  nets: Net[];
  routes: Route[];
  vias: Via[];
  annotations: Annotation[];
  rules: DRCRules;
  enclosure?: Enclosure;
};

export type DRCViolationType =
  | 'spacing'
  | 'wall'
  | 'bend'
  | 'pad'
  | 'overhang'
  | 'collision'
  | 'overlap';

export type DRCViolation = {
  type: DRCViolationType;
  message: string;
  position: Vec2;
  severity: 'error' | 'warning';
  autoFix?: () => void;
};

/** Footprint type is a string to allow extensibility. */
export type FootprintType = string;

export type FootprintDefinition = {
  type: FootprintType;
  name: string;
  pads: Omit<Pad, 'id'>[];
  holes: Hole[];
  outline?: Vec2[];
  /** Component height in mm (for lid clearance calculation). */
  height?: number;
  /** Contact height - where pressure pad should press (default: top of component). */
  contactHeight?: number;
};

// =====================
// ENCLOSURE TYPES
// =====================

export type MagnetPolarity = 'N' | 'S';

export type VentPattern = 'slots' | 'honeycomb' | 'grid' | 'none';

export type MagnetPlacement = {
  id: string;
  componentId: string; // Reference to magnet component
  polarity: MagnetPolarity;
  x: number; // Position X
  y: number; // Position Y
  diameter: number; // Magnet diameter in mm
  thickness: number; // Magnet thickness in mm
};

export type PressurePad = {
  id: string;
  componentId: string; // Component this pad presses
  pos: Vec2; // Position on lid (same as component pos)
  x: number; // Position X (same as pos[0])
  y: number; // Position Y (same as pos[1])
  width: number; // Pad width in mm
  height: number; // Pad height in mm (boss height extending from lid)
  diameter: number; // Pad diameter in mm
  material: 'plastic' | 'foam' | 'rubber';
};

export type ConnectorCutout = {
  id: string;
  componentId: string; // Reference to connector component
  type: 'usb' | 'barrel' | 'jack_35mm' | 'jack_635mm' | 'custom';
  wall: 'front' | 'back' | 'left' | 'right';
  x: number; // Position X
  y: number; // Position Y
  z: number; // Position Z
  width: number;
  height: number;
};

export type Enclosure = {
  enabled: boolean;
  wallThickness: number; // mm (default 2)
  lidHeight: number; // mm (auto-calculated or manual)
  cornerRadius: number; // mm (default 2)
  clearance: number; // mm above tallest component (default 2)
  snapFitTolerance: number; // mm (default 0.2)
  ventilation: {
    enabled: boolean;
    pattern: VentPattern;
    position: 'top' | 'sides' | 'both';
    slotWidth: number; // mm
    slotSpacing: number; // mm
  };
  pressurePads: PressurePad[];
  magnetPlacements: MagnetPlacement[];
  connectorCutouts: ConnectorCutout[];
};

// =====================
// AUTO-ASSEMBLY TYPES
// =====================

export type ComponentRole = 'input' | 'output' | 'power' | 'ground' | 'signal' | 'connector';

export type AssemblyComponent = {
  id: string;
  type: string; // Footprint type
  quantity: number;
  role?: ComponentRole;
};

export type ConnectionDef = {
  id: string;
  from: { componentIndex: number; padIndex: number };
  to: { componentIndex: number; padIndex: number };
  netName?: string;
  isPower?: boolean;
};

export type ArrangementMetrics = {
  totalRouteLength: number;
  routeCrossings: number;
  boardUtilization: number;
  symmetryScore: number;
};

export type ArrangementOption = {
  id: string;
  name: string; // "Compact", "Symmetric", "Linear", etc.
  description: string;
  components: Component[];
  routes: Route[];
  score: number; // Quality score (0-100)
  metrics: ArrangementMetrics;
};

export type AutoAssemblyStep = 'select' | 'connect' | 'arrange' | 'preview';
