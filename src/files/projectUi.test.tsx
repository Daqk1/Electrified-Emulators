import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import legacy from '../test/fixtures/legacy-project.json';
import { downloadJson, downloadPng, downloadSvg } from './downloads';

vi.mock('./downloads', () => ({ downloadJson: vi.fn(), downloadPng: vi.fn().mockResolvedValue(undefined), downloadSvg: vi.fn() }));

describe('project file UI', () => {
  it('loads original JSON, resets the picker for same-file retries, and updates the netlist', async () => {
    render(<App />);
    const input = screen.getByLabelText<HTMLInputElement>('Load circuit JSON');
    fireEvent.change(input, { target: { files: [new File([JSON.stringify(legacy)], 'old.json', { type: 'application/json' })] } });
    await waitFor(() => expect(screen.getByText('Components:')).toHaveTextContent('5'));
    expect(screen.getByText('Nets / Wires:')).toHaveTextContent('5');
    expect(input.value).toBe('');
    fireEvent.click(screen.getByRole('tab', { name: 'Netlist / Nodes' }));
    expect(screen.getByLabelText('Circuit netlist').textContent).toContain('0 (GND) N001');
  });
  it('keeps the current circuit on malformed import and shows a focused, keyboard-accessible modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Resistor (R)' }));
    const load = screen.getByRole('button', { name: /Load$/ });
    load.focus();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.change(screen.getByLabelText('Load circuit JSON'), { target: { files: [new File(['{"components":{},"wires":[]}'], 'bad.json')] } });
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('components and wires arrays');
    expect(screen.getByText('Components:')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Close notice' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close notice' }), { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(load).toHaveFocus();
    expect(alert).not.toHaveBeenCalled();
  });
  it('wires all download controls to circuit data and surfaces export failures', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Load Demo Circuit/ }));
    fireEvent.click(screen.getByRole('button', { name: /SVG$/ }));
    fireEvent.click(screen.getByRole('button', { name: /JSON$/ }));
    fireEvent.click(screen.getByRole('button', { name: /PNG$/ }));
    expect(downloadSvg).toHaveBeenCalledWith(expect.objectContaining({ components: legacy.components, wires: legacy.wires }));
    expect(downloadJson).toHaveBeenCalled();
    await waitFor(() => expect(downloadPng).toHaveBeenCalled());
    vi.mocked(downloadSvg).mockImplementation(() => { throw new Error('Download unavailable'); });
    fireEvent.click(screen.getByRole('button', { name: /SVG$/ }));
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Download unavailable');
  });
});
