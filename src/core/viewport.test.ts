// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createInitialViewport, screenToWorld, worldToScreen, zoomViewport } from './viewport';

describe('viewport math', () => {
  it('starts at the original reset position and converts using SVG screen offsets', () => {
    expect(createInitialViewport()).toEqual({ panX: 300, panY: 200, zoom: 1 });
    const view = { panX: -40, panY: 20, zoom: 2 };
    const rect = { left: 260, top: 52 };
    const screen = { x: 340, y: 132 };
    expect(screenToWorld(screen, rect, view)).toEqual({ x: 60, y: 30 });
    expect(worldToScreen({ x: 60, y: 30 }, rect, view)).toEqual(screen);
  });
  it.each([1.1, 0.9, 1.2, 0.833, 100, 0.001])('keeps the world point under the anchor for factor %s', (factor) => {
    const view = { panX: 300, panY: 200, zoom: 1 };
    const center = { x: 500, y: 300 };
    const next = zoomViewport(view, factor, center);
    const world = screenToWorld(center, { left: 0, top: 0 }, next);
    expect(world.x).toBeCloseTo(200);
    expect(world.y).toBeCloseTo(100);
    expect(next.zoom).toBe(Math.min(4, Math.max(0.2, factor)));
    expect(view).toEqual({ panX: 300, panY: 200, zoom: 1 });
  });
  it('does not drift at either zoom limit', () => {
    for (const [zoom, factor] of [[4, 1.1], [0.2, 0.9]]) {
      const view = { panX: 13, panY: -29, zoom: zoom! };
      expect(zoomViewport(view, factor!, { x: 321, y: 456 })).toEqual(view);
    }
  });
});
