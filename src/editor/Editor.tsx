import { useId, useRef } from 'react';
import type { Tool } from '../core/types';
import { useEditor } from '../state/EditorProvider';
import { Canvas } from './Canvas';
import { Palette } from './Palette';
import { Toolbar } from './Toolbar';
import { useCanvasPointer } from './useCanvasPointer';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { screenToWorld, zoomViewport } from '../core/viewport';
import { useCircuitCommands } from './useCircuitCommands';
import { isComponentType } from '../core/templates';
import { createDemoCircuit } from '../core/demo';
import { Inspector } from './Inspector';
import { NetlistPanel } from './NetlistPanel';
import { StatusBar } from './StatusBar';
import { Modal } from './Modal';
import { useProjectFiles } from '../files/useProjectFiles';

const toolAppearance: Record<Tool, { text: string; color: string; cursor: string }> = {
  select: { text: 'Tool: Select & Move', color: '#00b4d8', cursor: 'default' },
  wire: { text: 'Tool: Smart Pin-to-Pin Wiring', color: '#06d6a0', cursor: 'crosshair' },
  drag: { text: 'Tool: Canvas Dragging', color: '#ffd166', cursor: 'grab' },
};

// The editor composes UI and browser I/O; rendering and circuit math stay separate.
export function Editor() {
  const { circuit, editor, dispatch, getSnapshot } = useEditor();
  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const files = useProjectFiles();
  const tabId = useId();
  const pointer = useCanvasPointer(svgRef);
  const { placePart } = useCircuitCommands();
  useKeyboardShortcuts();
  const tool = toolAppearance[editor.tool];

  return (
    <>
      <header>
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">⚡</div>
          <h1 className="brand-title">CircuitEDU</h1>
          <span className="brand-badge">Prototype v1.0</span>
        </div>
        <Toolbar files={{ onPng: files.exportPng, onSvg: files.exportSvg, onSave: files.saveJson, onLoad: () => fileRef.current?.click(), exportingPng: files.exportingPng }} onZoom={(factor) => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) dispatch({ type: 'zoom', viewport: zoomViewport(getSnapshot().editor.viewport, factor, { x: rect.width / 2, y: rect.height / 2 }) });
        }} />
        <button type="button" className="btn btn-primary" onClick={() => {
          files.cancelPendingLoad(); dispatch({ type: 'loadCircuit', circuit: createDemoCircuit() });
        }}>⚡ Load Demo Circuit</button>
        <input ref={fileRef} type="file" accept=".json,application/json" aria-label="Load circuit JSON" hidden onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void files.load(file);
        }} />
      </header>

      <div className="app-container">
        <Palette onPlace={(type) => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) placePart(type, screenToWorld({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, rect, getSnapshot().editor.viewport));
        }} />

        <main className="canvas-wrapper" aria-label="Circuit workspace" tabIndex={0}>
          <div className="mode-indicator">
            <span className="mode-dot" style={{ backgroundColor: tool.color }} />
            <span>{tool.text}</span>
          </div>
          <Canvas ref={svgRef} {...pointer} circuit={circuit} viewport={editor.viewport} selection={editor.selection} wiring={editor.wiring}
            cursor={editor.drag?.kind === 'pan' ? 'grabbing' : tool.cursor}
            onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
              event.preventDefault();
              const type = event.dataTransfer.getData('circuit/component-type');
              if (isComponentType(type)) placePart(type, screenToWorld({ x: event.clientX, y: event.clientY }, event.currentTarget.getBoundingClientRect(), getSnapshot().editor.viewport));
            }} />
        </main>

        <aside className="sidebar-right" aria-label="Component properties">
          <div className="tab-nav" role="tablist" aria-label="Circuit information">
            {(['inspector', 'netlist'] as const).map((tab) => <button key={tab} type="button" role="tab" id={`${tabId}-${tab}`}
              aria-selected={editor.activeTab === tab} aria-controls={`${tabId}-panel`} className={`tab-btn${editor.activeTab === tab ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'setTab', tab })}>{tab === 'inspector' ? 'Properties' : 'Netlist / Nodes'}</button>)}
          </div>
          <div className="inspector-body" role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${editor.activeTab}`}>
            {editor.activeTab === 'inspector' ? <Inspector /> : <NetlistPanel />}
          </div>
        </aside>
      </div>

      <StatusBar />
      <Modal />
    </>
  );
}
