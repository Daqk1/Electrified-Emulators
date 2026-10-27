import type { Point, Viewport } from './types';

// Structural data only: callers may pass a DOM rectangle at the UI boundary.
export type ScreenOrigin = { left: number; top: number };
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 4;

export function createInitialViewport(): Viewport {
  return { panX: 300, panY: 200, zoom: 1 };
}

export function screenToWorld(screen: Point, rect: ScreenOrigin, viewport: Viewport): Point {
  return {
    x: (screen.x - rect.left - viewport.panX) / viewport.zoom,
    y: (screen.y - rect.top - viewport.panY) / viewport.zoom,
  };
}

export function worldToScreen(world: Point, rect: ScreenOrigin, viewport: Viewport): Point {
  return {
    x: world.x * viewport.zoom + viewport.panX + rect.left,
    y: world.y * viewport.zoom + viewport.panY + rect.top,
  };
}

// center is relative to the SVG rectangle, not the browser window.
export function zoomViewport(viewport: Viewport, factor: number, center: Point): Viewport {
  const zoom = Math.min(Math.max(MIN_ZOOM, viewport.zoom * factor), MAX_ZOOM);
  return {
    panX: center.x - (center.x - viewport.panX) * (zoom / viewport.zoom),
    panY: center.y - (center.y - viewport.panY) * (zoom / viewport.zoom),
    zoom,
  };
}
