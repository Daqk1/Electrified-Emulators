import { useId } from 'react';
import { isPinConnected } from '../core/circuit';
import { COMPONENT_TEMPLATES } from '../core/templates';
import { useEditor } from '../state/EditorProvider';

export function Inspector() {
  const { circuit, editor, dispatch } = useEditor();
  const id = useId();
  const part = editor.selection?.type === 'component' ? circuit.components.find((part) => part.id === editor.selection?.id) : undefined;
  if (!part) return <p className="inspector-empty">Select a component or wire to inspect and edit its parameters.</p>;
  return <div className="inspector-content">
    <div className="form-group">
      <label className="form-label" htmlFor={`${id}-label`}>Identifier / Label</label>
      <input id={`${id}-label`} className="form-control" value={part.label}
        onChange={(event) => dispatch({ type: 'updateComponent', id: part.id, fields: { label: event.target.value } })} />
    </div>
    <div className="form-group">
      <label className="form-label" htmlFor={`${id}-value`}>Component Value</label>
      <input id={`${id}-value`} className="form-control" value={part.value}
        onChange={(event) => dispatch({ type: 'updateComponent', id: part.id, fields: { value: event.target.value } })} />
    </div>
    <div className="form-group">
      <span className="form-label">Rotation</span>
      <div className="property-row"><span className="prop-label">Angle:</span><span className="prop-value">{part.rotation}°</span></div>
      <button type="button" className="btn inspector-rotate" aria-label="Rotate component 90 degrees"
        onClick={() => dispatch({ type: 'rotateSelected', selection: { type: 'component', id: part.id } })}>↻ Rotate 90°</button>
    </div>
    <div className="form-group">
      <span className="form-label">Position</span>
      <div className="property-row"><span className="prop-label">Grid Coordinates:</span><span className="prop-value">X: {part.x}, Y: {part.y}</span></div>
    </div>
    <div className="form-group">
      <span className="form-label">Terminals / Pins</span>
      <div className="pin-status-list">
        {COMPONENT_TEMPLATES[part.type].pins.map((pin) => {
          const connected = isPinConnected(circuit, { compId: part.id, pinId: pin.id });
          return <div className="property-row" key={pin.id}>
            <span className="prop-label">Pin {pin.label} ({pin.id}):</span>
            <span className="prop-value" style={{ color: connected ? '#06d6a0' : '#ef476f' }}>{connected ? 'Connected' : 'Open'}</span>
          </div>;
        })}
      </div>
    </div>
  </div>;
}
