import { useState } from 'react';
import { useAutoAssemblyStore, getTotalComponentCount } from '../stores/autoAssemblyStore';
import { useProjectStore } from '../stores/projectStore';
import { getAllFootprints, getFootprint } from '../data/footprints';
import { getComponentIcon } from '../data/componentIcons';
import { generatePlacements } from '../lib/assembly/placementEngine';
import { routeArrangement } from '../lib/assembly/autoRouter';
import { getPadLabel, inferComponentRole } from '../lib/assembly/connectionDetector';
import type { ArrangementOption, AssemblyComponent, PlacementZone, EdgePreference } from '../types';
import './AutoAssemblyWizard.css';

const STEP_LABELS = ['Select', 'Connect', 'Arrange', 'Preview'];

/** Auto-Assembly Wizard for intelligent component placement. */
const AutoAssemblyWizard = () => {
  const {
    isOpen,
    step,
    selectedComponents,
    connections,
    lastDetectionStats,
    arrangements,
    selectedArrangementId,
    isGenerating,
    generateEnclosure,
    optimizeOrientation,
    closeWizard,
    reset,
    setStep,
    nextStep,
    prevStep,
    addComponent,
    removeComponent,
    updateComponentQuantity,
    setComponentZone,
    setComponentEdge,
    addConnection,
    removeConnection,
    updateConnectionNetName,
    autoDetectConnections,
    clearAutoDetectedConnections,
    setArrangements,
    selectArrangement,
    setIsGenerating,
    setGenerateEnclosure,
    setOptimizeOrientation,
    getSelectedArrangement,
  } = useAutoAssemblyStore();

  const { project, loadProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Connection builder state
  const [connFrom, setConnFrom] = useState<{ compIdx: number; padIdx: number } | null>(null);

  if (!isOpen) return null;

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedComponents.length > 0;
      case 'connect':
        return true; // Connections optional
      case 'arrange':
        return selectedArrangementId !== null;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate placement options with constraints and orientation optimization
    const options = generatePlacements(selectedComponents, project.board, connections, {
      constraints: selectedComponents.filter((c) => c.constraint).map((c) => c.constraint!),
      optimizeOrientation,
    });

    // Route each arrangement
    const routedOptions = options.map((opt) => routeArrangement(opt, connections, project.board));

    setArrangements(routedOptions);
    setIsGenerating(false);
    nextStep();
  };

  const handleApply = () => {
    const selected = getSelectedArrangement();
    if (!selected) return;

    // Apply to project
    loadProject({
      ...project,
      components: [...project.components, ...selected.components],
      routes: [...project.routes, ...selected.routes],
    });

    reset();
    closeWizard();
  };

  return (
    <div className="wizard-overlay" onClick={closeWizard}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <h2>🔧 Auto-Assembly Wizard</h2>
          <button
            className="wizard-close"
            onClick={closeWizard}
            title="Close wizard without applying changes"
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <div className="wizard-steps">
          {STEP_LABELS.map((label, i) => {
            const stepKey = ['select', 'connect', 'arrange', 'preview'][i];
            const isActive = step === stepKey;
            const isPast =
              ['select', 'connect', 'arrange', 'preview'].indexOf(step) >
              ['select', 'connect', 'arrange', 'preview'].indexOf(stepKey);
            return (
              <div
                key={label}
                className={`wizard-step ${isActive ? 'active' : ''} ${isPast ? 'completed' : ''}`}
                onClick={() => isPast && setStep(stepKey as typeof step)}
              >
                <div className="step-number">{isPast ? '✓' : i + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="wizard-content">
          {step === 'select' && (
            <SelectStep
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedComponents={selectedComponents}
              addComponent={addComponent}
              removeComponent={removeComponent}
              updateComponentQuantity={updateComponentQuantity}
              setComponentZone={setComponentZone}
              setComponentEdge={setComponentEdge}
            />
          )}

          {step === 'connect' && (
            <ConnectStep
              selectedComponents={selectedComponents}
              connections={connections}
              connFrom={connFrom}
              setConnFrom={setConnFrom}
              addConnection={addConnection}
              removeConnection={removeConnection}
              updateConnectionNetName={updateConnectionNetName}
              autoDetectConnections={autoDetectConnections}
              clearAutoDetectedConnections={clearAutoDetectedConnections}
              lastDetectionStats={lastDetectionStats}
            />
          )}

          {step === 'arrange' && (
            <ArrangeStep
              arrangements={arrangements}
              selectedArrangementId={selectedArrangementId}
              selectArrangement={selectArrangement}
              isGenerating={isGenerating}
              generateEnclosure={generateEnclosure}
              setGenerateEnclosure={setGenerateEnclosure}
              optimizeOrientation={optimizeOrientation}
              setOptimizeOrientation={setOptimizeOrientation}
            />
          )}

          {step === 'preview' && <PreviewStep arrangement={getSelectedArrangement()} />}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <div className="wizard-info">
            {step === 'select' && (
              <span>
                {getTotalComponentCount(selectedComponents)} component
                {getTotalComponentCount(selectedComponents) !== 1 ? 's' : ''} selected
              </span>
            )}
            {step === 'connect' && <span>{connections.length} connection(s) defined</span>}
            {step === 'arrange' && <span>{arrangements.length} arrangement(s) generated</span>}
          </div>
          <div className="wizard-actions">
            {step !== 'select' && (
              <button
                className="wizard-btn secondary"
                onClick={prevStep}
                title="Go back to the previous step"
              >
                ← Back
              </button>
            )}
            {step === 'connect' && (
              <button
                className="wizard-btn primary"
                onClick={handleGenerate}
                disabled={isGenerating}
                title="Create multiple layout options based on your components and connections"
              >
                {isGenerating ? 'Generating...' : 'Generate Layouts →'}
              </button>
            )}
            {step === 'arrange' && arrangements.length > 0 && (
              <button
                className="wizard-btn primary"
                onClick={nextStep}
                disabled={!canProceed()}
                title="See the final preview before applying"
              >
                Preview →
              </button>
            )}
            {step === 'preview' && (
              <button
                className="wizard-btn primary"
                onClick={handleApply}
                title="Add all components and routes to your board"
              >
                ✓ Apply to Board
              </button>
            )}
            {step === 'select' && (
              <button
                className="wizard-btn primary"
                onClick={nextStep}
                disabled={!canProceed()}
                title="Continue to define connections between components"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================
// STEP COMPONENTS
// =====================

type SelectStepProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedComponents: AssemblyComponent[];
  addComponent: (type: string) => void;
  removeComponent: (id: string) => void;
  updateComponentQuantity: (id: string, qty: number) => void;
  setComponentZone: (id: string, zone: PlacementZone | undefined) => void;
  setComponentEdge: (id: string, edge: EdgePreference | undefined) => void;
};

const ZONES: { value: PlacementZone | 'none'; label: string }[] = [
  { value: 'none', label: 'Auto' },
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const EDGES: { value: EdgePreference | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const SelectStep = ({
  searchQuery,
  setSearchQuery,
  selectedComponents,
  addComponent,
  removeComponent,
  updateComponentQuantity,
  setComponentZone,
  setComponentEdge,
}: SelectStepProps) => {
  const footprints = getAllFootprints();
  const filtered = searchQuery
    ? footprints.filter(
        (fp) =>
          fp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fp.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : footprints.slice(0, 50);

  return (
    <div className="step-content select-step">
      <div className="step-description">
        <h3>1. Select Components</h3>
        <p>Choose components to add to your board. Click to add, adjust quantities as needed.</p>
      </div>

      <div className="select-columns">
        {/* Available Components */}
        <div className="select-column">
          <h4>Available Components</h4>
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            title="Type to filter components by name (e.g., 'resistor', 'LED', 'arduino')"
          />
          <div className="component-list">
            {filtered.map((fp) => (
              <div
                key={fp.type}
                className="component-item"
                onClick={() => addComponent(fp.type)}
                title={`Click to add ${fp.name} to your board`}
              >
                <span className="comp-icon">{getComponentIcon(fp.type)}</span>
                <span className="comp-name">{fp.name}</span>
                <span className="comp-add">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Components */}
        <div className="select-column">
          <h4>Selected ({getTotalComponentCount(selectedComponents)})</h4>
          <div className="component-list selected-list">
            {selectedComponents.length === 0 ? (
              <p className="empty-hint">Click components on the left to add them</p>
            ) : (
              selectedComponents.map((ac) => {
                const fp = getFootprint(ac.type);
                const role = inferComponentRole(ac.type);
                const isConnector = role === 'connector' || role === 'power';
                return (
                  <div key={ac.id} className="component-item selected expanded">
                    <div className="comp-main-row">
                      <span className="comp-icon">{getComponentIcon(ac.type)}</span>
                      <span className="comp-name">{fp?.name || ac.type}</span>
                      <span className="comp-role-badge">{role}</span>
                      <div
                        className="qty-controls"
                        title="Change how many of this component to place"
                      >
                        <button
                          onClick={() => updateComponentQuantity(ac.id, ac.quantity - 1)}
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty">{ac.quantity}</span>
                        <button
                          onClick={() => updateComponentQuantity(ac.id, ac.quantity + 1)}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeComponent(ac.id)}
                        title="Remove this component from the selection"
                      >
                        ×
                      </button>
                    </div>
                    <div className="comp-constraints-row">
                      <label
                        className="constraint-label"
                        title="Preferred area on the board (Auto lets the wizard decide)"
                      >
                        Zone:
                        <select
                          value={ac.constraint?.zone || 'none'}
                          onChange={(e) =>
                            setComponentZone(
                              ac.id,
                              e.target.value === 'none'
                                ? undefined
                                : (e.target.value as PlacementZone)
                            )
                          }
                        >
                          {ZONES.map((z) => (
                            <option key={z.value} value={z.value}>
                              {z.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {isConnector && (
                        <label
                          className="constraint-label"
                          title="For connectors: which edge of the board should this face (for easy cable access)"
                        >
                          Edge:
                          <select
                            value={ac.constraint?.edge || 'none'}
                            onChange={(e) =>
                              setComponentEdge(
                                ac.id,
                                e.target.value === 'none'
                                  ? undefined
                                  : (e.target.value as EdgePreference)
                              )
                            }
                          >
                            {EDGES.map((ed) => (
                              <option key={ed.value} value={ed.value}>
                                {ed.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type ConnectStepProps = {
  selectedComponents: AssemblyComponent[];
  connections: {
    id: string;
    from: { componentIndex: number; padIndex: number };
    to: { componentIndex: number; padIndex: number };
    netName?: string;
    isPower?: boolean;
    isGround?: boolean;
    autoDetected?: boolean;
  }[];
  connFrom: { compIdx: number; padIdx: number } | null;
  setConnFrom: (v: { compIdx: number; padIdx: number } | null) => void;
  addConnection: (fc: number, fp: number, tc: number, tp: number, power?: boolean) => void;
  removeConnection: (id: string) => void;
  updateConnectionNetName: (id: string, netName: string) => void;
  autoDetectConnections: () => void;
  clearAutoDetectedConnections: () => void;
  lastDetectionStats: {
    powerConnections: number;
    groundConnections: number;
    signalConnections: number;
    unknownComponents: string[];
  } | null;
};

const ConnectStep = ({
  selectedComponents,
  connections,
  connFrom,
  setConnFrom,
  addConnection,
  removeConnection,
  updateConnectionNetName,
  autoDetectConnections,
  clearAutoDetectedConnections,
  lastDetectionStats,
}: ConnectStepProps) => {
  const handlePadClick = (compIdx: number, padIdx: number) => {
    if (!connFrom) {
      setConnFrom({ compIdx, padIdx });
    } else {
      if (connFrom.compIdx !== compIdx || connFrom.padIdx !== padIdx) {
        addConnection(connFrom.compIdx, connFrom.padIdx, compIdx, padIdx);
      }
      setConnFrom(null);
    }
  };

  // Expand components for display
  const expanded: { type: string; originalIdx: number; instanceIdx: number }[] = [];
  selectedComponents.forEach((ac, idx) => {
    for (let i = 0; i < ac.quantity; i++) {
      expanded.push({ type: ac.type, originalIdx: idx, instanceIdx: i });
    }
  });

  const autoCount = connections.filter((c) => c.autoDetected).length;
  const manualCount = connections.length - autoCount;

  return (
    <div className="step-content connect-step">
      <div className="step-description">
        <h3>2. Define Connections</h3>
        <p>
          Click a pad to start, then click another pad to connect them. Or use auto-detect for
          power/ground.
        </p>

        {/* Auto-detect controls */}
        <div className="auto-detect-section">
          <button
            className="auto-detect-btn"
            onClick={autoDetectConnections}
            title="Automatically find and connect power (VCC) and ground (GND) pins between all components"
          >
            ⚡ Auto-Detect Connections
          </button>
          {autoCount > 0 && (
            <button
              className="clear-auto-btn"
              onClick={clearAutoDetectedConnections}
              title="Remove all auto-detected connections (keeps manually added ones)"
            >
              Clear Auto ({autoCount})
            </button>
          )}
        </div>

        {lastDetectionStats && (
          <div className="detection-stats">
            Detected: {lastDetectionStats.powerConnections} VCC,{' '}
            {lastDetectionStats.groundConnections} GND
            {lastDetectionStats.signalConnections > 0 &&
              `, ${lastDetectionStats.signalConnections} signal`}
            {lastDetectionStats.unknownComponents.length > 0 && (
              <span className="unknown-warn">
                {' '}
                (Unknown: {lastDetectionStats.unknownComponents.join(', ')})
              </span>
            )}
          </div>
        )}

        {connFrom && (
          <div className="conn-hint active">
            Connecting from Component {connFrom.compIdx + 1}, Pad {connFrom.padIdx + 1}...
            <button onClick={() => setConnFrom(null)} title="Cancel this connection">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="connect-layout">
        {/* Component pads */}
        <div className="components-grid">
          {expanded.map((exp, expIdx) => {
            const fp = getFootprint(exp.type);
            if (!fp) return null;
            return (
              <div key={`${exp.type}_${expIdx}`} className="comp-card">
                <div className="comp-card-header">
                  {getComponentIcon(exp.type)}
                  <span>
                    {fp.name}
                    {selectedComponents[exp.originalIdx].quantity > 1 && ` #${exp.instanceIdx + 1}`}
                  </span>
                </div>
                <div className="pads-row">
                  {fp.pads.map((_pad, padIdx) => {
                    const isSelected = connFrom?.compIdx === expIdx && connFrom?.padIdx === padIdx;
                    const conn = connections.find(
                      (c) =>
                        (c.from.componentIndex === expIdx && c.from.padIndex === padIdx) ||
                        (c.to.componentIndex === expIdx && c.to.padIndex === padIdx)
                    );
                    const isPower = conn?.isPower;
                    const isGround = conn?.isGround;
                    const padLabel = getPadLabel(exp.type, padIdx);
                    return (
                      <button
                        key={padIdx}
                        className={`pad-btn ${isSelected ? 'selected' : ''} ${conn ? 'connected' : ''} ${isPower ? 'power' : ''} ${isGround ? 'ground' : ''}`}
                        onClick={() => handlePadClick(expIdx, padIdx)}
                        title={padLabel}
                      >
                        {padIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connections list */}
        <div className="connections-list">
          <h4>
            Connections ({manualCount} manual, {autoCount} auto)
          </h4>
          {connections.length === 0 ? (
            <p className="empty-hint">No connections defined yet</p>
          ) : (
            connections.map((conn) => {
              const fromType = expanded[conn.from.componentIndex]?.type || '?';
              const toType = expanded[conn.to.componentIndex]?.type || '?';
              const fromLabel = getPadLabel(fromType, conn.from.padIndex);
              const toLabel = getPadLabel(toType, conn.to.padIndex);
              return (
                <div
                  key={conn.id}
                  className={`conn-item ${conn.autoDetected ? 'auto' : ''} ${conn.isPower ? 'power' : ''} ${conn.isGround ? 'ground' : ''}`}
                >
                  <div className="conn-details">
                    <span className="conn-path">
                      {fromType.split('_')[0]} ({fromLabel}) → {toType.split('_')[0]} ({toLabel})
                    </span>
                    <input
                      className="net-name-input"
                      type="text"
                      value={conn.netName || ''}
                      placeholder="Net name"
                      onChange={(e) => updateConnectionNetName(conn.id, e.target.value)}
                      title="Optional: give this connection a name (e.g., 'CLK', 'DATA', 'AUDIO_IN')"
                    />
                  </div>
                  <button onClick={() => removeConnection(conn.id)} title="Delete this connection">
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

type ArrangeStepProps = {
  arrangements: ArrangementOption[];
  selectedArrangementId: string | null;
  selectArrangement: (id: string) => void;
  isGenerating: boolean;
  generateEnclosure: boolean;
  setGenerateEnclosure: (v: boolean) => void;
  optimizeOrientation: boolean;
  setOptimizeOrientation: (v: boolean) => void;
};

const ArrangeStep = ({
  arrangements,
  selectedArrangementId,
  selectArrangement,
  isGenerating,
  generateEnclosure,
  setGenerateEnclosure,
  optimizeOrientation,
  setOptimizeOrientation,
}: ArrangeStepProps) => {
  if (isGenerating) {
    return (
      <div className="step-content arrange-step loading">
        <div className="loading-spinner">⚙️</div>
        <p>Generating layout options...</p>
      </div>
    );
  }

  return (
    <div className="step-content arrange-step">
      <div className="step-description">
        <h3>3. Choose Layout</h3>
        <p>Select the arrangement that best fits your needs. Scores consider routing efficiency.</p>
        <div className="arrange-options">
          <label
            className="option-toggle"
            title="Rotate components to minimize total route length and crossings"
          >
            <input
              type="checkbox"
              checked={optimizeOrientation}
              onChange={(e) => setOptimizeOrientation(e.target.checked)}
            />
            Optimize component orientation
          </label>
          <label
            className="option-toggle"
            title="Automatically create a 3D-printable case that fits your board"
          >
            <input
              type="checkbox"
              checked={generateEnclosure}
              onChange={(e) => setGenerateEnclosure(e.target.checked)}
            />
            Generate matching enclosure
          </label>
        </div>
      </div>

      <div className="arrangements-grid">
        {arrangements.map((arr) => (
          <div
            key={arr.id}
            className={`arrangement-card ${selectedArrangementId === arr.id ? 'selected' : ''}`}
            onClick={() => selectArrangement(arr.id)}
            title="Click to select this layout option"
          >
            <div className="arr-header">
              <h4>{arr.name}</h4>
              <span className="arr-score" title="Quality score (higher is better)">
                {arr.score}
              </span>
            </div>
            <p className="arr-desc">{arr.description}</p>
            <div className="arr-metrics">
              <div className="metric" title="Total length of all copper tape routes">
                <span className="metric-label">Route Length</span>
                <span className="metric-value">{arr.metrics.totalRouteLength}mm</span>
              </div>
              <div className="metric" title="Number of places where routes cross (fewer is better)">
                <span className="metric-label">Crossings</span>
                <span className="metric-value">{arr.metrics.routeCrossings}</span>
              </div>
              <div className="metric" title="How much of the board area is used">
                <span className="metric-label">Utilization</span>
                <span className="metric-value">
                  {Math.round(arr.metrics.boardUtilization * 100)}%
                </span>
              </div>
            </div>
            <div className="arr-preview">
              <ComponentPreview components={arr.components} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type PreviewStepProps = {
  arrangement: ArrangementOption | null;
};

const PreviewStep = ({ arrangement }: PreviewStepProps) => {
  if (!arrangement) {
    return (
      <div className="step-content preview-step">
        <p>No arrangement selected</p>
      </div>
    );
  }

  return (
    <div className="step-content preview-step">
      <div className="step-description">
        <h3>4. Preview & Apply</h3>
        <p>
          Review your {arrangement.name} layout. Click "Apply to Board" to add these components.
        </p>
      </div>

      <div className="preview-summary">
        <div className="summary-card">
          <h4>📦 Components</h4>
          <p>{arrangement.components.length} total</p>
        </div>
        <div className="summary-card">
          <h4>🔌 Routes</h4>
          <p>{arrangement.routes.length} traces</p>
        </div>
        <div className="summary-card">
          <h4>📊 Score</h4>
          <p>{arrangement.score}/100</p>
        </div>
      </div>

      <div className="preview-large">
        <ComponentPreview components={arrangement.components} routes={arrangement.routes} large />
      </div>

      <div className="preview-details">
        <h4>Components to be added:</h4>
        <ul>
          {arrangement.components.map((c) => (
            <li key={c.id}>
              {getComponentIcon(c.type)} {c.type} at ({Math.round(c.pos[0])}, {Math.round(c.pos[1])}
              )
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// =====================
// MINI PREVIEW
// =====================

type ComponentPreviewProps = {
  components: { pos: [number, number]; type: string }[];
  routes?: { polyline: [number, number][] }[];
  large?: boolean;
};

const ComponentPreview = ({ components, routes, large }: ComponentPreviewProps) => {
  if (components.length === 0) return <div className="mini-preview empty">No components</div>;

  // Calculate bounds
  const xs = components.map((c) => c.pos[0]);
  const ys = components.map((c) => c.pos[1]);
  const minX = Math.min(...xs) - 10;
  const maxX = Math.max(...xs) + 10;
  const minY = Math.min(...ys) - 10;
  const maxY = Math.max(...ys) + 10;
  const width = maxX - minX;
  const height = maxY - minY;

  const svgSize = large ? 300 : 100;
  const scale = Math.min(svgSize / width, svgSize / height) * 0.9;

  return (
    <svg
      className={`mini-preview ${large ? 'large' : ''}`}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      width={svgSize}
      height={svgSize}
    >
      <g transform={`translate(${svgSize / 2}, ${svgSize / 2}) scale(${scale})`}>
        {/* Routes */}
        {routes?.map((r, i) => (
          <polyline
            key={i}
            points={r.polyline
              .map((p) => `${p[0] - (minX + maxX) / 2},${p[1] - (minY + maxY) / 2}`)
              .join(' ')}
            fill="none"
            stroke="#e8a824"
            strokeWidth={2 / scale}
          />
        ))}
        {/* Components */}
        {components.map((c, i) => (
          <circle
            key={i}
            cx={c.pos[0] - (minX + maxX) / 2}
            cy={c.pos[1] - (minY + maxY) / 2}
            r={4 / scale}
            fill="#4a9eff"
          />
        ))}
      </g>
    </svg>
  );
};

export default AutoAssemblyWizard;
