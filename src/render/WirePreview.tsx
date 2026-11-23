import { wirePath } from '../core/geometry';
import type { Point } from '../core/types';

export function WirePreview({ from, to, pathData }: { from: Point; to: Point; pathData?: string }) {
  return <path d={pathData ?? wirePath(from, to)} className="circuit-wire-preview" stroke="#ffd166"
    strokeWidth="2" strokeDasharray="4,4" fill="none" pointerEvents="none" />;
}
