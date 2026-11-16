import { COMPONENT_TEMPLATES } from './templates';
import type { CircuitState, ComponentType, PinRef, Point } from './types';

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

const COMPONENT_BODY_BOUNDS: Record<ComponentType, WireObstacle> = {
  resistor: { left: -20, top: -11, right: 20, bottom: 11 },
  capacitor: { left: -9, top: -15, right: 9, bottom: 15 },
  inductor: { left: -20, top: -9, right: 20, bottom: 9 },
  switch: { left: -14, top: -12, right: 14, bottom: 3 },
  led: { left: -12, top: -12, right: 12, bottom: 12 },
  diode: { left: -12, top: -12, right: 12, bottom: 12 },
  dc_source: { left: -17, top: -17, right: 17, bottom: 17 },
  ground: { left: -16, top: -12, right: 16, bottom: 18 },
  and_gate: { left: -18, top: -16, right: 16, bottom: 16 },
  or_gate: { left: -18, top: -16, right: 16, bottom: 16 },
};

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
      const body = COMPONENT_BODY_BOUNDS[component.type];
      const radians = component.rotation * Math.PI / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const halfWidth = ((body.right - body.left) * cos + (body.bottom - body.top) * sin) / 2;
      const halfHeight = ((body.right - body.left) * sin + (body.bottom - body.top) * cos) / 2;
      const centerOffset = rotatePoint({
        x: (body.left + body.right) / 2,
        y: (body.top + body.bottom) / 2,
      }, component.rotation);
      return {
        left: component.x + centerOffset.x - halfWidth,
        top: component.y + centerOffset.y - halfHeight,
        right: component.x + centerOffset.x + halfWidth,
        bottom: component.y + centerOffset.y + halfHeight,
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
  const simpleRoute = candidates.sort((a, b) => routeLength(a) - routeLength(b))[0];
  if (simpleRoute) return simpleRoute;

  const clearance = 12;
  const detourCandidates = [
    ...obstacles.flatMap((obstacle) => [
      [from, { x: obstacle.left - clearance, y: from.y }, { x: obstacle.left - clearance, y: to.y }, to],
      [from, { x: obstacle.right + clearance, y: from.y }, { x: obstacle.right + clearance, y: to.y }, to],
      [from, { x: from.x, y: obstacle.top - clearance }, { x: to.x, y: obstacle.top - clearance }, to],
      [from, { x: from.x, y: obstacle.bottom + clearance }, { x: to.x, y: obstacle.bottom + clearance }, to],
    ] as [Point, Point, Point, Point][]),
  ].filter((route) => routeClear(route, obstacles));
  const detour = detourCandidates.sort((a, b) => routeLength(a) - routeLength(b))[0];
  if (detour) return detour;

  const minX = Math.min(from.x, to.x, ...obstacles.map((obstacle) => obstacle.left));
  const maxX = Math.max(from.x, to.x, ...obstacles.map((obstacle) => obstacle.right));
  const minY = Math.min(from.y, to.y, ...obstacles.map((obstacle) => obstacle.top));
  const maxY = Math.max(from.y, to.y, ...obstacles.map((obstacle) => obstacle.bottom));
  const outerRoutes: WireRoute[] = [
    [from, { x: minX - clearance, y: from.y }, { x: minX - clearance, y: to.y }, to],
    [from, { x: maxX + clearance, y: from.y }, { x: maxX + clearance, y: to.y }, to],
    [from, { x: from.x, y: minY - clearance }, { x: to.x, y: minY - clearance }, to],
    [from, { x: from.x, y: maxY + clearance }, { x: to.x, y: maxY + clearance }, to],
  ];
  return outerRoutes.find((route) => routeClear(route, obstacles)) ?? outerRoutes[0]!;
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
