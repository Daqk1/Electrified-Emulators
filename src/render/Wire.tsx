import { wirePath } from '../core/geometry';
import type { Point } from '../core/types';
import type { RenderVariant } from './parts/shared';

export function Wire({ id, from, to, selected = false, variant = 'canvas' }: {
  id: string; from: Point; to: Point; selected?: boolean; variant?: RenderVariant;
}) {
  const path = wirePath(from, to);
  return <g className="circuit-wire-group" data-id={id}>
    {variant === 'canvas' && <path d={path} stroke="transparent" strokeWidth="12" fill="none" data-hit-path="" style={{ cursor: 'pointer' }} />}
    <path d={path} className={`circuit-wire${variant === 'canvas' && selected ? ' selected' : ''}`}
      stroke="#06d6a0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {[from, to].map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3"
      className="junction-dot" fill="#06d6a0" stroke="#18181d" strokeWidth="1" />)}
  </g>;
}
