import { useViewSettingsStore } from '../stores/viewSettingsStore';

type LayerRowProps = {
  name: string;
  layerKey: string;
  visible: boolean;
  opacity?: number;
  color: string;
  onToggle: () => void;
  onOpacityChange?: (value: number) => void;
};

const LayerRow = ({ name, visible, opacity, color, onToggle, onOpacityChange }: LayerRowProps) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 0',
      borderBottom: '1px solid var(--border-color)',
    }}
  >
    <input type="checkbox" checked={visible} onChange={onToggle} style={{ cursor: 'pointer' }} />
    <span
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '2px',
        background: color,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        flex: 1,
        fontSize: '11px',
        color: visible ? 'var(--text-primary)' : 'var(--text-secondary)',
        opacity: visible ? 1 : 0.6,
      }}
    >
      {name}
    </span>
    {onOpacityChange && (
      <input
        type="range"
        min="0"
        max="100"
        value={(opacity ?? 1) * 100}
        onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
        disabled={!visible}
        style={{ width: '50px', cursor: 'pointer' }}
        title={`Opacity: ${Math.round((opacity ?? 1) * 100)}%`}
      />
    )}
  </div>
);

const LayerManager = () => {
  const {
    visibility,
    opacity,
    setLayerOpacity,
    toggleLayer,
    showComponentLabels,
    setShowComponentLabels,
    showComponentPinout,
    setShowComponentPinout,
    showDRCMarkers,
    setShowDRCMarkers,
  } = useViewSettingsStore();

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <h4
        style={{
          margin: '0 0 10px 0',
          fontSize: '13px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>🗂️</span> Layers
      </h4>

      <LayerRow
        name="Top Traces"
        layerKey="topCopper"
        visible={visibility.topCopper}
        opacity={opacity.topCopper}
        color="#B87333"
        onToggle={() => toggleLayer('topCopper')}
        onOpacityChange={(v) => setLayerOpacity('topCopper', v)}
      />

      <LayerRow
        name="Bottom Traces"
        layerKey="bottomCopper"
        visible={visibility.bottomCopper}
        opacity={opacity.bottomCopper}
        color="#CD853F"
        onToggle={() => toggleLayer('bottomCopper')}
        onOpacityChange={(v) => setLayerOpacity('bottomCopper', v)}
      />

      <LayerRow
        name="Board"
        layerKey="substrate"
        visible={visibility.substrate}
        opacity={opacity.substrate}
        color="#228B22"
        onToggle={() => toggleLayer('substrate')}
        onOpacityChange={(v) => setLayerOpacity('substrate', v)}
      />

      <LayerRow
        name="Drill Holes"
        layerKey="drillHoles"
        visible={visibility.drillHoles}
        color="#333333"
        onToggle={() => toggleLayer('drillHoles')}
      />

      <LayerRow
        name="Components"
        layerKey="components"
        visible={visibility.components}
        opacity={opacity.components}
        color="#4a90d9"
        onToggle={() => toggleLayer('components')}
        onOpacityChange={(v) => setLayerOpacity('components', v)}
      />

      <LayerRow
        name="Grid"
        layerKey="grid"
        visible={visibility.grid}
        color="#cccccc"
        onToggle={() => toggleLayer('grid')}
      />

      <div
        style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Display Options
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            marginBottom: '4px',
          }}
        >
          <input
            type="checkbox"
            checked={showComponentLabels}
            onChange={(e) => setShowComponentLabels(e.target.checked)}
          />
          Component Labels
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            marginBottom: '4px',
          }}
        >
          <input
            type="checkbox"
            checked={showComponentPinout}
            onChange={(e) => setShowComponentPinout(e.target.checked)}
          />
          Pin Names
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={showDRCMarkers}
            onChange={(e) => setShowDRCMarkers(e.target.checked)}
          />
          DRC Markers on Canvas
        </label>
      </div>

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--text-primary);
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="range"]:disabled {
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default LayerManager;
