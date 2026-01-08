import { create } from 'zustand';
import { getComponentHeight, getContactHeight } from '../data/footprints';
import type {
  Enclosure,
  EnclosureStyle,
  PressurePad,
  MagnetPlacement,
  MagnetPolarity,
  ConnectorCutout,
  ScrewBoss,
  EnclosureFoot,
  LabelArea,
  VentPattern,
  Component,
  Vec2,
} from '../types';

type EnclosureState = {
  enclosure: Enclosure;
  showLid: boolean;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setStyle: (style: EnclosureStyle) => void;
  setWallThickness: (thickness: number) => void;
  setLidHeight: (height: number) => void;
  setBaseHeight: (height: number) => void;
  setCornerRadius: (radius: number) => void;
  setClearance: (clearance: number) => void;
  setSnapFitTolerance: (tolerance: number) => void;

  // Ventilation
  setVentilationEnabled: (enabled: boolean) => void;
  setVentPattern: (pattern: VentPattern) => void;
  setVentPosition: (position: 'top' | 'sides' | 'both') => void;
  setVentSlotWidth: (width: number) => void;
  setVentSlotSpacing: (spacing: number) => void;

  // Pressure pads
  generatePressurePads: (components: Component[]) => void;
  updatePressurePad: (id: string, updates: Partial<PressurePad>) => void;
  removePressurePad: (id: string) => void;

  // Magnets
  generateMagnetPlacements: (components: Component[]) => void;
  toggleMagnetPolarity: (id: string) => void;
  setMagnetPolarity: (id: string, polarity: MagnetPolarity) => void;

  // Connector cutouts
  generateConnectorCutouts: (components: Component[]) => void;
  updateConnectorCutout: (id: string, updates: Partial<ConnectorCutout>) => void;

  // Screw bosses
  generateScrewBosses: (boundary: Vec2[]) => void;
  addScrewBoss: (x: number, y: number) => void;
  updateScrewBoss: (id: string, updates: Partial<ScrewBoss>) => void;
  removeScrewBoss: (id: string) => void;
  setShowScrewBosses: (show: boolean) => void;

  // Feet
  generateFeet: (boundary: Vec2[]) => void;
  addFoot: (x: number, y: number) => void;
  updateFoot: (id: string, updates: Partial<EnclosureFoot>) => void;
  removeFoot: (id: string) => void;
  setShowFeet: (show: boolean) => void;

  // Label areas
  addLabelArea: (x: number, y: number, width: number, height: number) => void;
  updateLabelArea: (id: string, updates: Partial<LabelArea>) => void;
  removeLabelArea: (id: string) => void;

  // Lid visibility
  setShowLid: (show: boolean) => void;

  // Auto-calculate lid height from components
  calculateLidHeight: (components: Component[], boardThickness: number) => number;

  // Reset
  resetEnclosure: () => void;
};

const createDefaultEnclosure = (): Enclosure => ({
  enabled: false,
  style: 'lid-only',
  wallThickness: 2,
  lidHeight: 15,
  baseHeight: 5,
  cornerRadius: 2,
  clearance: 2,
  snapFitTolerance: 0.2,
  ventilation: {
    enabled: false,
    pattern: 'slots',
    position: 'top',
    slotWidth: 2,
    slotSpacing: 4,
  },
  pressurePads: [],
  magnetPlacements: [],
  connectorCutouts: [],
  screwBosses: [],
  feet: [],
  labelAreas: [],
  showScrewBosses: true,
  showFeet: true,
});

export const useEnclosureStore = create<EnclosureState>((set, get) => ({
  enclosure: createDefaultEnclosure(),
  showLid: true,

  setEnabled: (enabled) =>
    set((state) => ({
      enclosure: { ...state.enclosure, enabled },
    })),

  setStyle: (style) =>
    set((state) => ({
      enclosure: { ...state.enclosure, style },
    })),

  setWallThickness: (wallThickness) =>
    set((state) => ({
      enclosure: { ...state.enclosure, wallThickness },
    })),

  setLidHeight: (lidHeight) =>
    set((state) => ({
      enclosure: { ...state.enclosure, lidHeight },
    })),

  setBaseHeight: (baseHeight) =>
    set((state) => ({
      enclosure: { ...state.enclosure, baseHeight },
    })),

  setCornerRadius: (cornerRadius) =>
    set((state) => ({
      enclosure: { ...state.enclosure, cornerRadius },
    })),

  setClearance: (clearance) =>
    set((state) => ({
      enclosure: { ...state.enclosure, clearance },
    })),

  setSnapFitTolerance: (snapFitTolerance) =>
    set((state) => ({
      enclosure: { ...state.enclosure, snapFitTolerance },
    })),

  // Ventilation
  setVentilationEnabled: (enabled) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        ventilation: { ...state.enclosure.ventilation, enabled },
      },
    })),

  setVentPattern: (pattern) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        ventilation: { ...state.enclosure.ventilation, pattern },
      },
    })),

  setVentPosition: (position) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        ventilation: { ...state.enclosure.ventilation, position },
      },
    })),

  setVentSlotWidth: (slotWidth) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        ventilation: { ...state.enclosure.ventilation, slotWidth },
      },
    })),

  setVentSlotSpacing: (slotSpacing) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        ventilation: { ...state.enclosure.ventilation, slotSpacing },
      },
    })),

  // Pressure pads - auto-generate from components
  generatePressurePads: (components) => {
    const pads: PressurePad[] = [];

    components.forEach((comp) => {
      // Skip magnets and connectors (they don't need pressure pads)
      if (comp.type.startsWith('magnet_') || comp.type.startsWith('connector_')) {
        return;
      }

      const compHeight = getComponentHeight(comp.type);
      const contactHeight = getContactHeight(comp.type);

      // Calculate pad diameter based on component outline
      let padDiameter = 8; // Default
      if (comp.type.includes('capacitor')) padDiameter = 10;
      if (comp.type.includes('ic_dip')) padDiameter = 12;
      if (comp.type.includes('mcu')) padDiameter = 15;

      pads.push({
        id: `pad_${comp.id}`,
        componentId: comp.id,
        pos: comp.pos,
        x: comp.pos[0],
        y: comp.pos[1],
        width: padDiameter,
        diameter: padDiameter,
        height: compHeight - contactHeight + 1, // Boss extends past contact
        material: 'plastic',
      });
    });

    set((state) => ({
      enclosure: { ...state.enclosure, pressurePads: pads },
    }));
  },

  updatePressurePad: (id, updates) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        pressurePads: state.enclosure.pressurePads.map((pad) =>
          pad.id === id ? { ...pad, ...updates } : pad
        ),
      },
    })),

  removePressurePad: (id) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        pressurePads: state.enclosure.pressurePads.filter((pad) => pad.id !== id),
      },
    })),

  // Magnets - auto-detect and assign alternating polarity
  generateMagnetPlacements: (components) => {
    const magnets: MagnetPlacement[] = [];
    let polarityToggle = true;

    components.forEach((comp) => {
      if (comp.type.startsWith('magnet_')) {
        // Parse magnet dimensions from type (e.g., magnet_10x3 = 10mm dia x 3mm thick)
        const match = comp.type.match(/magnet_(\d+)x(\d+)/);
        const diameter = match ? parseInt(match[1], 10) : 10;
        const thickness = match ? parseInt(match[2], 10) : 3;

        magnets.push({
          id: `mag_${comp.id}`,
          componentId: comp.id,
          polarity: polarityToggle ? 'N' : 'S',
          x: comp.pos[0],
          y: comp.pos[1],
          diameter,
          thickness,
        });
        polarityToggle = !polarityToggle;
      }
    });

    set((state) => ({
      enclosure: { ...state.enclosure, magnetPlacements: magnets },
    }));
  },

  toggleMagnetPolarity: (id) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        magnetPlacements: state.enclosure.magnetPlacements.map((mag) =>
          mag.id === id ? { ...mag, polarity: mag.polarity === 'N' ? 'S' : 'N' } : mag
        ),
      },
    })),

  setMagnetPolarity: (id, polarity) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        magnetPlacements: state.enclosure.magnetPlacements.map((mag) =>
          mag.id === id ? { ...mag, polarity } : mag
        ),
      },
    })),

  // Connector cutouts - auto-detect connectors
  generateConnectorCutouts: (components) => {
    const cutouts: ConnectorCutout[] = [];

    components.forEach((comp) => {
      let cutoutType: ConnectorCutout['type'] | null = null;
      let width = 10;
      let height = 8;

      if (comp.type.includes('usb')) {
        cutoutType = 'usb';
        width = comp.type.includes('usb_c') ? 10 : 12;
        height = comp.type.includes('usb_c') ? 4 : 6;
      } else if (comp.type.includes('barrel')) {
        cutoutType = 'barrel';
        width = 12;
        height = 12;
      } else if (comp.type.includes('jack_35') || comp.type.includes('jack_trs')) {
        cutoutType = 'jack_35mm';
        width = 8;
        height = 8;
      } else if (comp.type.includes('jack_635')) {
        cutoutType = 'jack_635mm';
        width = 12;
        height = 12;
      }

      if (cutoutType) {
        cutouts.push({
          id: `cutout_${comp.id}`,
          componentId: comp.id,
          type: cutoutType,
          wall: 'front', // Default - user can change
          x: comp.pos[0],
          y: comp.pos[1],
          z: 0, // At board level
          width,
          height,
        });
      }
    });

    set((state) => ({
      enclosure: { ...state.enclosure, connectorCutouts: cutouts },
    }));
  },

  updateConnectorCutout: (id, updates) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        connectorCutouts: state.enclosure.connectorCutouts.map((cutout) =>
          cutout.id === id ? { ...cutout, ...updates } : cutout
        ),
      },
    })),

  // Screw bosses - auto-generate at corners
  generateScrewBosses: (boundary) => {
    if (boundary.length === 0) return;

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

    const inset = 8; // Inset from corners
    const bosses: ScrewBoss[] = [
      {
        id: 'boss_tl',
        x: minX + inset,
        y: minY + inset,
        outerDiameter: 8,
        innerDiameter: 3,
        height: 6,
        insertType: 'heat-set',
      },
      {
        id: 'boss_tr',
        x: maxX - inset,
        y: minY + inset,
        outerDiameter: 8,
        innerDiameter: 3,
        height: 6,
        insertType: 'heat-set',
      },
      {
        id: 'boss_bl',
        x: minX + inset,
        y: maxY - inset,
        outerDiameter: 8,
        innerDiameter: 3,
        height: 6,
        insertType: 'heat-set',
      },
      {
        id: 'boss_br',
        x: maxX - inset,
        y: maxY - inset,
        outerDiameter: 8,
        innerDiameter: 3,
        height: 6,
        insertType: 'heat-set',
      },
    ];

    set((state) => ({
      enclosure: { ...state.enclosure, screwBosses: bosses },
    }));
  },

  addScrewBoss: (x, y) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        screwBosses: [
          ...state.enclosure.screwBosses,
          {
            id: `boss_${Date.now()}`,
            x,
            y,
            outerDiameter: 8,
            innerDiameter: 3,
            height: 6,
            insertType: 'heat-set',
          },
        ],
      },
    })),

  updateScrewBoss: (id, updates) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        screwBosses: state.enclosure.screwBosses.map((boss) =>
          boss.id === id ? { ...boss, ...updates } : boss
        ),
      },
    })),

  removeScrewBoss: (id) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        screwBosses: state.enclosure.screwBosses.filter((boss) => boss.id !== id),
      },
    })),

  setShowScrewBosses: (show) =>
    set((state) => ({
      enclosure: { ...state.enclosure, showScrewBosses: show },
    })),

  // Feet - auto-generate at corners
  generateFeet: (boundary) => {
    if (boundary.length === 0) return;

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

    const inset = 6;
    const feet: EnclosureFoot[] = [
      {
        id: 'foot_tl',
        x: minX + inset,
        y: minY + inset,
        diameter: 8,
        height: 3,
        style: 'rubber-pad',
      },
      {
        id: 'foot_tr',
        x: maxX - inset,
        y: minY + inset,
        diameter: 8,
        height: 3,
        style: 'rubber-pad',
      },
      {
        id: 'foot_bl',
        x: minX + inset,
        y: maxY - inset,
        diameter: 8,
        height: 3,
        style: 'rubber-pad',
      },
      {
        id: 'foot_br',
        x: maxX - inset,
        y: maxY - inset,
        diameter: 8,
        height: 3,
        style: 'rubber-pad',
      },
    ];

    set((state) => ({
      enclosure: { ...state.enclosure, feet },
    }));
  },

  addFoot: (x, y) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        feet: [
          ...state.enclosure.feet,
          {
            id: `foot_${Date.now()}`,
            x,
            y,
            diameter: 8,
            height: 3,
            style: 'rubber-pad',
          },
        ],
      },
    })),

  updateFoot: (id, updates) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        feet: state.enclosure.feet.map((foot) => (foot.id === id ? { ...foot, ...updates } : foot)),
      },
    })),

  removeFoot: (id) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        feet: state.enclosure.feet.filter((foot) => foot.id !== id),
      },
    })),

  setShowFeet: (show) =>
    set((state) => ({
      enclosure: { ...state.enclosure, showFeet: show },
    })),

  // Label areas
  addLabelArea: (x, y, width, height) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        labelAreas: [
          ...state.enclosure.labelAreas,
          {
            id: `label_${Date.now()}`,
            x,
            y,
            width,
            height,
            depth: 0.5,
          },
        ],
      },
    })),

  updateLabelArea: (id, updates) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        labelAreas: state.enclosure.labelAreas.map((area) =>
          area.id === id ? { ...area, ...updates } : area
        ),
      },
    })),

  removeLabelArea: (id) =>
    set((state) => ({
      enclosure: {
        ...state.enclosure,
        labelAreas: state.enclosure.labelAreas.filter((area) => area.id !== id),
      },
    })),

  setShowLid: (showLid) => set({ showLid }),

  // Calculate optimal lid height based on tallest component
  calculateLidHeight: (components, _boardThickness) => {
    if (components.length === 0) return 15; // Default

    const { clearance, wallThickness } = get().enclosure;

    let maxHeight = 0;
    components.forEach((comp) => {
      if (!comp.type.startsWith('magnet_')) {
        const h = getComponentHeight(comp.type);
        if (h > maxHeight) maxHeight = h;
      }
    });

    // Lid height = tallest component + clearance + wall thickness (for top)
    return Math.ceil(maxHeight + clearance + wallThickness);
  },

  resetEnclosure: () =>
    set({
      enclosure: createDefaultEnclosure(),
      showLid: true,
    }),
}));

/** Helper to get board bounds from boundary. */
export const getBoardBounds = (
  boundary: Vec2[]
): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number } => {
  if (boundary.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 60, width: 100, height: 60 };
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
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
