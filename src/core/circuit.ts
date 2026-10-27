import { getNextLabel } from './labels';
import { COMPONENT_TEMPLATES } from './templates';
import type { CircuitComponent, CircuitState, CircuitWire, ComponentType, PinRef, Point, Selection } from './types';

export function cloneCircuit(circuit: CircuitState): CircuitState {
  return {
    components: circuit.components.map((component) => ({ ...component })),
    wires: circuit.wires.map((wire) => ({ ...wire, from: { ...wire.from }, to: { ...wire.to } })),
  };
}

export function hasId(circuit: CircuitState, id: string): boolean {
  return circuit.components.some((component) => component.id === id)
    || circuit.wires.some((wire) => wire.id === id);
}

export function createComponent(
  circuit: CircuitState, type: ComponentType, position: Point, id: string,
): CircuitComponent {
  if (!id || hasId(circuit, id)) throw new Error('A new component requires a unique, nonempty ID.');
  const template = COMPONENT_TEMPLATES[type];
  return {
    id, type, label: getNextLabel(circuit.components, template.prefix), value: template.defaultValue,
    x: position.x, y: position.y, rotation: 0,
  };
}

export function addComponent(circuit: CircuitState, component: CircuitComponent): CircuitState {
  if (!component.id || hasId(circuit, component.id)) return circuit;
  return { ...circuit, components: [...circuit.components, { ...component }] };
}

export function moveComponent(circuit: CircuitState, id: string, position: Point): CircuitState {
  if (!circuit.components.some((component) => component.id === id)) return circuit;
  return {
    ...circuit,
    components: circuit.components.map((component) => component.id === id
      ? { ...component, x: position.x, y: position.y } : component),
  };
}

export function updateComponent(
  circuit: CircuitState, id: string, fields: Partial<Pick<CircuitComponent, 'label' | 'value'>>,
): CircuitState {
  if (!circuit.components.some((component) => component.id === id)) return circuit;
  return {
    ...circuit,
    components: circuit.components.map((component) => component.id === id ? { ...component, ...fields } : component),
  };
}

export function rotateSelected(circuit: CircuitState, selection: Selection): CircuitState {
  if (selection?.type !== 'component') return circuit;
  const component = circuit.components.find((part) => part.id === selection.id);
  if (!component) return circuit;
  return {
    ...circuit,
    components: circuit.components.map((part) => part.id === component.id
      ? { ...part, rotation: (part.rotation + 90) % 360 } : part),
  };
}

export function deleteSelected(circuit: CircuitState, selection: Selection): CircuitState {
  if (!selection) return circuit;
  if (selection.type === 'component') {
    if (!circuit.components.some((component) => component.id === selection.id)) return circuit;
    return {
      components: circuit.components.filter((component) => component.id !== selection.id),
      wires: circuit.wires.filter((wire) => wire.from.compId !== selection.id && wire.to.compId !== selection.id),
    };
  }
  if (!circuit.wires.some((wire) => wire.id === selection.id)) return circuit;
  return { ...circuit, wires: circuit.wires.filter((wire) => wire.id !== selection.id) };
}

export function samePin(a: PinRef, b: PinRef): boolean {
  return a.compId === b.compId && a.pinId === b.pinId;
}

export function hasPin(circuit: CircuitState, ref: PinRef): boolean {
  const component = circuit.components.find((part) => part.id === ref.compId);
  return component !== undefined && COMPONENT_TEMPLATES[component.type].pins.some((pin) => pin.id === ref.pinId);
}

export function isDuplicateWire(wires: readonly CircuitWire[], from: PinRef, to: PinRef): boolean {
  return wires.some((wire) => (samePin(wire.from, from) && samePin(wire.to, to))
    || (samePin(wire.from, to) && samePin(wire.to, from)));
}

export function canConnect(circuit: CircuitState, from: PinRef, to: PinRef): boolean {
  return hasPin(circuit, from) && hasPin(circuit, to) && !samePin(from, to)
    && !isDuplicateWire(circuit.wires, from, to);
}

export function addWire(circuit: CircuitState, wire: CircuitWire): CircuitState {
  if (!wire.id || hasId(circuit, wire.id) || !canConnect(circuit, wire.from, wire.to)) return circuit;
  return {
    ...circuit,
    wires: [...circuit.wires, { ...wire, from: { ...wire.from }, to: { ...wire.to } }],
  };
}

export function isPinConnected(circuit: CircuitState, ref: PinRef): boolean {
  return circuit.wires.some((wire) => samePin(wire.from, ref) || samePin(wire.to, ref));
}
