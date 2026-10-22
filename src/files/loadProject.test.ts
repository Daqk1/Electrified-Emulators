import { afterEach, describe, expect, it, vi } from 'vitest';
import legacy from '../test/fixtures/legacy-project.json';
import { readProjectFile } from './loadProject';

afterEach(() => vi.unstubAllGlobals());
describe('browser file reading', () => {
  it('parses a real original-project File', async () => {
    expect(await readProjectFile(new File([JSON.stringify(legacy)], 'legacy.json'))).toEqual({ components: legacy.components, wires: legacy.wires });
  });
  it.each(['error', 'abort', 'result'])('rejects %s failures', async (mode) => {
    vi.stubGlobal('FileReader', class {
      onload: (() => void) | null = null; onerror: (() => void) | null = null; onabort: (() => void) | null = null;
      result = null;
      readAsText() { if (mode === 'error') this.onerror?.(); else if (mode === 'abort') this.onabort?.(); else this.onload?.(); }
    });
    await expect(readProjectFile(new File(['{}'], 'project.json'))).rejects.toThrow();
  });
});
