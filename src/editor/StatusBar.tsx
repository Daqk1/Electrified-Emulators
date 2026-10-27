import { useEditor } from '../state/EditorProvider';

export function StatusBar() {
  const { circuit, editor } = useEditor();
  return <footer>
    <div className="status-left">
      <div className="status-badge"><span className="status-dot" aria-hidden="true" /><span>Engine: SVG Vector CAD</span></div>
      <div>Cursor: <span>X: {Math.round(editor.cursor.x)}, Y: {Math.round(editor.cursor.y)}</span></div>
      <div>Grid Snap: <span>{editor.snapToGrid ? 'Enabled (20px)' : 'Disabled'}</span></div>
    </div>
    <div className="status-right">
      <div>Components: <span>{circuit.components.length}</span></div>
      <div>Nets / Wires: <span>{circuit.wires.length}</span></div>
      <div>Zoom: <span>{Math.round(editor.viewport.zoom * 100)}%</span></div>
    </div>
  </footer>;
}
