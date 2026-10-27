# Frozen original prototype oracle

These are test-only reference files, not an application entry or part of the TypeScript editor bundle. They preserve the original pre-migration prototype bytes and hashes in SHA256.json.

The parent-directory originals were no longer present after the project was moved into editing_window/. The reference was recovered from the previously preserved .reference-qa copy. Only that copy's two known HTML repairs were reversed (Drag-button ID and closing SVG tag); all three resulting hashes exactly match the recorded original baseline.

The classic app.js is read by Node VM during compatibility tests and fixture capture. The HTML is parsed to compare palette artwork. These files deliberately remain in their original language and retain original bugs; they must not be imported by the editor. Git attributes disable newline conversion so the recorded reference bytes remain stable on Windows and other systems.
