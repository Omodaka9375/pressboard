import { useState } from 'react';

type HelpDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TabId = 'tools' | 'workflow' | 'enclosure' | 'tutorial' | 'shortcuts';

const HelpDialog = ({ isOpen, onClose }: HelpDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('tools');

  if (!isOpen) return null;

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>📖 PressBoard Help</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="help-tabs">
          <button
            className={`help-tab ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            🛠️ Tools
          </button>
          <button
            className={`help-tab ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            📋 Workflow
          </button>
          <button
            className={`help-tab ${activeTab === 'enclosure' ? 'active' : ''}`}
            onClick={() => setActiveTab('enclosure')}
          >
            🏠 Enclosure
          </button>
          <button
            className={`help-tab ${activeTab === 'tutorial' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutorial')}
          >
            🎓 Tutorial
          </button>
          <button
            className={`help-tab ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            ⌨️ Shortcuts
          </button>
        </div>

        <div className="help-content">
          {activeTab === 'tools' && <ToolsGuide />}
          {activeTab === 'workflow' && <WorkflowGuide />}
          {activeTab === 'enclosure' && <EnclosureGuide />}
          {activeTab === 'tutorial' && <TutorialGuide />}
          {activeTab === 'shortcuts' && <ShortcutsGuide />}
        </div>

        <style>{`
          .help-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
          }

          .help-dialog {
            background: var(--bg-primary);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            width: 700px;
            max-width: 90vw;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
          }

          .help-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
          }

          .help-header h2 {
            margin: 0;
            font-size: 18px;
            color: var(--text-primary);
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 4px 8px;
            border-radius: 4px;
          }

          .close-btn:hover {
            background: var(--btn-hover);
          }

          .help-tabs {
            display: flex;
            gap: 4px;
            padding: 12px 20px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-sidebar);
          }

          .help-tab {
            padding: 8px 16px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
          }

          .help-tab:hover {
            background: var(--btn-hover);
          }

          .help-tab.active {
            background: var(--accent-color, #2196F3);
            color: white;
          }

          .help-content {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
            color: var(--text-primary);
          }

          .help-content h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
          }

          .help-content h4 {
            margin: 16px 0 8px 0;
            font-size: 14px;
            color: var(--accent-color, #2196F3);
          }

          .help-content p {
            margin: 0 0 12px 0;
            line-height: 1.6;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .help-content ul {
            margin: 0 0 16px 0;
            padding-left: 20px;
          }

          .help-content li {
            margin-bottom: 6px;
            line-height: 1.5;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .tool-item {
            background: var(--bg-sidebar);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
          }

          .tool-item .tool-name {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .tool-item .tool-desc {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0;
          }

          .step-box {
            background: var(--bg-sidebar);
            border-left: 3px solid var(--accent-color, #2196F3);
            padding: 12px 16px;
            margin-bottom: 12px;
            border-radius: 0 8px 8px 0;
          }

          .step-box .step-num {
            font-weight: 700;
            color: var(--accent-color, #2196F3);
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .step-box .step-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 6px;
          }

          .step-box p {
            margin: 0;
          }

          .highlight-box {
            background: rgba(33, 150, 243, 0.1);
            border: 1px solid rgba(33, 150, 243, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            margin: 16px 0;
          }

          .highlight-box h4 {
            margin-top: 0;
            color: #2196F3;
          }

          .shortcut-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
          }

          .shortcut-key {
            background: var(--bg-sidebar);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
          }
        `}</style>
      </div>
    </div>
  );
};

const ToolsGuide = () => (
  <div>
    <h3>Drawing Tools</h3>

    <div className="tool-item">
      <div className="tool-name">✏️ Draw Trace</div>
      <p className="tool-desc">
        Freeform trace drawing. Click to add points one by one, creating a custom path for copper
        tape. Click <strong>Finish</strong> when done. Best for complex, non-standard routes.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">📐 L-Trace</div>
      <p className="tool-desc">
        Creates 90° angled traces automatically. Click the start point, then click the end point —
        the tool automatically creates an L-shaped path with right angles. Ideal for clean,
        Manhattan-style routing between components.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">〰️ Curve</div>
      <p className="tool-desc">
        Creates smooth curved traces using spline interpolation. Click to add control points that
        the curve passes through. Click <strong>Finish</strong> when done. Perfect for organic
        layouts or avoiding obstacles gracefully.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">🔀 Smart Path</div>
      <p className="tool-desc">
        Automatic pathfinding between two points. Click start, then click end — the algorithm finds
        an obstacle-free route automatically. Uses A* pathfinding to avoid existing traces and
        components.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">⚫ Layer Jump (Via)</div>
      <p className="tool-desc">
        Adds a hole to connect top and bottom copper layers. Click to place a via where traces on
        different layers need to connect. The 3D printed board will have a hole at this location for
        a wire or rivet to pass through.
      </p>
    </div>

    <h3>Route Settings</h3>

    <div className="tool-item">
      <div className="tool-name">⬆️ Top / ⬇️ Bottom Layer</div>
      <p className="tool-desc">
        Select which layer you're routing on. Top layer traces appear as solid copper color, bottom
        layer as dashed lines. Use both layers with vias for complex boards.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">Tape Width (3-8mm)</div>
      <p className="tool-desc">
        Sets the width of copper tape for new traces. Standard copper tape comes in 3mm, 5mm, 6mm,
        and 8mm widths. Wider tape carries more current but takes more space.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">Channel Profile (U / V / Flat)</div>
      <p className="tool-desc">
        <strong>U-Shape:</strong> Deep channel that holds tape securely. Best for permanent
        assemblies.
        <br />
        <strong>V-Shape:</strong> Shallow groove for easy tape removal. Good for prototyping.
        <br />
        <strong>Flat:</strong> Surface-level channel for press-fit assemblies.
      </p>
    </div>

    <h3>Other Tools</h3>

    <div className="tool-item">
      <div className="tool-name">🔍 Check Design (DRC)</div>
      <p className="tool-desc">
        Runs Design Rule Checks to find errors like traces too close together, unconnected pads, or
        traces outside the board boundary. Fix issues before exporting.
      </p>
    </div>
  </div>
);

const WorkflowGuide = () => (
  <div>
    <h3>Basic Workflow</h3>

    <div className="step-box">
      <div className="step-num">Step 1</div>
      <div className="step-title">Set Up Your Board</div>
      <p>
        Start with board settings (click the board boundary in Inspector). Choose board shape
        (rectangle, circle, or custom), set dimensions, and thickness (typically 2-4mm for PLA
        prints).
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 2</div>
      <div className="step-title">Place Components</div>
      <p>
        Drag components from the Component Library on the left onto your board. Click to select,
        press <strong>R</strong> to rotate 90°, drag to reposition. Press <strong>Delete</strong> to
        remove.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 3</div>
      <div className="step-title">Route Traces</div>
      <p>
        Connect component pads with copper tape traces. Use <strong>L-Trace</strong> for most
        connections, <strong>Curve</strong> for organic routes, or <strong>Smart Path</strong> for
        auto-routing.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 4</div>
      <div className="step-title">Add Layer Jumps (if needed)</div>
      <p>
        If traces need to cross, use the <strong>Layer Jump</strong> tool to add vias. Route one
        trace on the top layer, the other on bottom, and connect them through vias.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 5</div>
      <div className="step-title">Check Design</div>
      <p>
        Click <strong>Check Design</strong> to run DRC. Fix any errors shown (traces too close,
        unconnected nets, etc.). Green check means you're ready to export.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 6</div>
      <div className="step-title">Export & Manufacture</div>
      <p>
        Use <strong>File → Export Factory Package</strong> to get a ZIP with everything needed: STL
        for 3D printing, SVG/DXF for tape cutting, BOM, and assembly guide.
      </p>
    </div>

    <h3>Manufacturing Tips</h3>
    <ul>
      <li>Print STL with 0.2mm layer height in PLA or PETG</li>
      <li>Print channel-side up, no supports needed</li>
      <li>Cut copper tape using the SVG mask as a template</li>
      <li>Press tape firmly into channels — no air bubbles</li>
      <li>Pre-tin tape ends if soldering components</li>
      <li>Test continuity with multimeter before powering on</li>
    </ul>
  </div>
);

const EnclosureGuide = () => (
  <div>
    <h3>🏠 Enclosure / Lid Designer</h3>
    <p>
      The Lid Designer creates a press-fit enclosure that snaps onto your PCB using magnets. The lid
      has pressure pads that push components down onto copper tape pads —{' '}
      <strong>no soldering required</strong>.
    </p>

    <div className="highlight-box">
      <h4>💡 How It Works</h4>
      <p>
        When enabled, PressBoard automatically generates a lid with raised bosses (pressure pads)
        positioned over each component. When the lid snaps closed via magnets, these pads press
        components firmly onto their copper tape pads, making electrical contact.
      </p>
    </div>

    <h4>Accessing the Lid Designer</h4>
    <p>
      Find the <strong>Enclosure / Lid</strong> panel in the right sidebar. Toggle it{' '}
      <strong>On</strong> to enable enclosure generation. All settings update the 3D preview in
      real-time.
    </p>

    <h4>Settings Explained</h4>

    <div className="tool-item">
      <div className="tool-name">📐 Wall Thickness (1-4mm)</div>
      <p className="tool-desc">
        Thickness of the lid walls. 2mm is good for PLA, use 2.5-3mm for added strength. Thicker
        walls are more rigid but use more material.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">📏 Lid Height (auto-calculated)</div>
      <p className="tool-desc">
        Total height of the lid from base to top. Auto-calculated based on your tallest component
        plus clearance. You can manually adjust if needed.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">🔄 Corner Radius (0-10mm)</div>
      <p className="tool-desc">
        Rounds the corners of the lid. 0 = sharp corners, 3-5mm = comfortable rounded edges. Affects
        both appearance and ergonomics.
      </p>
    </div>

    <div className="tool-item">
      <div className="tool-name">📦 Component Clearance (1-10mm)</div>
      <p className="tool-desc">
        Extra space above the tallest component. 2-3mm is usually enough. Increase if components
        have wires or need adjustment room.
      </p>
    </div>

    <h4>Ventilation Options</h4>
    <p>
      Enable ventilation to add air holes for heat dissipation. Choose pattern (slots, honeycomb,
      grid) and position (top, sides, or both).
    </p>

    <h4>🧲 Magnets</h4>
    <p>
      When you place magnet footprints on your board, they appear in the Magnets section. Click each
      magnet to toggle its polarity between <strong style={{ color: '#e53935' }}>N (North)</strong>{' '}
      and <strong style={{ color: '#1e88e5' }}>S (South)</strong>.
    </p>

    <div className="highlight-box">
      <h4>⚠️ Critical: Magnet Polarity</h4>
      <p>
        The lid automatically uses <strong>opposite polarity</strong> for its magnet recesses. If
        your board magnet is N-up, the lid recess expects S-down. This makes them attract and snap
        together.
      </p>
      <ul>
        <li>Mark your magnets before inserting (use a marker on the N side)</li>
        <li>Board magnets: polarity marker facing UP</li>
        <li>Lid magnets: OPPOSITE polarity facing DOWN</li>
        <li>Test attraction before gluing!</li>
      </ul>
    </div>

    <h4>⬇️ Pressure Pads</h4>
    <p>
      Automatically generated for each non-magnet component. The pad height is calculated so it
      presses the component down when the lid closes. Taller components get shorter pads.
    </p>

    <h4>🔌 Connector Cutouts</h4>
    <p>
      USB, barrel jack, and audio connectors are auto-detected. The lid will have cutouts on the
      appropriate wall so cables can connect while enclosed.
    </p>

    <h4>3D Preview</h4>
    <p>
      Toggle <strong>"Show lid in 3D preview"</strong> to see the lid floating above your board.
      Enable <strong>Exploded View</strong> in the 3D tab to see all layers separated.
    </p>

    <h4>Exporting</h4>
    <p>
      When you use <strong>File → Export Factory Package</strong> with enclosure enabled:
    </p>
    <ul>
      <li>
        <strong>board.stl</strong> — Your PCB substrate (print first)
      </li>
      <li>
        <strong>lid.stl</strong> — The enclosure lid with pressure pads and magnet recesses
      </li>
      <li>BOM includes magnet quantities (board + lid = 2× per position)</li>
      <li>Assembly guide includes magnet polarity instructions</li>
    </ul>

    <h4>Printing Tips</h4>
    <ul>
      <li>Print lid with open side DOWN for best top surface</li>
      <li>Use same material as board for consistent fit</li>
      <li>0.2mm layer height, 20% infill minimum</li>
      <li>Pressure pads print as part of the lid — no supports needed</li>
      <li>Test fit before inserting magnets</li>
    </ul>

    <div className="highlight-box">
      <h4>🔧 Troubleshooting</h4>
      <ul>
        <li>
          <strong>Lid too tight:</strong> Increase snap-fit tolerance in advanced settings
        </li>
        <li>
          <strong>Components not making contact:</strong> Check component heights in footprint data,
          reduce clearance
        </li>
        <li>
          <strong>Magnets don't hold:</strong> Use larger magnets (8mm+) or add more positions
        </li>
        <li>
          <strong>Lid warps during printing:</strong> Use brim, ensure bed is level, consider PETG
        </li>
      </ul>
    </div>
  </div>
);

const TutorialGuide = () => (
  <div>
    <h3>🎓 Tutorial: Press-Fit Audio Amplifier</h3>
    <p>
      Build a small audio amplifier with <strong>no soldering required</strong>. Components are held
      in place by mechanical pressure from a 3D-printed enclosure lid.
    </p>

    <div className="highlight-box">
      <h4>💡 The Press-Fit Concept</h4>
      <p>
        Instead of soldering, this design uses a two-part 3D printed enclosure. The base has copper
        tape traces routed to pads. The lid has raised pressure pads that push components down onto
        the copper tape when closed. This allows easy swapping of ICs or modules — just open the
        case!
      </p>
    </div>

    <h4>What You'll Build</h4>
    <ul>
      <li>PLA base with routed copper tape channels</li>
      <li>Enclosure lid with pressure pads for IC and capacitors</li>
      <li>Swappable LM386 audio amplifier IC</li>
      <li>Input/output connections for audio and power</li>
    </ul>

    <h4>Step-by-Step Guide</h4>

    <div className="step-box">
      <div className="step-num">Step 1</div>
      <div className="step-title">Create the Board</div>
      <p>
        Set board shape to <strong>Rectangle</strong>, size to 60mm × 40mm, thickness 3mm. This will
        be the base of your enclosure.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 2</div>
      <div className="step-title">Place the IC</div>
      <p>
        Drag a <strong>DIP-8</strong> component from the library to the center of the board. This
        represents the LM386 amplifier IC socket area. The 8 pads will be contact points.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 3</div>
      <div className="step-title">Add Capacitors</div>
      <p>
        Place two <strong>Radial Capacitor</strong> components near the IC — one for input coupling
        (10µF), one for output (220µF). Position them so leads can reach IC pads.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 4</div>
      <div className="step-title">Add Connectors</div>
      <p>
        Place <strong>Pin Header 2x1</strong> components at the board edge for: Audio In, Audio Out,
        Power (+), and Ground (-). These will be your external connection points.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 5</div>
      <div className="step-title">Route Power Traces</div>
      <p>
        Select <strong>8mm tape width</strong> (for power handling). Use <strong>L-Trace</strong> to
        connect Power+ header to IC pin 6 (VCC). Connect Ground header to IC pin 4 (GND). Use wider
        tape for power rails.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 6</div>
      <div className="step-title">Route Signal Traces</div>
      <p>
        Switch to <strong>5mm tape width</strong>. Route Audio In through input capacitor to IC pin
        3. Route IC pin 5 through output capacitor to Audio Out header. Use <strong>Curve</strong>{' '}
        tool if traces need to go around components.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 7</div>
      <div className="step-title">Add Bypass Capacitor Route</div>
      <p>
        Route a trace from IC pins 2 and 4 (both ground) to a spot for a bypass capacitor. This
        stabilizes the amplifier.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 8</div>
      <div className="step-title">Add Magnets for Enclosure Closure</div>
      <p>
        From the <strong>Magnets</strong> category in the Component Library, drag four{' '}
        <strong>Magnet 6mm × 3mm</strong> components to the corners of your board. Position them
        about 5mm from each corner. These create recesses in the 3D print where neodymium magnets
        will be press-fit.
      </p>
    </div>

    <div className="step-box">
      <div className="step-num">Step 9</div>
      <div className="step-title">Check and Export</div>
      <p>
        Run <strong>Check Design</strong> to verify no errors. Then use{' '}
        <strong>File → Export Factory Package</strong>. You'll get the base STL plus all
        documentation.
      </p>
    </div>

    <div className="highlight-box">
      <h4>🧲 Magnet Placement Tips</h4>
      <ul>
        <li>
          Place magnets at <strong>all four corners</strong> for even pressure distribution
        </li>
        <li>
          Use <strong>6mm × 3mm</strong> or <strong>8mm × 3mm</strong> magnets for good holding
          force
        </li>
        <li>Magnet holes are sized 0.1mm larger for press-fit insertion</li>
        <li>
          Mark magnet polarity before inserting —{' '}
          <strong>opposite poles must face each other</strong> in base and lid!
        </li>
        <li>Add a drop of super glue to secure magnets permanently</li>
      </ul>
    </div>

    <div className="highlight-box">
      <h4>🔧 Building the Lid (External Step)</h4>
      <p>
        The pressure-fit lid is designed separately in CAD software (Fusion 360, FreeCAD, etc.).
        Create a matching box lid with:
      </p>
      <ul>
        <li>Raised pads positioned over each IC pin location</li>
        <li>Foam or rubber pads on pressure points for even contact</li>
        <li>
          <strong>Matching magnet recesses</strong> at the same corner positions (with opposite
          polarity!)
        </li>
        <li>Cutouts for external connectors</li>
      </ul>
      <p>
        When assembled, the magnets snap the lid closed and press all components firmly onto their
        copper tape pads — no soldering, no screws needed!
      </p>
    </div>

    <h4>Benefits of Press-Fit Design</h4>
    <ul>
      <li>
        <strong>No soldering</strong> — safe for beginners, no heat damage to components
      </li>
      <li>
        <strong>Swappable parts</strong> — easily replace ICs or upgrade components
      </li>
      <li>
        <strong>Reusable base</strong> — same board can test different IC variants
      </li>
      <li>
        <strong>Quick prototyping</strong> — assemble and test in minutes
      </li>
      <li>
        <strong>Educational</strong> — see all connections clearly, understand the circuit
      </li>
    </ul>
  </div>
);

const ShortcutsGuide = () => (
  <div>
    <h3>Keyboard Shortcuts</h3>

    <div className="shortcut-row">
      <span>Rotate selected component</span>
      <span className="shortcut-key">R</span>
    </div>
    <div className="shortcut-row">
      <span>Delete selected item</span>
      <span className="shortcut-key">Delete</span>
    </div>
    <div className="shortcut-row">
      <span>Toggle snap to grid</span>
      <span className="shortcut-key">G</span>
    </div>
    <div className="shortcut-row">
      <span>Undo</span>
      <span className="shortcut-key">Ctrl + Z</span>
    </div>
    <div className="shortcut-row">
      <span>Redo</span>
      <span className="shortcut-key">Ctrl + Y</span>
    </div>
    <div className="shortcut-row">
      <span>Show keyboard shortcuts</span>
      <span className="shortcut-key">?</span>
    </div>

    <h3 style={{ marginTop: '24px' }}>Mouse Controls</h3>

    <div className="shortcut-row">
      <span>Select / Place component</span>
      <span className="shortcut-key">Left Click</span>
    </div>
    <div className="shortcut-row">
      <span>Drag component</span>
      <span className="shortcut-key">Left Drag</span>
    </div>
    <div className="shortcut-row">
      <span>Pan canvas</span>
      <span className="shortcut-key">Right Drag</span>
    </div>
    <div className="shortcut-row">
      <span>Zoom in/out</span>
      <span className="shortcut-key">Scroll Wheel</span>
    </div>

    <h3 style={{ marginTop: '24px' }}>3D Preview Controls</h3>

    <div className="shortcut-row">
      <span>Orbit view</span>
      <span className="shortcut-key">Left Drag</span>
    </div>
    <div className="shortcut-row">
      <span>Pan view</span>
      <span className="shortcut-key">Right Drag</span>
    </div>
    <div className="shortcut-row">
      <span>Zoom</span>
      <span className="shortcut-key">Scroll Wheel</span>
    </div>
  </div>
);

export default HelpDialog;
