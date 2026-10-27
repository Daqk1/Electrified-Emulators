import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorProvider, useEditor } from '../state/EditorProvider';
import { createDemoCircuit } from '../core/demo';
import type { CircuitState } from '../core/types';
import { useProjectFiles } from './useProjectFiles';
import { readProjectFile } from './loadProject';
import { downloadPng } from './downloads';

vi.mock('./loadProject', () => ({ readProjectFile: vi.fn() }));
vi.mock('./downloads', () => ({ downloadPng: vi.fn(), downloadSvg: vi.fn(), downloadJson: vi.fn() }));
afterEach(() => vi.resetAllMocks());

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const file = new File(['{}'], 'circuit.json');

describe('file operation races', () => {
  it('lets the latest load win and does not overwrite a newer circuit with an older read', async () => {
    const a = deferred<CircuitState>(); const b = deferred<CircuitState>();
    vi.mocked(readProjectFile).mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const { result } = renderHook(() => ({ files: useProjectFiles(), state: useEditor() }), { wrapper: EditorProvider });
    let first!: Promise<void>; let second!: Promise<void>;
    act(() => { first = result.current.files.load(file); second = result.current.files.load(file); });
    await act(async () => { b.resolve(createDemoCircuit()); await second; });
    await act(async () => { a.resolve({ components: [], wires: [] }); await first; });
    expect(result.current.state.circuit.components).toHaveLength(5);
  });
  it('cancels an outstanding load when Demo replaces it', async () => {
    const request = deferred<CircuitState>(); vi.mocked(readProjectFile).mockReturnValue(request.promise);
    const { result } = renderHook(() => ({ files: useProjectFiles(), state: useEditor() }), { wrapper: EditorProvider });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.files.load(file);
      result.current.files.cancelPendingLoad();
      result.current.state.dispatch({ type: 'loadCircuit', circuit: createDemoCircuit() });
    });
    await act(async () => { request.resolve({ components: [], wires: [] }); await pending; });
    expect(result.current.state.circuit.components).toHaveLength(5);
  });
  it('shows read failures without replacing data and ignores completion after unmount', async () => {
    vi.mocked(readProjectFile).mockRejectedValueOnce(new Error('Read failed'));
    const { result, unmount } = renderHook(() => ({ files: useProjectFiles(), state: useEditor() }), { wrapper: EditorProvider });
    await act(() => result.current.files.load(file));
    expect(result.current.state.editor.modal?.message).toBe('Read failed');
    const late = deferred<CircuitState>(); vi.mocked(readProjectFile).mockReturnValueOnce(late.promise);
    const pending = result.current.files.load(file);
    unmount(); late.resolve(createDemoCircuit()); await pending;
  });
  it('prevents duplicate PNG exports and clears busy state after failures', async () => {
    const png = deferred<void>(); vi.mocked(downloadPng).mockReturnValue(png.promise);
    const { result } = renderHook(() => ({ files: useProjectFiles(), state: useEditor() }), { wrapper: EditorProvider });
    let pending!: Promise<void>;
    act(() => { pending = result.current.files.exportPng(); void result.current.files.exportPng(); });
    expect(downloadPng).toHaveBeenCalledTimes(1);
    expect(result.current.files.exportingPng).toBe(true);
    await act(async () => { png.reject(new Error('PNG failed')); await pending; });
    await waitFor(() => expect(result.current.files.exportingPng).toBe(false));
    expect(result.current.state.editor.modal?.message).toBe('PNG failed');
  });
});
