# PressBoard
<img width="468" height="465" alt="pressboard" src="https://github.com/user-attachments/assets/e2a0e9f6-f0ae-4468-b1a2-bb194f3beb97" />

**PressBoard** is a web‑based PCB design tool for creating 3D‑printable circuit boards with copper tape channels and modular enclosures. It combines intuitive layout, intelligent auto‑assembly, and real‑time 3D visualization to make solder‑free electronics design accessible to makers, educators, and rapid prototypers.

---


## ✨ Key Features

### User Interface
- Responsive three‑panel layout with component library, design canvas, and inspector panel
- Real‑time 3D preview with orbit controls, section plane, and exploded view
- Toggleable pin name labels with smart leader lines and overlap avoidance
- Dark mode, keyboard shortcuts, and built‑in tutorials for ease of use

### Board Design
- Parametric board shapes: rectangular, circular, or freeform
- Adjustable dimensions and thickness with presets (Arduino, small, medium, large)
- Mounting holes, magnet recesses, and press‑fit features for enclosures

### Component Library
- 120+ footprints across 30 categories: passives, semiconductors, headers, switches, ICs, MCUs (Arduino, ESP32, Raspberry Pi Pico, Teensy, Daisy Seed), displays, audio, sensors, motors, Bluetooth modules (HC-05, HC-06, HM-10, nRF52840), SD card modules, battery holders, joysticks, and more
- Drag‑and‑drop placement with grid snapping, rotation, and search
- Auto‑generated designators (R1, C1, U1, etc.) and annotations
- Beginner-friendly tooltips throughout the UI

### Routing
- Multiple routing modes: manual, Manhattan, spline, and auto‑router with obstacle avoidance
- Tape‑aware constraints: selectable widths (3–8 mm), bend radius enforcement, U/V/flat channel profiles
- Two‑sided board support with vias and pad clearance checks

### Auto‑Assembly
- Intelligent placement engine with multiple layout strategies (grid, compact, symmetric, flow, radial)
- Auto-detect connections with pinout database (120+ component types with VCC/GND/signal definitions)
- User constraints: zone placement, edge alignment, net naming, keep-out areas
- Orientation optimization for minimal wire crossings
- Connection‑aware auto‑routing with quality scoring and optimization
- Wizard workflow: select → connect → arrange → preview

### Design Rule Checks
- Comprehensive DRC: spacing, wall thickness, bend radius, pad clearance, overlap detection, unconnected pads, power validation
- Inline violation markers and one‑click auto‑fix suggestions

### 3D Enclosure Integration
- Lid designer with dimension controls, pressure pad generation, and magnet polarity indicators
- Automatic enclosure geometry aligned to component pads
- STL export for lids and substrates, with assembly guides

### Export & Assembly
- STL export for 3D printing
- SVG/DXF tape mask templates
- PDF assembly guide with step‑by‑step instructions
- Factory package (ZIP) including all files and BOM

### Project Management
- Save/load projects as JSON
- Undo/redo history
- Project sharing and collaboration ready
- Static hosting compatibility (GitHub Pages, Netlify, Vercel)

---

## 🛠️ Tech Stack
- **Frontend:** React 19 + TypeScript  
- **State Management:** Zustand  
- **3D Rendering:** Three.js + React Three Fiber  
- **Geometry:** three‑bvh‑csg for CSG operations  
- **Exports:** MakerJS, jsPDF, JSZip  
- **Build Tool:** Vite 7  
- **Deployment:** Static hosting (no backend required)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+  
- pnpm package manager  

### Installation
```bash
pnpm install
pnpm dev
```

### Build & Deploy
```bash
pnpm build
pnpm preview
```
Deploy the `dist/` folder to GitHub Pages, Netlify, Vercel, or any static host.

---

## 📂 Project Structure
```
src/
├── components/              # UI components
├── stores/                  # Zustand state management
├── lib/                     # Geometry, routing, assembly, DRC, export
├── data/                    # Footprints and icons
├── types/                   # TypeScript definitions
└── App.tsx                  # Main application
```

---

## ⚙️ Printer Defaults
Optimized for **Creality K1C**:
- Nozzle width: 0.4 mm  
- Layer height: 0.2 mm  
- Bed size: 220×220 mm  

Adjustable in View Settings for other printers.

---

## 📖 License
MIT
