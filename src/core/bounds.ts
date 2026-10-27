import type { CircuitState } from './types';

export type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number };

export function calculateCircuitBoundingBox(circuit: CircuitState): BoundingBox {
  if (!circuit.components.length) return { minX: 0, minY: 0, maxX: 400, maxY: 300 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const component of circuit.components) {
    minX = Math.min(minX, component.x - 50);
    minY = Math.min(minY, component.y - 50);
    maxX = Math.max(maxX, component.x + 50);
    maxY = Math.max(maxY, component.y + 50);
  }
  return { minX, minY, maxX, maxY };
}

export function exportDimensions(circuit: CircuitState, format: 'svg' | 'png') {
  const bounds = calculateCircuitBoundingBox(circuit);
  const padding = format === 'svg' ? 40 : 50;
  const minimum = format === 'svg' ? 0 : 200;
  const width = Math.max(minimum, bounds.maxX - bounds.minX + padding * 2);
  const height = Math.max(minimum, bounds.maxY - bounds.minY + padding * 2);
  return {
    x: bounds.minX - padding,
    y: bounds.minY - padding,
    width,
    height,
    pixelWidth: width * (format === 'png' ? 2 : 1),
    pixelHeight: height * (format === 'png' ? 2 : 1),
  };
}
