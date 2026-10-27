import { distToSegment, getPinAbsolutePosition, rotatePoint, snap, wireRoute } from './geometry';
import { COMPONENT_TEMPLATES } from './templates';
import type { CircuitComponent, CircuitState, CircuitWire, PinRef, Point } from './types';

export function findPinAtWorldPos(circuit: CircuitState, point: Point, radius = 12): PinRef | null {
  for (const component of circuit.components) {
    for (const pin of COMPONENT_TEMPLATES[component.type].pins) {
      const ref = { compId: component.id, pinId: pin.id };
      const position = getPinAbsolutePosition(circuit, ref);
      if (position && Math.hypot(point.x - position.x, point.y - position.y) <= radius) return ref;
    }
  }
  return null;
}

export function findComponentAtWorldPos(circuit: CircuitState, point: Point): CircuitComponent | null {
  for (const component of [...circuit.components].reverse()) {
    const template = COMPONENT_TEMPLATES[component.type];
    // Intentional fix: test in the rotated symbol's own coordinate system.
    const local = rotatePoint({ x: point.x - component.x, y: point.y - component.y }, -component.rotation);
    // Trigonometric roundoff must not exclude a point exactly on a rotated edge.
    if (Math.abs(local.x) <= template.width / 2 + 6 + 1e-9
      && Math.abs(local.y) <= template.height / 2 + 6 + 1e-9) return component;
  }
  return null;
}

export function findWireAtWorldPos(circuit: CircuitState, point: Point, threshold = 8): CircuitWire | null {
  for (const wire of circuit.wires) {
    const from = getPinAbsolutePosition(circuit, wire.from);
    const to = getPinAbsolutePosition(circuit, wire.to);
    if (!from || !to) continue;
    const [p1, p2, p3, p4] = wireRoute(from, to);
    if (distToSegment(point, p1, p2) < threshold
      || distToSegment(point, p2, p3) < threshold
      || distToSegment(point, p3, p4) < threshold) return wire;
  }
  return null;
}

export function wirePreviewTarget(
  circuit: CircuitState, point: Point, from: PinRef, snapToGrid: boolean, gridSize = 20,
): { position: Point; hoverPin: PinRef | null } {
  const hoverPin = findPinAtWorldPos(circuit, point, 18);
  if (hoverPin && (hoverPin.compId !== from.compId || hoverPin.pinId !== from.pinId)) {
    const position = getPinAbsolutePosition(circuit, hoverPin);
    if (position) return { position, hoverPin };
  }
  return {
    position: { x: snap(point.x, snapToGrid, gridSize), y: snap(point.y, snapToGrid, gridSize) },
    hoverPin: null,
  };
}
