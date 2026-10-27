import { useMemo } from 'react';
import { generateNetlist } from '../core/netlist';
import { useEditor } from '../state/EditorProvider';

export function NetlistPanel() {
  const { circuit } = useEditor();
  const text = useMemo(() => generateNetlist(circuit, new Date().toLocaleString()), [circuit]);
  return <>
    <div className="category-title">Resolved Circuit Nodes</div>
    <pre className="netlist-container" aria-label="Circuit netlist">{text}</pre>
  </>;
}
