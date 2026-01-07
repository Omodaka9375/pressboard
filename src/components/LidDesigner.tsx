import { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useEnclosureStore } from '../stores/enclosureStore';
import { getComponentHeight } from '../data/footprints';
import type { VentPattern } from '../types';

/** Lid Designer panel for configuring enclosure and pressure pads. */
const LidDesigner = () => {
  const { project } = useProjectStore();
  const {
    enclosure,
    showLid,
    setEnabled,
    setWallThickness,
    setLidHeight,
    setCornerRadius,
    setClearance,
    setVentilationEnabled,
    setVentPattern,
    setVentPosition,
    generatePressurePads,
    generateMagnetPlacements,
    generateConnectorCutouts,
    toggleMagnetPolarity,
    setShowLid,
    calculateLidHeight,
  } = useEnclosureStore();

  // Auto-generate features when enclosure is enabled
  useEffect(() => {
    if (enclosure.enabled && project.components.length > 0) {
      generatePressurePads(project.components);
      generateMagnetPlacements(project.components);
      generateConnectorCutouts(project.components);

      // Auto-calculate lid height
      const autoHeight = calculateLidHeight(project.components, project.board.thickness);
      setLidHeight(autoHeight);
    }
  }, [enclosure.enabled, project.components.length]);

  const magnetComponents = project.components.filter((c) => c.type.startsWith('magnet_'));
  const nonMagnetComponents = project.components.filter((c) => !c.type.startsWith('magnet_'));

  return (
    <div className="lid-designer">
      <h4>
        🏠 Enclosure / Lid
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={enclosure.enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span className="toggle-text">{enclosure.enabled ? 'On' : 'Off'}</span>
        </label>
      </h4>

      {enclosure.enabled && (
        <>
          {/* Show Lid Toggle */}
          <div className="control-row">
            <label>
              <input
                type="checkbox"
                checked={showLid}
                onChange={(e) => setShowLid(e.target.checked)}
              />
              Show lid in 3D preview
            </label>
          </div>

          {/* Dimensions */}
          <div className="section">
            <h5>📐 Dimensions</h5>

            <div className="control-row">
              <label>Wall Thickness</label>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={enclosure.wallThickness}
                onChange={(e) => setWallThickness(Number(e.target.value))}
              />
              <span className="value">{enclosure.wallThickness}mm</span>
            </div>

            <div className="control-row">
              <label>Lid Height</label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={enclosure.lidHeight}
                onChange={(e) => setLidHeight(Number(e.target.value))}
              />
              <span className="value">{enclosure.lidHeight}mm</span>
            </div>

            <div className="control-row">
              <label>Corner Radius</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={enclosure.cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
              />
              <span className="value">{enclosure.cornerRadius}mm</span>
            </div>

            <div className="control-row">
              <label>Component Clearance</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={enclosure.clearance}
                onChange={(e) => setClearance(Number(e.target.value))}
              />
              <span className="value">{enclosure.clearance}mm</span>
            </div>

            <button
              className="auto-btn"
              onClick={() => {
                const h = calculateLidHeight(project.components, project.board.thickness);
                setLidHeight(h);
              }}
            >
              🔄 Auto-Calculate Height
            </button>
          </div>

          {/* Ventilation */}
          <div className="section">
            <h5>
              💨 Ventilation
              <label className="toggle-label small">
                <input
                  type="checkbox"
                  checked={enclosure.ventilation.enabled}
                  onChange={(e) => setVentilationEnabled(e.target.checked)}
                />
              </label>
            </h5>

            {enclosure.ventilation.enabled && (
              <>
                <div className="control-row">
                  <label>Pattern</label>
                  <select
                    value={enclosure.ventilation.pattern}
                    onChange={(e) => setVentPattern(e.target.value as VentPattern)}
                  >
                    <option value="slots">Slots</option>
                    <option value="honeycomb">Honeycomb</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
                <div className="control-row">
                  <label>Position</label>
                  <select
                    value={enclosure.ventilation.position}
                    onChange={(e) => setVentPosition(e.target.value as 'top' | 'sides' | 'both')}
                  >
                    <option value="top">Top only</option>
                    <option value="sides">Sides only</option>
                    <option value="both">Top & Sides</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Magnets */}
          {magnetComponents.length > 0 && (
            <div className="section">
              <h5>🧲 Magnets ({magnetComponents.length})</h5>
              <p className="hint">Click to toggle polarity. Lid uses opposite polarity.</p>
              <div className="magnet-list">
                {enclosure.magnetPlacements.map((mag) => {
                  const comp = project.components.find((c) => c.id === mag.componentId);
                  return (
                    <div
                      key={mag.id}
                      className={`magnet-item polarity-${mag.polarity}`}
                      onClick={() => toggleMagnetPolarity(mag.id)}
                    >
                      <span className="polarity-badge">{mag.polarity}</span>
                      <span className="name">{comp?.type.replace('magnet_', '') || 'Magnet'}</span>
                      <span className="pos">
                        ({Math.round(comp?.pos[0] || 0)}, {Math.round(comp?.pos[1] || 0)})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pressure Pads */}
          <div className="section">
            <h5>⬇️ Pressure Pads ({enclosure.pressurePads.length})</h5>
            {enclosure.pressurePads.length === 0 ? (
              <p className="hint">Add components to generate pressure pads.</p>
            ) : (
              <div className="pad-list">
                {enclosure.pressurePads.slice(0, 8).map((pad) => {
                  const comp = project.components.find((c) => c.id === pad.componentId);
                  const height = comp ? getComponentHeight(comp.type) : 0;
                  return (
                    <div key={pad.id} className="pad-item">
                      <span className="name">{comp?.type || 'Unknown'}</span>
                      <span className="height">{height}mm</span>
                    </div>
                  );
                })}
                {enclosure.pressurePads.length > 8 && (
                  <p className="more">+{enclosure.pressurePads.length - 8} more...</p>
                )}
              </div>
            )}
            <button
              className="auto-btn"
              onClick={() => generatePressurePads(project.components)}
              disabled={nonMagnetComponents.length === 0}
            >
              🔄 Regenerate Pads
            </button>
          </div>

          {/* Connector Cutouts */}
          {enclosure.connectorCutouts.length > 0 && (
            <div className="section">
              <h5>🔌 Connector Cutouts ({enclosure.connectorCutouts.length})</h5>
              <div className="cutout-list">
                {enclosure.connectorCutouts.map((cutout) => {
                  return (
                    <div key={cutout.id} className="cutout-item">
                      <span className="type">{cutout.type.toUpperCase()}</span>
                      <span className="size">
                        {cutout.width}×{cutout.height}mm
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .lid-designer {
          padding: 12px;
          font-size: 12px;
        }

        .lid-designer h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-primary);
        }

        .lid-designer h5 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: normal;
          cursor: pointer;
        }

        .toggle-label.small {
          margin-left: auto;
        }

        .toggle-text {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .section {
          margin-bottom: 16px;
          padding: 10px;
          background: var(--bg-sidebar);
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-row label {
          flex: 1;
          color: var(--text-secondary);
        }

        .control-row input[type="range"] {
          flex: 2;
        }

        .control-row select {
          flex: 2;
          padding: 4px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--btn-bg);
          color: var(--text-primary);
          font-size: 11px;
        }

        .control-row .value {
          min-width: 40px;
          text-align: right;
          font-family: monospace;
          font-size: 11px;
          color: var(--text-primary);
        }

        .hint {
          color: var(--text-secondary);
          font-size: 10px;
          margin: 0 0 8px 0;
          font-style: italic;
        }

        .auto-btn {
          width: 100%;
          padding: 6px;
          margin-top: 8px;
          border: 1px solid var(--border-color);
          background: var(--btn-bg);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }

        .auto-btn:hover:not(:disabled) {
          background: var(--btn-hover);
        }

        .auto-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .magnet-list, .pad-list, .cutout-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .magnet-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid var(--border-color);
        }

        .magnet-item:hover {
          background: var(--btn-hover);
        }

        .magnet-item.polarity-N {
          border-left: 3px solid #e53935;
        }

        .magnet-item.polarity-S {
          border-left: 3px solid #1e88e5;
        }

        .polarity-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          color: white;
        }

        .polarity-N .polarity-badge {
          background: #e53935;
        }

        .polarity-S .polarity-badge {
          background: #1e88e5;
        }

        .magnet-item .name {
          flex: 1;
          font-size: 11px;
        }

        .magnet-item .pos {
          font-size: 10px;
          color: var(--text-secondary);
          font-family: monospace;
        }

        .pad-item, .cutout-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          font-size: 11px;
        }

        .pad-item .height, .cutout-item .size {
          color: var(--text-secondary);
          font-family: monospace;
        }

        .cutout-item .type {
          font-weight: 500;
        }

        .more {
          color: var(--text-secondary);
          font-size: 10px;
          text-align: center;
          margin: 4px 0 0 0;
        }
      `}</style>
    </div>
  );
};

export default LidDesigner;
