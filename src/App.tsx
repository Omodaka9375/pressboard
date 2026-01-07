import { useEffect, useState, useCallback } from 'react';
import { initOC } from './lib/geometry/opencascade';
import CanvasView from './components/CanvasView';
import ThreePreview from './components/ThreePreview';
import Toolbar from './components/Toolbar';
import InspectorPanel from './components/InspectorPanel';
import ComponentLibrary from './components/ComponentLibrary';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import AutoAssemblyWizard from './components/AutoAssemblyWizard';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationContainer } from './components/NotificationContainer';
import { DialogContainer } from './components/DialogContainer';
import { useProjectStore } from './stores/projectStore';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { undo, redo } = useProjectStore();

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Help panel
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShowShortcuts((prev) => !prev);
      }
      // Escape to close help
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    initOC()
      .then(() => {
        console.log('Geometry engine initialized');
      })
      .catch((error) => {
        console.warn('Geometry initialization:', error);
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <img src="/pressboard.png" alt="PressBoard" className="app-logo" />
        <Toolbar />
        <div className="header-spacer" />
        <ThemeToggle />
      </header>

      <div className="app-content">
        <aside className="sidebar-left">
          <ComponentLibrary />
        </aside>

        <main className="main-area">
          <div className="view-tabs">
            <button
              className={`view-tab ${activeView === '2d' ? 'active' : ''}`}
              onClick={() => setActiveView('2d')}
            >
              2D Layout
            </button>
            <button
              className={`view-tab ${activeView === '3d' ? 'active' : ''}`}
              onClick={() => setActiveView('3d')}
            >
              3D Preview
            </button>
          </div>
          <div className="view-content">
            <div
              className="canvas-container"
              style={{ display: activeView === '2d' ? 'flex' : 'none' }}
            >
              <CanvasView />
            </div>
            {activeView === '3d' && (
              <div className="three-fullscreen">
                <ThreePreview expanded />
              </div>
            )}
          </div>
        </main>

        <div className="sidebar-right-wrapper">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Show panel' : 'Hide panel'}
          >
            {sidebarCollapsed ? '◀' : '▶'}
          </button>
          <aside className={`sidebar-right ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <InspectorPanel />
          </aside>
        </div>
      </div>

      <footer className="app-footer">
        <span>PressBoard | Press ? for shortcuts</span>
      </footer>

      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <AutoAssemblyWizard />
      <NotificationContainer />
      <DialogContainer />
    </div>
  );
}

export default App;
