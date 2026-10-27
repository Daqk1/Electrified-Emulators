import { wirePath } from '../core/geometry';
import type { Point } from '../core/types';

export function WirePreview({ from, to }: { from: Point; to: Point }) {
  return <path d={wirePath(from, to)} className="circuit-wire-preview" stroke="#ffd166"
    strokeWidth="2" strokeDasharray="4,4" fill="none" pointerEvents="none" />;
}
