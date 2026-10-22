import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function DcSource({ variant = 'canvas' }: PartProps) {
  return <>
    <circle cx="0" cy="0" r="14" fill={variant === 'palette' ? 'none' : '#18181d'} stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <path d="M -30 0 L -14 0 M 14 0 L 30 0" fill="none" stroke="#f0f0f5" strokeWidth="2" />
    <text x={variant === 'palette' ? -6 : -7} y="-3" fill="#f0f0f5" fontSize="9" fontFamily="sans-serif" fontWeight="bold">-</text>
    <text x="3" y="-3" fill="#f0f0f5" fontSize="9" fontFamily="sans-serif" fontWeight="bold">+</text>
    <PartOutline variant={variant} y={-16} height={32} />
  </>;
}
