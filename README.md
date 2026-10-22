# CircuitEDU React editor

All nine migration phases are complete: React 18 function components, strict TypeScript, Vite, native SVG, two reducers with React context, FileSaver.js downloads, and Vitest/React Testing Library tests. The original root app.js, index.html and style.css remain unchanged.

## Run

Use Node.js 24.15+ (24.x) or Node.js 26+. From web/:

~~~powershell
npm.cmd ci
npm.cmd run dev
~~~

Open <http://127.0.0.1:5173/>. The dev server binds to localhost only and fails if port 5173 is occupied. Stop it with Ctrl+C. On this Windows machine use npm.cmd because its PowerShell npm launcher resolves an invalid roaming path. Elsewhere the equivalent npm commands work normally.

Normal startup is empty. Click **Load Demo Circuit** for the original five-part LED driver. The temporary ?demo=1 entry was removed; all normal entries now open the actual editor. DemoPreview.tsx remains an isolated renderer test harness.

## Use

- Drag a palette card to the canvas, or click it to place a part at the current view center.
- **V** selects/moves; **W** selects Wire; **H** or **Space** selects Drag. Middle-button drag and Alt-left drag also pan.
- Click any pin to start a wire, then another pin to finish. Escape, the same pin, empty canvas or switching away from Wire cancels. Hover snap uses 18 world units; completion uses a 12-unit click radius.
- **R** rotates a selected part by 90 degrees. **Delete/Backspace** removes a part or wire; deleting a part removes attached wires. Escape otherwise clears selection. Shortcuts are ignored while typing.
- Wheel zoom anchors to the cursor; toolbar zoom anchors to view center. **100%** restores zoom 1 and pan (300,200). **Grid: 20px** toggles snapping while leaving the grid visible.
- Properties edits labels/values immediately and shows position, rotation and current connectivity. **Netlist / Nodes** resolves nodes in prototype order. Disconnected pins retain N### names, as requested.
- **PNG**, **SVG** and **JSON** download through FileSaver.js. **Load** validates JSON before replacing the circuit. Errors use a focused, keyboard-accessible modal; failed imports preserve existing data.

## Verify

~~~powershell
npm.cmd test
npm.cmd run build
node src/test/capture-prototype.mjs --check
~~~

Final verification on 2026-10-20: **185 tests across 24 files pass**, strict TypeScript and production build pass, and all three original compatibility fixtures reproduce. The demo netlist matches except its timestamp; legacy JSON round-trips exactly with its original timestamp.

For production preview run npm.cmd run preview and open <http://127.0.0.1:4173/>. Watch tests with npm.cmd run test:watch or type-check with npm.cmd run typecheck.

See [acceptance results](src/test/acceptance.md) for test coverage, browser checks, bug fixes and retained prototype behavior. Browser verification included real palette drop, release outside SVG under pointer capture, rotated-pin wiring from Drag mode, inspector edits, legacy import, invalid-import modal recovery and real SVG/PNG/JSON downloads. The demo PNG is 1240×920; the selected-circuit SVG has no selection decoration.

At 1920×1080, panel/canvas dimensions, colors, component transforms and wire geometry/style match the corrected reference copy. At 2560×1440 there is no horizontal overflow. Narrow windows wrap the toolbar.

Evidence: [completed editor](evidence/final-editor.png), [import error modal](evidence/final-error.png), [SVG download](evidence/final-demo.svg), [PNG download](evidence/final-demo.png), [JSON download](evidence/final-demo.json), [desktop comparison](evidence/layout-comparison.json), [wide-screen measurements](evidence/wide-layout.json).

## Structure

- src/core/: pure templates/geometry, snapping, hit tests, viewport math, labels, immutable circuit edits, union-find netlist, bounds, schema and demo data. No React/DOM, clock or random dependencies.
- src/state/: circuit/editor reducers, typed events and context. A synchronous command snapshot uses the same reducers so batched/native events cannot read stale state. IDs/timestamps are generated at UI/I/O boundaries.
- src/render/: ten JSX symbols and shared pins/wires/grid/preview/scene. exportSvg(circuit) serializes the same geometry without reading the live canvas or editor state.
- src/editor/: Toolbar, Palette, Canvas, Inspector, NetlistPanel, StatusBar, Modal and pointer/keyboard hooks. Canvas gestures use pointer capture and world-coordinate hit tests.
- src/files/: FileSaver downloads, PNG rendering/URL cleanup, validated file reading and race protection.
- src/test/: DOM helpers, original-prototype fixtures/capture script and acceptance record. Unit tests live alongside modules.

Only React, ReactDOM and the requested FileSaver.js are runtime dependencies. No backend, LMS, dashboard, Home routing, autosave server, simulation, Konva or external state library was added. Dependencies are locked.

The ignored .reference-qa/ folder is a local comparison copy, excluded from the production build. Its HTML has only the Drag-button ID and closing SVG tag corrected so the original can start. The actual reference files were never edited. No Git repository was initialized; include the fixtures and lockfile when adding this work to source control.

