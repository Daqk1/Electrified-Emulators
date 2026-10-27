export type RenderVariant = 'canvas' | 'palette' | 'export';
export type PartProps = { variant?: RenderVariant };

export function PartOutline({ variant = 'canvas', x = -32, y = -14, width = 64, height = 28 }: PartProps & {
  x?: number; y?: number; width?: number; height?: number;
}) {
  if (variant !== 'canvas') return null;
  return <rect x={x} y={y} width={width} height={height} fill="transparent" stroke="transparent" className="comp-outline" strokeWidth="1.5" />;
}
