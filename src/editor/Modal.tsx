import { useEffect, useId, useRef } from 'react';
import { useEditor } from '../state/EditorProvider';

export function Modal() {
  const { editor, dispatch } = useEditor();
  const id = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const open = !!editor.modal;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [open]);
  if (!editor.modal) return null;
  const close = () => dispatch({ type: 'closeModal' });
  return <div className="modal-overlay open" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div ref={dialog} className="modal-content" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); close(); }
        if (event.key === 'Tab') {
          const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
          const first = buttons[0]; const last = buttons.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="modal-header"><h2 className="modal-title" id={`${id}-title`}>{editor.modal.title}</h2>
        <button type="button" className="modal-close" aria-label="Close notice" onClick={close}>×</button></div>
      <div className="modal-body" id={`${id}-message`}>{editor.modal.message}</div>
      <div className="modal-footer"><button type="button" className="btn" onClick={close}>Close</button></div>
    </div>
  </div>;
}
