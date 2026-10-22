import type { CircuitState } from '../core/types';
import { addComponent, addWire, cloneCircuit, deleteSelected, moveComponent, rotateSelected, updateComponent } from '../core/circuit';
import type { EditorEvent } from './actions';

export function createInitialCircuitState(): CircuitState {
  return { components: [], wires: [] };
}

export function circuitReducer(
  state: CircuitState,
  action: EditorEvent,
): CircuitState {
  switch (action.type) {
    case 'loadCircuit':
      return cloneCircuit(action.circuit);
    case 'addComponent': return addComponent(state, action.component);
    case 'moveComponent': return moveComponent(state, action.id, action.position);
    case 'rotateSelected': return rotateSelected(state, action.selection);
    case 'deleteSelected': return deleteSelected(state, action.selection);
    case 'updateComponent': return updateComponent(state, action.id, action.fields);
    case 'completeWire': return addWire(state, action.wire);
    default: return state;
  }
}
