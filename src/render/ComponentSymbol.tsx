import { COMPONENT_TEMPLATES } from '../core/templates';
import type { CircuitComponent } from '../core/types';
import { PartGraphic } from './PartGraphic';
import type { RenderVariant } from './parts/shared';

export function ComponentSymbol({ component, selected = false, variant = 'canvas', hoverPinId }: {
  component: CircuitComponent; selected?: boolean; variant?: RenderVariant; hoverPinId?: string;
}) {
  const template = COMPONENT_TEMPLATES[component.type];
  return <g className={`circuit-comp${variant === 'canvas' && selected ? ' selected' : ''}`}
    data-id={component.id} transform={`translate(${component.x}, ${component.y})`}>
    <g transform={`rotate(${component.rotation})`}>
      <PartGraphic type={component.type} variant={variant} {...(hoverPinId ? { hoverPinId } : {})} />
    </g>
    <text x="0" y={-template.height / 2 - 8} textAnchor="middle" fill="#00b4d8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">{component.label}</text>
    <text x="0" y={template.height / 2 + 14} textAnchor="middle" fill="#9e9ea8" fontSize="10" fontFamily="sans-serif">{component.value}</text>
  </g>;
}
