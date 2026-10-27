import type { PinDefinition } from '../core/types';
import type { RenderVariant } from './parts/shared';

export function Pin({ pin, variant = 'canvas', snapTarget = false }: {
  pin: PinDefinition; variant?: RenderVariant; snapTarget?: boolean;
}) {
  return <g className="pin-group" data-pin-id={pin.id} transform={`translate(${pin.relX}, ${pin.relY})`}>
    <circle cx="0" cy="0" r={variant === 'palette' ? 3 : 3.5} fill="#ef476f"
      className={variant === 'palette' ? undefined : `circuit-pin${variant === 'canvas' && snapTarget ? ' snap-target' : ''}`} />
  </g>;
}
