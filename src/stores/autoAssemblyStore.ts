import { create } from 'zustand';
import type {
  AssemblyComponent,
  ConnectionDef,
  ArrangementOption,
  AutoAssemblyStep,
  Board,
  PlacementZone,
  EdgePreference,
  PlacementConstraint,
} from '../types';
import { autoDetectConnections as detectConnections } from '../lib/assembly/connectionDetector';

type DetectionStats = {
  powerConnections: number;
  groundConnections: number;
  signalConnections: number;
  unknownComponents: string[];
};

type AutoAssemblyState = {
  // Wizard state
  isOpen: boolean;
  step: AutoAssemblyStep;

  // Step 1: Component selection
  selectedComponents: AssemblyComponent[];

  // Step 2: Connections
  connections: ConnectionDef[];
  lastDetectionStats: DetectionStats | null;

  // Step 3: Arrangements
  arrangements: ArrangementOption[];
  selectedArrangementId: string | null;
  isGenerating: boolean;

  // Options
  generateEnclosure: boolean;
  optimizeOrientation: boolean;

  // Actions
  openWizard: () => void;
  closeWizard: () => void;
  reset: () => void;
  setStep: (step: AutoAssemblyStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Component actions
  addComponent: (type: string) => void;
  removeComponent: (id: string) => void;
  updateComponentQuantity: (id: string, quantity: number) => void;
  clearComponents: () => void;

  // Constraint actions
  setComponentZone: (id: string, zone: PlacementZone | undefined) => void;
  setComponentEdge: (id: string, edge: EdgePreference | undefined) => void;
  lockComponent: (id: string, locked: boolean) => void;
  setKeepTogether: (ids: string[]) => void;

  // Connection actions
  addConnection: (
    fromComp: number,
    fromPad: number,
    toComp: number,
    toPad: number,
    isPower?: boolean
  ) => void;
  removeConnection: (id: string) => void;
  updateConnectionNetName: (id: string, netName: string) => void;
  clearConnections: () => void;
  autoDetectConnections: () => void;
  clearAutoDetectedConnections: () => void;

  // Arrangement actions
  setArrangements: (arrangements: ArrangementOption[]) => void;
  selectArrangement: (id: string) => void;
  setIsGenerating: (generating: boolean) => void;

  // Options
  setGenerateEnclosure: (generate: boolean) => void;
  setOptimizeOrientation: (optimize: boolean) => void;

  // Getters
  getSelectedArrangement: () => ArrangementOption | null;
  getConstraints: () => PlacementConstraint[];
};

const STEP_ORDER: AutoAssemblyStep[] = ['select', 'connect', 'arrange', 'preview'];

export const useAutoAssemblyStore = create<AutoAssemblyState>((set, get) => ({
  isOpen: false,
  step: 'select',
  selectedComponents: [],
  connections: [],
  lastDetectionStats: null,
  arrangements: [],
  selectedArrangementId: null,
  isGenerating: false,
  generateEnclosure: true,
  optimizeOrientation: true,

  openWizard: () => set({ isOpen: true, step: 'select' }),

  closeWizard: () => set({ isOpen: false }),

  reset: () =>
    set({
      step: 'select',
      selectedComponents: [],
      connections: [],
      lastDetectionStats: null,
      arrangements: [],
      selectedArrangementId: null,
      isGenerating: false,
      generateEnclosure: true,
      optimizeOrientation: true,
    }),

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) {
      set({ step: STEP_ORDER[currentIndex + 1] });
    }
  },

  prevStep: () => {
    const { step } = get();
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) {
      set({ step: STEP_ORDER[currentIndex - 1] });
    }
  },

  addComponent: (type) => {
    const { selectedComponents } = get();
    const existing = selectedComponents.find((c) => c.type === type);

    if (existing) {
      // Increment quantity
      set({
        selectedComponents: selectedComponents.map((c) =>
          c.type === type ? { ...c, quantity: c.quantity + 1 } : c
        ),
      });
    } else {
      // Add new
      set({
        selectedComponents: [
          ...selectedComponents,
          {
            id: `ac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            type,
            quantity: 1,
          },
        ],
      });
    }
  },

  removeComponent: (id) => {
    set((state) => ({
      selectedComponents: state.selectedComponents.filter((c) => c.id !== id),
      // Also remove any connections involving this component
      connections: state.connections.filter((conn) => {
        const compIndex = state.selectedComponents.findIndex((c) => c.id === id);
        return conn.from.componentIndex !== compIndex && conn.to.componentIndex !== compIndex;
      }),
    }));
  },

  updateComponentQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeComponent(id);
      return;
    }
    set((state) => ({
      selectedComponents: state.selectedComponents.map((c) =>
        c.id === id ? { ...c, quantity } : c
      ),
    }));
  },

  clearComponents: () => set({ selectedComponents: [], connections: [], lastDetectionStats: null }),

  // Constraint actions
  setComponentZone: (id, zone) => {
    set((state) => ({
      selectedComponents: state.selectedComponents.map((c) =>
        c.id === id ? { ...c, constraint: { ...c.constraint, componentId: id, zone } } : c
      ),
    }));
  },

  setComponentEdge: (id, edge) => {
    set((state) => ({
      selectedComponents: state.selectedComponents.map((c) =>
        c.id === id ? { ...c, constraint: { ...c.constraint, componentId: id, edge } } : c
      ),
    }));
  },

  lockComponent: (id, locked) => {
    set((state) => ({
      selectedComponents: state.selectedComponents.map((c) =>
        c.id === id ? { ...c, constraint: { ...c.constraint, componentId: id, locked } } : c
      ),
    }));
  },

  setKeepTogether: (ids) => {
    if (ids.length < 2) return;
    set((state) => ({
      selectedComponents: state.selectedComponents.map((c) =>
        ids.includes(c.id)
          ? { ...c, constraint: { ...c.constraint, componentId: c.id, keepTogether: ids } }
          : c
      ),
    }));
  },

  // Connection actions
  addConnection: (fromComp, fromPad, toComp, toPad, isPower = false) => {
    const { connections } = get();

    // Check for duplicate
    const exists = connections.some(
      (c) =>
        (c.from.componentIndex === fromComp &&
          c.from.padIndex === fromPad &&
          c.to.componentIndex === toComp &&
          c.to.padIndex === toPad) ||
        (c.from.componentIndex === toComp &&
          c.from.padIndex === toPad &&
          c.to.componentIndex === fromComp &&
          c.to.padIndex === fromPad)
    );

    if (exists) return;

    set({
      connections: [
        ...connections,
        {
          id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          from: { componentIndex: fromComp, padIndex: fromPad },
          to: { componentIndex: toComp, padIndex: toPad },
          isPower,
        },
      ],
    });
  },

  removeConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    }));
  },

  updateConnectionNetName: (id, netName) => {
    set((state) => ({
      connections: state.connections.map((c) => (c.id === id ? { ...c, netName } : c)),
    }));
  },

  clearConnections: () => set({ connections: [], lastDetectionStats: null }),

  autoDetectConnections: () => {
    const { selectedComponents, connections } = get();
    const result = detectConnections(selectedComponents, connections);

    set({
      connections: [...connections, ...result.connections],
      lastDetectionStats: result.stats,
    });
  },

  clearAutoDetectedConnections: () => {
    set((state) => ({
      connections: state.connections.filter((c) => !c.autoDetected),
      lastDetectionStats: null,
    }));
  },

  setArrangements: (arrangements) => {
    set({
      arrangements,
      selectedArrangementId: arrangements.length > 0 ? arrangements[0].id : null,
    });
  },

  selectArrangement: (id) => set({ selectedArrangementId: id }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setGenerateEnclosure: (generateEnclosure) => set({ generateEnclosure }),

  setOptimizeOrientation: (optimizeOrientation) => set({ optimizeOrientation }),

  getSelectedArrangement: () => {
    const { arrangements, selectedArrangementId } = get();
    return arrangements.find((a) => a.id === selectedArrangementId) || null;
  },

  getConstraints: () => {
    const { selectedComponents } = get();
    return selectedComponents
      .filter((c) => c.constraint)
      .map((c) => c.constraint as PlacementConstraint);
  },
}));

/** Get total component count (sum of all quantities). */
export const getTotalComponentCount = (components: AssemblyComponent[]): number => {
  return components.reduce((sum, c) => sum + c.quantity, 0);
};

/** Expand assembly components to individual component instances. */
export const expandComponents = (
  assemblyComponents: AssemblyComponent[],
  _board: Board
): { type: string; instanceIndex: number }[] => {
  const expanded: { type: string; instanceIndex: number }[] = [];

  assemblyComponents.forEach((ac) => {
    for (let i = 0; i < ac.quantity; i++) {
      expanded.push({ type: ac.type, instanceIndex: i });
    }
  });

  return expanded;
};
