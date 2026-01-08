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

export type EnclosureStyle = 'lid-only' | 'split-case' | 'tray';

export type MagnetPlacement = {
  id: string;
  componentId: string;
  polarity: MagnetPolarity;
  x: number;
  y: number;
  diameter: number;
  thickness: number;
};

export type PressurePad = {
  id: string;
  componentId: string;
  pos: Vec2;
  x: number;
  y: number;
  width: number;
  height: number;
  diameter: number;
  material: 'plastic' | 'foam' | 'rubber';
};

export type ConnectorCutout = {
  id: string;
  componentId: string;
  type: 'usb' | 'barrel' | 'jack_35mm' | 'jack_635mm' | 'midi' | 'custom';
  wall: 'front' | 'back' | 'left' | 'right';
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
};

export type ScrewBoss = {
  id: string;
  x: number;
  y: number;
  outerDiameter: number;
  innerDiameter: number;
  height: number;
  insertType: 'none' | 'heat-set' | 'self-tap';
};

export type EnclosureFoot = {
  id: string;
  x: number;
  y: number;
  diameter: number;
  height: number;
  style: 'round' | 'square' | 'rubber-pad';
};

export type LabelArea = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  text?: string;
};

export type Enclosure = {
  enabled: boolean;
  style: EnclosureStyle;
  wallThickness: number;
  lidHeight: number;
  baseHeight: number;
  cornerRadius: number;
  clearance: number;
  snapFitTolerance: number;
  ventilation: {
    enabled: boolean;
    pattern: VentPattern;
    position: 'top' | 'sides' | 'both';
    slotWidth: number;
    slotSpacing: number;
  };
  pressurePads: PressurePad[];
  magnetPlacements: MagnetPlacement[];
  connectorCutouts: ConnectorCutout[];
  screwBosses: ScrewBoss[];
  feet: EnclosureFoot[];
  labelAreas: LabelArea[];
  showScrewBosses: boolean;
  showFeet: boolean;
};

// =====================
// AUTO-ASSEMBLY TYPES
// =====================

export type ComponentRole = 'input' | 'output' | 'power' | 'ground' | 'signal' | 'connector';

/** Standard pad function roles for auto-detection. */
export type PadRole =
  | 'vcc'
  | 'gnd'
  | 'signal'
  | 'data'
  | 'clock'
  | 'enable'
  | 'output'
  | 'input'
  | 'nc';

/** Known pinout definition for a component type. */
export type ComponentPinout = {
  type: string;
  pins: { index: number; role: PadRole; name: string; voltage?: number }[];
};

/** Placement zone on the board. */
export type PlacementZone =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/** Edge preference for connector placement. */
export type EdgePreference = 'front' | 'back' | 'left' | 'right' | 'any';

/** Constraint for component placement. */
export type PlacementConstraint = {
  componentId: string;
  zone?: PlacementZone;
  edge?: EdgePreference;
  locked?: boolean;
  lockedPos?: Vec2;
  lockedRotation?: number;
  keepTogether?: string[];
};

export type AssemblyComponent = {
  id: string;
  type: string;
  quantity: number;
  role?: ComponentRole;
  constraint?: PlacementConstraint;
};

export type ConnectionDef = {
  id: string;
  from: { componentIndex: number; padIndex: number };
  to: { componentIndex: number; padIndex: number };
  netName?: string;
  isPower?: boolean;
  isGround?: boolean;
  isBus?: boolean;
  autoDetected?: boolean;
};

export type ArrangementMetrics = {
  totalRouteLength: number;
  routeCrossings: number;
  boardUtilization: number;
  symmetryScore: number;
};

export type ArrangementOption = {
  id: string;
  name: string;
  description: string;
  components: Component[];
  routes: Route[];
  score: number;
  metrics: ArrangementMetrics;
};

export type AutoAssemblyStep = 'select' | 'connect' | 'arrange' | 'preview';
