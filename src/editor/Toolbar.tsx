import { useEditor } from '../state/EditorProvider';

export type FileControls = { onPng: () => void; onSvg: () => void; onSave: () => void; onLoad: () => void; exportingPng: boolean };

export function Toolbar({ onZoom, files }: { onZoom: (factor: number) => void; files: FileControls }) {
  const { editor, dispatch } = useEditor();
  return <div className="toolbar" role="toolbar" aria-label="Schematic tools">
    <div className="toolbar-group">
      {(['select', 'wire', 'drag'] as const).map((tool) => <button key={tool} type="button"
        className={`btn${editor.tool === tool ? ' active' : ''}`} aria-pressed={editor.tool === tool}
        title={tool === 'select' ? 'Select & Move (V)' : tool === 'wire' ? 'Smart Pin-to-Pin Wire Tool (W)' : 'Pan Canvas (Space / H)'}
        onClick={() => dispatch({ type: 'setTool', tool })}>
        <span className="btn-icon" aria-hidden="true">{tool === 'select' ? '↖' : tool === 'wire' ? '⚡' : '✋'}</span>
        {tool === 'select' ? 'Select' : tool === 'wire' ? 'Wire' : 'Drag'}
      </button>)}
    </div>
    <div className="toolbar-separator" />
    <div className="toolbar-group">
      <button type="button" className="btn" title="Rotate Selected Component (R)"
        onClick={() => dispatch({ type: 'rotateSelected', selection: editor.selection })}>↻ Rotate 90°</button>
      <button type="button" className="btn" title="Delete Selected (Delete / Backspace)"
        onClick={() => dispatch({ type: 'deleteSelected', selection: editor.selection })}>🗑 Delete</button>
    </div>
    <div className="toolbar-separator" />
    <div className="toolbar-group">
      <button type="button" className="btn" aria-label="Zoom in" title="Zoom In" onClick={() => onZoom(1.2)}>🔍+</button>
      <button type="button" className="btn" aria-label="Zoom out" title="Zoom Out" onClick={() => onZoom(0.833)}>🔍-</button>
      <button type="button" className="btn" title="Reset View (100%)" onClick={() => dispatch({ type: 'resetViewport' })}>100%</button>
      <button type="button" className={`btn${editor.snapToGrid ? ' active' : ''}`} aria-pressed={editor.snapToGrid}
        title="Toggle Grid Snapping" onClick={() => dispatch({ type: 'toggleSnap' })}>▦ Grid: 20px</button>
    </div>
    <div className="toolbar-separator" />
    <div className="toolbar-group">
      <button type="button" className="btn" title="Export as High-Resolution PNG" onClick={files.onPng} disabled={files.exportingPng} aria-busy={files.exportingPng}>🖼 PNG</button>
      <button type="button" className="btn" title="Download Vector SVG File" onClick={files.onSvg}>📐 SVG</button>
      <button type="button" className="btn" title="Save / Download Schematic JSON" onClick={files.onSave}>💾 JSON</button>
      <button type="button" className="btn" title="Load Schematic JSON" onClick={files.onLoad}>📂 Load</button>
    </div>
  </div>;
}
