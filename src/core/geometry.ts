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

export type WireObstacle = { left: number; top: number; right: number; bottom: number };
export type WireRoute = [Point, Point, Point, Point];

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function routeClear(route: readonly Point[], obstacles: readonly WireObstacle[]): boolean {
  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index]!;
    const end = route[index + 1]!;
    if (samePoint(start, end)) continue;
    for (const obstacle of obstacles) {
      if (start.y === end.y) {
        const overlapsX = Math.max(start.x, end.x) > obstacle.left
          && Math.min(start.x, end.x) < obstacle.right;
        if (overlapsX && start.y > obstacle.top && start.y < obstacle.bottom) return false;
      } else if (start.x === end.x) {
        const overlapsY = Math.max(start.y, end.y) > obstacle.top
          && Math.min(start.y, end.y) < obstacle.bottom;
        if (overlapsY && start.x > obstacle.left && start.x < obstacle.right) return false;
      }
    }
  }
  return true;
}

export function getWireObstacles(circuit: CircuitState): WireObstacle[] {
  return circuit.components
    .map((component) => {
      const template = COMPONENT_TEMPLATES[component.type];
      const radians = component.rotation * Math.PI / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const halfWidth = (template.width * cos + template.height * sin) / 2;
      const halfHeight = (template.width * sin + template.height * cos) / 2;
      return {
        left: component.x - halfWidth,
        top: component.y - halfHeight,
        right: component.x + halfWidth,
        bottom: component.y + halfHeight,
      };
    });
}

export function wireRoute(
  from: Point,
  to: Point,
  obstacles: readonly WireObstacle[] = [],
): WireRoute {
  const xCandidates = [
    (from.x + to.x) / 2,
    ...obstacles.flatMap((obstacle) => [obstacle.left, obstacle.right]),
  ];
  const yCandidates = [
    (from.y + to.y) / 2,
    ...obstacles.flatMap((obstacle) => [obstacle.top, obstacle.bottom]),
  ];
  const candidates = [
    ...xCandidates.map((x) => [from, { x, y: from.y }, { x, y: to.y }, to] as [Point, Point, Point, Point]),
    ...yCandidates.map((y) => [from, { x: from.x, y }, { x: to.x, y }, to] as [Point, Point, Point, Point]),
  ].filter((route) => routeClear(route, obstacles));
  return candidates.sort((a, b) => routeLength(a) - routeLength(b))[0]
    ?? [from, { x: (from.x + to.x) / 2, y: from.y }, { x: (from.x + to.x) / 2, y: to.y }, to];
}

function routeLength(route: readonly Point[]): number {
  return route.slice(1).reduce((total, point, index) => {
    const previous = route[index]!;
    return total + Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y);
  }, 0);
}

export function wirePath(
  from: Point,
  to: Point,
  obstacles: readonly WireObstacle[] = [],
): string {
  const [start, turn1, turn2, end] = wireRoute(from, to, obstacles);
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
