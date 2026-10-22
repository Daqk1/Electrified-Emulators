import type { ComponentType } from '../core/types';
import { PartGraphic } from '../render/PartGraphic';

const categories: { title: string; parts: { type: ComponentType; name: string }[] }[] = [
  { title: 'Passive Components', parts: [
    { type: 'resistor', name: 'Resistor (R)' }, { type: 'capacitor', name: 'Capacitor (C)' },
    { type: 'inductor', name: 'Inductor (L)' }, { type: 'switch', name: 'SPST Switch' },
  ] },
  { title: 'Semiconductors & Diodes', parts: [{ type: 'led', name: 'LED (D)' }, { type: 'diode', name: 'Diode (D)' }] },
  { title: 'Sources & Reference', parts: [{ type: 'dc_source', name: 'DC Source (V)' }, { type: 'ground', name: 'Ground (GND)' }] },
  { title: 'Logic Gates', parts: [{ type: 'and_gate', name: 'AND Gate' }, { type: 'or_gate', name: 'OR Gate' }] },
];

export function Palette({ onPlace }: { onPlace?: (type: ComponentType) => void }) {
  return <aside className="sidebar-left" aria-label="Symbol library">
    <h2 className="sidebar-header">Symbol Library <span className="palette-hint">Drag / Click</span></h2>
    <div className="component-categories">
      {categories.map((category) => <div key={category.title}>
        <h3 className="category-title">{category.title}</h3>
        <div className="component-grid">
          {category.parts.map(({ type, name }) => <button key={type} type="button" className="component-card" data-type={type}
            aria-label={name} disabled={!onPlace} draggable={!!onPlace} onClick={() => onPlace?.(type)}
            onDragStart={(event) => { event.dataTransfer.setData('circuit/component-type', type); event.dataTransfer.effectAllowed = 'copy'; }}>
            <svg viewBox={type === 'ground' ? '-30 -10 60 40' : '-40 -20 80 40'} role="img" aria-label={name}>
              <PartGraphic type={type} variant="palette" />
            </svg>
            <div className="comp-name">{name}</div>
          </button>)}
        </div>
      </div>)}
    </div>
  </aside>;
}
