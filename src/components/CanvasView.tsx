import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useViewSettingsStore } from '../stores/viewSettingsStore';
import { useThemeStore } from '../stores/themeStore';
import { useNotificationStore } from '../stores/notificationStore';
import { getFootprint } from '../data/footprints';
import { manhattanRoute, splineRoute } from '../lib/routing/routingUtils';
import type { Vec2, Component, DRCViolation, Annotation, Route } from '../types';

const GRID_SIZES = [1, 2.54, 5, 10, 20] as const;
const DEFAULT_GRID_INDEX = 3; // 10mm
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_SENSITIVITY = 0.001;

const CanvasView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });
  const {
    project,
    violations,
    addRoutePoint,
    isDrawingRoute,
    currentRoutePoints,
    addComponent,
    selectedComponent,
    selectComponent,
    selectedRoute,
    selectRoute,
    updateComponentPosition,
    updateComponentRotation,
    isPlacingVia,
    addVia,
    setPlacingVia,
    routingMode,
    finishRoute,
    activeLayer,
    isAutoRouting,
    autoRouteStart,
    setAutoRouteStart,
    setAutoRouting,
    autoRoute,
  } = useProjectStore();
  const { visibility, opacity, showDRCMarkers, showComponentLabels } = useViewSettingsStore();
  const { theme } = useThemeStore();
  const { showNotification } = useNotificationStore();
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Vec2>([0, 0]);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridSizeIndex, setGridSizeIndex] = useState(DEFAULT_GRID_INDEX);
  const gridSize = GRID_SIZES[gridSizeIndex];

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const snapToGrid = (value: number): number => Math.round(value / gridSize) * gridSize;

  // Helper to calculate board center
  const calcBoardCenter = (boundary: Vec2[]): Vec2 => {
    if (boundary.length === 0) return [0, 0];
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
    return [(minX + maxX) / 2, (minY + maxY) / 2];
  };

  // Zoom and pan state - initialize pan to center board in canvas
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Vec2>([0, 0]);
  const [pan, setPan] = useState<Vec2>(() => {
    const [cx, cy] = calcBoardCenter(project.board.boundary);
    return [canvasSize.width / 2 - cx, canvasSize.height / 2 - cy];
  });

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (selectedComponent) {
          const comp = project.components.find((c) => c.id === selectedComponent);
          if (comp) {
            updateComponentRotation(selectedComponent, (comp.rotation + 90) % 360);
          }
        }
      }
      if (e.key === 'g' || e.key === 'G') {
        setSnapEnabled((prev) => !prev);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponent) {
          useProjectStore.getState().removeComponent(selectedComponent);
        }
      }
    },
    [selectedComponent, project.components, updateComponentRotation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /** Convert screen coordinates to world coordinates. */
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Vec2 => {
      return [(screenX - pan[0]) / zoom, (screenY - pan[1]) / zoom];
    },
    [zoom, pan]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with theme-appropriate background
    ctx.fillStyle = theme === 'dark' ? '#252540' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid in screen space (before zoom/pan transform)
    if (visibility.grid) {
      drawGrid(ctx, canvas.width, canvas.height, gridSize, zoom, pan, theme);
    }

    // Apply zoom and pan transform for board content
    ctx.save();
    ctx.translate(pan[0], pan[1]);
    ctx.scale(zoom, zoom);

    // Draw board boundary
    if (visibility.substrate) {
      ctx.globalAlpha = opacity.substrate;
      drawBoardBoundary(ctx, project.board.boundary, theme);
      ctx.globalAlpha = 1;
    }

    // Draw routes (bottom layer first, then top layer on top)
    if (visibility.bottomCopper) {
      ctx.globalAlpha = opacity.bottomCopper;
      project.routes
        .filter((r) => r.layer === 'bottom')
        .forEach((route) => {
          const isSelected = project.routes.indexOf(route) === selectedRoute;
          drawRoute(ctx, route.polyline, route.width, isSelected ? '#2196F3' : '#CD853F', true);
          if (isSelected) drawRoutePoints(ctx, route.polyline);
        });
      ctx.globalAlpha = 1;
    }
    if (visibility.topCopper) {
      ctx.globalAlpha = opacity.topCopper;
      project.routes
        .filter((r) => r.layer === 'top')
        .forEach((route) => {
          const isSelected = project.routes.indexOf(route) === selectedRoute;
          drawRoute(ctx, route.polyline, route.width, isSelected ? '#2196F3' : '#B87333');
          if (isSelected) drawRoutePoints(ctx, route.polyline);
        });
      ctx.globalAlpha = 1;
    }

    // Draw current route being drawn
    if (isDrawingRoute && currentRoutePoints.length > 0) {
      const color = activeLayer === 'top' ? '#ff0000' : '#ff6600';
      // In spline mode, show spline preview if we have enough points
      if (routingMode === 'spline' && currentRoutePoints.length >= 2) {
        const splinePoints = splineRoute(currentRoutePoints, 8);
        drawRoute(ctx, splinePoints, 5.0, color, activeLayer === 'bottom');
        // Also draw control points
        currentRoutePoints.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 3, 0, Math.PI * 2);
          ctx.fillStyle = '#9333ea';
          ctx.fill();
        });
      } else {
        drawRoute(ctx, currentRoutePoints, 5.0, color, activeLayer === 'bottom');
      }
    }

    // Draw auto-route start point indicator
    if (isAutoRouting && autoRouteStart) {
      ctx.beginPath();
      ctx.arc(autoRouteStart[0], autoRouteStart[1], 8, 0, Math.PI * 2);
      ctx.fillStyle = '#2196F3';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('START', autoRouteStart[0], autoRouteStart[1] - 12);
    }

    // Draw components
    if (visibility.components) {
      ctx.globalAlpha = opacity.components;
      project.components.forEach((component) => {
        drawComponent(
          ctx,
          component,
          component.id === selectedComponent,
          showComponentLabels,
          theme
        );
      });
      ctx.globalAlpha = 1;
    }

    // Draw vias / drill holes
    if (visibility.drillHoles) {
      project.vias.forEach((via) => {
        drawVia(ctx, via.pos, via.dia);
      });
    }

    // Draw DRC violation markers
    if (showDRCMarkers && violations.length > 0) {
      drawDRCMarkers(ctx, violations, zoom);
    }

    // Draw annotations
    if (visibility.annotations && project.annotations && project.annotations.length > 0) {
      drawAnnotations(ctx, project.annotations);
    }

    // Restore transform
    ctx.restore();
  }, [
    project,
    violations,
    isDrawingRoute,
    currentRoutePoints,
    isAutoRouting,
    autoRouteStart,
    zoom,
    pan,
    gridSize,
    activeLayer,
    routingMode,
    selectedComponent,
    selectedRoute,
    visibility,
    opacity,
    showDRCMarkers,
    showComponentLabels,
    theme,
    canvasSize,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const point: Vec2 = screenToWorld(screenX, screenY);

    // Auto-route mode
    if (isAutoRouting) {
      if (!autoRouteStart) {
        // First click: set start point
        setAutoRouteStart(point);
      } else {
        // Second click: run auto-route to end point
        const success = autoRoute(autoRouteStart, point);
        if (success) {
          setAutoRouting(false);
          showNotification('Route created successfully', 'success');
        } else {
          showNotification('No valid path found. Try a different route.', 'warning');
          setAutoRouteStart(null);
        }
      }
      return;
    }

    // Via placement mode
    if (isPlacingVia) {
      addVia({ pos: point, dia: 3.0, chamfer: 0.5 });
      setPlacingVia(false);
      return;
    }

    // Route drawing mode
    if (isDrawingRoute) {
      if (routingMode === 'manhattan' && currentRoutePoints.length > 0) {
        // Manhattan mode: auto-complete with L-shaped route
        const start = currentRoutePoints[currentRoutePoints.length - 1];
        const manhattanPoints = manhattanRoute(start, point);
        // Add intermediate points (skip first as it's already in currentRoutePoints)
        manhattanPoints.slice(1).forEach((p) => addRoutePoint(p));
        // Auto-finish after completing the route
        finishRoute();
      } else {
        addRoutePoint(point);
      }
      return;
    }

    // Component selection first
    const clicked = findComponentAt(project.components, point);
    if (clicked) {
      selectComponent(clicked.id);
      selectRoute(null);
      return;
    }

    // Route selection - check if click is near any route
    const clickedRouteIdx = findRouteAt(project.routes, point, 5);
    if (clickedRouteIdx !== null) {
      selectRoute(clickedRouteIdx);
      selectComponent(null);
      return;
    }

    // Clicked empty space - deselect all
    selectComponent(null);
    selectRoute(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Middle mouse or right mouse initiates panning
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart([screenX - pan[0], screenY - pan[1]]);
      return;
    }

    if (isDrawingRoute || isPlacingVia || isAutoRouting) return;

    const [worldX, worldY] = screenToWorld(screenX, screenY);
    const clicked = findComponentAt(project.components, [worldX, worldY]);
    if (clicked) {
      setDraggedComponent(clicked.id);
      setDragOffset([worldX - clicked.pos[0], worldY - clicked.pos[1]]);
      selectComponent(clicked.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Handle panning
    if (isPanning) {
      setPan([screenX - panStart[0], screenY - panStart[1]]);
      return;
    }

    if (!draggedComponent) return;

    const [worldX, worldY] = screenToWorld(screenX, screenY);
    let x = worldX - dragOffset[0];
    let y = worldY - dragOffset[1];

    if (snapEnabled) {
      x = snapToGrid(x);
      y = snapToGrid(y);
    }

    updateComponentPosition(draggedComponent, [x, y]);
  };

  const handleMouseUp = () => {
    setDraggedComponent(null);
    setIsPanning(false);
  };

  // Use native event listener for wheel to avoid passive event warning
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate new zoom level
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (1 + delta)));

      // Zoom towards mouse position
      const zoomRatio = newZoom / zoom;
      const newPanX = mouseX - (mouseX - pan[0]) * zoomRatio;
      const newPanY = mouseY - (mouseY - pan[1]) * zoomRatio;

      setZoom(newZoom);
      setPan([newPanX, newPanY]);
    };

    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelNative);
  }, [zoom, pan]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu on right-click (used for panning)
  };

  const resetView = useCallback(() => {
    setZoom(1);
    const [cx, cy] = calcBoardCenter(project.board.boundary);
    setPan([canvasSize.width / 2 - cx, canvasSize.height / 2 - cy]);
  }, [project.board.boundary, canvasSize]);

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data.type) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      let [x, y] = screenToWorld(screenX, screenY);

      if (snapEnabled) {
        x = snapToGrid(x);
        y = snapToGrid(y);
      }

      const footprint = getFootprint(data.type);
      const newComponent: Component = {
        id: `comp_${Date.now()}`,
        type: data.type,
        pos: [x, y],
        rotation: 0,
        pads: footprint?.pads.map((p, i) => ({ ...p, id: `pad_${i}` })) ?? [],
        holes: footprint?.holes ?? [],
      };

      addComponent(newComponent);
      selectComponent(newComponent.id);
    } catch {
      // Invalid drag data
    }
  };

  const findComponentAt = (components: Component[], point: Vec2): Component | null => {
    // Use footprint outline for hit detection, fall back to generous radius
    for (let i = components.length - 1; i >= 0; i--) {
      const comp = components[i];
      const footprint = getFootprint(comp.type);
      const dx = point[0] - comp.pos[0];
      const dy = point[1] - comp.pos[1];

      // Rotate point into component's local space
      const angle = (-comp.rotation * Math.PI) / 180;
      const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
      const localY = dx * Math.sin(angle) + dy * Math.cos(angle);

      if (footprint?.outline && footprint.outline.length > 0) {
        // Use bounding box of outline with padding
        const xs = footprint.outline.map((p) => p[0]);
        const ys = footprint.outline.map((p) => p[1]);
        const minX = Math.min(...xs) - 5;
        const maxX = Math.max(...xs) + 5;
        const minY = Math.min(...ys) - 5;
        const maxY = Math.max(...ys) + 5;
        if (localX >= minX && localX <= maxX && localY >= minY && localY <= maxY) {
          return comp;
        }
      } else {
        // Default: generous 20px radius for small components
        if (Math.sqrt(localX * localX + localY * localY) < 20) {
          return comp;
        }
      }
    }
    return null;
  };

  /** Find route index at point (uses distance to polyline segments). */
  const findRouteAt = (routes: Route[], point: Vec2, tolerance: number): number | null => {
    for (let rIdx = routes.length - 1; rIdx >= 0; rIdx--) {
      const route = routes[rIdx];
      for (let i = 0; i < route.polyline.length - 1; i++) {
        const p1 = route.polyline[i];
        const p2 = route.polyline[i + 1];
        const dist = pointToSegmentDistance(point, p1, p2);
        if (dist < route.width / 2 + tolerance / zoom) {
          return rIdx;
        }
      }
    }
    return null;
  };

  /** Distance from point to line segment. */
  const pointToSegmentDistance = (point: Vec2, p1: Vec2, p2: Vec2): number => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
      // Segment is a point
      return Math.sqrt((point[0] - p1[0]) ** 2 + (point[1] - p1[1]) ** 2);
    }

    // Project point onto segment
    let t = ((point[0] - p1[0]) * dx + (point[1] - p1[1]) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = p1[0] + t * dx;
    const projY = p1[1] + t * dy;

    return Math.sqrt((point[0] - projX) ** 2 + (point[1] - projY) ** 2);
  };

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (isDrawingRoute) return 'crosshair';
    if (isPlacingVia) return 'cell';
    if (isAutoRouting) return 'crosshair';
    if (draggedComponent) return 'grabbing';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}
    >
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(255,255,255,0.9)',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#333',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
          />
          Snap to Grid (G)
        </label>
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px' }}>Grid:</span>
          <select
            value={gridSizeIndex}
            onChange={(e) => setGridSizeIndex(Number(e.target.value))}
            style={{
              fontSize: '10px',
              padding: '1px 2px',
              border: '1px solid #ccc',
              borderRadius: '3px',
            }}
          >
            {GRID_SIZES.map((size, i) => (
              <option key={size} value={i}>
                {size}mm
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <button
            onClick={resetView}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              background: '#f5f5f5',
              color: 'gray',
            }}
          >
            Reset
          </button>
        </div>
        {selectedComponent && (
          <div style={{ marginTop: '4px', color: '#666' }}>R: Rotate | Del: Delete</div>
        )}
        <div style={{ marginTop: '4px', color: '#888', fontSize: '10px' }}>
          Scroll: Zoom | Right-drag: Pan
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        tabIndex={0}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          display: 'block',
          cursor: getCursor(),
          backgroundColor: theme === 'dark' ? '#252540' : '#fff',
          outline: 'none',
        }}
      />
    </div>
  );
};

const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  zoom: number,
  pan: Vec2,
  theme: 'light' | 'dark' = 'light'
) => {
  // Calculate visible area in world coordinates
  const startX = -pan[0] / zoom;
  const startY = -pan[1] / zoom;
  const endX = startX + width / zoom;
  const endY = startY + height / zoom;

  // Snap start to grid
  const gridStartX = Math.floor(startX / gridSize) * gridSize;
  const gridStartY = Math.floor(startY / gridSize) * gridSize;

  // Apply transform for drawing
  ctx.save();
  ctx.translate(pan[0], pan[1]);
  ctx.scale(zoom, zoom);

  // Theme-aware grid colors
  const minorColor = theme === 'dark' ? '#3a3a5a' : '#e8e8e8';
  const majorColor = theme === 'dark' ? '#4a4a6a' : '#cccccc';

  // Draw minor grid lines
  ctx.strokeStyle = minorColor;
  ctx.lineWidth = 0.5 / zoom;

  for (let x = gridStartX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, gridStartY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  for (let y = gridStartY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(gridStartX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }

  // Draw major grid lines (every 10 units or 5x the grid size, whichever is larger)
  const majorGridSize = Math.max(10, gridSize * 5);
  const majorStartX = Math.floor(startX / majorGridSize) * majorGridSize;
  const majorStartY = Math.floor(startY / majorGridSize) * majorGridSize;

  ctx.strokeStyle = majorColor;
  ctx.lineWidth = 1 / zoom;

  for (let x = majorStartX; x <= endX; x += majorGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, majorStartY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  for (let y = majorStartY; y <= endY; y += majorGridSize) {
    ctx.beginPath();
    ctx.moveTo(majorStartX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }

  ctx.restore();
};

const drawBoardBoundary = (
  ctx: CanvasRenderingContext2D,
  boundary: Vec2[],
  theme: 'light' | 'dark' = 'light'
) => {
  if (boundary.length === 0) return;

  ctx.strokeStyle = theme === 'dark' ? '#fff' : '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boundary[0][0], boundary[0][1]);

  for (let i = 1; i < boundary.length; i++) {
    ctx.lineTo(boundary[i][0], boundary[i][1]);
  }

  ctx.closePath();
  ctx.stroke();
};

const drawRoute = (
  ctx: CanvasRenderingContext2D,
  polyline: Vec2[],
  width: number,
  color = '#0066cc',
  dashed = false
) => {
  if (polyline.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (dashed) {
    ctx.setLineDash([8, 4]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  ctx.moveTo(polyline[0][0], polyline[0][1]);

  for (let i = 1; i < polyline.length; i++) {
    ctx.lineTo(polyline[i][0], polyline[i][1]);
  }

  ctx.stroke();
  ctx.setLineDash([]); // Reset
};

/** Draw route control points (for selected routes). */
const drawRoutePoints = (ctx: CanvasRenderingContext2D, polyline: Vec2[]) => {
  polyline.forEach((pt, idx) => {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 3, 0, Math.PI * 2);
    ctx.fillStyle = idx === 0 ? '#4caf50' : idx === polyline.length - 1 ? '#f44336' : '#2196F3';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
};

const drawComponent = (
  ctx: CanvasRenderingContext2D,
  component: Component,
  isSelected: boolean,
  showLabel = true,
  theme: 'light' | 'dark' = 'light'
) => {
  const { pos, type, rotation } = component;
  const footprint = getFootprint(type);
  const defaultStroke = theme === 'dark' ? '#ccc' : '#333';

  ctx.save();
  ctx.translate(pos[0], pos[1]);
  ctx.rotate((rotation * Math.PI) / 180);

  // Draw outline if footprint has one
  if (footprint?.outline && footprint.outline.length > 0) {
    ctx.strokeStyle = isSelected ? '#0066ff' : defaultStroke;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.fillStyle = isSelected ? 'rgba(0, 102, 255, 0.1)' : 'rgba(0, 170, 0, 0.15)';

    ctx.beginPath();
    ctx.moveTo(footprint.outline[0][0], footprint.outline[0][1]);
    for (let i = 1; i < footprint.outline.length; i++) {
      ctx.lineTo(footprint.outline[i][0], footprint.outline[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Default box for components without outline
    ctx.fillStyle = isSelected ? 'rgba(0, 102, 255, 0.2)' : 'rgba(0, 170, 0, 0.2)';
    ctx.strokeStyle = isSelected ? '#0066ff' : defaultStroke;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeRect(-8, -8, 16, 16);
  }

  // Draw pads
  if (footprint?.pads) {
    footprint.pads.forEach((pad) => {
      const radius = (pad.dia ?? pad.width ?? 2) / 2;
      ctx.fillStyle = '#b87333';
      ctx.beginPath();
      ctx.arc(pad.pos[0], pad.pos[1], radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  }

  // Draw holes
  if (footprint?.holes) {
    footprint.holes.forEach((hole) => {
      ctx.fillStyle = theme === 'dark' ? '#444' : '#222';
      ctx.beginPath();
      ctx.arc(hole.pos[0], hole.pos[1], hole.dia / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();

  // Draw label above component
  if (showLabel) {
    ctx.fillStyle = theme === 'dark' ? '#fff' : '#000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const label = footprint?.name?.split(' ')[0] || type;
    // Calculate top of component for label placement
    let labelY = pos[1];
    if (footprint?.outline && footprint.outline.length > 0) {
      const minY = Math.min(...footprint.outline.map((p) => p[1]));
      labelY = pos[1] + minY - 8; // Place label above outline
    } else {
      labelY = pos[1] - 12; // Default offset above
    }
    ctx.fillText(label, pos[0], labelY);
    ctx.textAlign = 'left'; // Reset text align
  }
};

/** Draw DRC violation markers on canvas */
const drawDRCMarkers = (
  ctx: CanvasRenderingContext2D,
  violations: DRCViolation[],
  zoom: number
) => {
  violations.forEach((violation) => {
    if (!violation.position) return;

    const [x, y] = violation.position;
    const radius = 8 / zoom;

    // Draw warning/error circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle =
      violation.severity === 'error' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(255, 152, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = violation.severity === 'error' ? '#f44336' : '#ff9800';
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();

    // Draw exclamation mark
    ctx.fillStyle = violation.severity === 'error' ? '#f44336' : '#ff9800';
    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', x, y);
  });
};

const drawVia = (ctx: CanvasRenderingContext2D, pos: Vec2, dia: number) => {
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.arc(pos[0], pos[1], dia / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
};

/** Draw annotations (text labels, designators, net labels, ref marks). */
const drawAnnotations = (ctx: CanvasRenderingContext2D, annotations: Annotation[]) => {
  annotations.forEach((ann) => {
    ctx.save();
    ctx.translate(ann.pos[0], ann.pos[1]);
    ctx.rotate(((ann.rotation || 0) * Math.PI) / 180);

    const fontSize = ann.fontSize || 3;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = ann.color || '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (ann.type) {
      case 'designator':
        // Blue text with slight background
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = ann.color || '#2563eb';
        ctx.fillText(ann.text, 0, 0);
        break;

      case 'netLabel':
        // Green label with box
        ctx.fillStyle = '#059669';
        const metrics = ctx.measureText(ann.text);
        const padding = 1;
        ctx.fillStyle = 'rgba(5, 150, 105, 0.1)';
        ctx.fillRect(
          -metrics.width / 2 - padding,
          -fontSize / 2 - padding,
          metrics.width + padding * 2,
          fontSize + padding * 2
        );
        ctx.fillStyle = '#059669';
        ctx.fillText(ann.text, 0, 0);
        break;

      case 'refMark':
        // Red reference mark with crosshair
        ctx.strokeStyle = ann.color || '#dc2626';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(3, 0);
        ctx.moveTo(0, -3);
        ctx.lineTo(0, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.stroke();
        if (ann.text) {
          ctx.fillStyle = ann.color || '#dc2626';
          ctx.fillText(ann.text, 0, -5);
        }
        break;

      case 'text':
      default:
        // Plain text annotation
        ctx.fillStyle = ann.color || '#333';
        ctx.fillText(ann.text, 0, 0);
        break;
    }

    ctx.restore();
  });
};

export default CanvasView;
