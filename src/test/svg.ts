import { vi } from 'vitest';

// jsdom does not lay out SVGs. Tests choose an explicit screen-space canvas rect
// so world-coordinate calculations exercise real offsets instead of all zeros.
export function mockSvgRect(svg: SVGSVGElement, rect: DOMRectInit = {}) {
  return vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ x: 260, y: 52, width: 800, height: 600, ...rect }),
  );
}
