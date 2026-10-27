// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { EditorState } from '../core/types';
import { circuitWithRoute, deepFreeze, part, wire } from '../test/coreHelpers';
import { createInitialEditorState, editorReducer } from './editorReducer';

function busyState(): EditorState {
  return {
    ...createInitialEditorState(), tool: 'wire', selection: { type: 'component', id: 'r1' },
    viewport: { panX: -10, panY: 90, zoom: 2 }, snapToGrid: false, activeTab: 'netlist',
    wiring: { from: { compId: 'r1', pinId: 'pin1' }, preview: { x: 40, y: 60 }, hoverPin: null },
    drag: { kind: 'component', pointerId: 1, compId: 'r1', offset: { x: 2, y: 3 } },
  };
}

describe('editor reducer lifecycle', () => {
  it('clears a deleted hover target while preserving the valid wiring source', () => {
    const state = busyState();
    state.wiring = { ...state.wiring!, hoverPin: { compId: 'r2', pinId: 'pin1' } };
    const next = editorReducer(state, { type: 'deleteSelected', selection: { type: 'component', id: 'r2' } });
    expect(next.wiring?.from.compId).toBe('r1');
    expect(next.wiring?.hoverPin).toBeNull();
  });
  it('clears transient references on load while preserving view, tool, snap and tab', () => {
    const state = deepFreeze(busyState());
    expect(editorReducer(state, { type: 'loadCircuit', circuit: circuitWithRoute() })).toEqual({
      ...state, selection: null, wiring: null, drag: null,
    });
    expect(state.wiring).not.toBeNull();
  });
  it('cancels wiring/drag when leaving Wire and removes stale references when their part is deleted', () => {
    const state = deepFreeze(busyState());
    expect(editorReducer(state, { type: 'setTool', tool: 'drag' })).toMatchObject({ tool: 'drag', wiring: null, drag: null });
    expect(editorReducer(state, { type: 'setTool', tool: 'wire' }).wiring).toBe(state.wiring);
    expect(editorReducer(state, { type: 'deleteSelected', selection: { type: 'component', id: 'r1' } }))
      .toMatchObject({ selection: null, wiring: null, drag: null });
    expect(editorReducer(state, { type: 'deleteSelected', selection: { type: 'component', id: 'r2' } }).wiring).toBe(state.wiring);
    expect(editorReducer(state, { type: 'deleteSelected', selection: { type: 'wire', id: 'w1' } }).wiring).toBe(state.wiring);
  });
  it('selects new parts, clears selection, and cancels completed previews', () => {
    const state = deepFreeze(busyState());
    expect(editorReducer(state, { type: 'addComponent', component: part({ id: 'new' }) }).selection).toEqual({ type: 'component', id: 'new' });
    expect(editorReducer(state, { type: 'selectElement', selection: null }).selection).toBeNull();
    expect(editorReducer(state, { type: 'completeWire', wire: wire() }).wiring).toBeNull();
    expect(editorReducer(state, { type: 'moveComponent', id: 'r1', position: { x: 20, y: 40 } })).toBe(state);
    const other = createInitialEditorState();
    other.viewport.panX = 99;
    expect(createInitialEditorState().viewport.panX).toBe(300);
  });
});
