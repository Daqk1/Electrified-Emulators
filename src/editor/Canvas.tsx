import { forwardRef } from 'react';
import type { SVGProps } from 'react';
import type { CircuitState, EditorState, Selection, Viewport } from '../core/types';
import { CircuitScene } from '../render/CircuitScene';
import { Grid } from '../render/Grid';

type CanvasProps = Omit<SVGProps<SVGSVGElement>, 'cursor'> & {
  circuit: CircuitState; viewport: Viewport; selection?: Selection; wiring?: EditorState['wiring']; cursor?: string; viewBox?: string;
};

export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(function Canvas({ circuit, viewport, selection = null, wiring = null, cursor = 'default', viewBox, ...events }, ref) {
  return <svg {...events} ref={ref} id="circuit-canvas" role="img" aria-label="Circuit schematic" tabIndex={0} style={{ cursor, touchAction: 'none' }} viewBox={viewBox}>
    <g id="world-root" transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
      <Grid />
      <CircuitScene circuit={circuit} selection={selection} wiring={wiring} />
    </g>
  </svg>;
});
