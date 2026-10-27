# Prototype compatibility fixtures

These files are captured by executing the unmodified prototype snapshot in `src/test/reference/app.js`, not by deriving expectations from the new core. The capture script checks the original SHA-256 first. The versioned reference makes the tests independent of the former parent-directory files and ignored QA folder.

- `demo-netlist.txt`: original `loadDemoCircuit()` → `updateNetlist()` text, including spacing and the final newline.
- `legacy-project.json`: the actual Blob created by original `exportJSON()` for that demo.
- `templates.json`: all original template metadata (geometry, ordered pins, prefixes, values), with drawing callbacks omitted.

From `editing_window/`, run `node src/test/capture-prototype.mjs --check` to reproduce and check them. Only the netlist's `* Exported:` line is ignored. JSON is compared structurally; its timestamp is frozen at `2026-10-19T12:00:00.000Z`. The netlist timestamp uses the original locale formatter, so its presentation can vary between systems. Fixture JSON/text uses LF, enforced by .gitattributes for Windows checkouts.

To deliberately recapture after reviewing a reference change, update the source hash if appropriate and run `node src/test/capture-prototype.mjs` without `--check`.

The script suppresses the DOMContentLoaded callback, creates the original controller without running its broken DOM constructor, and replaces only rendering, selection UI and browser-download sinks. It runs the original demo, netlist and JSON export functions unchanged. No actual file download, browser session or dependency is needed.

Keep these fixtures, the versioned reference snapshots and .gitattributes together in source control.
