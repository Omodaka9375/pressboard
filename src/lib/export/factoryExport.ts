import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { exportSTL } from './stlExport';
import { exportLidSTL } from './lidExport';
import { exportTapeMasksAsSVG, exportTapeMasksAsDXF } from './tapeExport';
import type { Project, Enclosure } from '../../types';
import { getFootprint } from '../../data/footprints';

/**
 * Export complete factory production package as ZIP.
 * Includes: STL, SVG masks, DXF masks, BOM, assembly guide PDF, optional lid STL
 */
export const exportFactoryPackage = async (
  project: Project,
  enclosure?: Enclosure
): Promise<void> => {
  const zip = new JSZip();
  const projectName = project.name.replace(/\s+/g, '_');

  // 1. STL file for 3D printing (board)
  const stlBlob = exportSTL(project);
  zip.file(`${projectName}_board.stl`, stlBlob);

  // 2. Lid STL if enclosure is enabled
  if (enclosure?.enabled) {
    const lidBlob = exportLidSTL(enclosure, project.board.boundary);
    zip.file(`${projectName}_lid.stl`, lidBlob);
  }

  // 3. SVG tape masks
  const svg = exportTapeMasksAsSVG(project);
  zip.file(`${projectName}_tape_masks.svg`, svg);

  // 4. DXF tape masks
  const dxf = exportTapeMasksAsDXF(project);
  zip.file(`${projectName}_tape_masks.dxf`, dxf);

  // 5. Bill of Materials (CSV)
  const bom = generateBOM(project, enclosure);
  zip.file(`${projectName}_BOM.csv`, bom);

  // 6. Assembly guide (PDF)
  const pdfBlob = generateAssemblyGuidePDF(project, enclosure);
  zip.file(`${projectName}_assembly_guide.pdf`, pdfBlob);

  // 7. Project JSON (for backup/sharing)
  const projectJson = JSON.stringify(project, null, 2);
  zip.file(`${projectName}.json`, projectJson);

  // 8. README with production notes
  const readme = generateReadme(project, enclosure);
  zip.file('README.txt', readme);

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${projectName}_factory_package.zip`);
};

/** Generate Bill of Materials as CSV. */
const generateBOM = (project: Project, enclosure?: Enclosure): string => {
  const lines: string[] = ['Quantity,Type,Description,Footprint'];

  // Group components by type
  const grouped = new Map<string, number>();
  project.components.forEach((c) => {
    grouped.set(c.type, (grouped.get(c.type) || 0) + 1);
  });

  grouped.forEach((qty, type) => {
    const fp = getFootprint(type);
    const name = fp?.name || type;
    const desc = fp?.name || type;
    lines.push(`${qty},"${type}","${desc}","${name}"`);
  });

  // Add copper tape requirements
  const tapeWidths = new Map<number, number>();
  project.routes.forEach((route) => {
    const length = calculateRouteLength(route.polyline);
    tapeWidths.set(route.width, (tapeWidths.get(route.width) || 0) + length);
  });

  lines.push('');
  lines.push('# Copper Tape Requirements');
  lines.push('Width (mm),Length (mm),Notes');
  tapeWidths.forEach((length, width) => {
    lines.push(`${width},${Math.ceil(length * 1.1)},"Includes 10% margin"`);
  });

  // Add enclosure materials if enabled
  if (enclosure?.enabled) {
    lines.push('');
    lines.push('# Enclosure Materials');
    lines.push('Item,Quantity,Notes');
    lines.push(`"Lid (3D printed)",1,"${enclosure.lidHeight}mm height"`);

    if (enclosure.magnetPlacements.length > 0) {
      const magnetGroups = new Map<string, number>();
      enclosure.magnetPlacements.forEach((m) => {
        const key = `${m.diameter}mm x ${m.thickness}mm`;
        magnetGroups.set(key, (magnetGroups.get(key) || 0) + 2); // x2 for lid
      });
      magnetGroups.forEach((qty, size) => {
        lines.push(`"Magnets ${size}",${qty},"Board + Lid (matching polarity)"`);
      });
    }
  }

  return lines.join('\n');
};

/** Generate assembly guide as PDF blob. */
const generateAssemblyGuidePDF = (project: Project, enclosure?: Enclosure): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Assembly Guide: ${project.name}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Project info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Board: ${project.board.shape} (${getBoardDimensions(project)})`, 20, y);
  y += 7;
  doc.text(`Thickness: ${project.board.thickness}mm`, 20, y);
  y += 7;
  doc.text(`Components: ${project.components.length}`, 20, y);
  y += 7;
  doc.text(`Routes: ${project.routes.length}`, 20, y);
  y += 7;
  doc.text(`Vias: ${project.vias.length}`, 20, y);
  y += 7;
  if (enclosure?.enabled) {
    doc.text(`Enclosure: Yes (lid height: ${enclosure.lidHeight}mm)`, 20, y);
    y += 7;
  }
  y += 8;

  // Materials
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Materials Included in Package', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const files = [
    `${project.name.replace(/\s+/g, '_')}_board.stl - 3D printable board`,
    ...(enclosure?.enabled ? [`${project.name.replace(/\s+/g, '_')}_lid.stl - Enclosure lid`] : []),
    `${project.name.replace(/\s+/g, '_')}_tape_masks.svg - Tape cutting guide`,
    `${project.name.replace(/\s+/g, '_')}_tape_masks.dxf - CAD cutting file`,
    `${project.name.replace(/\s+/g, '_')}_BOM.csv - Bill of materials`,
  ];
  files.forEach((f) => {
    doc.text(`• ${f}`, 25, y);
    y += 6;
  });
  y += 10;

  // Steps
  let stepNum = 1;

  y = addStep(doc, y, stepNum++, 'Print the Board', [
    'Load board STL into slicer (Cura, PrusaSlicer)',
    'Use PLA or PETG, 0.2mm layer height',
    'Print channel-side up, no supports needed',
  ]);

  if (enclosure?.enabled) {
    y = addStep(doc, y, stepNum++, 'Print the Lid', [
      'Load lid STL into slicer',
      'Print open-side down for best surface',
      'Same material as board for consistent fit',
    ]);
  }

  y = addStep(doc, y, stepNum++, 'Cut Copper Tape', [
    'Use SVG/DXF mask as cutting template',
    'Refer to BOM for tape lengths',
  ]);

  y = addStep(doc, y, stepNum++, 'Apply Tape & Components', [
    'Press tape into channels firmly',
    'Insert components through holes',
    'Solder connections',
  ]);

  if (enclosure?.enabled && enclosure.magnetPlacements.length > 0) {
    y = addStep(doc, y, stepNum++, 'Install Magnets', [
      '⚠️ IMPORTANT: Check polarity before gluing!',
      'Board magnets: Insert with marked polarity facing UP',
      'Lid magnets: Insert with OPPOSITE polarity facing DOWN',
      'Use CA glue or epoxy to secure magnets',
    ]);
  }

  y = addStep(doc, y, stepNum++, 'Test', [
    'Check continuity with multimeter',
    'Verify no shorts between traces',
  ]);

  if (enclosure?.enabled) {
    y = addStep(doc, y, stepNum++, 'Final Assembly', [
      'Place lid over board - magnets should snap together',
      'Pressure pads will hold components in place',
      'Check all connections still work after assembly',
    ]);
  }

  // Component table
  if (project.components.length > 0 && y < 200) {
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Component Placement', 20, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Ref', 20, y);
    doc.text('Type', 40, y);
    doc.text('X', 100, y);
    doc.text('Y', 120, y);
    doc.text('Rot', 140, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    project.components.slice(0, 15).forEach((comp, i) => {
      doc.text(`C${i + 1}`, 20, y);
      doc.text(comp.type.substring(0, 20), 40, y);
      doc.text(`${Math.round(comp.pos[0])}`, 100, y);
      doc.text(`${Math.round(comp.pos[1])}`, 120, y);
      doc.text(`${comp.rotation}°`, 140, y);
      y += 5;
    });
  }

  return doc.output('blob');
};

/** Generate README with production notes. */
const generateReadme = (project: Project, enclosure?: Enclosure): string => {
  const pn = project.name.replace(/\s+/g, '_');
  const lines = [
    `PressBoard Factory Package: ${project.name}`,
    '='.repeat(50),
    '',
    'Package Contents:',
    '-----------------',
    `• ${pn}_board.stl - 3D printable board substrate`,
    ...(enclosure?.enabled ? [`• ${pn}_lid.stl - Press-fit enclosure lid`] : []),
    `• ${pn}_tape_masks.svg - Vector cutting guide`,
    `• ${pn}_tape_masks.dxf - CAD format cutting guide`,
    `• ${pn}_BOM.csv - Bill of materials`,
    `• ${pn}_assembly_guide.pdf - Step-by-step instructions`,
    `• ${pn}.json - Project backup file`,
    '',
    'Board Specifications:',
    '---------------------',
    `Shape: ${project.board.shape}`,
    `Dimensions: ${getBoardDimensions(project)}`,
    `Thickness: ${project.board.thickness}mm`,
  ];

  if (enclosure?.enabled) {
    lines.push(
      '',
      'Enclosure Specifications:',
      '-------------------------',
      `Lid Height: ${enclosure.lidHeight}mm`,
      `Wall Thickness: ${enclosure.wallThickness}mm`,
      `Corner Radius: ${enclosure.cornerRadius}mm`,
      `Magnets: ${enclosure.magnetPlacements.length}`,
      `Pressure Pads: ${enclosure.pressurePads.length}`
    );
  }

  lines.push(
    '',
    'Bill of Materials Summary:',
    '--------------------------',
    `Components: ${project.components.length}`,
    `Copper tape routes: ${project.routes.length}`,
    `Layer jumps (vias): ${project.vias.length}`,
    '',
    'Production Steps:',
    '-----------------',
    '1. 3D print the board STL file (PLA/PETG, 0.2mm layers)'
  );

  if (enclosure?.enabled) {
    lines.push('2. 3D print the lid STL file (same material)');
  }

  lines.push(
    `${enclosure?.enabled ? '3' : '2'}. Cut copper tape using SVG/DXF masks`,
    `${enclosure?.enabled ? '4' : '3'}. Apply copper tape to channels on printed board`,
    `${enclosure?.enabled ? '5' : '4'}. Insert and solder components`
  );

  if (enclosure?.enabled && enclosure.magnetPlacements.length > 0) {
    lines.push(
      '6. Install magnets with correct polarity (CRITICAL!)',
      '   - Board: polarity marker facing UP',
      '   - Lid: OPPOSITE polarity facing DOWN'
    );
  }

  lines.push(`${enclosure?.enabled ? '7' : '5'}. Test all connections with multimeter`);

  if (enclosure?.enabled) {
    lines.push('8. Attach lid - magnets should snap securely');
  }

  lines.push('', 'Generated by PressBoard - https://pressboard.app');

  return lines.join('\n');
};

const getBoardDimensions = (project: Project): string => {
  const bounds = project.board.boundary;
  if (bounds.length < 3) return 'Unknown';
  const xs = bounds.map((p) => p[0]);
  const ys = bounds.map((p) => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return `${Math.round(width)}mm × ${Math.round(height)}mm`;
};

const calculateRouteLength = (polyline: [number, number][]): number => {
  let length = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dx = polyline[i + 1][0] - polyline[i][0];
    const dy = polyline[i + 1][1] - polyline[i][1];
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

const addStep = (doc: jsPDF, y: number, num: number, title: string, items: string[]): number => {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Step ${num}: ${title}`, 20, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    doc.text(`• ${item}`, 25, y);
    y += 5;
  });
  return y + 5;
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
