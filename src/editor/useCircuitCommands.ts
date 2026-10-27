import { createComponent, hasId } from '../core/circuit';
import { getPinAbsolutePosition, snap } from '../core/geometry';
import { COMPONENT_TEMPLATES } from '../core/templates';
import type { CircuitState, ComponentType, PinRef, Point } from '../core/types';
import { useEditor } from '../state/EditorProvider';

export function uniqueId(circuit: CircuitState, prefix: string): string {
  const base = `${prefix}_${crypto.randomUUID()}`;
  let id = base;
  let suffix = 1;
  while (hasId(circuit, id)) id = `${base}_${suffix++}`;
  return id;
}

export function useCircuitCommands() {
  const { dispatch, getSnapshot } = useEditor();
  const placePart = (type: ComponentType, position: Point) => {
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
    const { circuit, editor } = getSnapshot();
    dispatch({ type: 'addComponent', component: createComponent(circuit, type, {
      x: snap(position.x, editor.snapToGrid), y: snap(position.y, editor.snapToGrid),
    }, uniqueId(circuit, COMPONENT_TEMPLATES[type].prefix)) });
  };
  const wirePin = (pin: PinRef) => {
    const { circuit, editor } = getSnapshot();
    const position = getPinAbsolutePosition(circuit, pin);
    if (!position) return;
    if (editor.wiring) dispatch({ type: 'completeWire', wire: {
      id: uniqueId(circuit, 'wire'), from: editor.wiring.from, to: pin,
    } });
    else dispatch({ type: 'startWire', from: pin, position });
  };
  return { placePart, wirePin };
}
