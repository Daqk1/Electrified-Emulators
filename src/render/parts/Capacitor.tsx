import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Capacitor({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 0 L -6 0 M -6 -12 L -6 12 M 6 -12 L 6 12 M 6 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} />
  </>;
}
