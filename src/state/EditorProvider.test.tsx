import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { part, wire } from '../test/coreHelpers';
import { EditorProvider, useEditor } from './EditorProvider';

describe('shared editor dispatch', () => {
  it('applies batched circuit events in order and keeps selection and cascade deletion consistent', () => {
    const { result } = renderHook(useEditor, { wrapper: EditorProvider });
    act(() => {
      result.current.dispatch({ type: 'addComponent', component: part() });
      result.current.dispatch({ type: 'addComponent', component: part({ id: 'r2', label: 'R2' }) });
      result.current.dispatch({ type: 'completeWire', wire: wire() });
      result.current.dispatch({ type: 'moveComponent', id: 'r1', position: { x: 40, y: 20 } });
    });
    expect(result.current.circuit.components.map((component) => component.id)).toEqual(['r1', 'r2']);
    expect(result.current.circuit.components[0]).toMatchObject({ x: 40, y: 20 });
    expect(result.current.circuit.wires).toHaveLength(1);
    expect(result.current.editor.selection).toEqual({ type: 'component', id: 'r2' });

    act(() => result.current.dispatch({ type: 'deleteSelected', selection: result.current.editor.selection }));
    expect(result.current.circuit.components.map((component) => component.id)).toEqual(['r1']);
    expect(result.current.circuit.wires).toEqual([]);
    expect(result.current.editor.selection).toBeNull();
  });
});
