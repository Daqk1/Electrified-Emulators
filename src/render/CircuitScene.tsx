import { getPinAbsolutePosition } from '../core/geometry';
import type { CircuitState, EditorState, Selection } from '../core/types';
import { ComponentSymbol } from './ComponentSymbol';
import { Wire } from './Wire';
import { WirePreview } from './WirePreview';
import type { RenderVariant } from './parts/shared';

export function CircuitScene({ circuit, selection = null, wiring = null, variant = 'canvas' }: {
  circuit: CircuitState; selection?: Selection; wiring?: EditorState['wiring']; variant?: RenderVariant;
}) {
  const previewFrom = variant === 'canvas' && wiring ? getPinAbsolutePosition(circuit, wiring.from) : null;
  const previewTo = wiring?.hoverPin ? getPinAbsolutePosition(circuit, wiring.hoverPin) ?? wiring.preview : wiring?.preview;
  return <>
    <g data-layer="wires">
      {circuit.wires.map((wire) => {
        const from = getPinAbsolutePosition(circuit, wire.from);
        const to = getPinAbsolutePosition(circuit, wire.to);
        return from && to ? <Wire key={wire.id} id={wire.id} from={from} to={to} variant={variant}
          selected={selection?.type === 'wire' && selection.id === wire.id} /> : null;
      })}
    </g>
    {variant === 'canvas' && <g data-layer="preview">
      {previewFrom && previewTo && <WirePreview from={previewFrom} to={previewTo} />}
    </g>}
    <g data-layer="components">
      {circuit.components.map((component) => <ComponentSymbol key={component.id} component={component} variant={variant}
        selected={selection?.type === 'component' && selection.id === component.id}
        {...(variant === 'canvas' && wiring?.hoverPin?.compId === component.id ? { hoverPinId: wiring.hoverPin.pinId } : {})} />)}
    </g>
  </>;
}
