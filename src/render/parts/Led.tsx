import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Led({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 0 L -10 0 M -10 -10 L 10 0 L -10 10 Z M 10 -10 L 10 10 M 10 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <path d="M -2 -8 L 4 -16 M 1 -17 L 4 -16 L 4 -13" fill="none" stroke="#ffd166" strokeWidth="1.5" />
    <path d="M 4 -5 L 10 -13 M 7 -14 L 10 -13 L 10 -10" fill="none" stroke="#ffd166" strokeWidth="1.5" />
    <PartOutline variant={variant} y={-18} height={36} />
  </>;
}
