import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { addComponent, cloneCircuit, moveComponent, rotateSelected } from '../core/circuit';
import { getCircuitWireRoute } from '../core/geometry';
import { findWireAtWorldPos } from '../core/hitTests';
import { parseProject, serializeProject } from '../core/project';
import { circuitReducer } from '../state/circuitReducer';
import { circuitWithRoute, part } from '../test/coreHelpers';
import { CircuitScene } from './CircuitScene';

describe('fixed completed wire routes', () => {
  it('keeps endpoints and obstacle detours fixed through transforms, new obstacles and save/load', () => {
    const initial = circuitWithRoute();
    initial.components.push(part({ id: 'obstacle', x: 80, y: 50 }));
    const wire = initial.wires[0]!;
    let circuit = circuitReducer({ ...initial, wires: [] }, { type: 'completeWire', wire });
    const route = getCircuitWireRoute(circuit, circuit.wires[0]!)!;
    expect(circuit.wires[0]!.route).toEqual(route);
    const view = render(<svg><CircuitScene circuit={circuit} /></svg>);
    const path = view.container.querySelector('.circuit-wire')!.getAttribute('d');
    circuit = moveComponent(circuit, 'r1', { x: -300, y: -300 });
    circuit = moveComponent(circuit, 'r2', { x: 500, y: 500 });
    circuit = rotateSelected(circuit, { type: 'component', id: 'r2' });
    circuit = moveComponent(circuit, 'obstacle', { x: 400, y: 400 });
    circuit = addComponent(circuit, part({ id: 'new-obstacle', ...route[1]! }));
    circuit = parseProject(serializeProject(circuit, 'now'));
    view.rerender(<svg><CircuitScene circuit={circuit} /></svg>);
    expect(view.container.querySelector('.circuit-wire')).toHaveAttribute('d', path);
    expect(getCircuitWireRoute(circuit, circuit.wires[0]!)).toEqual(route);
    expect(findWireAtWorldPos(circuit, route[1]!)).toMatchObject({ id: wire.id });
    const clone = cloneCircuit(circuit);
    clone.wires[0]!.route![0]!.x += 100;
    expect(circuit.wires[0]!.route).toEqual(route);
  });
});
