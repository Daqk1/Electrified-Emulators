// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { circuitWithRoute, deepFreeze, part, wire } from '../test/coreHelpers';
import { circuitReducer, createInitialCircuitState } from './circuitReducer';

describe('circuit reducer', () => {
  it('runs named edit events against immutable circuit snapshots', () => {
    const initial = deepFreeze(createInitialCircuitState());
    let state = circuitReducer(initial, { type: 'addComponent', component: part() });
    state = circuitReducer(state, { type: 'addComponent', component: part({ id: 'r2', label: 'R2', x: 160, y: 100 }) });
    state = circuitReducer(state, { type: 'moveComponent', id: 'r1', position: { x: 20, y: 40 } });
    state = circuitReducer(state, { type: 'rotateSelected', selection: { type: 'component', id: 'r1' } });
    state = circuitReducer(state, { type: 'updateComponent', id: 'r1', fields: { label: 'edited', value: '10kΩ' } });
    state = circuitReducer(state, { type: 'completeWire', wire: wire() });
    expect(state.components[0]).toMatchObject({ x: 20, y: 40, rotation: 90, label: 'edited', value: '10kΩ' });
    expect(state.wires).toHaveLength(1);
    expect(circuitReducer(state, { type: 'completeWire', wire: wire({ id: 'duplicate' }) })).toBe(state);
    state = circuitReducer(state, { type: 'deleteSelected', selection: { type: 'component', id: 'r1' } });
    expect(state.components.map((component) => component.id)).toEqual(['r2']);
    expect(state.wires).toEqual([]);
    expect(initial).toEqual({ components: [], wires: [] });
  });
  it('loads owned copies and ignores editor-only events', () => {
    const circuit = circuitWithRoute();
    const state = circuitReducer(createInitialCircuitState(), { type: 'loadCircuit', circuit });
    circuit.components[0]!.x = 999;
    circuit.wires[0]!.from.pinId = 'changed';
    expect(state.components[0]?.x).toBe(0);
    expect(state.wires[0]?.from.pinId).toBe('pin2');
    expect(circuitReducer(state, { type: 'setTool', tool: 'drag' })).toBe(state);
    expect(circuitReducer(state, { type: 'selectElement', selection: null })).toBe(state);
    expect(createInitialCircuitState()).not.toBe(createInitialCircuitState());
  });
});
