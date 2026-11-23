// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { part } from '../test/coreHelpers';
import { distToSegment, getPinAbsolutePosition, getWireObstacles, rotatePoint, routeCircuitWires, routeWire, snap, wirePath, wireRoute } from './geometry';

describe('snapping', () => {
  it.each([[0, 0], [9, 0], [10, 20], [29, 20], [30, 40], [-9, -0], [-10, -0], [-11, -20], [-30, -20]])(
    'matches Math.round at %s', (value, expected) => expect(snap(value)).toBe(expected),
  );
  it('leaves values unchanged when off and supports an explicit grid size', () => {
    expect(snap(13.25, false)).toBe(13.25);
    expect(snap(-11, true, 10)).toBe(-10);
  });
});

describe('pin rotation', () => {
  it.each([[0, 70, 200], [90, 100, 170], [180, 130, 200], [270, 100, 230]])(
    'rotates a resistor pin at %s degrees', (rotation, x, y) => {
      const circuit = { components: [part({ x: 100, y: 200, rotation })], wires: [] };
      const position = getPinAbsolutePosition(circuit, { compId: 'r1', pinId: 'pin1' });
      expect(position?.x).toBeCloseTo(x);
      expect(position?.y).toBeCloseTo(y);
    },
  );
  it('keeps ground and logic-gate offsets exact', () => {
    const circuit = { components: [part({ type: 'ground', rotation: 90 })], wires: [] };
    expect(getPinAbsolutePosition(circuit, { compId: 'r1', pinId: 'gnd' })?.x).toBeCloseTo(10);
    circuit.components = [part({ type: 'and_gate', x: 20, y: 40, rotation: 90 })];
    const position = getPinAbsolutePosition(circuit, { compId: 'r1', pinId: 'inA' });
    expect(position?.x).toBeCloseTo(28);
    expect(position?.y).toBeCloseTo(10);
    expect(rotatePoint({ x: 8, y: 3 }, 0)).toEqual({ x: 8, y: 3 });
  });
  it('returns null for absent parts and pins', () => {
    expect(getPinAbsolutePosition({ components: [], wires: [] }, { compId: 'missing', pinId: 'pin1' })).toBeNull();
    expect(getPinAbsolutePosition({ components: [part()], wires: [] }, { compId: 'r1', pinId: 'missing' })).toBeNull();
  });
});

describe('orthogonal route and distances', () => {
  it('uses exactly three midpoint-X segments in both directions', () => {
    const from = { x: 10, y: 20 };
    const to = { x: 90, y: 100 };
    expect(wireRoute(from, to)).toEqual([from, { x: 50, y: 20 }, { x: 50, y: 100 }, to]);
    expect(wirePath(from, to)).toBe('M 10 20 L 50 20 L 50 100 L 90 100');
    expect(wirePath(to, from)).toBe('M 90 100 L 50 100 L 50 20 L 10 20');
    expect(wirePath(from, from)).toBe('M 10 20 L 10 20 L 10 20 L 10 20');
    expect(wirePath(from, { x: 10, y: 50 })).toBe('M 10 20 L 10 20 L 10 50 L 10 50');
  });
  it('routes around an existing wire when a clear lane is available', () => {
    const from = { x: 50, y: 0 };
    const to = { x: 50, y: 100 };
    const occupiedSegments = [{ start: { x: 0, y: 50 }, end: { x: 100, y: 50 } }];
    expect(wireRoute(from, to, [], undefined, undefined, occupiedSegments)).toEqual([
      from,
      { x: -8, y: 0 },
      { x: -8, y: 100 },
      to,
    ]);
  });
  it('finds a multi-bend path around component obstacles when simple routes are blocked', () => {
    const obstacles = [
      { left: -1, top: -100, right: 1, bottom: -1 },
      { left: -1, top: 1, right: 1, bottom: 100 },
      { left: 40, top: -10, right: 60, bottom: 10 },
    ];
    const route = routeWire({ x: 0, y: 0 }, { x: 100, y: 0 }, obstacles);
    expect(route.segments.length).toBeGreaterThan(3);
    for (const { start, end } of route.segments) {
      const passesThroughObstacle = obstacles.some((obstacle) => start.y === end.y
        ? Math.max(start.x, end.x) > obstacle.left && Math.min(start.x, end.x) < obstacle.right
          && start.y > obstacle.top && start.y < obstacle.bottom
        : start.x === end.x
          && Math.max(start.y, end.y) > obstacle.top && Math.min(start.y, end.y) < obstacle.bottom
          && start.x > obstacle.left && start.x < obstacle.right);
      expect(passesThroughObstacle).toBe(false);
    }
  });
  it('routes around a rotated component with clearance for its visible symbol', () => {
    const circuit = { components: [part({ type: 'inductor', x: 100, y: 100, rotation: 90 })], wires: [] };
    const obstacles = getWireObstacles(circuit);
    const route = routeWire({ x: 20, y: 100 }, { x: 180, y: 100 }, obstacles);
    expect(route.path).not.toBe('');
    for (const { start, end } of route.segments) {
      const passesThroughObstacle = obstacles.some((obstacle) => start.y === end.y
        ? Math.max(start.x, end.x) > obstacle.left && Math.min(start.x, end.x) < obstacle.right
          && start.y > obstacle.top && start.y < obstacle.bottom
        : start.x === end.x
          && Math.max(start.y, end.y) > obstacle.top && Math.min(start.y, end.y) < obstacle.bottom
          && start.x > obstacle.left && start.x < obstacle.right);
      expect(passesThroughObstacle).toBe(false);
    }
  });
  it('keeps aligned pin-to-pin wires straight without short terminal jogs', () => {
    const circuit = {
      components: [
        part({ id: 'r1', type: 'resistor', x: 100, y: 100 }),
        part({ id: 'c1', type: 'capacitor', label: 'C1', x: 100, y: 260 }),
      ],
      wires: [{ id: 'w1', from: { compId: 'r1', pinId: 'pin2' }, to: { compId: 'c1', pinId: 'pin2' } }],
    };
    const [route] = routeCircuitWires(circuit);
    expect(route?.path).toBe('M 130 100 L 130 260');
    expect(route?.segments).toEqual([{ start: { x: 130, y: 100 }, end: { x: 130, y: 260 } }]);
  });
  it('keeps a route when both pin stubs clear their component bounds', () => {
    const circuit = {
      components: [
        part({ id: 'c1', type: 'capacitor', label: 'C1', x: 100, y: 100, rotation: 90 }),
        part({ id: 'l1', type: 'inductor', label: 'L1', x: 300, y: 300, rotation: 90 }),
      ],
      wires: [{ id: 'w1', from: { compId: 'c1', pinId: 'pin2' }, to: { compId: 'l1', pinId: 'pin1' } }],
    };
    const [route] = routeCircuitWires(circuit);
    expect(route?.path).not.toBe('');
    expect(route?.segments.length).toBeGreaterThan(1);
  });
  it('extends a nearby pin stub to avoid a tiny connection jog', () => {
    const circuit = {
      components: [
        part({ id: 'c1', type: 'capacitor', label: 'C1', x: 100, y: 100, rotation: 90 }),
        part({ id: 'l1', type: 'inductor', label: 'L1', x: 141, y: 300 }),
      ],
      wires: [{ id: 'w1', from: { compId: 'c1', pinId: 'pin2' }, to: { compId: 'l1', pinId: 'pin1' } }],
    };
    const [route] = routeCircuitWires(circuit);
    expect(route?.path).toBe('M 100 130 L 100 300 L 111 300');
  });
  it('aligns stubs for the reverse pin-orientation combination too', () => {
    const circuit = {
      components: [
        part({ id: 'l1', type: 'inductor', label: 'L1', x: 141, y: 100 }),
        part({ id: 'c1', type: 'capacitor', label: 'C1', x: 100, y: 300, rotation: 90 }),
      ],
      wires: [{ id: 'w1', from: { compId: 'l1', pinId: 'pin1' }, to: { compId: 'c1', pinId: 'pin1' } }],
    };
    const [route] = routeCircuitWires(circuit);
    expect(route?.path).toBe('M 111 100 L 100 100 L 100 270');
  });
  it('projects onto a segment and clamps beyond endpoints, including zero length', () => {
    expect(distToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
    expect(distToSegment({ x: -3, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(distToSegment({ x: 13, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(distToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
    expect(distToSegment({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(0);
  });
});
