import type { CircuitComponent, CircuitState, CircuitWire, Drag, EditorState, PinRef, Point, Selection, Tool, Viewport } from '../core/types';

// Extend these unions as each approved phase introduces its behavior.
// loadCircuit is an internal state event; file parsing arrives in phase 8.
export type CircuitAction =
  | { type: 'loadCircuit'; circuit: CircuitState }
  | { type: 'addComponent'; component: CircuitComponent }
  | { type: 'moveComponent'; id: string; position: Point }
  | { type: 'rotateSelected'; selection: Selection }
  | { type: 'deleteSelected'; selection: Selection }
  | { type: 'updateComponent'; id: string; fields: Partial<Pick<CircuitComponent, 'label' | 'value'>> }
  | { type: 'completeWire'; wire: CircuitWire };
export type EditorAction = CircuitAction
  | { type: 'setTool'; tool: Tool }
  | { type: 'selectElement'; selection: Selection }
  | { type: 'startWire'; from: PinRef; position: Point }
  | { type: 'updateWirePreview'; position: Point; hoverPin: PinRef | null }
  | { type: 'cancelWire' }
  | { type: 'startDrag'; drag: Drag }
  | { type: 'endDrag' }
  | { type: 'pan'; panX: number; panY: number }
  | { type: 'zoom'; viewport: Viewport }
  | { type: 'resetViewport' }
  | { type: 'toggleSnap' }
  | { type: 'setCursor'; position: Point }
  | { type: 'setTab'; tab: EditorState['activeTab'] }
  | { type: 'showModal'; title: string; message: string }
  | { type: 'closeModal' };
export type EditorEvent = EditorAction;
