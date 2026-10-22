import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';

const prototypeUrl = new URL('../../../app.js', import.meta.url);
const fixtureDirectory = new URL('./fixtures/', import.meta.url);
const source = await readFile(prototypeUrl, 'utf8');
assert.equal(
  createHash('sha256').update(source).digest('hex'),
  'fe964019a3e22fad11d01918a8b61746fd21d43c5a6348a269f3029c387aee0c',
  'The prototype changed; review the reference before recapturing fixtures.',
);

// Freeze time at the boundary, while leaving the prototype's algorithms intact.
class FixtureDate extends Date {
  constructor() { super('2026-10-19T12:00:00.000Z'); }
  static now() { return new FixtureDate().getTime(); }
}

let savedBlob;
let downloadName;
const sandbox = vm.createContext({
  Date: FixtureDate,
  Blob,
  window: { addEventListener() {} }, // Do not invoke the broken DOM constructor.
  document: {
    createElement(tag) {
      assert.equal(tag, 'a');
      return { click() { downloadName = this.download; } };
    },
  },
  URL: {
    createObjectURL(blob) { savedBlob = blob; return 'blob:fixture-capture'; },
    revokeObjectURL() {},
  },
});

vm.runInContext(`${source}\nthis.reference = { CircuitCADState, CircuitCADApp, COMPONENT_TEMPLATES };`, sandbox);
const { CircuitCADApp, CircuitCADState, COMPONENT_TEMPLATES } = sandbox.reference;
const app = Object.create(CircuitCADApp.prototype);
app.state = new CircuitCADState();
app.netlistOutput = { textContent: '' };
app.selectElement = () => {};
app.render = () => {};
app.loadDemoCircuit(); // Runs the original updateNetlist, not a rewritten oracle.
const netlist = app.netlistOutput.textContent;
app.exportJSON(); // Intercept only the browser download; preserve its actual Blob.
assert.ok(savedBlob instanceof Blob);
assert.match(downloadName, /^circuit_project_\d+\.json$/);
const project = await savedBlob.text();
const templates = Object.fromEntries(
  Object.entries(COMPONENT_TEMPLATES).map(([type, { render: _render, ...metadata }]) => [type, metadata]),
);

const artifacts = new Map([
  ['demo-netlist.txt', netlist],
  ['legacy-project.json', project],
  ['templates.json', JSON.stringify(templates, null, 2)],
]);
const stripTimestamp = (text) => text.replace(/^\* Exported:.*\r?\n/m, '');
const check = process.argv.includes('--check');
if (!check) await mkdir(fixtureDirectory, { recursive: true });
for (const [name, contents] of artifacts) {
  const destination = new URL(name, fixtureDirectory);
  if (check) {
    const recorded = await readFile(destination, 'utf8');
    if (name.endsWith('.json')) assert.deepEqual(JSON.parse(recorded), JSON.parse(contents), name);
    else assert.equal(stripTimestamp(recorded), stripTimestamp(contents), name);
  } else {
    await writeFile(destination, contents, 'utf8');
  }
  console.log(`${check ? 'Verified' : 'Captured'} ${name}`);
}
