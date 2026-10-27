import type { CircuitComponent, CircuitState, CircuitWire } from '../core/types';

export function part(fields: Partial<CircuitComponent> = {}): CircuitComponent {
  return { id: 'r1', type: 'resistor', label: 'R1', value: '1kΩ', x: 0, y: 0, rotation: 0, ...fields };
}

export function circuitWithRoute(): CircuitState {
  return {
    components: [part(), part({ id: 'r2', label: 'R2', x: 160, y: 100 })],
    wires: [{ id: 'w1', from: { compId: 'r1', pinId: 'pin2' }, to: { compId: 'r2', pinId: 'pin1' } }],
  };
}

export function wire(fields: Partial<CircuitWire> = {}): CircuitWire {
  return { id: 'w1', from: { compId: 'r1', pinId: 'pin2' }, to: { compId: 'r2', pinId: 'pin1' }, ...fields };
}

export function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
