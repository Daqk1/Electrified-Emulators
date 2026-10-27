import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function AndGate({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M -30 -8 L -14 -8 M -30 8 L -14 8 M -14 -14 L 0 -14 A 14 14 0 0 1 0 14 L -14 14 Z M 14 0 L 30 0" fill={variant === 'palette' ? 'none' : '#18181d'} stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} y={-16} height={32} />
  </>;
}
