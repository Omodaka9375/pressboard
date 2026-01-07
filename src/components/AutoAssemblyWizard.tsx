import { useState } from 'react';
import { useAutoAssemblyStore, getTotalComponentCount } from '../stores/autoAssemblyStore';
import { useProjectStore } from '../stores/projectStore';
import { getAllFootprints, getFootprint } from '../data/footprints';
import { getComponentIcon } from '../data/componentIcons';
import { generatePlacements } from '../lib/assembly/placementEngine';
import { routeArrangement } from '../lib/assembly/autoRouter';
import type { ArrangementOption, AssemblyComponent } from '../types';
import './AutoAssemblyWizard.css';

const STEP_LABELS = ['Select', 'Connect', 'Arrange', 'Preview'];

/** Auto-Assembly Wizard for intelligent component placement. */
const AutoAssemblyWizard = () => {
  const {
    isOpen,
    step,
    selectedComponents,
    connections,
    arrangements,
    selectedArrangementId,
    isGenerating,
    generateEnclosure,
    closeWizard,
    reset,
    setStep,
    nextStep,
    prevStep,
    addComponent,
    removeComponent,
    updateComponentQuantity,
    addConnection,
    removeConnection,
    setArrangements,
    selectArrangement,
    setIsGenerating,
    setGenerateEnclosure,
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

    // Generate placement options
    const options = generatePlacements(selectedComponents, project.board, connections);

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
          <button className="wizard-close" onClick={closeWizard}>
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
              <button className="wizard-btn secondary" onClick={prevStep}>
                ← Back
              </button>
            )}
            {step === 'connect' && (
              <button
                className="wizard-btn primary"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Layouts →'}
              </button>
            )}
            {step === 'arrange' && arrangements.length > 0 && (
              <button className="wizard-btn primary" onClick={nextStep} disabled={!canProceed()}>
                Preview →
              </button>
            )}
            {step === 'preview' && (
              <button className="wizard-btn primary" onClick={handleApply}>
                ✓ Apply to Board
              </button>
            )}
            {step === 'select' && (
              <button className="wizard-btn primary" onClick={nextStep} disabled={!canProceed()}>
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
};

const SelectStep = ({
  searchQuery,
  setSearchQuery,
  selectedComponents,
  addComponent,
  removeComponent,
  updateComponentQuantity,
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
          />
          <div className="component-list">
            {filtered.map((fp) => (
              <div key={fp.type} className="component-item" onClick={() => addComponent(fp.type)}>
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
                return (
                  <div key={ac.id} className="component-item selected">
                    <span className="comp-icon">{getComponentIcon(ac.type)}</span>
                    <span className="comp-name">{fp?.name || ac.type}</span>
                    <div className="qty-controls">
                      <button onClick={() => updateComponentQuantity(ac.id, ac.quantity - 1)}>
                        −
                      </button>
                      <span className="qty">{ac.quantity}</span>
                      <button onClick={() => updateComponentQuantity(ac.id, ac.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <button className="remove-btn" onClick={() => removeComponent(ac.id)}>
                      ×
                    </button>
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
    isPower?: boolean;
  }[];
  connFrom: { compIdx: number; padIdx: number } | null;
  setConnFrom: (v: { compIdx: number; padIdx: number } | null) => void;
  addConnection: (fc: number, fp: number, tc: number, tp: number, power?: boolean) => void;
  removeConnection: (id: string) => void;
};

const ConnectStep = ({
  selectedComponents,
  connections,
  connFrom,
  setConnFrom,
  addConnection,
  removeConnection,
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

  return (
    <div className="step-content connect-step">
      <div className="step-description">
        <h3>2. Define Connections</h3>
        <p>
          Click a pad to start, then click another pad to connect them. Skip if routing manually.
        </p>
        {connFrom && (
          <div className="conn-hint active">
            Connecting from Component {connFrom.compIdx + 1}, Pad {connFrom.padIdx + 1}...
            <button onClick={() => setConnFrom(null)}>Cancel</button>
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
                    const hasConnection = connections.some(
                      (c) =>
                        (c.from.componentIndex === expIdx && c.from.padIndex === padIdx) ||
                        (c.to.componentIndex === expIdx && c.to.padIndex === padIdx)
                    );
                    return (
                      <button
                        key={padIdx}
                        className={`pad-btn ${isSelected ? 'selected' : ''} ${hasConnection ? 'connected' : ''}`}
                        onClick={() => handlePadClick(expIdx, padIdx)}
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
          <h4>Connections ({connections.length})</h4>
          {connections.length === 0 ? (
            <p className="empty-hint">No connections defined yet</p>
          ) : (
            connections.map((conn) => {
              const fromType = expanded[conn.from.componentIndex]?.type || '?';
              const toType = expanded[conn.to.componentIndex]?.type || '?';
              return (
                <div key={conn.id} className="conn-item">
                  <span>
                    {fromType.split('_')[0]} P{conn.from.padIndex + 1} → {toType.split('_')[0]} P
                    {conn.to.padIndex + 1}
                  </span>
                  <button onClick={() => removeConnection(conn.id)}>×</button>
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
};

const ArrangeStep = ({
  arrangements,
  selectedArrangementId,
  selectArrangement,
  isGenerating,
  generateEnclosure,
  setGenerateEnclosure,
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
        <label className="enclosure-toggle">
          <input
            type="checkbox"
            checked={generateEnclosure}
            onChange={(e) => setGenerateEnclosure(e.target.checked)}
          />
          Generate matching enclosure
        </label>
      </div>

      <div className="arrangements-grid">
        {arrangements.map((arr) => (
          <div
            key={arr.id}
            className={`arrangement-card ${selectedArrangementId === arr.id ? 'selected' : ''}`}
            onClick={() => selectArrangement(arr.id)}
          >
            <div className="arr-header">
              <h4>{arr.name}</h4>
              <span className="arr-score">{arr.score}</span>
            </div>
            <p className="arr-desc">{arr.description}</p>
            <div className="arr-metrics">
              <div className="metric">
                <span className="metric-label">Route Length</span>
                <span className="metric-value">{arr.metrics.totalRouteLength}mm</span>
              </div>
              <div className="metric">
                <span className="metric-label">Crossings</span>
                <span className="metric-value">{arr.metrics.routeCrossings}</span>
              </div>
              <div className="metric">
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
