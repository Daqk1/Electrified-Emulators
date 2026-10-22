import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { DemoPreview } from './DemoPreview';

describe('static demo preview', () => {
  it('shows the full demo through a fitted viewBox with all ten palette graphics', () => {
    const { container } = render(<DemoPreview />);
    expect(screen.getByText('LED Driver Circuit')).toBeInTheDocument();
    const svg = screen.getByRole('img', { name: 'Circuit schematic' });
    expect(svg).toHaveAttribute('viewBox', '110 90 600 440');
    expect(svg.querySelectorAll('.circuit-comp')).toHaveLength(5);
    expect(svg.querySelectorAll('.circuit-wire')).toHaveLength(5);
    expect(container.querySelectorAll('.component-card')).toHaveLength(10);
  });
  it('keeps the normal editor empty with its original viewport', () => {
    render(<App />);
    const svg = screen.getByRole('img', { name: 'Circuit schematic' });
    expect(svg).not.toHaveAttribute('viewBox');
    expect(svg.querySelectorAll('.circuit-comp')).toHaveLength(0);
    expect(svg.querySelector('#world-root')).toHaveAttribute('transform', 'translate(300, 200) scale(1)');
  });
});
