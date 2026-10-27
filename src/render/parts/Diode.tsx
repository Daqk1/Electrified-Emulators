import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Diode({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 0 L -10 0 M -10 -10 L 10 0 L -10 10 Z M 10 -10 L 10 10 M 10 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} />
  </>;
}
