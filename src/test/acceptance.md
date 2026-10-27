# Editing-window acceptance record

Completed 2026-10-20. The user authorized all remaining phases without intermediate approval pauses.

## TypeScript consolidation recheck — 2026-10-26

- One configured entry: index.html → src/main.tsx → src/App.tsx; all npm app/test commands explicitly select vite.config.ts.
- Duplicate JSX entry files, prototype-only modules/styles and unused JavaScript lint config preserved outside src in legacy/javascript-prototype. All 13 files match their original contents; backend/public assets remain in place.
- Unused direct Babel/React Compiler tooling removed; no runtime dependencies added.
- Tests use versioned original snapshots in src/test/reference, whose SHA-256 hashes match the recorded pre-migration baseline. Git attributes protect reference bytes and LF fixture endings across Windows checkouts.
- All 185 tests across 24 files, strict production build and three fixture reproduction checks pass. Dev-server HTML/main.tsx/App.tsx return HTTP 200. Production assets contain no legacy backend endpoint, Konva, SVG.js or React Compiler runtime.
- Existing screenshots and browser evidence document the 2026-10-20 migration checks; the original web/ folder is now editing_window/.

## Automated checks

| Check | Result |
| --- | --- |
| npm test | 185 tests across 24 files pass |
| npm run build | Strict TypeScript and Vite production build pass |
| node src/test/capture-prototype.mjs --check | All 3 captured fixtures reproduce |
| Demo netlist | Exact spacing/order/blank lines/final newline match; only timestamp excluded |
| Original JSON | Parse/save/parse preserves data; original timestamp yields byte-identical file |
| Root reference SHA-256 | app.js/index.html/style.css match the migration baseline |
| Runtime dependencies | React 18, ReactDOM 18, FileSaver.js only |

## Feature coverage

| Acceptance group | Verification |
| --- | --- |
| Ten-part library | Exact prefixes/defaults/sizes/ordered pin IDs, labels and offsets compared to captured metadata. JSX bodies/outlines match original callbacks; palette shapes match original HTML. |
| Palette click/drop | Center placement and transformed screen-to-world drop; snap/default selection; unknown types ignored; free coordinates with snap off. Native browser drop adds exactly one part. |
| IDs and labels | Gap filling, shared D/U prefixes, unique IDs even with repeated UUID candidates; batched commands do not allocate from stale state. |
| Grid | Minor 20/major 100, independent pattern IDs, snap on initially, button/status updates, grid remains visible with snap disabled. |
| Pan | Middle, Alt-left and Drag-tool left drag; grab/grabbing cursors, capture/cancel. Native Drag released outside SVG returns to grab correctly. |
| Zoom | Cursor wheel factors 1.1/0.9; view-center toolbar factors 1.2/0.833; clamps 0.2–4; reset (300,200,1). Wheel default prevented; horizontal-only wheel does not zoom. |
| Tools | Select/Wire/Drag badges/colors/cursors/active buttons, V/W/H/Space; switching away cancels wiring. |
| Selection/movement | World-coordinate pin/part/wire tests, topmost parts, rotated bounds/corners, grab offsets, live snap, attached wires and empty deselection. |
| Rotate/delete | R, toolbar and inspector; +90 modulo 360; Delete/Backspace/toolbar; all attached wires cascade; deleting wires preserves parts. |
| Keyboard guards | Inputs/textarea/select/contenteditable protected; handled defaults prevented; modifier shortcuts left alone; Escape cancels wire before selection and ends active drag. |
| Wiring | Any-tool pin starts; 12-unit click/18-unit hover; grid/raw preview; same-pin/empty/Escape/tool cancellation; bidirectional duplicate rejection; rotated geometry. Native rotated-pin wiring from Drag verified. |
| Wire rendering/hits | Midpoint-X route; all three segments; strict distance <8; degenerate segments; 12px transparent hit path and r=3 junction endpoints. |
| Inspector | Empty for no selection/wire; live Label/Value to SVG/netlist; rotation/position/every pin; Connected green/Open red derives from current wires. |
| Netlist | Union-find chains/cycles, component/pin order, ground=0 (GND), isolated N### nodes, exact formatting/empty state and live tab updates. |
| Status | Rounded world cursor, snap state, part/wire counts and zoom percentage derive from state. |
| SVG | Data-only shared JSX; ±50 bounds +40 padding, #18181d background, explicit styles, no grid/preview/selection/hit paths; escaped text. Real selected-circuit export is clean. |
| PNG | Same SVG geometry, padding 50, logical minimum 200×200, 2× raster size. Real demo is 1240×920 and visually inspected. URL cleanup on every failure path. |
| JSON save | Exact CircuitEDU/1.0.0 envelope, ISO timestamp, original fields, exact filename patterns, FileSaver for all downloads. Actual demo JSON arrays match fixture. |
| JSON load | Arrays/types/strings/finite numbers/IDs/endpoints validated atomically; duplicate/self/orphan wires rejected; original file unchanged. Picker reset, latest-load/Demo race protection. |
| Modal | Read/import/export failures; focus enters, Tab trapped, Escape/Close dismiss and restore focus; circuit preserved. Real unknown-part import verified. |
| Demo | Exact V1/SW1/R1/D1/GND and w1–w5 positions/rotations/values; clears selection/drag/wiring, preserves viewport/tool/snap. |
| Layout/theme | Original custom properties; matching desktop bounds/colors/transforms/wire styles at 1920×1080; 2560×1440 no horizontal overflow; toolbar wraps cleanly at 1280. |
| Architecture | Pure core with unit tests; two reducers/context; SVG JSX; pointer capture/world hits; data-based exports; no excluded features or new runtime dependencies. |

## Bugs fixed

- Drag tool drag/pan mismatch, HTML button ID mismatch and malformed SVG closing tag.
- Alert-based/trusting imports; validation and modal errors now precede replacement.
- Selection decoration leaking into exports and unescaped annotation text.
- Unused wiringCurrentPos, waypoints, idCounter and selection layer omitted.
- Rotation-blind hits and floating-point corner exclusions.
- Stale inspector connectivity and removed-source drag/wire references.
- Preview targets detach when moved/rotated; hovered target references persist after deletion.
- Secondary-button edits, shortcuts during typing/modifier commands, Space/Backspace defaults and Escape leaving a drag active.
- Wrong initial badge/cursor and released-pan cursor; collapsed netlist whitespace.
- PNG image/context/draw/encoding/null-blob failures and SVG URL leaks; duplicate pending PNG exports.
- Older file reads overwriting newer imports/Demo, and file-picker same-file retry failure.
- ID collision/stale command state, horizontal wheel zoom and narrow-toolbar overlap.

## Reference comparison and evidence

An ignored local comparison copy corrected only tool-pan → tool-drag and the invalid closing SVG tag in HTML, allowing the original to start. Its remaining logic stayed original. The root references were never edited. Node VM capture executes original demo/netlist/JSON logic for the fixtures.

- web/evidence/final-editor.png: complete editor, demo and live netlist, panned to frame the circuit.
- web/evidence/final-error.png: actual invalid-file modal preserving the circuit.
- web/evidence/final-demo.svg/.png/.json: real FileSaver browser downloads, inspected independently.
- web/evidence/layout-comparison.json: identical 1920×1080 reference/migrated bounds, colors, transforms, routes and wire style.
- web/evidence/wide-layout.json: 2560×1440 viewport/canvas bounds/counts and no horizontal overflow.

Large-viewport full-page capture was unavailable in the browser tool. Desktop comparisons use measured DOM bounds/styles, with normal-size screenshots saved separately. Application file downloads were verified as actual files.

## Retained prototype behavior

Disconnected pins receive node names, as explicitly requested. Wire crossings do not automatically join. Labels can be blank/duplicate and stay upright at the prototype annotation positions. Export bounds remain part-center ±50 with fixed padding, so unusually long labels are not measured dynamically. Space selects Drag until another tool is selected. No simulation or server persistence was added.
