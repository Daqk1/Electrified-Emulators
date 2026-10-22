import { createDemoCircuit } from '../core/demo';
import { exportDimensions } from '../core/bounds';
import { Canvas } from './Canvas';
import { Palette } from './Palette';

// Temporary rendering harness at ?demo=1; the normal editor still starts empty.
export function DemoPreview() {
  const circuit = createDemoCircuit();
  const { x, y, width, height } = exportDimensions(circuit, 'svg');
  return <>
    <header>
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">⚡</div>
        <h1 className="brand-title">CircuitEDU</h1>
        <span className="brand-badge">Prototype v1.0</span>
      </div>
      <span className="demo-title">LED Driver Circuit</span>
    </header>
    <div className="app-container">
      <Palette />
      <main className="canvas-wrapper" aria-label="Demo circuit preview">
        <Canvas circuit={circuit} viewport={{ panX: 0, panY: 0, zoom: 1 }} viewBox={`${x} ${y} ${width} ${height}`} />
      </main>
    </div>
  </>;
}
