# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PressBoard is a web-based PCB design tool for creating 3D-printable circuit boards with copper tape channels. It runs as both a web app (React + Vite) and a native desktop app (Tauri 2).

## Commands

### Development
```bash
pnpm dev              # Start Vite dev server (web)
pnpm tauri:dev        # Start Tauri dev mode (native app)
```

### Build
```bash
pnpm build            # Build web app to dist/
pnpm tauri:build      # Build native desktop app
```

### Code Quality
```bash
pnpm check            # TypeScript type checking (tsc --noEmit)
pnpm lint             # ESLint
pnpm format           # Prettier formatting
```

### Other
```bash
pnpm tauri:icon public/pressboard.png  # Generate app icons from source image
```

## Architecture

### State Management (Zustand Stores)

All application state is managed via Zustand stores in `src/stores/`:

- **projectStore** - Core project state: board, components, routes, vias, annotations. Handles undo/redo history (50 states). All geometry operations modify this store.
- **enclosureStore** - Lid/enclosure designer: pressure pads, magnets, connector cutouts, screw bosses, feet. Auto-generates features from components.
- **autoAssemblyStore** - Auto-assembly wizard state: component selection, connection definitions, arrangement options.
- **viewSettingsStore** - UI preferences: grid, snap, display options, 3D printer defaults (Creality K1C).
- **themeStore** - Dark/light mode toggle.
- **notificationStore** - Toast notifications.

### Core Domain Libraries (`src/lib/`)

- **lib/geometry/** - Board, channel, lid, and via geometry generation using Three.js and three-bvh-csg for CSG operations
- **lib/routing/** - Route utilities: Manhattan routing, A* pathfinding, spline interpolation, fillet generation
- **lib/assembly/** - Auto-assembly engine: placement strategies (grid, compact, symmetric, flow, radial), simulated annealing optimizer, connection detection
- **lib/drc/** - Design rule checks: spacing, wall thickness, bend radius, pad clearance, overlap detection, power validation
- **lib/export/** - Export generators: STL (3D print), SVG/DXF (tape masks), PDF (assembly guide), ZIP (factory package)

### Component Footprints

`src/data/footprints.ts` contains 120+ component definitions with:
- Pad positions and dimensions
- Hole positions
- Component heights (for lid clearance)
- Outline shapes

Use `getFootprint(type)` to retrieve footprint definitions.

### Type Definitions

All TypeScript types are in `src/types/index.ts`:
- `Project` - Root project type containing board, components, routes, vias, annotations, rules
- `Component`, `Route`, `Via`, `Annotation` - Core PCB elements
- `Enclosure`, `PressurePad`, `MagnetPlacement` - Lid/enclosure features
- `AssemblyComponent`, `ConnectionDef`, `ArrangementOption` - Auto-assembly types
- `DRCViolation` - Design rule check results

### Tauri Integration

Native desktop features via `src/lib/tauri.ts`:
- File system access via `@tauri-apps/plugin-fs`
- Dialog boxes via `@tauri-apps/plugin-dialog`
- Shell commands via `@tauri-apps/plugin-shell`

The Tauri backend (`src-tauri/`) is minimal Rust - most logic stays in the frontend.

### Key UI Components

- **CanvasView** - 2D board editor with component placement and routing
- **ThreePreview** - 3D visualization using React Three Fiber with orbit controls, section plane, exploded view
- **AutoAssemblyWizard** - Multi-step wizard for auto-placement and routing
- **InspectorPanel** - Properties panel for selected elements
- **ComponentLibrary** - Drag-and-drop component picker with search

## Code Style

- Prefer `type` over `interface` for TypeScript types
- Place configurable parameters at the top of files (e.g., `GRID_SIZE`, `COMPONENT_SPACING` in placementEngine.ts)
- Run `pnpm check` and `pnpm format` after completing tasks

## Units

All dimensions are in millimeters (mm). Standard pitch is 2.54mm (0.1 inch).
