import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Switch({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 0 L -12 0 M -12 0 L 10 -10 M 12 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <circle cx="-12" cy="0" r="2.5" fill="#f0f0f5" />
    <circle cx="12" cy="0" r="2.5" fill="#f0f0f5" />
    <PartOutline variant={variant} />
  </>;
}
