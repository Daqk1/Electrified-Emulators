// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { part } from '../test/coreHelpers';
import { calculateCircuitBoundingBox, exportDimensions } from './bounds';
import { createDemoCircuit } from './demo';

describe('circuit bounds', () => {
  it('keeps the empty fallback and centers plus/minus 50 regardless of rotation or text', () => {
    expect(calculateCircuitBoundingBox({ components: [], wires: [] })).toEqual({ minX: 0, minY: 0, maxX: 400, maxY: 300 });
    expect(calculateCircuitBoundingBox(createDemoCircuit())).toEqual({ minX: 150, minY: 130, maxX: 670, maxY: 490 });
    expect(calculateCircuitBoundingBox({ components: [part({ x: -100, y: -50, rotation: 90, label: 'long label' })], wires: [] }))
      .toEqual({ minX: -150, minY: -100, maxX: -50, maxY: 0 });
  });
  it('uses SVG/PNG padding, logical PNG minimum and 2x pixel dimensions', () => {
    expect(exportDimensions(createDemoCircuit(), 'svg')).toEqual({ x: 110, y: 90, width: 600, height: 440, pixelWidth: 600, pixelHeight: 440 });
    expect(exportDimensions(createDemoCircuit(), 'png')).toEqual({ x: 100, y: 80, width: 620, height: 460, pixelWidth: 1240, pixelHeight: 920 });
    expect(exportDimensions({ components: [part()], wires: [] }, 'png')).toEqual({ x: -100, y: -100, width: 200, height: 200, pixelWidth: 400, pixelHeight: 400 });
    expect(exportDimensions({ components: [], wires: [] }, 'png')).toEqual({ x: -50, y: -50, width: 500, height: 400, pixelWidth: 1000, pixelHeight: 800 });
  });
});
