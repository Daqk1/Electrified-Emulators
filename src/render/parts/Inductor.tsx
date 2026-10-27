import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Inductor({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 0 L -18 0 A 6 6 0 0 1 -6 0 A 6 6 0 0 1 6 0 A 6 6 0 0 1 18 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} />
  </>;
}
