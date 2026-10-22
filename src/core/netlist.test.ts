// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { part, deepFreeze } from '../test/coreHelpers';
import { createDemoCircuit } from './demo';
import { EMPTY_NETLIST, generateNetlist, pinKey, resolveNodes } from './netlist';

describe('netlist compatibility', () => {
  it('matches the original demo line for line, ignoring only the timestamp line', () => {
    const fixture = readFileSync(new URL('../test/fixtures/demo-netlist.txt', import.meta.url), 'utf8');
    const stripTimestamp = (text: string) => text.replace(/^\* Exported:.*\r?\n/m, '');
    expect(stripTimestamp(generateNetlist(deepFreeze(createDemoCircuit()), 'test timestamp'))).toBe(stripTimestamp(fixture));
    expect(generateNetlist(createDemoCircuit(), 'test timestamp')).toContain('* Exported: test timestamp\n');
  });
  it('returns the exact empty state without a timestamp or extra newline', () => {
    expect(generateNetlist({ components: [], wires: [] }, 'ignored')).toBe(EMPTY_NETLIST);
    expect(EMPTY_NETLIST).toBe('// CircuitEDU Auto-Generated Netlist\nNo components placed.');
  });
  it('keeps named nodes for isolated pins in component and pin order', () => {
    const circuit = createDemoCircuit();
    circuit.wires = [];
    const nodes = resolveNodes(circuit);
    expect([...nodes.values()]).toEqual(['N001', 'N002', 'N003', 'N004', 'N005', 'N006', 'N007', 'N008', '0 (GND)']);
    expect(generateNetlist(circuit, 'now')).not.toContain('OPEN');
    expect(generateNetlist(circuit, 'now')).toMatch(/\n\.END\n$/);
  });
  it('unifies chains and cycles independently of wire order or direction; ground wins', () => {
    const circuit = createDemoCircuit();
    const normal = generateNetlist(circuit, 'same');
    circuit.wires.reverse();
    circuit.wires = circuit.wires.map((wire) => ({ ...wire, from: wire.to, to: wire.from }));
    expect(generateNetlist(circuit, 'same')).toBe(normal);
    circuit.wires.push({ id: 'cycle', from: { compId: 'd1', pinId: 'cathode' }, to: { compId: 'v1', pinId: 'neg' } });
    expect(generateNetlist(circuit, 'same')).toBe(normal);
    const nodes = resolveNodes(circuit);
    expect(nodes.get(pinKey({ compId: 'v1', pinId: 'neg' }))).toBe('0 (GND)');
    expect(nodes.get(pinKey({ compId: 'd1', pinId: 'cathode' }))).toBe('0 (GND)');
  });
  it('names multiple ground roots 0 (GND) and does not truncate long text', () => {
    const circuit = { components: [part({ type: 'ground', id: '__proto__', label: 'a-long-ground-label' }), part({ type: 'ground', id: 'other' })], wires: [] };
    expect([...resolveNodes(circuit).values()]).toEqual(['0 (GND)', '0 (GND)']);
    expect(generateNetlist(circuit, 'now')).toContain('a-long-ground-label 0 (GND)          1kΩ');
  });
});
