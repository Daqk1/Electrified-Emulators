// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import legacy from '../test/fixtures/legacy-project.json';
import { deepFreeze, part, circuitWithRoute } from '../test/coreHelpers';
import { createDemoCircuit } from './demo';
import { parseProject, ProjectFormatError, serializeProject, validateProject } from './project';
import { COMPONENT_TEMPLATES } from './templates';

describe('legacy project compatibility', () => {
  it('round-trips the actual prototype JSON without altering its circuit or envelope', () => {
    const raw = readFileSync(new URL('../test/fixtures/legacy-project.json', import.meta.url), 'utf8');
    const loaded = parseProject(raw);
    expect(loaded).toEqual({ components: legacy.components, wires: legacy.wires });
    const saved = serializeProject(deepFreeze(loaded), legacy.timestamp);
    expect(saved).toBe(raw);
    expect(parseProject(saved)).toEqual(loaded);
  });
  it('accepts metadata-free files, all ten types, arbitrary finite rotations and unsnapped positions', () => {
    const components = Object.values(COMPONENT_TEMPLATES).map((template, index) => part({
      type: template.type, id: `part-${index}`, x: -12.5, y: 33.75, rotation: -450.5, label: '', value: 'µ Ω < & >',
    }));
    const circuit = { components, wires: [] };
    expect(validateProject(circuit)).toEqual(circuit);
    expect(parseProject(serializeProject(circuit, '2026-10-19T12:00:00.000Z'))).toEqual(circuit);
    expect(validateProject({ components: [], wires: [] })).toEqual({ components: [], wires: [] });
  });
  it('owns parsed data and removes extra imported editor fields/waypoints', () => {
    const circuit = circuitWithRoute();
    const raw = { ...circuit, selectedElement: { id: 'r1' },
      components: circuit.components.map((component) => ({ ...component, selected: true })),
      wires: circuit.wires.map((wire) => ({ ...wire, waypoints: [1, 2] })),
    };
    const loaded = validateProject(raw);
    expect(loaded).toEqual(circuit);
    loaded.components[0]!.value = 'changed';
    loaded.wires[0]!.from.compId = 'changed';
    expect(raw.components[0]?.value).toBe('1kΩ');
    expect(raw.wires[0]?.from.compId).toBe('r1');
    expect(Object.keys(JSON.parse(serializeProject(circuit, 'timestamp')))).toEqual(['project', 'version', 'timestamp', 'components', 'wires']);
  });
});

describe('project validation failures', () => {
  it.each(['{bad', '', 'undefined', '{"components": ['])('reports invalid JSON %s', (source) => {
    expect(() => parseProject(source)).toThrow(ProjectFormatError);
    expect(() => parseProject(source)).toThrow(/Invalid Circuit JSON/);
  });
  it.each([
    null, [], 1, 'text', {}, { components: [], wires: {} }, { components: {}, wires: [] },
    { components: [], wires: [], project: 'Other' },
    { components: [], wires: [], version: '2.0.0' },
    { components: [], wires: [], timestamp: 123 },
    { components: [null], wires: [] },
    { components: [{ ...part(), type: 'op_amp' }], wires: [] },
    { components: [{ ...part(), type: '__proto__' }], wires: [] },
    { components: [{ ...part(), x: '20' }], wires: [] },
    { components: [{ ...part(), x: NaN }], wires: [] },
    { components: [{ ...part(), y: Infinity }], wires: [] },
    { components: [{ ...part(), rotation: null }], wires: [] },
    { components: [{ ...part(), label: 123 }], wires: [] },
    { components: [{ ...part(), value: null }], wires: [] },
    { components: [{ ...part(), id: '' }], wires: [] },
    { components: [part(), part()], wires: [] },
  ])('rejects malformed structure case %#', (value) => {
    expect(() => validateProject(value)).toThrow(ProjectFormatError);
  });
  it('rejects invalid numeric fields when saving instead of silently serializing NaN to null', () => {
    expect(() => serializeProject({ components: [part({ rotation: Infinity })], wires: [] }, 'now')).toThrow(/finite/);
  });
  it.each(['missing-component', 'missing-pin', 'self', 'duplicate', 'reverse-duplicate', 'duplicate-id', 'cross-id', 'missing-endpoint'])('%s never yields a partial circuit', (variant) => {
    const circuit = createDemoCircuit();
    const first = circuit.wires[0]!;
    switch (variant) {
      case 'missing-component': first.from.compId = 'absent'; break;
      case 'missing-pin': first.from.pinId = 'absent'; break;
      case 'self': first.to = { ...first.from }; break;
      case 'duplicate': circuit.wires.push({ ...first, id: 'new' }); break;
      case 'reverse-duplicate': circuit.wires.push({ id: 'new', from: first.to, to: first.from }); break;
      case 'duplicate-id': circuit.wires[1]!.id = first.id; break;
      case 'cross-id': first.id = circuit.components[0]!.id; break;
      case 'missing-endpoint': first.from = undefined as never; break;
    }
    const snapshot = structuredClone(circuit);
    expect(() => validateProject(deepFreeze(circuit))).toThrow(ProjectFormatError);
    expect(circuit).toEqual(snapshot);
  });
});
