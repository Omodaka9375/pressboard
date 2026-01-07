import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { AnnotationType, Vec2 } from '../types';

/**
 * Panel for adding and managing annotations (text labels, designators, etc.).
 */
const AnnotationTools = () => {
  const { project, addAnnotation, removeAnnotation, generateDesignators } = useProjectStore();
  const [annotationText, setAnnotationText] = useState('');
  const [annotationType, setAnnotationType] = useState<AnnotationType>('text');
  const [fontSize, setFontSize] = useState(4);

  const handleAddAnnotation = () => {
    if (!annotationText.trim()) return;

    // Place in center of board by default
    const boundary = project.board.boundary;
    let cx = 50,
      cy = 30;
    if (boundary.length > 0) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      boundary.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
      cx = (minX + maxX) / 2;
      cy = (minY + maxY) / 2;
    }

    addAnnotation({
      id: `ann_${Date.now()}`,
      type: annotationType,
      pos: [cx, cy] as Vec2,
      text: annotationText,
      fontSize,
      rotation: 0,
      color: getDefaultColor(annotationType),
    });

    setAnnotationText('');
  };

  const getDefaultColor = (type: AnnotationType): string => {
    switch (type) {
      case 'designator':
        return '#2563eb';
      case 'netLabel':
        return '#059669';
      case 'refMark':
        return '#dc2626';
      default:
        return '#333333';
    }
  };

  const annotations = project.annotations || [];

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
        📝 Annotations
      </h4>

      {/* Auto-generate designators */}
      <button
        onClick={generateDesignators}
        disabled={project.components.length === 0}
        style={{
          width: '100%',
          padding: '6px 10px',
          fontSize: '11px',
          background: project.components.length > 0 ? '#2563eb' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: project.components.length > 0 ? 'pointer' : 'not-allowed',
          marginBottom: '10px',
        }}
      >
        🏷️ Generate Designators (R1, C1, etc.)
      </button>

      {/* Add new annotation */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <select
            value={annotationType}
            onChange={(e) => setAnnotationType(e.target.value as AnnotationType)}
            style={{
              flex: 1,
              fontSize: '11px',
              padding: '4px',
              borderRadius: '3px',
              border: '1px solid var(--border-color)',
            }}
          >
            <option value="text">Text</option>
            <option value="netLabel">Net Label</option>
            <option value="refMark">Ref Mark</option>
          </select>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              width: '60px',
              fontSize: '11px',
              padding: '4px',
              borderRadius: '3px',
              border: '1px solid var(--border-color)',
            }}
          >
            <option value={2}>2mm</option>
            <option value={3}>3mm</option>
            <option value={4}>4mm</option>
            <option value={5}>5mm</option>
            <option value={6}>6mm</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
            placeholder="Annotation text..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddAnnotation()}
            style={{
              flex: 1,
              fontSize: '11px',
              padding: '4px 6px',
              borderRadius: '3px',
              border: '1px solid var(--border-color)',
            }}
          />
          <button
            onClick={handleAddAnnotation}
            disabled={!annotationText.trim()}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              background: annotationText.trim() ? '#22c55e' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: annotationText.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* List existing annotations */}
      {annotations.length > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Annotations ({annotations.length})
          </div>
          <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
            {annotations.map((ann) => (
              <div
                key={ann.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2px 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span
                  style={{
                    color: ann.color,
                    fontWeight: ann.type === 'designator' ? 'bold' : 'normal',
                  }}
                >
                  {ann.type === 'designator' ? '🏷️' : ann.type === 'netLabel' ? '🔌' : '📍'}{' '}
                  {ann.text}
                </span>
                <button
                  onClick={() => removeAnnotation(ann.id)}
                  style={{
                    padding: '1px 5px',
                    fontSize: '10px',
                    background: 'transparent',
                    color: '#999',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Remove annotation"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationTools;
