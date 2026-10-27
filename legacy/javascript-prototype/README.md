# Preserved JavaScript prototype

These source files were moved without changing their bytes during the TypeScript editor consolidation on 2026-10-26. They are reference/future-work material, outside the active editor's source tree and module graph.

## Feature audit

| Original files | Behavior | Disposition |
| --- | --- | --- |
| src/main.jsx, src/App.jsx | A second React bootstrap that displays the login mock-up; also imports unused grid/dashboard modules | Replaced by the existing index.html → src/main.tsx → src/App.tsx editor entry. Preserved here. |
| src/EditingWindow/Grid.jsx | Static Konva grid with 20px spacing | Already covered by the TypeScript native-SVG Grid, including pan/zoom/snap support. Preserved here; no Konva dependency added. |
| src/EditingWindow/Header.jsx, componentConainer.jsx | Gray header and component-panel rectangles | Already covered by the functional TypeScript Toolbar and Palette. These files have no additional placement/wiring/selection logic to port. |
| src/logInScreen/Login.jsx | Username/password form and SVG title; submission prevents default but does not authenticate | Preserved for future login work. Authentication remains outside this editor task. |
| src/DashBoard/* | SVG dashboard, assignments and personal-project lists fetched from localhost:5001 | Preserved for future dashboard/backend integration. No dashboard or backend feature was wired into the editor. |
| src/useSVGResize.jsx | Calls a drawing function on resize | Used only by the preserved SVG.js login mock-up. The editor's native SVG/CSS handles its own sizing. |
| src/App.css, src/index.css | Prototype page layout, blue/login theme and custom font declarations | Preserved here; not imported over the editor's dark theme. Existing font assets remain in the project's public/ folder. |
| eslint.config.js | JavaScript-only template lint configuration | Preserved here. Strict TypeScript checking remains the active editor check; no new lint dependency was added. |

The relative source paths remain together. The archive is not a second configured application and does not claim working authentication or a running data service. The project's existing backend/ and public/ folders were left in place.

Future features can be ported individually to TypeScript when requested, using this archive as the source reference. Do not restore the old bootstrap or global styles into the active editor.
