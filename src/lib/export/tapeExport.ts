import makerjs from 'makerjs';
import type { Project, Route, Vec2 } from '../../types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generate tape mask drawings for each net
 */
export const generateTapeMasks = (project: Project): Record<string, any> => {
  const masks: Record<string, any> = {};

  for (let i = 0; i < project.routes.length; i++) {
    const route = project.routes[i];
    const netName = route.net || `NET_${i + 1}`;

    masks[netName] = createRouteMask(route, i + 1);
  }

  return masks;
};

/**
 * Create mask drawing for a single route
 */
const createRouteMask = (route: Route, index: number): any => {
  const model: any = {
    models: {},
    paths: {},
  };

  // Create polyline path
  const points = route.polyline.map((p) => [p[0], p[1]]);
  model.paths.centerline = new makerjs.paths.Line(points[0], points[points.length - 1]);

  // Create outline with tape width offset
  const offset = route.width / 2;

  for (let i = 0; i < route.polyline.length - 1; i++) {
    const p1 = route.polyline[i];
    const p2 = route.polyline[i + 1];

    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) continue;

    // Perpendicular vector
    const px = (-dy / len) * offset;
    const py = (dx / len) * offset;

    // Segment edges
    const edge1: [Vec2, Vec2] = [
      [p1[0] + px, p1[1] + py],
      [p2[0] + px, p2[1] + py],
    ];
    const edge2: [Vec2, Vec2] = [
      [p1[0] - px, p1[1] - py],
      [p2[0] - px, p2[1] - py],
    ];

    model.paths[`edge1_${i}`] = new makerjs.paths.Line(edge1[0], edge1[1]);
    model.paths[`edge2_${i}`] = new makerjs.paths.Line(edge2[0], edge2[1]);
  }

  // Add label text position
  model.caption = {
    text: route.net || `Route ${index}`,
    anchor: route.polyline[0],
  };

  return model;
};

/**
 * Export all tape masks as SVG
 */
export const exportTapeMasksAsSVG = (project: Project): string => {
  const boardBounds = project.board.boundary;
  if (boardBounds.length < 3) {
    return '<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20">No board defined</text></svg>';
  }

  const [minX, minY, maxX, maxY] = getBounds(boardBounds);
  const combinedModel: any = {
    models: {},
    paths: {},
  };

  // Add board outline
  combinedModel.paths.boardOutline = createBoardOutline(boardBounds);

  // Add alignment markers
  combinedModel.models.alignmentMarkers = {
    paths: {
      marker1: new makerjs.paths.Circle([minX + 5, minY + 5], 2),
      marker2: new makerjs.paths.Circle([maxX - 5, minY + 5], 2),
      marker3: new makerjs.paths.Circle([minX + 5, maxY - 5], 2),
      marker4: new makerjs.paths.Circle([maxX - 5, maxY - 5], 2),
    },
  };

  // Add scale bar
  const scaleBarLength = 10;
  combinedModel.models.scaleBar = {
    paths: {
      line: new makerjs.paths.Line([minX, maxY + 10], [minX + scaleBarLength, maxY + 10]),
    },
  };

  // Add route masks only if there are routes
  if (project.routes.length > 0) {
    const masks = generateTapeMasks(project);
    Object.entries(masks).forEach(([netName, mask]) => {
      combinedModel.models[netName] = mask;
    });
  }

  // Convert to SVG
  const svg = makerjs.exporter.toSVG(combinedModel, {
    units: makerjs.unitType.Millimeter,
    strokeWidth: '0.1mm',
    fontSize: '3mm',
    useSvgPathOnly: false,
  });

  return svg;
};

/**
 * Export all tape masks as DXF
 */
export const exportTapeMasksAsDXF = (project: Project): string => {
  const boardBounds = project.board.boundary;
  const combinedModel: any = {
    models: {},
    paths: {},
  };

  // Add board outline if defined
  if (boardBounds.length >= 3) {
    combinedModel.paths.boardOutline = createBoardOutline(boardBounds);
  }

  // Add route masks only if there are routes
  if (project.routes.length > 0) {
    const masks = generateTapeMasks(project);
    Object.entries(masks).forEach(([netName, mask]) => {
      combinedModel.models[netName] = mask;
    });
  }

  // Convert to DXF
  const dxf = makerjs.exporter.toDXF(combinedModel, {
    units: makerjs.unitType.Millimeter,
  });

  return dxf;
};

/**
 * Download tape masks as SVG
 */
export const downloadTapeMasksSVG = (project: Project): void => {
  const svg = exportTapeMasksAsSVG(project);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_')}_tape_masks.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download tape masks as DXF
 */
export const downloadTapeMasksDXF = (project: Project): void => {
  const dxf = exportTapeMasksAsDXF(project);
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_')}_tape_masks.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get bounding box of points
 */
const getBounds = (points: Vec2[]): [number, number, number, number] => {
  if (points.length === 0) return [0, 0, 100, 100];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return [minX, minY, maxX, maxY];
};

/** Create board outline path from boundary points. */
const createBoardOutline = (boundary: Vec2[]): any => {
  if (boundary.length < 2) return null;
  // Create a closed polyline for the board
  const points = boundary.map((p) => [p[0], p[1]]);
  points.push([boundary[0][0], boundary[0][1]]); // Close the path

  const model: any = { paths: {} };
  for (let i = 0; i < points.length - 1; i++) {
    model.paths[`seg${i}`] = new makerjs.paths.Line(points[i], points[i + 1]);
  }
  return model;
};
