// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { circuitWithRoute, deepFreeze, part, wire } from '../test/coreHelpers';
import { addComponent, addWire, canConnect, cloneCircuit, createComponent, deleteSelected, hasId, hasPin, isDuplicateWire, isPinConnected, moveComponent, rotateSelected, samePin, updateComponent } from './circuit';
import { getPinAbsolutePosition } from './geometry';

describe('immutable component operations', () => {
  it('creates defaults with injected unique IDs and gap-filling labels', () => {
    const circuit = deepFreeze({ components: [part(), part({ id: 'r3', label: 'R3' })], wires: [] });
    const component = createComponent(circuit, 'resistor', { x: 40, y: 60 }, 'r2');
    expect(component).toEqual({ id: 'r2', type: 'resistor', label: 'R2', value: '1kΩ', x: 40, y: 60, rotation: 0 });
    const added = addComponent(circuit, component);
    expect(added.components).toHaveLength(3);
    expect(circuit.components).toHaveLength(2);
    component.label = 'external mutation';
    expect(added.components.at(-1)?.label).toBe('R2');
    expect(() => createComponent(circuit, 'resistor', { x: 0, y: 0 }, 'r1')).toThrow(/unique/);
    expect(() => createComponent(circuit, 'resistor', { x: 0, y: 0 }, '')).toThrow(/nonempty/);
    expect(addComponent(circuit, part())).toBe(circuit);
  });
  it('moves and edits without changing IDs, wire references or previous snapshots', () => {
    const circuit = deepFreeze(circuitWithRoute());
    const moved = moveComponent(circuit, 'r1', { x: 20, y: 40 });
    expect(getPinAbsolutePosition(moved, wire().from)).toEqual({ x: 50, y: 40 });
    expect(getPinAbsolutePosition(circuit, wire().from)).toEqual({ x: 30, y: 0 });
    expect(moved.wires).toEqual(circuit.wires);
    expect(updateComponent(moved, 'r1', { label: '', value: '<literal & text>' }).components[0])
      .toMatchObject({ label: '', value: '<literal & text>', id: 'r1', x: 20 });
    expect(moveComponent(circuit, 'absent', { x: 0, y: 0 })).toBe(circuit);
    expect(updateComponent(circuit, 'absent', { value: 'new' })).toBe(circuit);
  });
  it('rotates four times and ignores wire/no/missing selection', () => {
    const original = deepFreeze(circuitWithRoute());
    let circuit = original;
    for (const expected of [90, 180, 270, 0]) {
      circuit = rotateSelected(circuit, { type: 'component', id: 'r1' });
      expect(circuit.components[0]?.rotation).toBe(expected);
      expect(circuit.wires).toEqual(original.wires);
    }
    expect(original.components[0]?.rotation).toBe(0);
    expect(rotateSelected(circuit, null)).toBe(circuit);
    expect(rotateSelected(circuit, { type: 'wire', id: 'w1' })).toBe(circuit);
    expect(rotateSelected(circuit, { type: 'component', id: 'absent' })).toBe(circuit);
  });
  it('clones parts and both wire endpoints for independent ownership', () => {
    const original = deepFreeze(circuitWithRoute());
    const clone = cloneCircuit(original);
    clone.components[0]!.value = 'changed';
    clone.wires[0]!.from.pinId = 'changed';
    clone.wires[0]!.to.pinId = 'changed';
    expect(original.components[0]?.value).toBe('1kΩ');
    expect(original.wires[0]).toEqual(wire());
  });
});

describe('wire validity', () => {
  it('allows a new connection and prevents duplicates in either direction', () => {
    const connected = deepFreeze(circuitWithRoute());
    const empty = { components: connected.components, wires: [] };
    const candidate = wire();
    expect(canConnect(empty, candidate.from, candidate.to)).toBe(true);
    const added = addWire(empty, candidate);
    expect(added.wires).toEqual(connected.wires);
    candidate.from.pinId = 'external mutation';
    expect(added.wires[0]?.from.pinId).toBe('pin2');
    expect(isDuplicateWire(connected.wires, wire().from, wire().to)).toBe(true);
    expect(isDuplicateWire(connected.wires, wire().to, wire().from)).toBe(true);
    expect(addWire(connected, wire({ id: 'new' }))).toBe(connected);
    expect(addWire(connected, wire({ id: 'reverse', from: wire().to, to: wire().from }))).toBe(connected);
    expect(isPinConnected(connected, wire().from)).toBe(true);
    expect(isPinConnected(connected, { compId: 'r1', pinId: 'pin1' })).toBe(false);
    expect(samePin(wire().from, { ...wire().from })).toBe(true);
  });
  it('rejects self connections, missing endpoints, and colliding IDs', () => {
    const circuit = deepFreeze(circuitWithRoute());
    const from = { compId: 'r1', pinId: 'pin1' };
    expect(addWire(circuit, wire({ id: 'self', from, to: from }))).toBe(circuit);
    expect(addWire(circuit, wire({ id: 'missing', from: { compId: 'absent', pinId: 'pin1' } }))).toBe(circuit);
    expect(addWire(circuit, wire({ id: 'missing', from: { compId: 'r1', pinId: 'bad' } }))).toBe(circuit);
    for (const id of ['r1', 'w1', '']) expect(addWire(circuit, wire({ id, from }))).toBe(circuit);
    expect(addComponent(circuit, part({ id: 'w1' }))).toBe(circuit);
    expect(hasId(circuit, 'w1')).toBe(true);
    expect(hasId(circuit, 'r1')).toBe(true);
    expect(hasId(circuit, 'absent')).toBe(false);
    expect(hasPin(circuit, from)).toBe(true);
    expect(hasPin(circuit, { compId: 'absent', pinId: 'pin1' })).toBe(false);
  });
});

describe('deletion', () => {
  it('cascades wires attached at either end, preserving unrelated parts and wires', () => {
    const original = circuitWithRoute();
    original.components.push(part({ id: 'r3', label: 'R3', x: 300 }));
    original.wires.push(
      wire({ id: 'w2', from: { compId: 'r3', pinId: 'pin2' }, to: { compId: 'r1', pinId: 'pin1' } }),
      wire({ id: 'unrelated', from: { compId: 'r3', pinId: 'pin1' } }),
    );
    const frozen = deepFreeze(original);
    const deleted = deleteSelected(frozen, { type: 'component', id: 'r1' });
    expect(deleted.components.map((part) => part.id)).toEqual(['r2', 'r3']);
    expect(deleted.wires.map((wire) => wire.id)).toEqual(['unrelated']);
    expect(frozen.wires).toHaveLength(3);
  });
  it('deletes one wire and safely ignores missing/no selection', () => {
    const circuit = deepFreeze(circuitWithRoute());
    const deleted = deleteSelected(circuit, { type: 'wire', id: 'w1' });
    expect(deleted.components).toEqual(circuit.components);
    expect(deleted.wires).toEqual([]);
    expect(deleteSelected(circuit, null)).toBe(circuit);
    expect(deleteSelected(circuit, { type: 'wire', id: 'absent' })).toBe(circuit);
    expect(deleteSelected(circuit, { type: 'component', id: 'absent' })).toBe(circuit);
  });
});
