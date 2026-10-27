import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDemoCircuit } from '../core/demo';
import { COMPONENT_TEMPLATES } from '../core/templates';
import type { ComponentType } from '../core/types';
import { part } from '../test/coreHelpers';
import { Canvas } from '../editor/Canvas';
import { Palette } from '../editor/Palette';
import { ComponentSymbol } from './ComponentSymbol';
import { CircuitScene } from './CircuitScene';
import { PART_SYMBOLS } from './PartGraphic';
import { Grid } from './Grid';
import { getPinAbsolutePosition, wirePath } from '../core/geometry';

// Run only the original symbol callbacks, never its DOM constructor.
const original = vm.runInNewContext(
  readFileSync(resolve(process.cwd(), 'src/test/reference/app.js'), 'utf8') + '\nCOMPONENT_TEMPLATES;',
  { window: { addEventListener() {} } },
) as Record<ComponentType, { render: () => string }>;
const types = Object.keys(COMPONENT_TEMPLATES) as ComponentType[];
const parseSvg = (source: string) => new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;

function tree(element: Element): unknown {
  return {
    tag: element.localName,
    attributes: Object.fromEntries([...element.attributes].map(({ name, value }) => [name, value]).sort()),
    text: [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent?.trim()).join(''),
    children: [...element.children].map(tree),
  };
}

// Flatten pin translation groups to compare the palette's original direct circles.
function paletteShapes(svg: Element): unknown[] {
  return [...svg.querySelectorAll('path,circle,text,rect')].map((element) => {
    const attrs = Object.fromEntries([...element.attributes].filter((attr) => attr.name !== 'class').map(({ name, value }) => [name, value]));
    if (element.localName === 'circle') {
      const transform = element.parentElement?.getAttribute('transform')?.match(/^translate\(([-\d.]+), ([-\d.]+)\)$/);
      if (transform) {
        attrs.cx = String(Number(attrs.cx) + Number(transform[1]));
        attrs.cy = String(Number(attrs.cy) + Number(transform[2]));
      }
    }
    return { tag: element.localName, attributes: attrs, text: element.textContent?.trim() };
  });
}

describe('prototype symbol parity', () => {
  it.each(types)('%s has exactly the original body paths, fills, text and outline', (type) => {
    const Body = PART_SYMBOLS[type];
    const actual = parseSvg(renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg"><Body /></svg>));
    const expected = parseSvg(`<svg xmlns="http://www.w3.org/2000/svg">${original[type].render()}</svg>`);
    expect([...actual.children].map(tree)).toEqual([...expected.children].map(tree));
  });

  it.each(types)('%s rotates its body and ordered pins while annotations remain upright', (type) => {
    for (const rotation of [0, 90, 180, 270]) {
      const component = part({ type, rotation, x: 100, y: 200 });
      const svg = parseSvg(renderToStaticMarkup(<svg><ComponentSymbol component={component} selected /></svg>));
      const outer = svg.firstElementChild!;
      expect(outer.getAttribute('transform')).toBe('translate(100, 200)');
      expect(outer.classList.contains('selected')).toBe(true);
      const body = outer.firstElementChild!;
      expect(body.getAttribute('transform')).toBe(`rotate(${rotation})`);
      const pins = [...body.querySelectorAll('.pin-group')];
      expect(pins.map((pin) => pin.getAttribute('data-pin-id'))).toEqual(COMPONENT_TEMPLATES[type].pins.map((pin) => pin.id));
      COMPONENT_TEMPLATES[type].pins.forEach((pin, index) => {
        expect(pins[index]?.getAttribute('transform')).toBe(`translate(${pin.relX}, ${pin.relY})`);
        expect(pins[index]?.querySelector('circle')?.getAttribute('r')).toBe('3.5');
      });
      const annotations = [...outer.children].filter((child) => child.localName === 'text');
      expect(annotations.map((label) => label.textContent)).toEqual([component.label, component.value]);
      expect(annotations.map((label) => label.getAttribute('y'))).toEqual(['-23', '29']);
      expect(annotations.every((label) => !label.hasAttribute('transform'))).toBe(true);
    }
  });

  it('matches all ten original palette cards, including special fills and pin sizes', () => {
    const reference = new DOMParser().parseFromString(readFileSync(resolve(process.cwd(), 'src/test/reference/index.html'), 'utf8'), 'text/html');
    const { container } = render(<Palette />);
    expect(container.querySelectorAll('.component-card')).toHaveLength(10);
    for (const type of types) {
      const expected = reference.querySelector(`[data-type="${type}"] svg`)!;
      const actual = container.querySelector(`[data-type="${type}"] svg`)!;
      expect(actual.getAttribute('viewBox')).toBe(expected.getAttribute('viewBox'));
      expect(paletteShapes(actual)).toEqual(paletteShapes(expected));
      expect(actual.querySelector('.comp-outline')).toBeNull();
    }
  });
});

describe('scene layering and decoration', () => {
  it('keeps a hovered target attached to its pin after that part moves or rotates', () => {
    const circuit = createDemoCircuit();
    circuit.components[1] = { ...circuit.components[1]!, x: 360, rotation: 90 };
    const wiring = { from: { compId: 'v1', pinId: 'pos' }, preview: { x: 310, y: 180 }, hoverPin: { compId: 'sw1', pinId: 'pin1' } };
    const { container } = render(<svg><CircuitScene circuit={circuit} wiring={wiring} /></svg>);
    expect(container.querySelector('.circuit-wire-preview')).toHaveAttribute('d', wirePath(getPinAbsolutePosition(circuit, wiring.from)!, getPinAbsolutePosition(circuit, wiring.hoverPin)!));
  });
  it('draws grid, wires, preview then five demo components with exact transforms', () => {
    const circuit = createDemoCircuit();
    const { container } = render(<Canvas circuit={circuit} viewport={{ panX: 300, panY: 200, zoom: 1 }} />);
    const root = container.querySelector('#world-root')!;
    expect([...root.children].map((element) => element.getAttribute('data-layer'))).toEqual(['grid', 'wires', 'preview', 'components']);
    expect(root.querySelectorAll('.circuit-wire')).toHaveLength(5);
    expect(root.querySelectorAll('[data-hit-path]')).toHaveLength(5);
    expect(root.querySelectorAll('.junction-dot')).toHaveLength(10);
    for (const component of circuit.components) {
      const symbol = root.querySelector(`.circuit-comp[data-id="${component.id}"]`)!;
      expect(symbol.getAttribute('transform')).toBe(`translate(${component.x}, ${component.y})`);
      expect(symbol.firstElementChild?.getAttribute('transform')).toBe(`rotate(${component.rotation})`);
    }
    for (const hit of root.querySelectorAll('[data-hit-path]')) expect(hit.getAttribute('stroke-width')).toBe('12');
    for (const dot of root.querySelectorAll('.junction-dot')) expect(dot.getAttribute('r')).toBe('3');
  });
  it('renders previews, selection and hover snaps only for the editor variant', () => {
    const circuit = createDemoCircuit();
    const wiring = { from: { compId: 'v1', pinId: 'pos' }, preview: { x: 400, y: 180 }, hoverPin: { compId: 'sw1', pinId: 'pin1' } };
    const props = { circuit, wiring, selection: { type: 'wire' as const, id: 'w1' } };
    const live = parseSvg(renderToStaticMarkup(<svg><CircuitScene {...props} /></svg>));
    expect(live.querySelector('.circuit-wire.selected')).not.toBeNull();
    expect(live.querySelector('.circuit-wire-preview')?.getAttribute('pointer-events')).toBe('none');
    expect(live.querySelector('.snap-target')).not.toBeNull();
    const exported = renderToStaticMarkup(<svg><CircuitScene {...props} variant="export" /></svg>);
    expect(exported).toBe(renderToStaticMarkup(<svg><CircuitScene circuit={circuit} variant="export" /></svg>));
    expect(exported).not.toMatch(/selected|snap-target|comp-outline|data-hit-path|circuit-wire-preview/);
  });
  it('gives every grid independent minor and major pattern IDs', () => {
    const { container } = render(<svg><Grid /><Grid /></svg>);
    const patterns = [...container.querySelectorAll('pattern')];
    expect(patterns.map((pattern) => pattern.getAttribute('width'))).toEqual(['20', '100', '20', '100']);
    expect(new Set(patterns.map((pattern) => pattern.id)).size).toBe(4);
    for (const element of container.querySelectorAll('[fill^="url"]')) {
      const id = element.getAttribute('fill')!.slice(5, -1);
      expect(patterns.some((pattern) => pattern.id === id)).toBe(true);
    }
  });
});
