import { useProjectStore } from '../stores/projectStore';
import { useNotificationStore } from '../stores/notificationStore';
import { runDRCChecks } from '../lib/drc/checks';
import type { DRCViolation } from '../types';

/**
 * DRC panel with violations list and one-click auto-fix suggestions.
 */
const DRCPanel = () => {
  const { project, violations, setViolations, updateRoutePoint } = useProjectStore();
  const { showNotification } = useNotificationStore();

  const handleRunDRC = () => {
    const results = runDRCChecks(project);
    setViolations(results);
  };

  const getFixSuggestion = (
    violation: DRCViolation
  ): { label: string; action: () => void } | null => {
    switch (violation.type) {
      case 'spacing':
        return {
          label: 'Widen spacing',
          action: () => {
            showNotification(
              'Review routes near this position and manually adjust spacing. Consider using wider tape or routing on different layers.',
              'info',
              6000
            );
          },
        };

      case 'wall':
        return {
          label: 'Adjust route width',
          action: () => {
            showNotification(
              'Consider using narrower tape (3mm) to increase wall thickness between channels.',
              'info',
              6000
            );
          },
        };

      case 'bend':
        return {
          label: 'Add fillet',
          action: () => {
            showNotification(
              'Use the Curve tool to create smooth bends instead of sharp corners. Copper tape works best with gradual curves.',
              'info',
              6000
            );
          },
        };

      case 'overhang':
        return {
          label: 'Move inside',
          action: () => {
            // Find the point outside boundary and move it inside
            const [vx, vy] = violation.position;
            const boundary = project.board.boundary;
            let cx = 0,
              cy = 0;
            boundary.forEach(([x, y]) => {
              cx += x;
              cy += y;
            });
            cx /= boundary.length;
            cy /= boundary.length;

            // Find which route has this point
            for (let rIdx = 0; rIdx < project.routes.length; rIdx++) {
              const route = project.routes[rIdx];
              for (let pIdx = 0; pIdx < route.polyline.length; pIdx++) {
                const [px, py] = route.polyline[pIdx];
                if (Math.abs(px - vx) < 1 && Math.abs(py - vy) < 1) {
                  // Move point 10% toward center
                  const newX = px + (cx - px) * 0.15;
                  const newY = py + (cy - py) * 0.15;
                  updateRoutePoint(rIdx, pIdx, [newX, newY]);
                  showNotification('Route point adjusted', 'success');
                  handleRunDRC(); // Re-run DRC
                  return;
                }
              }
            }
            showNotification('Could not find the route point to adjust.', 'warning');
          },
        };

      case 'collision':
        return {
          label: 'Move apart',
          action: () => {
            showNotification(
              'Move one of the components to increase distance between mounting holes.',
              'info',
              6000
            );
          },
        };

      case 'overlap':
        return {
          label: 'Connect via',
          action: () => {
            showNotification(
              'Draw a route through this via to connect it to a copper tape path.',
              'info',
              6000
            );
          },
        };

      case 'pad':
        return {
          label: 'Reroute',
          action: () => {
            showNotification(
              'Move the route away from component pads. Consider routing around the component.',
              'info',
              6000
            );
          },
        };

      default:
        return null;
    }
  };

  const errorCount = violations.filter((v) => v.severity === 'error').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
          🔍 Design Check
        </h4>
        <button
          onClick={handleRunDRC}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Run Check
        </button>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '11px' }}>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '10px',
            background: errorCount > 0 ? '#f44336' : '#4caf50',
            color: 'white',
          }}
        >
          {errorCount} errors
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '10px',
            background: warningCount > 0 ? '#ff9800' : '#4caf50',
            color: 'white',
          }}
        >
          {warningCount} warnings
        </span>
      </div>

      {violations.length === 0 ? (
        <p style={{ fontSize: '11px', color: 'var(--success-color)' }}>✅ No violations found</p>
      ) : (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {violations.map((v, i) => {
            const fix = getFixSuggestion(v);
            return (
              <div
                key={i}
                style={{
                  padding: '6px',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  border: `1px solid ${v.severity === 'error' ? '#f44336' : '#ff9800'}`,
                  background:
                    v.severity === 'error' ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)',
                  fontSize: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: v.severity === 'error' ? '#f44336' : '#ff9800',
                        marginBottom: '2px',
                      }}
                    >
                      {v.severity === 'error' ? '❌' : '⚠️'} {v.type.toUpperCase()}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{v.message}</div>
                    {v.position && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
                        @ ({v.position[0].toFixed(1)}, {v.position[1].toFixed(1)})
                      </div>
                    )}
                  </div>
                  {fix && (
                    <button
                      onClick={fix.action}
                      style={{
                        padding: '3px 6px',
                        fontSize: '9px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      title={`Auto-fix: ${fix.label}`}
                    >
                      🔧 {fix.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DRCPanel;
