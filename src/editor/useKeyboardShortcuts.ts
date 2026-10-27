import { useEffect } from 'react';
import { useEditor } from '../state/EditorProvider';

export function useKeyboardShortcuts() {
  const { dispatch, getSnapshot } = useEditor();
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const { editor } = getSnapshot();
      if (editor.modal) {
        if (event.key === 'Escape') { event.preventDefault(); dispatch({ type: 'closeModal' }); }
        return;
      }
      const key = event.key.toLowerCase();
      if (key === ' ' && target instanceof Element && target.closest('button')) return;
      const tool = key === 'v' ? 'select' : key === 'w' ? 'wire' : (key === 'h' || key === ' ') ? 'drag' : null;
      if (tool) { event.preventDefault(); dispatch({ type: 'setTool', tool }); }
      else if (key === 'escape') {
        event.preventDefault();
        if (editor.drag) dispatch({ type: 'endDrag' });
        dispatch(editor.wiring ? { type: 'cancelWire' } : { type: 'selectElement', selection: null });
      }
      else if (key === 'r') { event.preventDefault(); dispatch({ type: 'rotateSelected', selection: editor.selection }); }
      else if (key === 'delete' || key === 'backspace') { event.preventDefault(); dispatch({ type: 'deleteSelected', selection: editor.selection }); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [dispatch, getSnapshot]);
}
