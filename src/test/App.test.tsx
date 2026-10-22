import { StrictMode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { Editor } from '../editor/Editor';
import { EditorProvider, useEditor } from '../state/EditorProvider';
import { mockSvgRect } from './svg';

describe('editor scaffold', () => {
  it('starts with an empty circuit and the prototype viewport under StrictMode', () => {
    render(<StrictMode><App /></StrictMode>);

    expect(screen.getByRole('heading', { name: 'CircuitEDU' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Symbol library' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Component properties' })).toBeInTheDocument();
    expect(screen.getByText('Tool: Select & Move')).toBeInTheDocument();
    expect(screen.getByText(/Select a component or wire/)).toBeInTheDocument();

    const canvas = screen.getByRole('img', { name: 'Circuit schematic' });
    expect(canvas).toHaveStyle({ cursor: 'default' });
    expect(canvas.querySelector('#world-root')).toHaveAttribute('transform', 'translate(300, 200) scale(1)');
    expect(screen.getByText('X: 0, Y: 0')).toBeInTheDocument();
    expect(screen.getByText('Enabled (20px)')).toBeInTheDocument();
    expect(screen.getByText('Components:')).toHaveTextContent('Components: 0');
    expect(screen.getByText('Nets / Wires:')).toHaveTextContent('Nets / Wires: 0');
    expect(screen.getByText('Zoom:')).toHaveTextContent('Zoom: 100%');
  });

  it('keeps each provider independent while routing typed events to both state owners', () => {
    function Commands() {
      const { dispatch } = useEditor();
      return (
        <>
          <button onClick={() => dispatch({ type: 'setTool', tool: 'drag' })}>Choose drag</button>
          <button onClick={() => dispatch({
            type: 'loadCircuit',
            circuit: {
              components: [{ id: 'test-r1', type: 'resistor', label: 'R1', value: '1kΩ', x: 0, y: 0, rotation: 0 }],
              wires: [],
            },
          })}>Load internal state</button>
        </>
      );
    }

    render(
      <>
        <section aria-label="First editor"><EditorProvider><Commands /><Editor /></EditorProvider></section>
        <section aria-label="Second editor"><App /></section>
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Choose drag' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load internal state' }));

    const first = within(screen.getByRole('region', { name: 'First editor' }));
    const second = within(screen.getByRole('region', { name: 'Second editor' }));
    expect(first.getByText('Tool: Canvas Dragging')).toBeInTheDocument();
    expect(first.getByText('Components:')).toHaveTextContent('Components: 1');
    expect(second.getByText('Tool: Select & Move')).toBeInTheDocument();
    expect(second.getByText('Components:')).toHaveTextContent('Components: 0');
  });

  it('supports SVG rectangles and pointer capture in the interaction test environment', () => {
    render(<App />);
    const canvas = screen.getByRole('img', { name: 'Circuit schematic' });
    if (!(canvas instanceof SVGSVGElement)) {
      throw new Error('The circuit workspace must render a native SVG element.');
    }
    mockSvgRect(canvas, { x: 100, width: 900 });
    expect(canvas.getBoundingClientRect()).toMatchObject({ left: 100, top: 52, width: 900, height: 600 });

    const pointer = new PointerEvent('pointerdown', { pointerId: 7, clientX: 140, clientY: 80 });
    expect(pointer.pointerId).toBe(7);
    expect(pointer.clientX).toBe(140);
    canvas.setPointerCapture(pointer.pointerId);
    expect(canvas.hasPointerCapture(7)).toBe(true);
    canvas.releasePointerCapture(7);
    expect(canvas.hasPointerCapture(7)).toBe(false);
  });
});
