// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { circuitWithRoute, part } from '../test/coreHelpers';
import { findComponentAtWorldPos, findPinAtWorldPos, findWireAtWorldPos, wirePreviewTarget } from './hitTests';
import { rotatePoint } from './geometry';

describe('pin hit tests and preview targets', () => {
  it('includes radius 12, using component then pin order', () => {
    const circuit = { components: [part(), part({ id: 'top' })], wires: [] };
    expect(findPinAtWorldPos(circuit, { x: -30, y: 12 })).toEqual({ compId: 'r1', pinId: 'pin1' });
    expect(findPinAtWorldPos(circuit, { x: -30, y: 12.001 })).toBeNull();
    circuit.components = [part({ type: 'and_gate' })];
    expect(findPinAtWorldPos(circuit, { x: -30, y: 0 })).toEqual({ compId: 'r1', pinId: 'inA' });
  });
  it('uses rotated pin geometry', () => {
    const circuit = { components: [part({ rotation: 90 })], wires: [] };
    expect(findPinAtWorldPos(circuit, { x: 0, y: -30 })).toEqual({ compId: 'r1', pinId: 'pin1' });
    expect(findPinAtWorldPos(circuit, { x: -30, y: 0 })).toBeNull();
  });
  it('snaps previews within 18 units without expanding the click radius', () => {
    const circuit = circuitWithRoute();
    const from = { compId: 'r1', pinId: 'pin1' };
    const point = { x: 130, y: 118 };
    expect(findPinAtWorldPos(circuit, point)).toBeNull();
    expect(wirePreviewTarget(circuit, point, from, true)).toEqual({
      position: { x: 130, y: 100 }, hoverPin: { compId: 'r2', pinId: 'pin1' },
    });
    expect(wirePreviewTarget(circuit, { x: 130, y: 118.001 }, from, true)).toEqual({
      position: { x: 140, y: 120 }, hoverPin: null,
    });
    expect(wirePreviewTarget(circuit, { x: 51, y: 52 }, from, true)).toEqual({ position: { x: 60, y: 60 }, hoverPin: null });
    expect(wirePreviewTarget(circuit, { x: 51, y: 52 }, from, false)).toEqual({ position: { x: 51, y: 52 }, hoverPin: null });
    expect(wirePreviewTarget(circuit, { x: -29, y: 0 }, from, true)).toEqual({ position: { x: -20, y: 0 }, hoverPin: null });
  });
});

describe('component hit tests', () => {
  it('includes exact rotated corners despite floating point roundoff', () => {
    for (const rotation of [0, 90, 180, 270, 45]) {
      const point = rotatePoint({ x: 36, y: 21 }, rotation);
      expect(findComponentAtWorldPos({ components: [part({ rotation })], wires: [] }, point)?.id).toBe('r1');
    }
  });
  it('selects the topmost part within inclusive half-size plus six-unit bounds', () => {
    const circuit = { components: [part(), part({ id: 'top' })], wires: [] };
    expect(findComponentAtWorldPos(circuit, { x: 36, y: 21 })?.id).toBe('top');
    expect(findComponentAtWorldPos(circuit, { x: 36.001, y: 0 })).toBeNull();
    expect(findComponentAtWorldPos(circuit, { x: 0, y: 21.001 })).toBeNull();
  });
  it.each([0, 90, 180, 270])('fixes rotated body bounds at %s degrees', (rotation) => {
    const circuit = { components: [part({ rotation })], wires: [] };
    const vertical = rotation === 90 || rotation === 270;
    expect(findComponentAtWorldPos(circuit, vertical ? { x: 0, y: 35 } : { x: 35, y: 0 })?.id).toBe('r1');
    expect(findComponentAtWorldPos(circuit, vertical ? { x: 30, y: 0 } : { x: 0, y: 30 })).toBeNull();
  });
  it('uses ground dimensions', () => {
    const circuit = { components: [part({ type: 'ground' })], wires: [] };
    expect(findComponentAtWorldPos(circuit, { x: 21, y: 21 })?.id).toBe('r1');
    expect(findComponentAtWorldPos(circuit, { x: 22, y: 0 })).toBeNull();
  });
});

describe('wire hit tests', () => {
  it.each([{ x: 50, y: 0 }, { x: 80, y: 50 }, { x: 110, y: 100 }, { x: 30, y: 0 }, { x: 130, y: 100 }])(
    'hits each segment and endpoints at $x,$y', (point) => expect(findWireAtWorldPos(circuitWithRoute(), point)?.id).toBe('w1'),
  );
  it('uses strict distance <8 and wire order', () => {
    const circuit = circuitWithRoute();
    expect(findWireAtWorldPos(circuit, { x: 50, y: 7.999 })?.id).toBe('w1');
    expect(findWireAtWorldPos(circuit, { x: 50, y: 8 })).toBeNull();
    circuit.wires.push({ ...circuit.wires[0]!, id: 'w2' });
    expect(findWireAtWorldPos(circuit, { x: 80, y: 50 })?.id).toBe('w1');
    expect(findWireAtWorldPos(circuit, { x: 85, y: 50 }, 4)).toBeNull();
  });
  it('handles degenerate segments and missing endpoints', () => {
    const circuit = circuitWithRoute();
    circuit.components[1] = part({ id: 'r2', x: 60, y: 100 });
    expect(findWireAtWorldPos(circuit, { x: 30, y: 50 })?.id).toBe('w1');
    circuit.components[1] = part({ id: 'r2', x: 60, y: 0 });
    expect(findWireAtWorldPos(circuit, { x: 33, y: 4 })?.id).toBe('w1');
    circuit.components.pop();
    expect(findWireAtWorldPos(circuit, { x: 30, y: 0 })).toBeNull();
  });
});
