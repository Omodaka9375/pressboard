import { useProjectStore } from '../stores/projectStore';
import { useEnclosureStore } from '../stores/enclosureStore';
import BoardSettings from './BoardSettings';
import LayerManager from './LayerManager';
import PrintabilityMeter from './PrintabilityMeter';
import AnnotationTools from './AnnotationTools';
import RouteEditor from './RouteEditor';
import DRCPanel from './DRCPanel';
import LidDesigner from './LidDesigner';

const InspectorPanel = () => {
  const { project, selectedComponent, removeComponent, updateComponentRotation } =
    useProjectStore();
  const { enclosure } = useEnclosureStore();

  const selectedComp = project.components.find((c) => c.id === selectedComponent);

  return (
    <div style={{ borderTop: '1px solid var(--border-color)' }}>
      <BoardSettings />
      <LayerManager />
      <RouteEditor />
      <AnnotationTools />
      <LidDesigner />
      <PrintabilityMeter />

      {selectedComp && (
        <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
            Selected Component
          </h4>
          <p style={{ fontSize: '12px', margin: '4px 0' }}>
            <strong>Type:</strong> {selectedComp.type}
          </p>
          <p style={{ fontSize: '12px', margin: '4px 0' }}>
            <strong>Position:</strong> ({Math.round(selectedComp.pos[0])},{' '}
            {Math.round(selectedComp.pos[1])})
          </p>
          <div
            style={{
              fontSize: '12px',
              margin: '8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <strong>Rotation:</strong>
            <button
              onClick={() =>
                updateComponentRotation(selectedComp.id, (selectedComp.rotation - 90 + 360) % 360)
              }
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              -90°
            </button>
            <span style={{ minWidth: '40px', textAlign: 'center' }}>{selectedComp.rotation}°</span>
            <button
              onClick={() =>
                updateComponentRotation(selectedComp.id, (selectedComp.rotation + 90) % 360)
              }
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              +90°
            </button>
          </div>
          <button
            onClick={() => removeComponent(selectedComp.id)}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      )}

      <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
          Project Info
        </h4>
        <p style={{ fontSize: '12px', margin: '4px 0', color: 'var(--text-secondary)' }}>
          <strong>Board:</strong> {project.board.shape} ({project.board.thickness}mm)
        </p>
        <p style={{ fontSize: '12px', margin: '4px 0', color: 'var(--text-secondary)' }}>
          <strong>Components:</strong> {project.components.length}
        </p>
        <p style={{ fontSize: '12px', margin: '4px 0', color: 'var(--text-secondary)' }}>
          <strong>Routes:</strong> {project.routes.length}
        </p>
        <p style={{ fontSize: '12px', margin: '4px 0', color: 'var(--text-secondary)' }}>
          <strong>Vias:</strong> {project.vias.length}
        </p>
        {enclosure.enabled && (
          <p style={{ fontSize: '12px', margin: '4px 0', color: 'var(--text-secondary)' }}>
            <strong>Enclosure:</strong> {enclosure.lidHeight}mm lid,{' '}
            {enclosure.magnetPlacements.length} magnets
          </p>
        )}
      </div>

      <DRCPanel />
    </div>
  );
};

export default InspectorPanel;
