export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'switch'
  | 'led'
  | 'diode'
  | 'dc_source'
  | 'ground'
  | 'and_gate'
  | 'or_gate';

export type Point = { x: number; y: number };

export type PinDefinition = {
  id: string;
  label: string;
  relX: number;
  relY: number;
};

export type ComponentTemplate = {
  type: ComponentType;
  prefix: string;
  defaultValue: string;
  width: number;
  height: number;
  pins: readonly PinDefinition[];
};

export type CircuitComponent = {
  id: string;
  type: ComponentType;
  label: string;
  value: string;
  x: number;
  y: number;
  rotation: number;
};

export type PinRef = { compId: string; pinId: string };
export type CircuitWire = { id: string; from: PinRef; to: PinRef };
export type CircuitState = {
  components: CircuitComponent[];
  wires: CircuitWire[];
};

export type ProjectFile = CircuitState & {
  project: 'CircuitEDU';
  version: '1.0.0';
  timestamp: string;
};

export type Selection = { type: 'component' | 'wire'; id: string } | null;
export type Tool = 'select' | 'wire' | 'drag';
export type Viewport = { panX: number; panY: number; zoom: number };

export type Drag =
  | { kind: 'pan'; pointerId: number; screenOrigin: Point; panOrigin: Point }
  | { kind: 'component'; pointerId: number; compId: string; offset: Point }
  | null;

export type EditorState = {
  tool: Tool;
  selection: Selection;
  viewport: Viewport;
  gridSize: 20;
  snapToGrid: boolean;
  cursor: Point;
  wiring: { from: PinRef; preview: Point; hoverPin: PinRef | null } | null;
  drag: Drag;
  activeTab: 'inspector' | 'netlist';
  modal: { title: string; message: string } | null;
};
