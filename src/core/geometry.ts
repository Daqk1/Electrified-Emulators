import { COMPONENT_TEMPLATES } from './templates';
import type { CircuitState, CircuitWire, ComponentType, PinRef, Point } from './types';

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

export function getPinOutwardDirection(circuit: CircuitState, ref: PinRef): Point | null {
  const component = circuit.components.find((part) => part.id === ref.compId);
  if (!component) return null;
  const pin = COMPONENT_TEMPLATES[component.type].pins.find((item) => item.id === ref.pinId);
  if (!pin) return null;
  const localDirection = Math.abs(pin.relX) >= Math.abs(pin.relY)
    ? { x: Math.sign(pin.relX), y: 0 }
    : { x: 0, y: Math.sign(pin.relY) };
  if (localDirection.x === 0 && localDirection.y === 0) return null;
  const rotated = rotatePoint(localDirection, component.rotation);
  return { x: Math.round(rotated.x), y: Math.round(rotated.y) };
}

export type WireObstacle = { left: number; top: number; right: number; bottom: number };
export type WireRoute = [Point, Point, Point, Point];
export type WireSegment = { start: Point; end: Point };
type PinObstaclePair = { from?: WireObstacle | undefined; to?: WireObstacle | undefined };

const COMPONENT_BODY_BOUNDS: Record<ComponentType, WireObstacle> = {
  resistor: { left: -31, top: -9, right: 31, bottom: 9 },
  capacitor: { left: -31, top: -13, right: 31, bottom: 13 },
  inductor: { left: -31, top: -7, right: 31, bottom: 7 },
  switch: { left: -31, top: -12, right: 31, bottom: 3 },
  led: { left: -31, top: -18, right: 31, bottom: 11 },
  diode: { left: -31, top: -11, right: 31, bottom: 11 },
  dc_source: { left: -31, top: -15, right: 31, bottom: 15 },
  ground: { left: -15, top: -11, right: 15, bottom: 17 },
  and_gate: { left: -31, top: -15, right: 31, bottom: 15 },
  or_gate: { left: -31, top: -15, right: 31, bottom: 15 },
};

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function routeRespectsPins(
  route: WireRoute,
  fromDirection?: Point,
  toDirection?: Point,
): boolean {
  const firstTurn = samePoint(route[1], route[0]) ? route[2] : route[1];
  const lastTurn = samePoint(route[2], route[3]) ? route[1] : route[2];
  const firstStep = { x: firstTurn.x - route[0].x, y: firstTurn.y - route[0].y };
  const lastStep = { x: lastTurn.x - route[3].x, y: lastTurn.y - route[3].y };
  const startsOutward = !fromDirection
    || firstStep.x * fromDirection.x + firstStep.y * fromDirection.y >= 0;
  const endsOutward = !toDirection
    || lastStep.x * toDirection.x + lastStep.y * toDirection.y >= 0;
  return startsOutward && endsOutward;
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

function routeWireConflicts(route: readonly Point[], occupiedSegments: readonly WireSegment[]): number {
  const lineSpacing = 4;
  let conflicts = 0;
  for (let routeIndex = 0; routeIndex < route.length - 1; routeIndex += 1) {
    const start = route[routeIndex]!;
    const end = route[routeIndex + 1]!;
    if (samePoint(start, end)) continue;
    const routeHorizontal = start.y === end.y;
    for (const segment of occupiedSegments) {
      const occupiedStart = segment.start;
      const occupiedEnd = segment.end;
      if (samePoint(occupiedStart, occupiedEnd)) continue;
      const occupiedHorizontal = occupiedStart.y === occupiedEnd.y;
      if (routeHorizontal && occupiedHorizontal && Math.abs(start.y - occupiedStart.y) < lineSpacing) {
        const overlap = Math.min(Math.max(start.x, end.x), Math.max(occupiedStart.x, occupiedEnd.x))
          - Math.max(Math.min(start.x, end.x), Math.min(occupiedStart.x, occupiedEnd.x));
        if (overlap > 0) conflicts += 1;
      } else if (!routeHorizontal && !occupiedHorizontal && Math.abs(start.x - occupiedStart.x) < lineSpacing) {
        const overlap = Math.min(Math.max(start.y, end.y), Math.max(occupiedStart.y, occupiedEnd.y))
          - Math.max(Math.min(start.y, end.y), Math.min(occupiedStart.y, occupiedEnd.y));
        if (overlap > 0) conflicts += 1;
      } else if (routeHorizontal !== occupiedHorizontal) {
        const horizontalStart = routeHorizontal ? start : occupiedStart;
        const horizontalEnd = routeHorizontal ? end : occupiedEnd;
        const verticalStart = routeHorizontal ? occupiedStart : start;
        const verticalEnd = routeHorizontal ? occupiedEnd : end;
        const crosses = verticalStart.x >= Math.min(horizontalStart.x, horizontalEnd.x)
          && verticalStart.x <= Math.max(horizontalStart.x, horizontalEnd.x)
          && horizontalStart.y >= Math.min(verticalStart.y, verticalEnd.y)
          && horizontalStart.y <= Math.max(verticalStart.y, verticalEnd.y);
        if (crosses) conflicts += 1;
      }
    }
  }
  return conflicts;
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
      const wireClearance = 4;
      return {
        left: component.x + centerOffset.x - halfWidth - wireClearance,
        top: component.y + centerOffset.y - halfHeight - wireClearance,
        right: component.x + centerOffset.x + halfWidth + wireClearance,
        bottom: component.y + centerOffset.y + halfHeight + wireClearance,
      };
    });
}

export function wireRoute(
  from: Point,
  to: Point,
  obstacles: readonly WireObstacle[] = [],
  fromDirection?: Point,
  toDirection?: Point,
  occupiedSegments: readonly WireSegment[] = [],
): WireRoute | null {
  const isClear = (route: WireRoute) => routeClear(route, obstacles)
    && routeRespectsPins(route, fromDirection, toDirection);
  const wireClearance = 8;
  const xCandidates = [
    ...(fromDirection || toDirection ? [from.x, to.x] : []),
    ...occupiedSegments.flatMap((segment) => [
      Math.min(segment.start.x, segment.end.x) - wireClearance,
      Math.max(segment.start.x, segment.end.x) + wireClearance,
    ]),
    (from.x + to.x) / 2,
    ...obstacles.flatMap((obstacle) => [obstacle.left, obstacle.right]),
  ];
  const yCandidates = [
    ...(fromDirection || toDirection ? [from.y, to.y] : []),
    ...occupiedSegments.flatMap((segment) => [
      Math.min(segment.start.y, segment.end.y) - wireClearance,
      Math.max(segment.start.y, segment.end.y) + wireClearance,
    ]),
    (from.y + to.y) / 2,
    ...obstacles.flatMap((obstacle) => [obstacle.top, obstacle.bottom]),
  ];
  const candidates = [
    ...xCandidates.map((x) => [from, { x, y: from.y }, { x, y: to.y }, to] as [Point, Point, Point, Point]),
    ...yCandidates.map((y) => [from, { x: from.x, y }, { x: to.x, y }, to] as [Point, Point, Point, Point]),
  ].filter(isClear);

  const clearance = 12;
  const detourCandidates = [
    ...obstacles.flatMap((obstacle) => [
      [from, { x: obstacle.left - clearance, y: from.y }, { x: obstacle.left - clearance, y: to.y }, to],
      [from, { x: obstacle.right + clearance, y: from.y }, { x: obstacle.right + clearance, y: to.y }, to],
      [from, { x: from.x, y: obstacle.top - clearance }, { x: to.x, y: obstacle.top - clearance }, to],
      [from, { x: from.x, y: obstacle.bottom + clearance }, { x: to.x, y: obstacle.bottom + clearance }, to],
    ] as [Point, Point, Point, Point][]),
  ].filter(isClear);

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
  const clearRoutes = [...candidates, ...detourCandidates, ...outerRoutes.filter(isClear)];
  const bestClearRoute = clearRoutes.sort((a, b) =>
    routeWireConflicts(a, occupiedSegments) - routeWireConflicts(b, occupiedSegments)
      || routeBendCount(a) - routeBendCount(b)
      || routeLength(a) - routeLength(b))[0];
  return bestClearRoute ?? null;
}

function routeLength(route: readonly Point[]): number {
  return route.slice(1).reduce((total, point, index) => {
    const previous = route[index]!;
    return total + Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y);
  }, 0);
}

function routeBendCount(route: readonly Point[]): number {
  const points = route.filter((point, index) => index === 0 || !samePoint(point, route[index - 1]!));
  let bends = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    const next = points[index + 1]!;
    if ((previous.x === current.x && current.x !== next.x)
      || (previous.y === current.y && current.y !== next.y)) bends += 1;
  }
  return bends;
}

type SearchCost = { conflicts: number; bends: number; length: number };
type SearchEntry = { state: number; cost: SearchCost };
type SearchEdge = { node: number; direction: 1 | 2; length: number; conflicts: number };

function compareSearchCosts(a: SearchCost, b: SearchCost): number {
  return a.conflicts - b.conflicts || a.bends - b.bends || a.length - b.length;
}

function findSafeOrthogonalRoute(
  from: Point,
  to: Point,
  obstacles: readonly WireObstacle[],
  fromDirection: Point | undefined,
  toDirection: Point | undefined,
  occupiedSegments: readonly WireSegment[],
): Point[] | null {
  const obstacleGap = 4;
  const wireGap = 8;
  const xs = [...new Set([
    from.x,
    to.x,
    ...obstacles.flatMap((obstacle) => [obstacle.left - obstacleGap, obstacle.right + obstacleGap]),
    ...occupiedSegments.flatMap((segment) => [
      Math.min(segment.start.x, segment.end.x) - wireGap,
      Math.max(segment.start.x, segment.end.x) + wireGap,
    ]),
  ])].sort((a, b) => a - b);
  const ys = [...new Set([
    from.y,
    to.y,
    ...obstacles.flatMap((obstacle) => [obstacle.top - obstacleGap, obstacle.bottom + obstacleGap]),
    ...occupiedSegments.flatMap((segment) => [
      Math.min(segment.start.y, segment.end.y) - wireGap,
      Math.max(segment.start.y, segment.end.y) + wireGap,
    ]),
  ])].sort((a, b) => a - b);
  const key = (point: Point) => String(point.x) + "," + String(point.y);
  const nodes: Point[] = [];
  const nodeIds = new Map<string, number>();
  for (const y of ys) {
    for (const x of xs) {
      const point = { x, y };
      if (obstacles.some((obstacle) => point.x > obstacle.left && point.x < obstacle.right
        && point.y > obstacle.top && point.y < obstacle.bottom)) continue;
      nodeIds.set(key(point), nodes.length);
      nodes.push(point);
    }
  }
  const startNode = nodeIds.get(key(from));
  const endNode = nodeIds.get(key(to));
  if (startNode === undefined || endNode === undefined) return null;
  if (startNode === endNode) return [from, to];

  const edges: SearchEdge[][] = nodes.map(() => []);
  const connect = (fromId: number, toId: number) => {
    const start = nodes[fromId]!;
    const end = nodes[toId]!;
    if (!routeClear([start, end], obstacles)) return;
    const edge = {
      direction: (start.y === end.y ? 1 : 2) as 1 | 2,
      length: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
      conflicts: routeWireConflicts([start, end], occupiedSegments),
    };
    edges[fromId]!.push({ node: toId, ...edge });
    edges[toId]!.push({ node: fromId, ...edge });
  };
  for (const y of ys) {
    const row = xs.map((x) => nodeIds.get(key({ x, y }))).filter((id) => id !== undefined);
    for (let index = 0; index < row.length - 1; index += 1) connect(row[index]!, row[index + 1]!);
  }
  for (const x of xs) {
    const column = ys.map((y) => nodeIds.get(key({ x, y }))).filter((id) => id !== undefined);
    for (let index = 0; index < column.length - 1; index += 1) connect(column[index]!, column[index + 1]!);
  }

  const stateCount = nodes.length * 3;
  const costs: Array<SearchCost | undefined> = Array.from({ length: stateCount });
  const previous: Array<number | undefined> = Array.from({ length: stateCount });
  const startState = startNode * 3;
  costs[startState] = { conflicts: 0, bends: 0, length: 0 };
  const queue: SearchEntry[] = [];
  const compareEntries = (a: SearchEntry, b: SearchEntry) =>
    compareSearchCosts(a.cost, b.cost) || a.state - b.state;
  const push = (entry: SearchEntry) => {
    let index = queue.length;
    queue.push(entry);
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (compareEntries(queue[parent]!, entry) <= 0) break;
      queue[index] = queue[parent]!;
      index = parent;
    }
    queue[index] = entry;
  };
  const pop = (): SearchEntry | undefined => {
    if (!queue.length) return undefined;
    const first = queue[0]!;
    const last = queue.pop()!;
    if (queue.length) {
      let index = 0;
      while (index * 2 + 1 < queue.length) {
        let child = index * 2 + 1;
        if (child + 1 < queue.length && compareEntries(queue[child + 1]!, queue[child]!) < 0) child += 1;
        if (compareEntries(last, queue[child]!) <= 0) break;
        queue[index] = queue[child]!;
        index = child;
      }
      queue[index] = last;
    }
    return first;
  };
  push({ state: startState, cost: costs[startState]! });

  let goalState: number | undefined;
  while (queue.length) {
    const entry = pop()!;
    const currentCost = costs[entry.state]!;
    if (compareSearchCosts(entry.cost, currentCost) !== 0) continue;
    const currentNode = Math.floor(entry.state / 3);
    if (currentNode === endNode) {
      goalState = entry.state;
      break;
    }
    for (const edge of edges[currentNode]!) {
      const currentPoint = nodes[currentNode]!;
      const nextPoint = nodes[edge.node]!;
      if (currentNode === startNode && fromDirection
        && (nextPoint.x - currentPoint.x) * fromDirection.x
          + (nextPoint.y - currentPoint.y) * fromDirection.y < 0) continue;
      if (edge.node === endNode && toDirection
        && (currentPoint.x - nextPoint.x) * toDirection.x
          + (currentPoint.y - nextPoint.y) * toDirection.y < 0) continue;
      const nextState = edge.node * 3 + edge.direction;
      const previousDirection = entry.state % 3;
      const nextCost = {
        conflicts: currentCost.conflicts + edge.conflicts,
        bends: currentCost.bends + (previousDirection !== 0 && previousDirection !== edge.direction ? 1 : 0),
        length: currentCost.length + edge.length,
      };
      if (costs[nextState] && compareSearchCosts(nextCost, costs[nextState]!) >= 0) continue;
      costs[nextState] = nextCost;
      previous[nextState] = entry.state;
      push({ state: nextState, cost: nextCost });
    }
  }
  if (goalState === undefined) return null;

  const route: Point[] = [];
  let state = goalState;
  while (state !== startState) {
    route.push(nodes[Math.floor(state / 3)]!);
    const parent = previous[state];
    if (parent === undefined) return null;
    state = parent;
  }
  route.push(from);
  return route.reverse().filter((point, index, points) => index === 0 || !samePoint(point, points[index - 1]!));
}

export function routeWire(
  from: Point,
  to: Point,
  obstacles: readonly WireObstacle[] = [],
  fromDirection?: Point,
  toDirection?: Point,
  occupiedSegments: readonly WireSegment[] = [],
  pinObstacles: PinObstaclePair = {},
): { path: string; segments: WireSegment[] } {
  const directHorizontalOrVertical = from.x === to.x || from.y === to.y;
  const directDx = to.x - from.x;
  const directDy = to.y - from.y;
  const directRespectsPins = (!fromDirection || directDx * fromDirection.x + directDy * fromDirection.y >= 0)
    && (!toDirection || -directDx * toDirection.x - directDy * toDirection.y >= 0);
  const sharesPinObstacle = pinObstacles.from !== undefined && pinObstacles.from === pinObstacles.to;
  const directObstacles = obstacles.filter((obstacle) => obstacle !== pinObstacles.from
    && obstacle !== pinObstacles.to);
  if ((pinObstacles.from || pinObstacles.to)
    && !samePoint(from, to) && directHorizontalOrVertical && directRespectsPins && !sharesPinObstacle
    && routeClear([from, to], directObstacles)
    && routeWireConflicts([from, to], occupiedSegments) === 0) {
    return {
      path: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      segments: [{ start: from, end: to }],
    };
  }

  const pinStubLength = 6;
  const maxAlignedStubLength = 24;
  const stubPairs: Array<{ from: number; to: number }> = [];
  const addStubPair = (fromLength: number, toLength: number) => {
    if ((!fromDirection && fromLength !== 0) || (!toDirection && toLength !== 0)) return;
    if ((fromDirection && (fromLength < pinStubLength || fromLength > maxAlignedStubLength))
      || (toDirection && (toLength < pinStubLength || toLength > maxAlignedStubLength))) return;
    if (stubPairs.some((pair) => pair.from === fromLength && pair.to === toLength)) return;
    stubPairs.push({ from: fromLength, to: toLength });
  };
  const baseFromLength = fromDirection ? pinStubLength : 0;
  const baseToLength = toDirection ? pinStubLength : 0;
  addStubPair(baseFromLength, baseToLength);
  if (fromDirection && toDirection) {
    if (fromDirection.x !== 0) {
      addStubPair((to.x + toDirection.x * baseToLength - from.x) / fromDirection.x, baseToLength);
    }
    if (toDirection.x !== 0) {
      addStubPair(baseFromLength, (from.x + fromDirection.x * baseFromLength - to.x) / toDirection.x);
    }
    if (fromDirection.y !== 0) {
      addStubPair((to.y + toDirection.y * baseToLength - from.y) / fromDirection.y, baseToLength);
    }
    if (toDirection.y !== 0) {
      addStubPair(baseFromLength, (from.y + fromDirection.y * baseFromLength - to.y) / toDirection.y);
    }
  }

  const endpointSafe = (start: Point, end: Point, ownObstacle?: WireObstacle) =>
    routeClear([start, end], obstacles.filter((obstacle) => obstacle !== ownObstacle));
  const alignedStubRoutes = (fromDirection || toDirection) ? stubPairs.flatMap((pair) => {
    const routeFrom = fromDirection
      ? { x: from.x + fromDirection.x * pair.from, y: from.y + fromDirection.y * pair.from }
      : from;
    const routeTo = toDirection
      ? { x: to.x + toDirection.x * pair.to, y: to.y + toDirection.y * pair.to }
      : to;
    if (routeFrom.x !== routeTo.x && routeFrom.y !== routeTo.y) return [];
    const dx = routeTo.x - routeFrom.x;
    const dy = routeTo.y - routeFrom.y;
    if ((fromDirection && dx * fromDirection.x + dy * fromDirection.y < 0)
      || (toDirection && -dx * toDirection.x - dy * toDirection.y < 0)) return [];
    if (!endpointSafe(from, routeFrom, pinObstacles.from)
      || !endpointSafe(routeTo, to, pinObstacles.to)
      || !routeClear([routeFrom, routeTo], obstacles)) return [];
    const points = [from, routeFrom, routeTo, to]
      .filter((point, index, route) => index === 0 || !samePoint(point, route[index - 1]!))
      .filter((point, index, route) => {
        if (index === 0 || index === route.length - 1) return true;
        const previous = route[index - 1]!;
        const next = route[index + 1]!;
        return (previous.x !== point.x || point.x !== next.x)
          && (previous.y !== point.y || point.y !== next.y);
      });
    if (routeWireConflicts(points, occupiedSegments) > 0) return [];
    return [{ points, length: routeLength(points) }];
  }).sort((a, b) => a.length - b.length) : [];
  const alignedStubRoute = alignedStubRoutes[0];
  if (alignedStubRoute) {
    const points = alignedStubRoute.points;
    return {
      path: "M " + points[0]!.x + " " + points[0]!.y
        + points.slice(1).map((point) => " L " + point.x + " " + point.y).join(""),
      segments: points.slice(1).map((end, index) => ({ start: points[index]!, end })),
    };
  }

  const fromStubLength = baseFromLength;
  const toStubLength = baseToLength;
  const routeFrom = fromDirection
    ? { x: from.x + fromDirection.x * fromStubLength, y: from.y + fromDirection.y * fromStubLength }
    : from;
  const routeTo = toDirection
    ? { x: to.x + toDirection.x * toStubLength, y: to.y + toDirection.y * toStubLength }
    : to;
  const candidateRoute = wireRoute(routeFrom, routeTo, obstacles, fromDirection, toDirection, occupiedSegments);
  const candidateIsSafe = candidateRoute !== null
    && routeClear(candidateRoute, obstacles)
    && routeRespectsPins(candidateRoute, fromDirection, toDirection);
  let coreRoute: readonly Point[] | null = candidateIsSafe ? candidateRoute : null;
  if (!candidateIsSafe || routeWireConflicts(candidateRoute ?? [], occupiedSegments) > 0) {
    const plannedRoute = findSafeOrthogonalRoute(
      routeFrom,
      routeTo,
      obstacles,
      fromDirection,
      toDirection,
      occupiedSegments,
    );
    if (!plannedRoute && !candidateIsSafe) return { path: "", segments: [] };
    if (plannedRoute) {
      const plannedConflicts = routeWireConflicts(plannedRoute, occupiedSegments);
      const candidateConflicts = candidateRoute
        ? routeWireConflicts(candidateRoute, occupiedSegments)
        : Number.POSITIVE_INFINITY;
      if (!candidateIsSafe || plannedConflicts < candidateConflicts
        || (candidateRoute && plannedConflicts === candidateConflicts
          && routeLength(plannedRoute) < routeLength(candidateRoute))) {
        coreRoute = plannedRoute;
      }
    }
  }
  if (!coreRoute) return { path: "", segments: [] };
  const rawPoints = [
    from,
    ...(fromDirection ? [routeFrom] : []),
    ...coreRoute.slice(1, -1),
    ...(toDirection ? [routeTo] : []),
    to,
  ];
  const points = fromDirection || toDirection
    ? rawPoints.filter((point, index, route) => index === 0 || !samePoint(point, route[index - 1]!))
    .filter((point, index, route) => {
      if (index === 0 || index === route.length - 1) return true;
      const previous = route[index - 1]!;
      const next = route[index + 1]!;
      return (previous.x !== point.x || point.x !== next.x)
        && (previous.y !== point.y || point.y !== next.y);
    })
    : rawPoints;
  const segments = points.slice(1).map((end, index) => ({ start: points[index]!, end }));
  const path = "M " + points[0]!.x + " " + points[0]!.y
    + points.slice(1).map((point) => " L " + point.x + " " + point.y).join("");
  return { path, segments };
}

export type RoutedCircuitWire = {
  wire: CircuitWire;
  from: Point;
  to: Point;
  path: string;
  segments: WireSegment[];
};

export function routeCircuitWires(
  circuit: CircuitState,
  obstacles: readonly WireObstacle[] = getWireObstacles(circuit),
): RoutedCircuitWire[] {
  const obstacleByComponentId = new Map(circuit.components.map((component, index) => [component.id, obstacles[index]]));
  const occupiedSegments: WireSegment[] = [];
  const routedWires: RoutedCircuitWire[] = [];
  for (const wire of circuit.wires) {
    const from = getPinAbsolutePosition(circuit, wire.from);
    const to = getPinAbsolutePosition(circuit, wire.to);
    if (!from || !to) continue;
    const route = routeWire(
      from,
      to,
      obstacles,
      getPinOutwardDirection(circuit, wire.from) ?? undefined,
      getPinOutwardDirection(circuit, wire.to) ?? undefined,
      occupiedSegments,
      {
        from: obstacleByComponentId.get(wire.from.compId),
        to: obstacleByComponentId.get(wire.to.compId),
      },
    );
    occupiedSegments.push(...route.segments);
    routedWires.push({ wire, from, to, ...route });
  }
  return routedWires;
}

export function wirePath(
  from: Point,
  to: Point,
  obstacles: readonly WireObstacle[] = [],
  fromDirection?: Point,
  toDirection?: Point,
  occupiedSegments: readonly WireSegment[] = [],
): string {
  return routeWire(from, to, obstacles, fromDirection, toDirection, occupiedSegments).path;
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
