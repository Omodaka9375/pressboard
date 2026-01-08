import { useRef, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useEnclosureStore } from '../stores/enclosureStore';
import { useAutoAssemblyStore } from '../stores/autoAssemblyStore';
import { useNotificationStore } from '../stores/notificationStore';
import { downloadSTL } from '../lib/export/stlExport';
import { downloadTapeMasksSVG, downloadTapeMasksDXF } from '../lib/export/tapeExport';
import { generateAssemblyGuide } from '../lib/export/assemblyGuide';
import { exportFactoryPackage } from '../lib/export/factoryExport';
import { runDRCChecks } from '../lib/drc/checks';
import {
  downloadProjectJSON,
  loadProjectFromFile,
  openProjectWithNativeDialog,
} from '../lib/persistence';
import { isTauri } from '../lib/tauri';
import AboutDialog from './AboutDialog';
import HelpDialog from './HelpDialog';
import type { ChannelProfile, Layer } from '../types';

type DropdownMenuProps = {
  label: string;
  icon: string;
  children: React.ReactNode;
};

const DropdownMenu = ({ label, icon, children }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="dropdown-trigger">
        <span className="icon">{icon}</span>
        <span className="label">{label}</span>
        <span className="arrow">▾</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

const Toolbar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { enclosure } = useEnclosureStore();
  const { openWizard } = useAutoAssemblyStore();
  const { showNotification, showConfirm } = useNotificationStore();
  const {
    project,
    setViolations,
    startRoute,
    finishRoute,
    cancelRoute,
    isDrawingRoute,
    isPlacingVia,
    setPlacingVia,
    loadProject,
    resetProject,
    routeWidth,
    routeProfile,
    setRouteWidth,
    setRouteProfile,
    routingMode,
    setRoutingMode,
    activeLayer,
    setActiveLayer,
    undo,
    redo,
    canUndo,
    canRedo,
    isAutoRouting,
    setAutoRouting,
  } = useProjectStore();

  const handleRunDRC = () => {
    const violations = runDRCChecks(project);
    setViolations(violations);
    if (violations.length === 0) {
      showNotification('DRC passed - no violations found', 'success');
    } else {
      showNotification(`DRC found ${violations.length} violation(s)`, 'warning');
    }
  };

  const handleExportSTL = () => {
    try {
      downloadSTL(project);
      showNotification('STL exported successfully', 'success');
    } catch {
      showNotification('STL export failed. Make sure geometry is valid.', 'error');
    }
  };

  const handleFactoryExport = async () => {
    try {
      await exportFactoryPackage(project, enclosure.enabled ? enclosure : undefined);
      showNotification('Factory package exported successfully', 'success');
    } catch (err) {
      console.error('Factory export failed:', err);
      showNotification('Factory export failed. Check console for details.', 'error');
    }
  };

  const handleNewProject = async () => {
    const confirmed = await showConfirm(
      'Create new project? Unsaved changes will be lost.',
      'New Project'
    );
    if (confirmed) {
      resetProject();
      showNotification('New project created', 'success');
    }
  };

  const handleLoadProject = async () => {
    // Use native dialog in Tauri
    if (isTauri()) {
      try {
        const loaded = await openProjectWithNativeDialog();
        if (loaded) {
          loadProject(loaded);
          showNotification('Project loaded successfully', 'success');
        }
      } catch {
        showNotification('Failed to load project file', 'error');
      }
      return;
    }

    // Fallback to file input in browser
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loaded = await loadProjectFromFile(file);
      loadProject(loaded);
      showNotification('Project loaded successfully', 'success');
    } catch {
      showNotification('Failed to load project file', 'error');
    }

    e.target.value = '';
  };

  const isRouteMode = isDrawingRoute || isPlacingVia || isAutoRouting;

  return (
    <div className="toolbar">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* File operations */}
      <DropdownMenu label="File" icon="📁">
        <button onClick={handleNewProject} title="Start a new empty project">
          📄 New Project
        </button>
        <button
          onClick={() => downloadProjectJSON(project)}
          title="Save your project as a JSON file"
        >
          💾 Save Project
        </button>
        <button onClick={handleLoadProject} title="Load a previously saved project">
          📂 Open Project
        </button>
        <div className="menu-divider" />
        <button
          onClick={handleFactoryExport}
          title="Export everything needed for manufacturing (STL, BOM, assembly guide)"
        >
          📦 Export Factory Package
        </button>
        <div className="menu-divider" />
        <button onClick={handleExportSTL} title="Export 3D model for 3D printing">
          🖨️ Export STL
        </button>
        <button
          onClick={() => downloadTapeMasksSVG(project)}
          title="Export tape masks as SVG for laser cutting"
        >
          📐 Export SVG
        </button>
        <button
          onClick={() => downloadTapeMasksDXF(project)}
          title="Export tape masks as DXF for CNC or laser cutting"
        >
          📏 Export DXF
        </button>
        <button
          onClick={() => generateAssemblyGuide(project)}
          title="Generate a step-by-step PDF guide for building your board"
        >
          📋 Assembly Guide (PDF)
        </button>
        <div className="menu-divider" />
        <button onClick={() => setShowHelp(true)} title="Learn how to use PressBoard">
          ❓ Help & Guide
        </button>
        <button onClick={() => setShowAbout(true)} title="About PressBoard and credits">
          ℹ️ About PressBoard
        </button>
      </DropdownMenu>

      <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button className="icon-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          ↩
        </button>
        <button className="icon-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          ↪
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Routing controls */}
      <div className="toolbar-group route-controls">
        <div className="control-row">
          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value as Layer)}
            disabled={isDrawingRoute}
            className={`compact-select layer-${activeLayer}`}
            title="Active Layer - Top layer is on top surface, Bottom is underneath the board"
          >
            <option value="top">⬆ Top</option>
            <option value="bottom">⬇ Bottom</option>
          </select>
          <select
            value={routeWidth}
            onChange={(e) => setRouteWidth(Number(e.target.value))}
            disabled={isDrawingRoute}
            className="compact-select"
            title="Tape Width - Width of the copper tape channel (5mm is standard)"
          >
            <option value={3}>3mm</option>
            <option value={5}>5mm</option>
            <option value={6}>6mm</option>
            <option value={8}>8mm</option>
          </select>
          <select
            value={routeProfile}
            onChange={(e) => setRouteProfile(e.target.value as ChannelProfile)}
            disabled={isDrawingRoute}
            className="compact-select"
            title="Channel Profile - Shape of the groove that holds the copper tape"
          >
            <option value="U">U-Shape</option>
            <option value="V">V-Shape</option>
            <option value="flat">Flat</option>
          </select>
        </div>
      </div>

      {/* Drawing tools */}
      <div className="toolbar-group">
        {!isDrawingRoute ? (
          <>
            <button
              className={`tool-btn ${routingMode === 'manual' ? 'active' : ''}`}
              onClick={() => {
                setRoutingMode('manual');
                startRoute();
              }}
              disabled={isPlacingVia || isAutoRouting}
              title="Draw Trace - Click points on canvas to create a copper tape path, then click Done"
            >
              ✏️ Draw Trace
            </button>
            <button
              className={`tool-btn ${routingMode === 'manhattan' ? 'active' : ''}`}
              onClick={() => {
                setRoutingMode('manhattan');
                startRoute();
              }}
              disabled={isPlacingVia || isAutoRouting}
              title="L-Trace - Click start point, then end point to create a 90° angled path"
            >
              📐 L-Trace
            </button>
            <button
              className={`tool-btn ${routingMode === 'spline' ? 'active' : ''}`}
              onClick={() => {
                setRoutingMode('spline');
                startRoute();
              }}
              disabled={isPlacingVia || isAutoRouting}
              title="Curved Trace - Click control points to create a smooth curved path"
            >
              〰️ Curve
            </button>
          </>
        ) : (
          <>
            <button
              className="tool-btn success"
              onClick={finishRoute}
              title="Finish and save the trace"
            >
              ✓ Finish
            </button>
            <button className="tool-btn danger" onClick={cancelRoute} title="Cancel without saving">
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      <div className="toolbar-group">
        <button
          className={`tool-btn ${isAutoRouting ? 'active' : ''}`}
          onClick={() => setAutoRouting(!isAutoRouting)}
          disabled={isDrawingRoute || isPlacingVia}
          title="Smart Path - Click start then end point to auto-connect"
        >
          🔀 Smart Path
        </button>
        <button
          className={`tool-btn ${isPlacingVia ? 'active' : ''}`}
          onClick={() => setPlacingVia(!isPlacingVia)}
          disabled={isDrawingRoute || isAutoRouting}
          title="Layer Jump - Add a hole to connect top and bottom layers"
        >
          ⚫ Layer Jump
        </button>
      </div>

      {isRouteMode && (
        <div className="status-badge">
          {isDrawingRoute && routingMode === 'manual' && '✏️ Click to add points, then Finish'}
          {isDrawingRoute && routingMode === 'manhattan' && '📐 Click start, then end point'}
          {isDrawingRoute && routingMode === 'spline' && '〰️ Click control points, then Finish'}
          {isPlacingVia && '⚫ Click to add layer jump'}
          {isAutoRouting && '🔀 Click start → end points'}
        </div>
      )}

      <div className="toolbar-divider" />

      {/* Auto-Assembly */}
      <button
        className="tool-btn"
        onClick={openWizard}
        disabled={isRouteMode}
        title="Auto-Assembly Wizard - Intelligently place components and generate routes"
      >
        🔧 Auto-Assembly
      </button>

      {/* Design Check */}
      <button
        className="tool-btn"
        onClick={handleRunDRC}
        title="Check for design errors like overlapping traces or short circuits"
      >
        🔍 Check Design
      </button>

      <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: var(--bg-sidebar);
          border-bottom: 1px solid var(--border-color);
          min-height: 36px;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border-color);
          margin: 0 4px;
        }

        .toolbar-spacer {
          flex: 1;
        }

        .icon-btn {
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .icon-btn:hover:not(:disabled) {
          background: var(--btn-hover);
        }

        .icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .tool-btn {
          padding: 4px 10px;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tool-btn:hover:not(:disabled) {
          background: var(--btn-hover);
        }

        .tool-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .tool-btn.active {
          background: #2196F3;
          color: white;
          border-color: #1976D2;
        }

        .tool-btn.success {
          background: #4CAF50;
          color: white;
          border-color: #388E3C;
        }

        .tool-btn.danger {
          background: #f44336;
          color: white;
          border-color: #d32f2f;
        }

        .compact-select {
          padding: 3px 6px;
          border-radius: 3px;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-primary);
          font-size: 11px;
          min-width: 50px;
        }

        .compact-select.layer-top {
          border-left: 3px solid #4caf50;
        }

        .compact-select.layer-bottom {
          border-left: 3px solid #ff9800;
        }

        .status-badge {
          padding: 4px 8px;
          background: rgba(33, 150, 243, 0.15);
          color: #2196F3;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        /* Dropdown styles */
        .dropdown {
          position: relative;
        }

        .dropdown-trigger {
          padding: 4px 8px;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-primary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dropdown-trigger:hover {
          background: var(--btn-hover);
        }

        .dropdown-trigger .icon {
          font-size: 14px;
        }

        .dropdown-trigger .arrow {
          font-size: 10px;
          opacity: 0.6;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 2px;
          min-width: 180px;
          background: var(--bg-sidebar);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          padding: 4px;
        }

        .dropdown-menu button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          font-size: 12px;
        }

        .dropdown-menu button:hover {
          background: var(--btn-hover);
        }

        .menu-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 0;
        }

        .control-row {
          display: flex;
          gap: 3px;
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
