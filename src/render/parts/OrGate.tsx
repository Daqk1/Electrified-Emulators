import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function OrGate({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 -8 L -12 -8 M -30 8 L -12 8 M -16 -14 Q 0 -14 14 0 Q 0 14 -16 14 Q -8 0 -16 -14 Z M 14 0 L 30 0" fill={variant === 'palette' ? 'none' : '#18181d'} stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} y={-16} height={32} />
  </>;
}
