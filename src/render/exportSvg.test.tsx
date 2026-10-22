import { describe, expect, it } from 'vitest';
import { createDemoCircuit } from '../core/demo';
import { getPinAbsolutePosition, wirePath } from '../core/geometry';
import { part, deepFreeze } from '../test/coreHelpers';
import { exportSvg } from './exportSvg';

const parse = (source: string) => new DOMParser().parseFromString(source, 'image/svg+xml');

describe('standalone SVG serialization', () => {
  it('uses export bounds, explicit background/styles and the same wire geometry', () => {
    const circuit = deepFreeze(createDemoCircuit());
    const doc = parse(exportSvg(circuit));
    expect(doc.querySelector('parsererror')).toBeNull();
    const svg = doc.documentElement;
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe('110 90 600 440');
    expect(svg.getAttribute('width')).toBe('600');
    expect(svg.getAttribute('height')).toBe('440');
    expect(svg.firstElementChild?.getAttribute('fill')).toBe('#18181d');
    expect(svg.querySelectorAll('.circuit-comp')).toHaveLength(5);
    expect(svg.querySelectorAll('.circuit-pin')).toHaveLength(9);
    expect(svg.querySelectorAll('.junction-dot')).toHaveLength(10);
    for (const wire of circuit.wires) {
      const path = svg.querySelector(`[data-id="${wire.id}"] path`)!;
      expect(path.getAttribute('d')).toBe(wirePath(getPinAbsolutePosition(circuit, wire.from)!, getPinAbsolutePosition(circuit, wire.to)!));
      expect(path.getAttribute('stroke')).toBe('#06d6a0');
      expect(path.getAttribute('stroke-width')).toBe('2.5');
    }
    expect(svg.querySelectorAll('[stroke^="var"],[fill^="var"],pattern,filter,.comp-outline,[data-hit-path]')).toHaveLength(0);
  });
  it('escapes label/value markup as literal text and never inserts elements or attributes', () => {
    const circuit = { components: [part({ label: '<script>alert("x")</script>', value: '5V & "quoted" <image href="bad" />' })], wires: [] };
    const source = exportSvg(circuit);
    const doc = parse(source);
    expect(doc.querySelector('parsererror,script,image')).toBeNull();
    expect([...doc.querySelectorAll('text')].map((node) => node.textContent)).toEqual([circuit.components[0]!.label, circuit.components[0]!.value]);
    expect(source).toContain('&lt;script&gt;');
    expect(source).toContain('&amp;');
  });
  it('ignores extra editor state and supports empty circuits and PNG source dimensions', () => {
    const circuit = createDemoCircuit();
    const withEditorState = { ...circuit, selection: { type: 'component', id: 'r1' }, wiring: { preview: { x: 1, y: 2 } } };
    expect(exportSvg(withEditorState)).toBe(exportSvg(circuit));
    expect(exportSvg(circuit)).not.toMatch(/selected|preview|outline|hit-path|grid|cursor|filter/);
    expect(parse(exportSvg({ components: [], wires: [] })).documentElement.getAttribute('viewBox')).toBe('-40 -40 480 380');
    const png = parse(exportSvg(circuit, { format: 'png' })).documentElement;
    expect(png.getAttribute('viewBox')).toBe('100 80 620 460');
    expect(png.getAttribute('width')).toBe('620');
  });
});
