import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Resistor({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 0 L -18 0 L -14 -8 L -6 8 L 2 -8 L 10 8 L 14 -8 L 18 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} />
  </>;
}
