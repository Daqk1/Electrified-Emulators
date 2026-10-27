import { renderToStaticMarkup } from 'react-dom/server';
import { exportDimensions } from '../core/bounds';
import type { CircuitState } from '../core/types';
import { CircuitScene } from './CircuitScene';

// Data-only rendering: never reads a canvas element or editor state.
export function exportSvg(circuit: CircuitState, options: { format?: 'svg' | 'png' } = {}): string {
  const { x, y, width, height } = exportDimensions(circuit, options.format ?? 'svg');
  return renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`${x} ${y} ${width} ${height}`} width={width} height={height}>
      <rect x={x} y={y} width={width} height={height} fill="#18181d" />
      <CircuitScene circuit={circuit} variant="export" />
    </svg>,
  );
}
