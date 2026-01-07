import { useProjectStore } from '../stores/projectStore';
import type { Vec2 } from '../types';

/**
 * Panel for editing selected routes - move points, delete segments.
 */
const RouteEditor = () => {
  const { project, selectedRoute, selectRoute, removeRoute, removeRoutePoint } = useProjectStore();

  const route = selectedRoute !== null ? project.routes[selectedRoute] : null;

  if (!route) {
    return (
      <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
          🛤️ Routes ({project.routes.length})
        </h4>
        {project.routes.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            No routes yet. Use the trace tools to create routes.
          </p>
        ) : (
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {project.routes.map((r, idx) => (
              <div
                key={idx}
                onClick={() => selectRoute(idx)}
                style={{
                  padding: '4px 8px',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  background: 'var(--btn-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: r.layer === 'top' ? '#4caf50' : '#ff9800',
                      marginRight: '6px',
                    }}
                  />
                  {r.net} ({r.polyline.length} pts)
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {r.width}mm · {r.layer}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Route is selected - show editor
  const calcLength = (polyline: Vec2[]): number => {
    let len = 0;
    for (let i = 0; i < polyline.length - 1; i++) {
      const dx = polyline[i + 1][0] - polyline[i][0];
      const dy = polyline[i + 1][1] - polyline[i][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  };

  const length = calcLength(route.polyline);

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
          🛤️ Edit Route
        </h4>
        <button
          onClick={() => selectRoute(null)}
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '3px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ✕ Close
        </button>
      </div>

      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Net:</strong> {route.net}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Layer:</strong>{' '}
          <span style={{ color: route.layer === 'top' ? '#4caf50' : '#ff9800' }}>
            {route.layer}
          </span>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Width:</strong> {route.width}mm
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Length:</strong> {length.toFixed(1)}mm
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Points:</strong> {route.polyline.length}
        </div>
      </div>

      {/* Points list */}
      <div
        style={{
          maxHeight: '100px',
          overflowY: 'auto',
          marginBottom: '8px',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          fontSize: '10px',
        }}
      >
        {route.polyline.map((pt, idx) => (
          <div
            key={idx}
            style={{
              padding: '2px 6px',
              borderBottom:
                idx < route.polyline.length - 1 ? '1px solid var(--border-color)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background:
                idx === 0 || idx === route.polyline.length - 1
                  ? 'rgba(33,150,243,0.1)'
                  : 'transparent',
            }}
          >
            <span>
              {idx === 0 ? '🟢' : idx === route.polyline.length - 1 ? '🔴' : '⚪'} P{idx + 1}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                ({pt[0].toFixed(1)}, {pt[1].toFixed(1)})
              </span>
              {route.polyline.length > 2 && (
                <button
                  onClick={() => selectedRoute !== null && removeRoutePoint(selectedRoute, idx)}
                  style={{
                    padding: '0 4px',
                    fontSize: '9px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f44336',
                    cursor: 'pointer',
                  }}
                  title="Delete point"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => {
            if (selectedRoute !== null) {
              removeRoute(selectedRoute);
              selectRoute(null);
            }
          }}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '11px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🗑️ Delete Route
        </button>
      </div>

      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px' }}>
        Tip: Click another route in the list to switch selection
      </p>
    </div>
  );
};

export default RouteEditor;
