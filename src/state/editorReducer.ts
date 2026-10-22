import type { EditorState } from '../core/types';
import { createInitialViewport } from '../core/viewport';
import type { EditorAction } from './actions';

export function createInitialEditorState(): EditorState {
  return {
    tool: 'select',
    selection: null,
    viewport: createInitialViewport(),
    gridSize: 20,
    snapToGrid: true,
    cursor: { x: 0, y: 0 },
    wiring: null,
    drag: null,
    activeTab: 'inspector',
    modal: null,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'loadCircuit':
      return { ...state, selection: null, wiring: null, drag: null };
    case 'addComponent':
      return { ...state, selection: { type: 'component', id: action.component.id } };
    case 'selectElement':
      return { ...state, selection: action.selection };
    case 'startWire':
      return { ...state, tool: 'wire', drag: null, wiring: { from: { ...action.from }, preview: { ...action.position }, hoverPin: null } };
    case 'updateWirePreview':
      return state.wiring ? { ...state, wiring: { ...state.wiring, preview: action.position, hoverPin: action.hoverPin } } : state;
    case 'cancelWire': return { ...state, wiring: null };
    case 'startDrag': return { ...state, drag: action.drag };
    case 'endDrag': return { ...state, drag: null };
    case 'pan': return { ...state, viewport: { ...state.viewport, panX: action.panX, panY: action.panY } };
    case 'zoom': return { ...state, viewport: action.viewport };
    case 'resetViewport': return { ...state, viewport: createInitialViewport(), drag: null };
    case 'toggleSnap': return { ...state, snapToGrid: !state.snapToGrid };
    case 'setCursor': return { ...state, cursor: action.position };
    case 'setTab': return { ...state, activeTab: action.tab };
    case 'showModal': return { ...state, modal: { title: action.title, message: action.message }, drag: null };
    case 'closeModal': return { ...state, modal: null };
    case 'completeWire':
      return { ...state, wiring: null };
    case 'deleteSelected': {
      const deletedId = action.selection?.type === 'component' ? action.selection.id : null;
      return {
        ...state,
        selection: null,
        wiring: state.wiring?.from.compId === deletedId ? null : state.wiring?.hoverPin?.compId === deletedId
          ? { ...state.wiring, hoverPin: null } : state.wiring,
        drag: state.drag?.kind === 'component' && state.drag.compId === deletedId ? null : state.drag,
      };
    }
    case 'setTool':
      return {
        ...state,
        tool: action.tool,
        wiring: action.tool === 'wire' ? state.wiring : null,
        drag: null,
      };
    default: return state;
  }
}
