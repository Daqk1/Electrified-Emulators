import { afterEach, describe, expect, it, vi } from 'vitest';
import { rasterizeSvg } from './rasterize';

function mockBrowser(mode = 'success') {
  let image: { onload: (() => void) | null; onerror: (() => void) | null };
  vi.stubGlobal('Image', class {
    onload = null; onerror = null;
    constructor() { image = this; }
    set src(_source: string) { if (mode === 'source') throw new Error('source failed'); }
  });
  const revoke = vi.fn();
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = vi.fn(() => 'blob:circuit');
    static revokeObjectURL = revoke;
  });
  const draw = vi.fn(() => { if (mode === 'draw') throw new Error('draw failed'); });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mode === 'context' ? null : { drawImage: draw } as unknown as CanvasRenderingContext2D);
  const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (this: HTMLCanvasElement, callback) {
    if (mode === 'encode') throw new Error('encode failed');
    expect(this.width).toBe(400); expect(this.height).toBe(402);
    callback(mode === 'blob' ? null : new Blob(['png'], { type: 'image/png' }));
  });
  return { get image() { return image!; }, revoke, draw, encode };
}
afterEach(() => vi.unstubAllGlobals());

describe('PNG rasterization lifecycle', () => {
  it('renders at the requested pixel dimensions and releases its SVG URL', async () => {
    const browser = mockBrowser();
    const pending = rasterizeSvg('<svg/>', { pixelWidth: 400, pixelHeight: 401.5 });
    browser.image.onload?.();
    expect((await pending).type).toBe('image/png');
    expect(browser.draw).toHaveBeenCalledWith(expect.anything(), 0, 0, 400, 402);
    expect(browser.revoke).toHaveBeenCalledExactlyOnceWith('blob:circuit');
    expect(browser.image.onload).toBeNull();
  });
  it.each(['image', 'context', 'draw', 'encode', 'blob', 'source'])('releases URLs and rejects on %s failure', async (mode) => {
    const browser = mockBrowser(mode);
    const pending = rasterizeSvg('<svg/>', { pixelWidth: 400, pixelHeight: 401.5 });
    if (mode === 'image') browser.image.onerror?.();
    else if (mode !== 'source') browser.image.onload?.();
    await expect(pending).rejects.toThrow();
    expect(browser.revoke).toHaveBeenCalledExactlyOnceWith('blob:circuit');
  });
});
