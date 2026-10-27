import { COMPONENT_TEMPLATES } from './templates';
import type { CircuitState, PinRef, Point } from './types';

export function snap(value: number, enabled = true, gridSize = 20): number {
  return enabled ? Math.round(value / gridSize) * gridSize : value;
}

export function rotatePoint(point: Point, degrees: number): Point {
  const radians = degrees * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

export function getPinAbsolutePosition(circuit: CircuitState, ref: PinRef): Point | null {
  const component = circuit.components.find((part) => part.id === ref.compId);
  if (!component) return null;
  const pin = COMPONENT_TEMPLATES[component.type].pins.find((item) => item.id === ref.pinId);
  if (!pin) return null;
  const rotated = rotatePoint({ x: pin.relX, y: pin.relY }, component.rotation);
  return { x: component.x + rotated.x, y: component.y + rotated.y };
}

export function wireRoute(from: Point, to: Point): [Point, Point, Point, Point] {
  const midX = (from.x + to.x) / 2;
  return [{ ...from }, { x: midX, y: from.y }, { x: midX, y: to.y }, { ...to }];
}

export function wirePath(from: Point, to: Point): string {
  const [start, turn1, turn2, end] = wireRoute(from, to);
  return `M ${start.x} ${start.y} L ${turn1.x} ${turn1.y} L ${turn2.x} ${turn2.y} L ${end.x} ${end.y}`;
}

export function distToSegment(point: Point, start: Point, end: Point): number {
  const lengthSquared = (start.x - end.x) ** 2 + (start.y - end.y) ** 2;
  if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const projection = ((point.x - start.x) * (end.x - start.x)
    + (point.y - start.y) * (end.y - start.y)) / lengthSquared;
  const t = Math.max(0, Math.min(1, projection));
  return Math.hypot(
    point.x - (start.x + t * (end.x - start.x)),
    point.y - (start.y + t * (end.y - start.y)),
  );
}
