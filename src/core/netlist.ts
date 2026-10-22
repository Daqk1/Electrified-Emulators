import { COMPONENT_TEMPLATES } from './templates';
import type { CircuitState, PinRef } from './types';

export const EMPTY_NETLIST = '// CircuitEDU Auto-Generated Netlist\nNo components placed.';

export function pinKey(ref: PinRef): string {
  return JSON.stringify([ref.compId, ref.pinId]);
}

export function resolveNodes(circuit: CircuitState): Map<string, string> {
  const parents = new Map<string, string>();
  for (const component of circuit.components) {
    for (const pin of COMPONENT_TEMPLATES[component.type].pins) {
      const key = pinKey({ compId: component.id, pinId: pin.id });
      parents.set(key, key);
    }
  }

  // Iterative path compression also handles large imports without recursive stack growth.
  const find = (key: string): string => {
    let root = key;
    while (parents.get(root) !== root) root = parents.get(root)!;
    while (key !== root) {
      const next = parents.get(key)!;
      parents.set(key, root);
      key = next;
    }
    return root;
  };

  for (const wire of circuit.wires) {
    const from = pinKey(wire.from);
    const to = pinKey(wire.to);
    if (parents.has(from) && parents.has(to)) parents.set(find(from), find(to));
  }

  const rootNames = new Map<string, string>();
  for (const component of circuit.components) {
    if (component.type === 'ground') {
      rootNames.set(find(pinKey({ compId: component.id, pinId: 'gnd' })), '0 (GND)');
    }
  }

  const pinNodes = new Map<string, string>();
  let counter = 1;
  for (const key of parents.keys()) {
    const root = find(key);
    let name = rootNames.get(root);
    if (name === undefined) {
      name = `N${String(counter++).padStart(3, '0')}`;
      rootNames.set(root, name);
    }
    pinNodes.set(key, name);
  }
  return pinNodes;
}

// Timestamp formatting belongs to the UI boundary (new Date().toLocaleString()).
export function generateNetlist(circuit: CircuitState, exportedAt: string): string {
  if (!circuit.components.length) return EMPTY_NETLIST;
  const nodes = resolveNodes(circuit);
  let result = `* CircuitEDU Schematic Netlist\n* Exported: ${exportedAt}\n\n`;
  for (const component of circuit.components) {
    const pins = COMPONENT_TEMPLATES[component.type].pins.map((pin) =>
      nodes.get(pinKey({ compId: component.id, pinId: pin.id })) ?? 'OPEN').join(' ');
    result += `${component.label.padEnd(8)} ${pins.padEnd(16)} ${component.value}\n`;
  }
  return `${result}\n.END\n`;
}
