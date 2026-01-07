import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { BoardShape, Vec2 } from '../types';

const PRESETS = {
  small: { width: 50, height: 30 },
  medium: { width: 100, height: 60 },
  large: { width: 150, height: 100 },
  arduino: { width: 68.6, height: 53.3 },
};

const BoardSettings = () => {
  const { project, setBoard } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentBounds = project.board.boundary;
  const actualWidth =
    currentBounds.length >= 3 ? Math.abs(currentBounds[2][0] - currentBounds[0][0]) : 100;
  const actualHeight =
    currentBounds.length >= 3 ? Math.abs(currentBounds[2][1] - currentBounds[0][1]) : 60;

  // Local state for input fields to allow proper editing
  const [widthInput, setWidthInput] = useState(String(Math.round(actualWidth)));
  const [heightInput, setHeightInput] = useState(String(Math.round(actualHeight)));
  const [thicknessInput, setThicknessInput] = useState(String(project.board.thickness));

  // Sync local state when project changes externally (e.g., presets, undo)
  useEffect(() => {
    setWidthInput(String(Math.round(actualWidth)));
  }, [actualWidth]);

  useEffect(() => {
    setHeightInput(String(Math.round(actualHeight)));
  }, [actualHeight]);

  useEffect(() => {
    setThicknessInput(String(project.board.thickness));
  }, [project.board.thickness]);

  const handleShapeChange = (shape: BoardShape) => {
    let boundary: Vec2[];

    if (shape === 'circular') {
      // Approximate circle with 32 points
      const radius = Math.min(actualWidth, actualHeight) / 2;
      const cx = radius;
      const cy = radius;
      boundary = [];
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        boundary.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
      }
    } else {
      boundary = [
        [0, 0],
        [actualWidth, 0],
        [actualWidth, actualHeight],
        [0, actualHeight],
      ];
    }

    setBoard({
      ...project.board,
      shape,
      boundary,
    });
  };

  const handleSizeChange = (newWidth: number, newHeight: number) => {
    const shape = project.board.shape;
    let boundary: Vec2[];

    if (shape === 'circular') {
      const radius = Math.min(newWidth, newHeight) / 2;
      const cx = radius;
      const cy = radius;
      boundary = [];
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        boundary.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
      }
    } else {
      boundary = [
        [0, 0],
        [newWidth, 0],
        [newWidth, newHeight],
        [0, newHeight],
      ];
    }

    setBoard({
      ...project.board,
      boundary,
    });
  };

  const handleThicknessChange = (thickness: number) => {
    setBoard({
      ...project.board,
      thickness,
    });
  };

  const handlePreset = (preset: keyof typeof PRESETS) => {
    const { width: w, height: h } = PRESETS[preset];
    handleSizeChange(w, h);
  };

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: isExpanded ? '10px' : 0,
        }}
      >
        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>
          Board Settings
        </h4>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}
            >
              Shape
            </label>
            <select
              value={project.board.shape}
              onChange={(e) => handleShapeChange(e.target.value as BoardShape)}
              style={{ width: '100%', padding: '4px' }}
            >
              <option value="rectangular">Rectangular</option>
              <option value="circular">Circular</option>
              <option value="freeform">Freeform</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label
              style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}
            >
              Width (mm)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
              onBlur={() => {
                const val = Math.min(200, Math.max(10, Number(widthInput) || 10));
                setWidthInput(String(val));
                handleSizeChange(val, actualHeight);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = Math.min(200, Math.max(10, Number(widthInput) || 10));
                  setWidthInput(String(val));
                  handleSizeChange(val, actualHeight);
                }
              }}
              style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label
              style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}
            >
              Height (mm)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              onBlur={() => {
                const val = Math.min(200, Math.max(10, Number(heightInput) || 10));
                setHeightInput(String(val));
                handleSizeChange(actualWidth, val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = Math.min(200, Math.max(10, Number(heightInput) || 10));
                  setHeightInput(String(val));
                  handleSizeChange(actualWidth, val);
                }
              }}
              style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
            Max board size: 200 × 200 mm
          </p>

          <div style={{ marginBottom: '10px' }}>
            <label
              style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}
            >
              Thickness (mm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={thicknessInput}
              onChange={(e) => setThicknessInput(e.target.value)}
              onBlur={() => {
                const val = Math.min(10, Math.max(0.5, Number(thicknessInput) || 1.6));
                setThicknessInput(String(val));
                handleThicknessChange(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = Math.min(10, Math.max(0.5, Number(thicknessInput) || 1.6));
                  setThicknessInput(String(val));
                  handleThicknessChange(val);
                }
              }}
              style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label
              style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}
            >
              Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => handlePreset(key as keyof typeof PRESETS)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSettings;
