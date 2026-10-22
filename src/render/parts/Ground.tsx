import { PartOutline } from './shared';
import type { PartProps } from './shared';

export function Ground({ variant = 'canvas' }: PartProps) {
  return <>
    <path d="M 0 -10 L 0 6 M -14 6 L 14 6 M -9 11 L 9 11 M -4 16 L 4 16" fill="none" stroke="#f0f0f5" strokeWidth="2" className="comp-body" />
    <PartOutline variant={variant} x={-16} y={-12} width={32} height={30} />
  </>;
}
