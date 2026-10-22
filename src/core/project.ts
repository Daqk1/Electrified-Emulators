import { addWire } from './circuit';
import { isComponentType } from './templates';
import type { CircuitComponent, CircuitState, CircuitWire, PinRef, ProjectFile } from './types';

export class ProjectFormatError extends Error {
  constructor(message: string) { super(message); this.name = 'ProjectFormatError'; }
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ProjectFormatError(`${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string, nonempty = false): string {
  if (typeof value !== 'string' || (nonempty && value.length === 0)) {
    throw new ProjectFormatError(`${path} must be ${nonempty ? 'a nonempty' : 'a'} string.`);
  }
  return value;
}

function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ProjectFormatError(`${path} must be a finite number.`);
  }
  return value;
}

function parsePin(value: unknown, path: string): PinRef {
  const pin = record(value, path);
  return { compId: text(pin.compId, `${path}.compId`, true), pinId: text(pin.pinId, `${path}.pinId`, true) };
}

// Accept the old envelope or metadata-free legacy data; return only circuit fields.
// Reconstruct known fields rather than allowing imported UI state/waypoints to leak in.
export function validateProject(value: unknown): CircuitState {
  const data = record(value, 'Project');
  if (Object.hasOwn(data, 'project') && data.project !== 'CircuitEDU') {
    throw new ProjectFormatError('Unsupported project. Expected CircuitEDU.');
  }
  if (Object.hasOwn(data, 'version') && data.version !== '1.0.0') {
    throw new ProjectFormatError('Unsupported project version. Expected 1.0.0.');
  }
  if (Object.hasOwn(data, 'timestamp')) text(data.timestamp, 'timestamp');
  if (!Array.isArray(data.components) || !Array.isArray(data.wires)) {
    throw new ProjectFormatError('Project must contain components and wires arrays.');
  }
  const ids = new Set<string>();
  const uniqueId = (value: unknown, path: string): string => {
    const id = text(value, path, true);
    if (ids.has(id)) throw new ProjectFormatError(`Duplicate ID: ${id}.`);
    ids.add(id);
    return id;
  };
  const components: CircuitComponent[] = data.components.map((value, index) => {
    const path = `components[${index}]`;
    const part = record(value, path);
    if (!isComponentType(part.type)) throw new ProjectFormatError(`${path}.type is not a known part type.`);
    return {
      id: uniqueId(part.id, `${path}.id`), type: part.type,
      label: text(part.label, `${path}.label`), value: text(part.value, `${path}.value`),
      x: finite(part.x, `${path}.x`), y: finite(part.y, `${path}.y`),
      rotation: finite(part.rotation, `${path}.rotation`),
    };
  });
  let circuit: CircuitState = { components, wires: [] };
  for (const [index, value] of data.wires.entries()) {
    const path = `wires[${index}]`;
    const data = record(value, path);
    const wire: CircuitWire = {
      id: uniqueId(data.id, `${path}.id`),
      from: parsePin(data.from, `${path}.from`), to: parsePin(data.to, `${path}.to`),
    };
    const next = addWire(circuit, wire);
    if (next === circuit) {
      throw new ProjectFormatError(`${path} must connect two existing, distinct pins without duplicating another wire.`);
    }
    circuit = next;
  }
  return circuit;
}

export function parseProject(source: string): CircuitState {
  let value: unknown;
  try { value = JSON.parse(source); }
  catch { throw new ProjectFormatError('Invalid Circuit JSON file format.'); }
  return validateProject(value);
}

export function serializeProject(circuit: CircuitState, timestamp: string): string {
  const clean = validateProject(circuit);
  const project: ProjectFile = { project: 'CircuitEDU', version: '1.0.0', timestamp, ...clean };
  text(timestamp, 'timestamp');
  return JSON.stringify(project, null, 2);
}
