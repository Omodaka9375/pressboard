import { jsPDF } from 'jspdf';
import type { Project, Component, Route } from '../../types';
import { getFootprint } from '../../data/footprints';

/**
 * Generate assembly guide PDF with step-by-step instructions
 */
export const generateAssemblyGuide = (project: Project): void => {
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
  y += 15;

  // Materials needed
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Materials Needed', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const materials = getMaterialsList(project);
  materials.forEach((material) => {
    doc.text(`• ${material}`, 25, y);
    y += 6;
  });
  y += 10;

  // Step 1: 3D Print the Board
  y = addStep(doc, y, 1, 'Print the Board', [
    'Export the STL file from DIYPCB Designer',
    'Load into your slicer software (Cura, PrusaSlicer, etc.)',
    `Set layer height to ${project.rules.layerHeight}mm for best results`,
    'Use PLA or PETG filament',
    'Print with the channel side facing up',
    'No supports needed for channels',
  ]);

  // Step 2: Prepare Copper Tape
  y = addStep(doc, y, 2, 'Prepare Copper Tape', [
    'Export SVG tape mask from DIYPCB Designer',
    'Print mask at 100% scale on paper',
    'Cut copper tape strips to match mask lengths',
    'Pre-tin tape ends if soldering components directly',
  ]);

  // Step 3: Apply Copper Tape Routes
  y = addStep(doc, y, 3, 'Apply Copper Tape Routes', getRouteInstructions(project.routes));

  // Check if we need a new page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Step 4: Place Components
  y = addStep(doc, y, 4, 'Place Components', getComponentInstructions(project.components));

  // Check if we need a new page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Step 5: Connect Vias (if any)
  if (project.vias.length > 0) {
    y = addStep(doc, y, 5, 'Connect Vias', [
      `Install ${project.vias.length} via connection(s)`,
      'Thread wire or use conductive paste through via holes',
      'Ensure good contact on both sides',
      'Test continuity with multimeter',
    ]);
  }

  // Step 6: Testing
  const testStep = project.vias.length > 0 ? 6 : 5;
  y = addStep(doc, y, testStep, 'Testing', [
    'Visual inspection of all connections',
    'Check for shorts between adjacent traces',
    'Test continuity of each route',
    'Verify component orientation',
    'Power on and test functionality',
  ]);

  // Component reference table
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  y = addComponentTable(doc, y, project.components);

  // Save PDF
  doc.save(`${project.name.replace(/\s+/g, '_')}_assembly_guide.pdf`);
};

const getBoardDimensions = (project: Project): string => {
  const bounds = project.board.boundary;
  if (bounds.length < 3) return 'Unknown';

  const width = Math.abs(bounds[2][0] - bounds[0][0]);
  const height = Math.abs(bounds[2][1] - bounds[0][1]);
  return `${width}mm × ${height}mm`;
};

const getMaterialsList = (project: Project): string[] => {
  const materials: string[] = ['3D printed board substrate'];

  // Get unique tape widths used
  const tapeWidths = new Set<number>();
  project.routes.forEach((r) => tapeWidths.add(r.width));
  tapeWidths.forEach((w) => materials.push(`${w}mm copper tape`));

  // Component types
  const componentTypes = new Set<string>();
  project.components.forEach((c) => {
    const fp = getFootprint(c.type);
    componentTypes.add(fp?.name || c.type);
  });
  componentTypes.forEach((t) => materials.push(t));

  // Additional materials
  materials.push('Soldering iron and solder');
  materials.push('Multimeter for testing');
  if (project.vias.length > 0) {
    materials.push('Wire or conductive paste for vias');
  }

  return materials;
};

const getRouteInstructions = (routes: Route[]): string[] => {
  if (routes.length === 0) return ['No routes defined'];

  const instructions: string[] = [];
  routes.forEach((route, i) => {
    const length = calculateRouteLength(route.polyline);
    instructions.push(
      `Route ${i + 1}: ${route.width}mm tape, ${route.profile}-channel, ~${Math.round(length)}mm length`
    );
  });

  instructions.push('Press tape firmly into channels');
  instructions.push('Ensure tape is flat with no air bubbles');
  instructions.push('Overlap connections by 2-3mm for good contact');

  return instructions;
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

const getComponentInstructions = (components: Component[]): string[] => {
  if (components.length === 0) return ['No components defined'];

  const instructions: string[] = [];
  const grouped = new Map<string, number>();

  components.forEach((c) => {
    grouped.set(c.type, (grouped.get(c.type) || 0) + 1);
  });

  grouped.forEach((count, type) => {
    const fp = getFootprint(type);
    const name = fp?.name || type;
    instructions.push(`${count}× ${name}`);
  });

  instructions.push('Insert component leads through holes');
  instructions.push('Bend leads slightly to hold in place');
  instructions.push('Solder to copper tape pads');
  instructions.push('Trim excess leads');

  return instructions;
};

const addStep = (
  doc: jsPDF,
  y: number,
  stepNum: number,
  title: string,
  items: string[]
): number => {
  // Check if we need a new page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Step ${stepNum}: ${title}`, 20, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  items.forEach((item) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(`• ${item}`, 25, y);
    y += 5;
  });

  return y + 8;
};

const addComponentTable = (doc: jsPDF, y: number, components: Component[]): number => {
  if (components.length === 0) return y;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Component Reference', 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ID', 20, y);
  doc.text('Type', 50, y);
  doc.text('Position', 120, y);
  doc.text('Rotation', 165, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  components.forEach((comp, i) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(`C${i + 1}`, 20, y);
    doc.text(comp.type, 50, y);
    doc.text(`(${Math.round(comp.pos[0])}, ${Math.round(comp.pos[1])})`, 120, y);
    doc.text(`${comp.rotation}°`, 165, y);
    y += 5;
  });

  return y;
};
