import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import type { CircuitState, EditorState } from '../core/types';
import type { EditorEvent } from './actions';
import { circuitReducer, createInitialCircuitState } from './circuitReducer';
import { createInitialEditorState, editorReducer } from './editorReducer';

type EditorContextValue = {
  circuit: CircuitState;
  editor: EditorState;
  dispatch: (event: EditorEvent) => void;
  getSnapshot: () => { circuit: CircuitState; editor: EditorState };
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: PropsWithChildren) {
  const [circuit, dispatchCircuit] = useReducer(
    circuitReducer,
    undefined,
    createInitialCircuitState,
  );
  const [editor, dispatchEditor] = useReducer(
    editorReducer,
    undefined,
    createInitialEditorState,
  );

  // Predict synchronous state with the same pure reducers so batched commands and
  // native wheel handlers always see the latest event, before React commits.
  const snapshot = useRef({ circuit, editor });
  const getSnapshot = useCallback(() => snapshot.current, []);
  const dispatch = useCallback((event: EditorEvent) => {
    const current = snapshot.current;
    const nextCircuit = circuitReducer(current.circuit, event);
    if (event.type === 'addComponent' && nextCircuit === current.circuit) return;
    if (event.type === 'selectElement' && event.selection) {
      const collection = event.selection.type === 'component' ? current.circuit.components : current.circuit.wires;
      if (!collection.some((item) => item.id === event.selection?.id)) return;
    }
    snapshot.current = { circuit: nextCircuit, editor: editorReducer(current.editor, event) };
    dispatchCircuit(event);
    dispatchEditor(event);
  }, []);

  const value = useMemo(() => ({ circuit, editor, dispatch, getSnapshot }), [circuit, editor, dispatch, getSnapshot]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider.');
  }
  return context;
}
