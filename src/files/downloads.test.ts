import { describe, expect, it, vi } from 'vitest';
import { saveAs } from 'file-saver';
import { createDemoCircuit } from '../core/demo';
import { downloadJson, downloadPng, downloadSvg } from './downloads';
import { rasterizeSvg } from './rasterize';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));
vi.mock('./rasterize', () => ({ rasterizeSvg: vi.fn() }));
const read = (blob: Blob) => new Promise<string>((resolve) => {
  const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob);
});

describe('FileSaver downloads', () => {
  it('downloads a standalone SVG with the required name and MIME type', async () => {
    downloadSvg(createDemoCircuit(), 123);
    const [blob, name] = vi.mocked(saveAs).mock.calls[0]!;
    expect(name).toBe('CircuitEDU_Schematic_123.svg');
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as Blob).type).toBe('image/svg+xml;charset=utf-8');
    const source = await read(blob as Blob);
    expect(source).toContain('viewBox="110 90 600 440"');
    expect(source).not.toMatch(/selected|comp-outline|data-hit-path/);
  });
  it('saves the exact JSON envelope and prototype fields', async () => {
    const circuit = createDemoCircuit();
    downloadJson(circuit, 123);
    const [blob, name] = vi.mocked(saveAs).mock.calls[0]!;
    expect(name).toBe('circuit_project_123.json');
    expect((blob as Blob).type).toBe('application/json');
    expect(JSON.parse(await read(blob as Blob))).toEqual({ project: 'CircuitEDU', version: '1.0.0', timestamp: new Date(123).toISOString(), ...circuit });
  });
  it('rasterizes PNG with padding 50 and saves only after rendering succeeds', async () => {
    const png = new Blob(['png'], { type: 'image/png' });
    vi.mocked(rasterizeSvg).mockResolvedValue(png);
    await downloadPng(createDemoCircuit(), 123);
    expect(rasterizeSvg).toHaveBeenCalledWith(expect.stringContaining('viewBox="100 80 620 460"'), expect.objectContaining({ pixelWidth: 1240, pixelHeight: 920 }));
    expect(saveAs).toHaveBeenCalledWith(png, 'CircuitEDU_Schematic_123.png');
    vi.mocked(saveAs).mockClear();
    vi.mocked(rasterizeSvg).mockRejectedValue(new Error('render failed'));
    await expect(downloadPng(createDemoCircuit())).rejects.toThrow('render failed');
    expect(saveAs).not.toHaveBeenCalled();
  });
});
