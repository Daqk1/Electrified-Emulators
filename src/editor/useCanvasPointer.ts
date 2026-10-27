import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { screenToWorld, zoomViewport } from '../core/viewport';
import { findComponentAtWorldPos, findPinAtWorldPos, findWireAtWorldPos, wirePreviewTarget } from '../core/hitTests';
import { snap } from '../core/geometry';
import { useEditor } from '../state/EditorProvider';
import { useCircuitCommands } from './useCircuitCommands';

export function useCanvasPointer(svgRef: RefObject<SVGSVGElement | null>) {
  const { editor, dispatch, getSnapshot } = useEditor();
  const captured = useRef<number | null>(null);
  const { wirePin } = useCircuitCommands();

  const release = () => {
    const svg = svgRef.current;
    if (svg && captured.current !== null && svg.hasPointerCapture(captured.current)) svg.releasePointerCapture(captured.current);
    captured.current = null;
  };
  useEffect(() => { if (!editor.drag) release(); }, [editor.drag]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!event.deltaY) return;
      const { editor } = getSnapshot();
      if (editor.modal || editor.drag) return;
      const rect = svg.getBoundingClientRect();
      const viewport = zoomViewport(editor.viewport, event.deltaY < 0 ? 1.1 : 0.9, { x: event.clientX - rect.left, y: event.clientY - rect.top });
      dispatch({ type: 'zoom', viewport });
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [svgRef, dispatch, getSnapshot]);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const { circuit, editor } = getSnapshot();
    if (editor.modal || editor.drag || !event.isPrimary || (event.button !== 0 && event.button !== 1)) return;
    event.currentTarget.focus();
    const startPan = () => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      captured.current = event.pointerId;
      dispatch({ type: 'startDrag', drag: { kind: 'pan', pointerId: event.pointerId,
        screenOrigin: { x: event.clientX, y: event.clientY }, panOrigin: { x: editor.viewport.panX, y: editor.viewport.panY } } });
    };
    if (event.button === 1 || event.altKey) { startPan(); return; }
    const point = screenToWorld({ x: event.clientX, y: event.clientY }, event.currentTarget.getBoundingClientRect(), editor.viewport);
    const pin = findPinAtWorldPos(circuit, point);
    if (pin) { event.preventDefault(); wirePin(pin); return; }
    if (editor.wiring) { dispatch({ type: 'cancelWire' }); return; }
    if (editor.tool === 'drag') { startPan(); return; }
    const component = findComponentAtWorldPos(circuit, point);
    if (component) {
      dispatch({ type: 'selectElement', selection: { type: 'component', id: component.id } });
      if (editor.tool === 'select') {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        captured.current = event.pointerId;
        dispatch({ type: 'startDrag', drag: { kind: 'component', pointerId: event.pointerId, compId: component.id,
          offset: { x: point.x - component.x, y: point.y - component.y } } });
      }
      return;
    }
    const wire = findWireAtWorldPos(circuit, point);
    dispatch({ type: 'selectElement', selection: wire ? { type: 'wire', id: wire.id } : null });
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const { editor } = getSnapshot();
    if (!event.isPrimary || editor.modal || (editor.drag && editor.drag.pointerId !== event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (editor.drag?.kind === 'pan') {
      dispatch({ type: 'pan', panX: editor.drag.panOrigin.x + event.clientX - editor.drag.screenOrigin.x,
        panY: editor.drag.panOrigin.y + event.clientY - editor.drag.screenOrigin.y });
    }
    const point = screenToWorld({ x: event.clientX, y: event.clientY }, rect, getSnapshot().editor.viewport);
    if (editor.drag?.kind === 'component') dispatch({ type: 'moveComponent', id: editor.drag.compId, position: {
      x: snap(point.x - editor.drag.offset.x, editor.snapToGrid), y: snap(point.y - editor.drag.offset.y, editor.snapToGrid),
    } });
    dispatch({ type: 'setCursor', position: point });
    if (!editor.drag && editor.wiring) {
      const preview = wirePreviewTarget(getSnapshot().circuit, point, editor.wiring.from, editor.snapToGrid);
      dispatch({ type: 'updateWirePreview', position: preview.position, hoverPin: preview.hoverPin });
    }
  };

  const end = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (getSnapshot().editor.drag?.pointerId !== event.pointerId) return;
    dispatch({ type: 'endDrag' });
    release();
  };
  return { onPointerDown, onPointerMove, onPointerUp: end,
    onPointerCancel: (event: ReactPointerEvent<SVGSVGElement>) => { end(event); dispatch({ type: 'cancelWire' }); },
    onLostPointerCapture: end };
}
