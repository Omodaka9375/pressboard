import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LayerVisibility = {
  topCopper: boolean;
  bottomCopper: boolean;
  substrate: boolean;
  drillHoles: boolean;
  components: boolean;
  annotations: boolean;
  grid: boolean;
};

type LayerOpacity = {
  topCopper: number;
  bottomCopper: number;
  substrate: number;
  components: number;
};

type PrintabilitySettings = {
  nozzleWidth: number;
  layerHeight: number;
  bedWidth: number;
  bedDepth: number;
};

type ViewSettingsState = {
  // Layer visibility
  visibility: LayerVisibility;
  opacity: LayerOpacity;

  // Printability settings
  printability: PrintabilitySettings;

  // View options
  showPrintabilityMeter: boolean;
  showDRCMarkers: boolean;
  showComponentLabels: boolean;
  showComponentPinout: boolean;

  // Actions
  setLayerVisibility: (layer: keyof LayerVisibility, visible: boolean) => void;
  setLayerOpacity: (layer: keyof LayerOpacity, opacity: number) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  setPrintabilitySetting: (key: keyof PrintabilitySettings, value: number) => void;
  setShowPrintabilityMeter: (show: boolean) => void;
  setShowDRCMarkers: (show: boolean) => void;
  setShowComponentLabels: (show: boolean) => void;
  setShowComponentPinout: (show: boolean) => void;
  resetToDefaults: () => void;
};

const defaultVisibility: LayerVisibility = {
  topCopper: true,
  bottomCopper: true,
  substrate: true,
  drillHoles: true,
  components: true,
  annotations: true,
  grid: true,
};

const defaultOpacity: LayerOpacity = {
  topCopper: 1.0,
  bottomCopper: 1.0,
  substrate: 1.0,
  components: 1.0,
};

// Default settings optimized for Creality K1C
const defaultPrintability: PrintabilitySettings = {
  nozzleWidth: 0.4, // K1C standard nozzle
  layerHeight: 0.2, // Good balance of speed/quality
  bedWidth: 220, // K1C build volume
  bedDepth: 220, // K1C build volume
};

export const useViewSettingsStore = create<ViewSettingsState>()(
  persist(
    (set) => ({
      visibility: { ...defaultVisibility },
      opacity: { ...defaultOpacity },
      printability: { ...defaultPrintability },
      showPrintabilityMeter: true,
      showDRCMarkers: true,
      showComponentLabels: true,
      showComponentPinout: true,

      setLayerVisibility: (layer, visible) =>
        set((state) => ({
          visibility: { ...state.visibility, [layer]: visible },
        })),

      setLayerOpacity: (layer, opacity) =>
        set((state) => ({
          opacity: { ...state.opacity, [layer]: Math.max(0, Math.min(1, opacity)) },
        })),

      toggleLayer: (layer) =>
        set((state) => ({
          visibility: { ...state.visibility, [layer]: !state.visibility[layer] },
        })),

      setPrintabilitySetting: (key, value) =>
        set((state) => ({
          printability: { ...state.printability, [key]: value },
        })),

      setShowPrintabilityMeter: (show) => set({ showPrintabilityMeter: show }),
      setShowDRCMarkers: (show) => set({ showDRCMarkers: show }),
      setShowComponentLabels: (show) => set({ showComponentLabels: show }),
      setShowComponentPinout: (show) => set({ showComponentPinout: show }),

      resetToDefaults: () =>
        set({
          visibility: { ...defaultVisibility },
          opacity: { ...defaultOpacity },
          printability: { ...defaultPrintability },
          showPrintabilityMeter: true,
          showDRCMarkers: true,
          showComponentLabels: true,
          showComponentPinout: true,
        }),
    }),
    {
      name: 'pressboard-view-settings',
    }
  )
);
