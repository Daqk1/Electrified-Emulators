// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { part } from '../test/coreHelpers';
import { distToSegment, getPinAbsolutePosition, rotatePoint, snap, wirePath, wireRoute } from './geometry';

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
  it('projects onto a segment and clamps beyond endpoints, including zero length', () => {
    expect(distToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
    expect(distToSegment({ x: -3, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(distToSegment({ x: 13, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(distToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
    expect(distToSegment({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(0);
  });
});
