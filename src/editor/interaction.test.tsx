import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { mockSvgRect } from '../test/svg';

export function setupEditor() {
  const view = render(<App />);
  const svg = screen.getByRole('img', { name: 'Circuit schematic' }) as unknown as SVGSVGElement;
  mockSvgRect(svg);
  return { ...view, svg, root: svg.querySelector('#world-root')! };
}
const primary = { pointerId: 1, isPrimary: true };
const setup = setupEditor;

export function dropPart(svg: SVGSVGElement, type: string, x: number, y: number) {
  const event = new MouseEvent('drop', { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(event, 'dataTransfer', { value: { getData: () => type } });
  fireEvent(svg, event);
}

describe('viewport interactions', () => {
  it.each(['middle', 'alt', 'drag'])('pans with %s and releases capture on cancellation', (mode) => {
    const { svg, root } = setup();
    if (mode === 'drag') fireEvent.click(screen.getByRole('button', { name: 'Drag' }));
    fireEvent.pointerDown(svg, { ...primary, button: mode === 'middle' ? 1 : 0, altKey: mode === 'alt', clientX: 600, clientY: 300 });
    expect(svg.hasPointerCapture(1)).toBe(true);
    expect(svg).toHaveStyle({ cursor: 'grabbing' });
    fireEvent.pointerMove(svg, { ...primary, clientX: 650, clientY: 330 });
    expect(root).toHaveAttribute('transform', 'translate(350, 230) scale(1)');
    fireEvent.pointerCancel(svg, primary);
    expect(svg.hasPointerCapture(1)).toBe(false);
    expect(svg).toHaveStyle({ cursor: mode === 'drag' ? 'grab' : 'default' });
    fireEvent.pointerMove(svg, { ...primary, clientX: 800, clientY: 400 });
    expect(root).toHaveAttribute('transform', 'translate(350, 230) scale(1)');
  });
  it('anchors wheel zoom, prevents page scroll, and resets view', () => {
    const { svg, root } = setup();
    const wheel = new WheelEvent('wheel', { deltaY: -1, clientX: 760, clientY: 352, bubbles: true, cancelable: true });
    fireEvent(svg, wheel);
    expect(wheel.defaultPrevented).toBe(true);
    expect(root).toHaveAttribute('transform', 'translate(280, 190) scale(1.1)');
    fireEvent.click(screen.getByRole('button', { name: '100%' }));
    expect(root).toHaveAttribute('transform', 'translate(300, 200) scale(1)');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(root).toHaveAttribute('transform', 'translate(280, 180) scale(1.2)');
    for (let index = 0; index < 25; index++) fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(screen.getByText('Zoom:')).toHaveTextContent('20%');
  });
  it('changes tools using shortcuts and toggles snap without hiding the grid', () => {
    const { svg } = setup();
    for (const [key, text] of [['w', 'Smart Pin-to-Pin Wiring'], ['h', 'Canvas Dragging'], ['v', 'Select & Move'], [' ', 'Canvas Dragging']]) {
      fireEvent.keyDown(window, { key });
      expect(screen.getByText(`Tool: ${text}`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: /Grid: 20px/ }));
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(svg.querySelector('[data-layer="grid"]')).not.toBeNull();
  });
});

describe('placement and transforms', () => {
  it('handles repeated ID candidates without collisions or stale label allocation', () => {
    const { svg } = setup();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000');
    for (let index = 0; index < 3; index++) fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    expect(new Set([...svg.querySelectorAll('.circuit-comp')].map((part) => part.getAttribute('data-id'))).size).toBe(3);
    expect([...svg.querySelectorAll('.circuit-comp')].map((part) => part.textContent)).toEqual(['R11kΩ', 'R21kΩ', 'R31kΩ']);
  });
  it('places at the current view center, selects, moves with snapping and rotates/deletes by shortcuts', () => {
    const { svg } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    let symbol = svg.querySelector('.circuit-comp')!;
    expect(symbol).toHaveAttribute('transform', 'translate(100, 100)');
    expect(symbol).toHaveClass('selected');
    fireEvent.pointerDown(svg, { ...primary, button: 0, clientX: 660, clientY: 352 });
    fireEvent.pointerMove(svg, { ...primary, clientX: 705, clientY: 379 });
    fireEvent.pointerUp(svg, primary);
    symbol = svg.querySelector('.circuit-comp')!;
    expect(symbol).toHaveAttribute('transform', 'translate(140, 120)');
    fireEvent.keyDown(window, { key: 'R' });
    expect(symbol.firstElementChild).toHaveAttribute('transform', 'rotate(90)');
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(svg.querySelector('.circuit-comp')).toBeNull();
    expect(screen.getByText('Components:')).toHaveTextContent('0');
  });
  it('drops parts using SVG offsets, preserves free coordinates with snap off, and ignores unknown types', () => {
    const { svg } = setup();
    dropPart(svg, 'capacitor', 693, 357);
    expect(svg.querySelector('.circuit-comp')).toHaveAttribute('transform', 'translate(140, 100)');
    fireEvent.click(screen.getByRole('button', { name: /Grid: 20px/ }));
    dropPart(svg, 'led', 793, 377);
    expect(svg.querySelectorAll('.circuit-comp')[1]).toHaveAttribute('transform', 'translate(233, 125)');
    dropPart(svg, '__proto__', 0, 0);
    expect(svg.querySelectorAll('.circuit-comp')).toHaveLength(2);
  });
  it('fills label gaps and allocates unique IDs, even across repeated palette clicks', () => {
    const { svg } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    const ids = [...svg.querySelectorAll('.circuit-comp')].map((part) => part.getAttribute('data-id'));
    expect(new Set(ids).size).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    expect(svg.querySelectorAll('.circuit-comp')[1]?.textContent).toContain('R2');
  });
  it('ignores shortcuts while typing and rejects secondary-button selection', () => {
    render(<input aria-label="Typing field" />);
    const { svg } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Typing field' }), { key: 'Delete' });
    expect(svg.querySelector('.circuit-comp')).not.toBeNull();
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerDown(svg, { ...primary, button: 2, clientX: 660, clientY: 352 });
    expect(svg.querySelector('.selected')).toBeNull();
  });
});

describe('wiring interactions', () => {
  function wireSetup() {
    const view = setup();
    dropPart(view.svg, 'resistor', 660, 352);
    dropPart(view.svg, 'resistor', 860, 452);
    const click = (x: number, y: number) => {
      fireEvent.pointerDown(view.svg, { ...primary, button: 0, clientX: x, clientY: y });
      fireEvent.pointerUp(view.svg, primary);
    };
    return { ...view, click };
  }
  it('starts from Drag-tool pins, snaps previews at radius 18 and completes only inside radius 12', () => {
    const { svg, click } = wireSetup();
    fireEvent.click(screen.getByRole('button', { name: 'Drag' }));
    click(690, 352);
    expect(screen.getByText('Tool: Smart Pin-to-Pin Wiring')).toBeInTheDocument();
    fireEvent.pointerMove(svg, { ...primary, clientX: 830, clientY: 468 });
    expect(svg.querySelector('.circuit-wire-preview')).toHaveAttribute('d', 'M 130 100 L 200 100 L 200 200 L 270 200');
    expect(svg.querySelector('.snap-target')).not.toBeNull();
    click(830, 452);
    expect(svg.querySelectorAll('.circuit-wire')).toHaveLength(1);
    expect(svg.querySelector('.circuit-wire-preview')).toBeNull();
    expect(screen.getByText('Nets / Wires:')).toHaveTextContent('1');
    click(830, 452);
    click(690, 352);
    expect(svg.querySelectorAll('.circuit-wire')).toHaveLength(1);
  });
  it('cancels on same pin, empty space, Escape and tool changes', () => {
    const { svg, click } = wireSetup();
    for (const cancel of [() => click(690, 352), () => click(1000, 600),
      () => fireEvent.keyDown(window, { key: 'Escape' }), () => fireEvent.click(screen.getByRole('button', { name: 'Select' }))]) {
      click(690, 352);
      expect(svg.querySelector('.circuit-wire-preview')).not.toBeNull();
      cancel();
      expect(svg.querySelector('.circuit-wire-preview')).toBeNull();
      expect(svg.querySelectorAll('.circuit-wire')).toHaveLength(0);
    }
  });
  it('selects wires by world segments and cascades deletion of attached wires', () => {
    const { svg, click } = wireSetup();
    click(690, 352); click(830, 452);
    fireEvent.click(screen.getByRole('button', { name: 'Select' }));
    click(760, 402);
    expect(svg.querySelector('.circuit-wire')).toHaveClass('selected');
    click(660, 352);
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(svg.querySelectorAll('.circuit-wire')).toHaveLength(0);
    expect(svg.querySelectorAll('.circuit-comp')).toHaveLength(1);
  });
});

describe('inspector and netlist', () => {
  it('edits label/value without shortcuts firing, updates SVG and netlist, and rotates in the inspector', () => {
    const { svg } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    const label = screen.getByRole('textbox', { name: 'Identifier / Label' });
    const value = screen.getByRole('textbox', { name: 'Component Value' });
    fireEvent.change(label, { target: { value: 'LOAD' } });
    fireEvent.change(value, { target: { value: '220Ω' } });
    fireEvent.keyDown(value, { key: 'r' });
    expect(svg.querySelector('.circuit-comp')?.textContent).toBe('LOAD220Ω');
    expect(svg.querySelector('.circuit-comp')?.firstElementChild).toHaveAttribute('transform', 'rotate(0)');
    fireEvent.click(screen.getByRole('button', { name: 'Rotate component 90 degrees' }));
    expect(screen.getByText('90°')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Netlist / Nodes' }));
    expect(screen.getByLabelText('Circuit netlist')).toHaveTextContent('LOAD N001 N002 220Ω');
    expect(screen.getByLabelText('Circuit netlist').textContent).not.toContain('OPEN');
  });
  it('updates pin status after wiring and netlist after delete while the tab remains open', () => {
    const { svg } = setup();
    dropPart(svg, 'resistor', 660, 352); dropPart(svg, 'resistor', 860, 452);
    fireEvent.pointerDown(svg, { ...primary, button: 0, clientX: 690, clientY: 352 });
    fireEvent.pointerDown(svg, { ...primary, button: 0, clientX: 830, clientY: 452 });
    expect(screen.getByText('Connected')).toHaveStyle({ color: '#06d6a0' });
    expect(screen.getByText('Open')).toHaveStyle({ color: '#ef476f' });
    fireEvent.click(screen.getByRole('tab', { name: 'Netlist / Nodes' }));
    expect(screen.getByLabelText('Circuit netlist')).toHaveTextContent('R2');
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(screen.getByLabelText('Circuit netlist').textContent).not.toContain('R2');
    expect(screen.getByText('Nets / Wires:')).toHaveTextContent('0');
  });
});
