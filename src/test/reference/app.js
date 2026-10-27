/**
 * CircuitEDU Interactive Schematic CAD Engine
 * Core Architecture: Component Data Graph, Orthogonal Manhattan Wiring, SVG Vector Renderer
 */

// --- Global Component Symbol Definitions & Pin Geometries ---
const COMPONENT_TEMPLATES = {
  resistor: {
    type: 'resistor',
    prefix: 'R',
    defaultValue: '1kΩ',
    width: 60,
    height: 30,
    pins: [
      { id: 'pin1', label: '1', relX: -30, relY: 0 },
      { id: 'pin2', label: '2', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 0 L -18 0 L -14 -8 L -6 8 L 2 -8 L 10 8 L 14 -8 L 18 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-32" y="-14" width="64" height="28" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  capacitor: {
    type: 'capacitor',
    prefix: 'C',
    defaultValue: '10µF',
    width: 60,
    height: 30,
    pins: [
      { id: 'pin1', label: '+', relX: -30, relY: 0 },
      { id: 'pin2', label: '-', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 0 L -6 0 M -6 -12 L -6 12 M 6 -12 L 6 12 M 6 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-32" y="-14" width="64" height="28" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  inductor: {
    type: 'inductor',
    prefix: 'L',
    defaultValue: '100µH',
    width: 60,
    height: 30,
    pins: [
      { id: 'pin1', label: '1', relX: -30, relY: 0 },
      { id: 'pin2', label: '2', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 0 L -18 0 A 6 6 0 0 1 -6 0 A 6 6 0 0 1 6 0 A 6 6 0 0 1 18 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-32" y="-14" width="64" height="28" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  switch: {
    type: 'switch',
    prefix: 'SW',
    defaultValue: 'SPST',
    width: 60,
    height: 30,
    pins: [
      { id: 'pin1', label: '1', relX: -30, relY: 0 },
      { id: 'pin2', label: '2', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 0 L -12 0 M -12 0 L 10 -10 M 12 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <circle cx="-12" cy="0" r="2.5" fill="#f0f0f5"/>
      <circle cx="12" cy="0" r="2.5" fill="#f0f0f5"/>
      <rect x="-32" y="-14" width="64" height="28" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  led: {
    type: 'led',
    prefix: 'D',
    defaultValue: 'Red LED',
    width: 60,
    height: 30,
    pins: [
      { id: 'anode', label: 'A', relX: -30, relY: 0 },
      { id: 'cathode', label: 'K', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 0 L -10 0 M -10 -10 L 10 0 L -10 10 Z M 10 -10 L 10 10 M 10 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <path d="M -2 -8 L 4 -16 M 1 -17 L 4 -16 L 4 -13" fill="none" stroke="#ffd166" stroke-width="1.5"/>
      <path d="M 4 -5 L 10 -13 M 7 -14 L 10 -13 L 10 -10" fill="none" stroke="#ffd166" stroke-width="1.5"/>
      <rect x="-32" y="-18" width="64" height="36" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  diode: {
    type: 'diode',
    prefix: 'D',
    defaultValue: '1N4148',
    width: 60,
    height: 30,
    pins: [
      { id: 'anode', label: 'A', relX: -30, relY: 0 },
      { id: 'cathode', label: 'K', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 0 L -10 0 M -10 -10 L 10 0 L -10 10 Z M 10 -10 L 10 10 M 10 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-32" y="-14" width="64" height="28" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  dc_source: {
    type: 'dc_source',
    prefix: 'V',
    defaultValue: '5V',
    width: 60,
    height: 30,
    pins: [
      { id: 'neg', label: '-', relX: -30, relY: 0 },
      { id: 'pos', label: '+', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <circle cx="0" cy="0" r="14" fill="#18181d" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <path d="M -30 0 L -14 0 M 14 0 L 30 0" fill="none" stroke="#f0f0f5" stroke-width="2"/>
      <text x="-7" y="-3" fill="#f0f0f5" font-size="9" font-family="sans-serif" font-weight="bold">-</text>
      <text x="3" y="-3" fill="#f0f0f5" font-size="9" font-family="sans-serif" font-weight="bold">+</text>
      <rect x="-32" y="-16" width="64" height="32" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  ground: {
    type: 'ground',
    prefix: 'GND',
    defaultValue: '0V',
    width: 30,
    height: 30,
    pins: [
      { id: 'gnd', label: 'GND', relX: 0, relY: -10 }
    ],
    render: (comp) => `
      <path d="M 0 -10 L 0 6 M -14 6 L 14 6 M -9 11 L 9 11 M -4 16 L 4 16" fill="none" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-16" y="-12" width="32" height="30" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  and_gate: {
    type: 'and_gate',
    prefix: 'U',
    defaultValue: '74HC08',
    width: 60,
    height: 30,
    pins: [
      { id: 'inA', label: 'A', relX: -30, relY: -8 },
      { id: 'inB', label: 'B', relX: -30, relY: 8 },
      { id: 'out', label: 'Y', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 -8 L -14 -8 M -30 8 L -14 8 M -14 -14 L 0 -14 A 14 14 0 0 1 0 14 L -14 14 Z M 14 0 L 30 0" fill="#18181d" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-32" y="-16" width="64" height="32" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  },
  or_gate: {
    type: 'or_gate',
    prefix: 'U',
    defaultValue: '74HC32',
    width: 60,
    height: 30,
    pins: [
      { id: 'inA', label: 'A', relX: -30, relY: -8 },
      { id: 'inB', label: 'B', relX: -30, relY: 8 },
      { id: 'out', label: 'Y', relX: 30, relY: 0 }
    ],
    render: (comp) => `
      <path d="M -30 -8 L -12 -8 M -30 8 L -12 8 M -16 -14 Q 0 -14 14 0 Q 0 14 -16 14 Q -8 0 -16 -14 Z M 14 0 L 30 0" fill="#18181d" stroke="#f0f0f5" stroke-width="2" class="comp-body"/>
      <rect x="-32" y="-16" width="64" height="32" fill="transparent" stroke="transparent" class="comp-outline" stroke-width="1.5"/>
    `
  }
};

// --- Application State Model ---
class CircuitCADState {
  constructor() {
    this.components = []; // Array of component instances
    this.wires = [];      // Array of wire instances { id, from: { compId, pinId }, to: { compId, pinId }, waypoints: [] }
    this.selectedElement = null; // { type: 'component' | 'wire', id: string }
    this.activeTool = 'select';  // 'select' | 'wire' | 'drag'
    this.gridSize = 20;
    this.snapToGrid = true;
    this.idCounter = 1;

    // Viewport transform
    this.panX = 300;
    this.panY = 200;
    this.zoom = 1.0;

    // Interactive Dragging & Wiring State
    this.isPanning = false;
    this.startPan = { x: 0, y: 0 };
    this.isDraggingComp = false;
    this.draggedComp = null;
    this.dragOffset = { x: 0, y: 0 };

    // Wiring state machine
    this.wiringStartPin = null; // { compId, pinId, x, y }
    this.wiringCurrentPos = { x: 0, y: 0 };
  }

  generateId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
  }

  getNextLabel(prefix) {
    let count = 1;
    while (this.components.some(c => c.label === `${prefix}${count}`)) {
      count++;
    }
    return `${prefix}${count}`;
  }

  snap(val) {
    if (!this.snapToGrid) return val;
    return Math.round(val / this.gridSize) * this.gridSize;
  }

  screenToWorld(screenX, screenY, svgRect) {
    const x = (screenX - svgRect.left - this.panX) / this.zoom;
    const y = (screenY - svgRect.top - this.panY) / this.zoom;
    return { x, y };
  }

  worldToScreen(worldX, worldY, svgRect) {
    const x = worldX * this.zoom + this.panX + svgRect.left;
    const y = worldY * this.zoom + this.panY + svgRect.top;
    return { x, y };
  }

  getComponent(id) {
    return this.components.find(c => c.id === id);
  }

  getPinAbsolutePosition(compId, pinId) {
    const comp = this.getComponent(compId);
    if (!comp) return null;
    const tmpl = COMPONENT_TEMPLATES[comp.type];
    const pin = tmpl.pins.find(p => p.id === pinId);
    if (!pin) return null;

    const rad = (comp.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotatedX = pin.relX * cos - pin.relY * sin;
    const rotatedY = pin.relX * sin + pin.relY * cos;

    return {
      x: comp.x + rotatedX,
      y: comp.y + rotatedY
    };
  }
}

// --- Main Application Controller ---
class CircuitCADApp {
  constructor() {
    this.state = new CircuitCADState();
    this.initDOMElements();
    this.bindEvents();
    this.updateViewportTransform();
    this.render();
  }

  initDOMElements() {
    this.svg = document.getElementById('circuit-canvas');
    this.worldRoot = document.getElementById('world-root');
    this.componentsLayer = document.getElementById('components-layer');
    this.wiresLayer = document.getElementById('wires-layer');
    this.wirePreviewLayer = document.getElementById('wire-preview-layer');
    this.selectionLayer = document.getElementById('selection-layer');

    // Toolbar buttons
    this.toolSelectBtn = document.getElementById('tool-select');
    this.toolWireBtn = document.getElementById('tool-wire');
    this.toolDragBtn = document.getElementById('tool-drag');
    this.btnRotate = document.getElementById('btn-rotate');
    this.btnDelete = document.getElementById('btn-delete');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
    this.btnToggleGrid = document.getElementById('btn-toggle-grid');
    this.btnDemoCircuit = document.getElementById('btn-demo-circuit');

    // Export & Save buttons
    this.btnExportPng = document.getElementById('btn-export-png');
    this.btnExportSvg = document.getElementById('btn-export-svg');
    this.btnSaveJson = document.getElementById('btn-save-json');
    this.btnLoadJson = document.getElementById('btn-load-json');
    this.fileInputJson = document.getElementById('file-input-json');

    // Right Sidebar / Inspector
    this.inspectorEmpty = document.getElementById('inspector-empty');
    this.inspectorContent = document.getElementById('inspector-content');
    this.propId = document.getElementById('prop-id');
    this.propValue = document.getElementById('prop-value');
    this.propRotationDisplay = document.getElementById('prop-rotation-display');
    this.propPositionDisplay = document.getElementById('prop-position-display');
    this.propPinsList = document.getElementById('prop-pins-list');
    this.btnPropRotate = document.getElementById('btn-prop-rotate');
    this.netlistOutput = document.getElementById('netlist-output');

    // Status bar & Overlays
    this.modeText = document.getElementById('mode-text');
    this.modeDot = document.getElementById('mode-dot');
    this.statusCoords = document.getElementById('status-coords');
    this.statusComponents = document.getElementById('status-components');
    this.statusNets = document.getElementById('status-nets');
    this.statusZoom = document.getElementById('status-zoom');

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('tab-content-inspector').style.display = tab === 'inspector' ? 'flex' : 'none';
        document.getElementById('tab-content-netlist').style.display = tab === 'netlist' ? 'flex' : 'none';
        if (tab === 'netlist') this.updateNetlist();
      });
    });
  }

  bindEvents() {
    // Mode toggling
    this.toolSelectBtn.addEventListener('click', () => this.setTool('select'));
    this.toolWireBtn.addEventListener('click', () => this.setTool('wire'));
    this.toolDragBtn.addEventListener('click', () => this.setTool('drag'));

    // Transforms
    this.btnRotate.addEventListener('click', () => this.rotateSelected());
    this.btnDelete.addEventListener('click', () => this.deleteSelected());
    this.btnPropRotate.addEventListener('click', () => this.rotateSelected());

    // Zoom controls
    this.btnZoomIn.addEventListener('click', () => this.applyZoom(1.2));
    this.btnZoomOut.addEventListener('click', () => this.applyZoom(0.833));
    this.btnZoomReset.addEventListener('click', () => {
      this.state.zoom = 1.0;
      this.state.panX = 300;
      this.state.panY = 200;
      this.updateViewportTransform();
    });

    this.btnToggleGrid.addEventListener('click', () => {
      this.state.snapToGrid = !this.state.snapToGrid;
      this.btnToggleGrid.classList.toggle('active', this.state.snapToGrid);
      document.getElementById('status-snap').textContent = this.state.snapToGrid ? 'Enabled (20px)' : 'Disabled';
    });

    // Inspector inputs
    this.propId.addEventListener('input', (e) => {
      if (this.state.selectedElement && this.state.selectedElement.type === 'component') {
        const comp = this.state.getComponent(this.state.selectedElement.id);
        if (comp) {
          comp.label = e.target.value;
          this.render();
          this.updateNetlist();
        }
      }
    });

    this.propValue.addEventListener('input', (e) => {
      if (this.state.selectedElement && this.state.selectedElement.type === 'component') {
        const comp = this.state.getComponent(this.state.selectedElement.id);
        if (comp) {
          comp.value = e.target.value;
          this.render();
          this.updateNetlist();
        }
      }
    });

    // Sidebar Drag and Drop / Click to add
    document.querySelectorAll('.component-card').forEach(card => {
      const type = card.dataset.type;
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('circuit/component-type', type);
      });

      card.addEventListener('click', () => {
        // Add near center of current view
        const rect = this.svg.getBoundingClientRect();
        const center = this.state.screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2, rect);
        this.addComponent(type, this.state.snap(center.x), this.state.snap(center.y));
      });
    });

    // Canvas Drag and Drop Handlers
    this.svg.addEventListener('dragover', (e) => e.preventDefault());
    this.svg.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('circuit/component-type');
      if (type && COMPONENT_TEMPLATES[type]) {
        const rect = this.svg.getBoundingClientRect();
        const pos = this.state.screenToWorld(e.clientX, e.clientY, rect);
        this.addComponent(type, this.state.snap(pos.x), this.state.snap(pos.y));
      }
    });

    // Canvas Mouse Interaction (Pointer & Zoom)
    this.svg.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
    this.svg.addEventListener('wheel', (e) => this.handleCanvasWheel(e), { passive: false });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return; // Ignore when typing in inspector
      if (e.key === 'r' || e.key === 'R') this.rotateSelected();
      if (e.key === 'Delete' || e.key === 'Backspace') this.deleteSelected();
      if (e.key === 'v' || e.key === 'V') this.setTool('select');
      if (e.key === 'w' || e.key === 'W') this.setTool('wire');
      if (e.key === 'h' || e.key === 'H' || e.key === ' ') this.setTool('drag');
      if (e.key === 'Escape') {
        if (this.state.wiringStartPin) {
          this.cancelWiring();
        } else {
          this.selectElement(null);
        }
      }
    });

    // Export & Demo Actions
    this.btnExportPng.addEventListener('click', () => this.exportPNG());
    this.btnExportSvg.addEventListener('click', () => this.exportSVG());
    this.btnSaveJson.addEventListener('click', () => this.exportJSON());
    this.btnLoadJson.addEventListener('click', () => this.fileInputJson.click());
    this.fileInputJson.addEventListener('change', (e) => this.loadJSON(e));
    this.btnDemoCircuit.addEventListener('click', () => this.loadDemoCircuit());
  }

  setTool(tool) {
    this.state.activeTool = tool;
    this.toolSelectBtn.classList.toggle('active', tool === 'select');
    this.toolWireBtn.classList.toggle('active', tool === 'wire');
    this.toolDragBtn.classList.toggle('active', tool === 'drag');

    if (tool === 'wire') {
      this.modeText.textContent = 'Tool: Smart Pin-to-Pin Wiring';
      this.modeDot.style.background = '#06d6a0';
      this.svg.style.cursor = 'crosshair';
    } else if (tool === 'drag') {
      this.modeText.textContent = 'Tool: Canvas Dragging';
      this.modeDot.style.background = '#ffd166';
      this.svg.style.cursor = 'grab';
    } else {
      this.modeText.textContent = 'Tool: Select & Move';
      this.modeDot.style.background = '#00b4d8';
      this.svg.style.cursor = 'default';
    }

    if (tool !== 'wire') {
      this.cancelWiring();
    }
  }

  updateViewportTransform() {
    this.worldRoot.setAttribute('transform', `translate(${this.state.panX}, ${this.state.panY}) scale(${this.state.zoom})`);
    this.statusZoom.textContent = `${Math.round(this.state.zoom * 100)}%`;
  }

  applyZoom(factor, centerX, centerY) {
    const rect = this.svg.getBoundingClientRect();
    const cx = centerX !== undefined ? centerX : rect.width / 2;
    const cy = centerY !== undefined ? centerY : rect.height / 2;

    const prevZoom = this.state.zoom;
    let newZoom = prevZoom * factor;
    newZoom = Math.min(Math.max(0.2, newZoom), 4.0); // Clamp zoom

    this.state.panX = cx - (cx - this.state.panX) * (newZoom / prevZoom);
    this.state.panY = cy - (cy - this.state.panY) * (newZoom / prevZoom);
    this.state.zoom = newZoom;

    this.updateViewportTransform();
  }

  handleCanvasWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.applyZoom(factor, e.clientX - this.svg.getBoundingClientRect().left, e.clientY - this.svg.getBoundingClientRect().top);
  }

  // --- CAD Element Management ---
  addComponent(type, x, y) {
    const tmpl = COMPONENT_TEMPLATES[type];
    if (!tmpl) return;

    const id = this.state.generateId(tmpl.prefix);
    const label = this.state.getNextLabel(tmpl.prefix);

    const comp = {
      id,
      type,
      label,
      value: tmpl.defaultValue,
      x: x,
      y: y,
      rotation: 0
    };

    this.state.components.push(comp);
    this.selectElement({ type: 'component', id });
    this.render();
    this.updateNetlist();
  }

  rotateSelected() {
    if (this.state.selectedElement && this.state.selectedElement.type === 'component') {
      const comp = this.state.getComponent(this.state.selectedElement.id);
      if (comp) {
        comp.rotation = (comp.rotation + 90) % 360;
        this.render();
        this.updateInspector();
        this.updateNetlist();
      }
    }
  }

  deleteSelected() {
    if (!this.state.selectedElement) return;

    if (this.state.selectedElement.type === 'component') {
      const compId = this.state.selectedElement.id;
      // Delete component
      this.state.components = this.state.components.filter(c => c.id !== compId);
      // Delete associated wires
      this.state.wires = this.state.wires.filter(w => w.from.compId !== compId && w.to.compId !== compId);
    } else if (this.state.selectedElement.type === 'wire') {
      const wireId = this.state.selectedElement.id;
      this.state.wires = this.state.wires.filter(w => w.id !== wireId);
    }

    this.selectElement(null);
    this.render();
    this.updateNetlist();
  }

  selectElement(elem) {
    this.state.selectedElement = elem;
    this.render();
    this.updateInspector();
  }

  updateInspector() {
    if (!this.state.selectedElement || this.state.selectedElement.type !== 'component') {
      this.inspectorEmpty.style.display = 'block';
      this.inspectorContent.style.display = 'none';
      return;
    }

    const comp = this.state.getComponent(this.state.selectedElement.id);
    if (!comp) return;

    this.inspectorEmpty.style.display = 'none';
    this.inspectorContent.style.display = 'flex';

    this.propId.value = comp.label;
    this.propValue.value = comp.value;
    this.propRotationDisplay.textContent = `${comp.rotation}°`;
    this.propPositionDisplay.textContent = `X: ${comp.x}, Y: ${comp.y}`;

    // Pins
    const tmpl = COMPONENT_TEMPLATES[comp.type];
    this.propPinsList.innerHTML = tmpl.pins.map(pin => {
      const absPos = this.state.getPinAbsolutePosition(comp.id, pin.id);
      const isConnected = this.state.wires.some(w => 
        (w.from.compId === comp.id && w.from.pinId === pin.id) ||
        (w.to.compId === comp.id && w.to.pinId === pin.id)
      );
      return `
        <div class="property-row">
          <span class="prop-label">Pin ${pin.label} (${pin.id}):</span>
          <span class="prop-value" style="color: ${isConnected ? '#06d6a0' : '#ef476f'}">
            ${isConnected ? 'Connected' : 'Open'}
          </span>
        </div>
      `;
    }).join('');
  }

  // --- Smart Pin-to-Pin Wiring Engine ---
  startWiring(compId, pinId) {
    const absPos = this.state.getPinAbsolutePosition(compId, pinId);
    if (!absPos) return;

    this.state.wiringStartPin = { compId, pinId, x: absPos.x, y: absPos.y };
    this.state.wiringCurrentPos = { x: absPos.x, y: absPos.y };
    this.setTool('wire');
  }

  completeWiring(compId, pinId) {
    if (!this.state.wiringStartPin) return;

    // Prevent connecting pin to itself
    if (this.state.wiringStartPin.compId === compId && this.state.wiringStartPin.pinId === pinId) {
      this.cancelWiring();
      return;
    }

    // Check if wire already exists
    const exists = this.state.wires.some(w => 
      (w.from.compId === this.state.wiringStartPin.compId && w.from.pinId === this.state.wiringStartPin.pinId &&
       w.to.compId === compId && w.to.pinId === pinId) ||
      (w.to.compId === this.state.wiringStartPin.compId && w.to.pinId === this.state.wiringStartPin.pinId &&
       w.from.compId === compId && w.from.pinId === pinId)
    );

    if (!exists) {
      const wire = {
        id: this.state.generateId('wire'),
        from: { compId: this.state.wiringStartPin.compId, pinId: this.state.wiringStartPin.pinId },
        to: { compId, pinId }
      };
      this.state.wires.push(wire);
    }

    this.cancelWiring();
    this.render();
    this.updateNetlist();
  }

  cancelWiring() {
    this.state.wiringStartPin = null;
    this.wirePreviewLayer.innerHTML = '';
  }

  calculateManhattanWirePath(p1, p2) {
    // Standard Orthogonal routing: Horizontal then Vertical (or midway step)
    const midX = (p1.x + p2.x) / 2;
    return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
  }

  // --- Mouse & Pointer Event Handling ---
  handleCanvasMouseDown(e) {
    if (e.button === 1 || this.state.activeTool === 'pan' || (e.button === 0 && e.altKey)) {
      // Pan action
      this.state.isPanning = true;
      this.state.startPan = { x: e.clientX - this.state.panX, y: e.clientY - this.state.panY };
      this.svg.style.cursor = 'grabbing';
      return;
    }

    const rect = this.svg.getBoundingClientRect();
    const worldPos = this.state.screenToWorld(e.clientX, e.clientY, rect);

    // Hit test on pins
    const clickedPin = this.findPinAtWorldPos(worldPos.x, worldPos.y);
    if (clickedPin) {
      if (this.state.wiringStartPin) {
        this.completeWiring(clickedPin.compId, clickedPin.pinId);
      } else {
        this.startWiring(clickedPin.compId, clickedPin.pinId);
      }
      return;
    }

    // If wiring in progress and clicked empty canvas -> cancel
    if (this.state.wiringStartPin) {
      this.cancelWiring();
      return;
    }

    // Hit test on components
    const clickedComp = this.findComponentAtWorldPos(worldPos.x, worldPos.y);
    if (clickedComp) {
      this.selectElement({ type: 'component', id: clickedComp.id });
      if (this.state.activeTool === 'select') {
        this.state.isDraggingComp = true;
        this.state.draggedComp = clickedComp;
        this.state.dragOffset = {
          x: worldPos.x - clickedComp.x,
          y: worldPos.y - clickedComp.y
        };
      }
      return;
    }

    // Hit test on wires
    const clickedWire = this.findWireAtWorldPos(worldPos.x, worldPos.y);
    if (clickedWire) {
      this.selectElement({ type: 'wire', id: clickedWire.id });
      return;
    }

    // Deselect if clicked empty background
    this.selectElement(null);
  }

  handleCanvasMouseMove(e) {
    const rect = this.svg.getBoundingClientRect();
    const worldPos = this.state.screenToWorld(e.clientX, e.clientY, rect);

    // Update status coords
    this.statusCoords.textContent = `X: ${Math.round(worldPos.x)}, Y: ${Math.round(worldPos.y)}`;

    if (this.state.isPanning) {
      this.state.panX = e.clientX - this.state.startPan.x;
      this.state.panY = e.clientY - this.state.startPan.y;
      this.updateViewportTransform();
      return;
    }

    if (this.state.isDraggingComp && this.state.draggedComp) {
      const rawX = worldPos.x - this.state.dragOffset.x;
      const rawY = worldPos.y - this.state.dragOffset.y;
      this.state.draggedComp.x = this.state.snap(rawX);
      this.state.draggedComp.y = this.state.snap(rawY);
      this.render();
      this.updateInspector();
      return;
    }

    // Handle interactive wire preview
    if (this.state.wiringStartPin) {
      // Check if snapping to a candidate target pin
      const hoverPin = this.findPinAtWorldPos(worldPos.x, worldPos.y, 18);
      let targetX = worldPos.x;
      let targetY = worldPos.y;

      if (hoverPin && (hoverPin.compId !== this.state.wiringStartPin.compId || hoverPin.pinId !== this.state.wiringStartPin.pinId)) {
        const pinPos = this.state.getPinAbsolutePosition(hoverPin.compId, hoverPin.pinId);
        if (pinPos) {
          targetX = pinPos.x;
          targetY = pinPos.y;
        }
      } else {
        targetX = this.state.snap(worldPos.x);
        targetY = this.state.snap(worldPos.y);
      }

      const pathData = this.calculateManhattanWirePath(this.state.wiringStartPin, { x: targetX, y: targetY });
      this.wirePreviewLayer.innerHTML = `<path d="${pathData}" class="circuit-wire-preview"/>`;
    }
  }

  handleCanvasMouseUp(e) {
    if (this.state.isPanning) {
      this.state.isPanning = false;
      this.svg.style.cursor = this.state.activeTool === 'pan' ? 'grab' : (this.state.activeTool === 'wire' ? 'crosshair' : 'default');
    }

    if (this.state.isDraggingComp) {
      this.state.isDraggingComp = false;
      this.state.draggedComp = null;
      this.updateNetlist();
    }
  }

  findPinAtWorldPos(x, y, radius = 12) {
    for (const comp of this.state.components) {
      const tmpl = COMPONENT_TEMPLATES[comp.type];
      for (const pin of tmpl.pins) {
        const pos = this.state.getPinAbsolutePosition(comp.id, pin.id);
        if (pos) {
          const dist = Math.hypot(x - pos.x, y - pos.y);
          if (dist <= radius) {
            return { compId: comp.id, pinId: pin.id };
          }
        }
      }
    }
    return null;
  }

  findComponentAtWorldPos(x, y) {
    // Reverse iterate to pick top-most
    for (let i = this.state.components.length - 1; i >= 0; i--) {
      const comp = this.state.components[i];
      const tmpl = COMPONENT_TEMPLATES[comp.type];
      const hw = tmpl.width / 2 + 6;
      const hh = tmpl.height / 2 + 6;
      if (x >= comp.x - hw && x <= comp.x + hw && y >= comp.y - hh && y <= comp.y + hh) {
        return comp;
      }
    }
    return null;
  }

  findWireAtWorldPos(x, y, threshold = 8) {
    for (const wire of this.state.wires) {
      const p1 = this.state.getPinAbsolutePosition(wire.from.compId, wire.from.pinId);
      const p2 = this.state.getPinAbsolutePosition(wire.to.compId, wire.to.pinId);
      if (p1 && p2) {
        const midX = (p1.x + p2.x) / 2;
        // Check distance to Manhattan segments
        if (this.distToSegment({ x, y }, p1, { x: midX, y: p1.y }) < threshold ||
            this.distToSegment({ x, y }, { x: midX, y: p1.y }, { x: midX, y: p2.y }) < threshold ||
            this.distToSegment({ x, y }, { x: midX, y: p2.y }, p2) < threshold) {
          return wire;
        }
      }
    }
    return null;
  }

  distToSegment(p, v, w) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // --- Rendering Loop ---
  render() {
    this.renderWires();
    this.renderComponents();
    this.statusComponents.textContent = this.state.components.length;
    this.statusNets.textContent = this.state.wires.length;
  }

  renderWires() {
    let html = '';
    for (const wire of this.state.wires) {
      const p1 = this.state.getPinAbsolutePosition(wire.from.compId, wire.from.pinId);
      const p2 = this.state.getPinAbsolutePosition(wire.to.compId, wire.to.pinId);
      if (p1 && p2) {
        const pathData = this.calculateManhattanWirePath(p1, p2);
        const isSelected = this.state.selectedElement && this.state.selectedElement.type === 'wire' && this.state.selectedElement.id === wire.id;
        html += `
          <g class="circuit-wire-group" data-id="${wire.id}">
            <!-- Transparent thick path for easier clicking -->
            <path d="${pathData}" stroke="transparent" stroke-width="12" fill="none" style="cursor:pointer;"/>
            <!-- Visible stylized wire -->
            <path d="${pathData}" class="circuit-wire ${isSelected ? 'selected' : ''}"/>
            <circle cx="${p1.x}" cy="${p1.y}" r="3" class="junction-dot"/>
            <circle cx="${p2.x}" cy="${p2.y}" r="3" class="junction-dot"/>
          </g>
        `;
      }
    }
    this.wiresLayer.innerHTML = html;
  }

  renderComponents() {
    let html = '';
    for (const comp of this.state.components) {
      const tmpl = COMPONENT_TEMPLATES[comp.type];
      if (!tmpl) continue;

      const isSelected = this.state.selectedElement && this.state.selectedElement.type === 'component' && this.state.selectedElement.id === comp.id;

      // Pins SVG elements
      const pinsHtml = tmpl.pins.map(pin => {
        return `
          <g class="pin-group" data-pin-id="${pin.id}" transform="translate(${pin.relX}, ${pin.relY})">
            <circle cx="0" cy="0" r="3.5" fill="#ef476f" class="circuit-pin"/>
          </g>
        `;
      }).join('');

      html += `
        <g class="circuit-comp ${isSelected ? 'selected' : ''}" data-id="${comp.id}" transform="translate(${comp.x}, ${comp.y})">
          <g transform="rotate(${comp.rotation})">
            ${tmpl.render(comp)}
            ${pinsHtml}
          </g>
          <!-- Component Annotation Labels -->
          <text x="0" y="${-tmpl.height / 2 - 8}" text-anchor="middle" fill="#00b4d8" font-size="11" font-family="sans-serif" font-weight="bold">${comp.label}</text>
          <text x="0" y="${tmpl.height / 2 + 14}" text-anchor="middle" fill="#9e9ea8" font-size="10" font-family="sans-serif">${comp.value}</text>
        </g>
      `;
    }
    this.componentsLayer.innerHTML = html;
  }

  // --- Netlist Generator ---
  updateNetlist() {
    if (this.state.components.length === 0) {
      this.netlistOutput.textContent = '// CircuitEDU Auto-Generated Netlist\nNo components placed.';
      return;
    }

    // Union-Find / Disjoint-Set for electrical nodes
    const pinToNode = new Map();
    let nodeCounter = 1;

    const getPinKey = (compId, pinId) => `${compId}:${pinId}`;

    // Initialize each pin with its own node
    for (const comp of this.state.components) {
      const tmpl = COMPONENT_TEMPLATES[comp.type];
      for (const pin of tmpl.pins) {
        pinToNode.set(getPinKey(comp.id, pin.id), null);
      }
    }

    // Connect nodes by wires
    const parent = {};
    const find = (i) => {
      if (!parent[i]) parent[i] = i;
      if (parent[i] === i) return i;
      return parent[i] = find(parent[i]);
    };
    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) parent[rootI] = rootJ;
    };

    for (const wire of this.state.wires) {
      const k1 = getPinKey(wire.from.compId, wire.from.pinId);
      const k2 = getPinKey(wire.to.compId, wire.to.pinId);
      union(k1, k2);
    }

    // Assign clean node names (e.g. GND, N001, N002)
    const rootToNodeName = new Map();

    // Check for ground nodes
    for (const comp of this.state.components) {
      if (comp.type === 'ground') {
        const gndKey = getPinKey(comp.id, 'gnd');
        const root = find(gndKey);
        rootToNodeName.set(root, '0 (GND)');
      }
    }

    for (const comp of this.state.components) {
      const tmpl = COMPONENT_TEMPLATES[comp.type];
      for (const pin of tmpl.pins) {
        const key = getPinKey(comp.id, pin.id);
        const root = find(key);
        if (!rootToNodeName.has(root)) {
          rootToNodeName.set(root, `N${String(nodeCounter++).padStart(3, '0')}`);
        }
        pinToNode.set(key, rootToNodeName.get(root));
      }
    }

    // Build SPICE-like netlist string
    let netlist = `* CircuitEDU Schematic Netlist\n* Exported: ${new Date().toLocaleString()}\n\n`;
    for (const comp of this.state.components) {
      const tmpl = COMPONENT_TEMPLATES[comp.type];
      const pinNodes = tmpl.pins.map(p => pinToNode.get(getPinKey(comp.id, p.id)) || 'OPEN').join(' ');
      netlist += `${comp.label.padEnd(8)} ${pinNodes.padEnd(16)} ${comp.value}\n`;
    }
    netlist += `\n.END\n`;

    this.netlistOutput.textContent = netlist;
  }

  // --- Export Engines (SVG, PNG, JSON) ---
  exportSVG() {
    const bbox = this.calculateCircuitBoundingBox();
    const padding = 40;
    const x = bbox.minX - padding;
    const y = bbox.minY - padding;
    const width = (bbox.maxX - bbox.minX) + padding * 2;
    const height = (bbox.maxY - bbox.minY) + padding * 2;

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}" width="${width}" height="${height}" style="background:#18181d; font-family:sans-serif;">
        <style>
          .comp-body { stroke: #f0f0f5; stroke-width: 2px; }
          .circuit-wire { stroke: #06d6a0; stroke-width: 2.5px; fill: none; stroke-linecap: round; }
          .junction-dot { fill: #06d6a0; }
          .circuit-pin { fill: #ef476f; }
        </style>
        <g>${this.wiresLayer.innerHTML}</g>
        <g>${this.componentsLayer.innerHTML}</g>
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CircuitEDU_Schematic_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPNG() {
    const bbox = this.calculateCircuitBoundingBox();
    const padding = 50;
    const x = bbox.minX - padding;
    const y = bbox.minY - padding;
    const width = Math.max(200, (bbox.maxX - bbox.minX) + padding * 2);
    const height = Math.max(200, (bbox.maxY - bbox.minY) + padding * 2);

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}" width="${width}" height="${height}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#18181d"/>
        <style>
          .comp-body { stroke: #f0f0f5; stroke-width: 2px; }
          .circuit-wire { stroke: #06d6a0; stroke-width: 2.5px; fill: none; stroke-linecap: round; }
          .junction-dot { fill: #06d6a0; }
          .circuit-pin { fill: #ef476f; }
        </style>
        <g>${this.wiresLayer.innerHTML}</g>
        <g>${this.componentsLayer.innerHTML}</g>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // 2x Retina DPI
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `CircuitEDU_Schematic_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = url;
  }

  exportJSON() {
    const data = {
      project: 'CircuitEDU',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      components: this.state.components,
      wires: this.state.wires
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit_project_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  loadJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.components && data.wires) {
          this.state.components = data.components;
          this.state.wires = data.wires;
          this.selectElement(null);
          this.render();
          this.updateNetlist();
        }
      } catch (err) {
        alert('Invalid Circuit JSON file format.');
      }
    };
    reader.readAsText(file);
  }

  calculateCircuitBoundingBox() {
    if (this.state.components.length === 0) {
      return { minX: 0, minY: 0, maxX: 400, maxY: 300 };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const comp of this.state.components) {
      minX = Math.min(minX, comp.x - 50);
      minY = Math.min(minY, comp.y - 50);
      maxX = Math.max(maxX, comp.x + 50);
      maxY = Math.max(maxY, comp.y + 50);
    }
    return { minX, minY, maxX, maxY };
  }

  loadDemoCircuit() {
    // Clear and build an LED Driver Circuit
    this.state.components = [
      { id: 'v1', type: 'dc_source', label: 'V1', value: '5V', x: 200, y: 300, rotation: 270 },
      { id: 'sw1', type: 'switch', label: 'SW1', value: 'SPST', x: 340, y: 180, rotation: 0 },
      { id: 'r1', type: 'resistor', label: 'R1', value: '220Ω', x: 480, y: 180, rotation: 0 },
      { id: 'd1', type: 'led', label: 'D1', value: 'Red LED', x: 620, y: 300, rotation: 90 },
      { id: 'gnd1', type: 'ground', label: 'GND', value: '0V', x: 410, y: 440, rotation: 0 }
    ];

    this.state.wires = [
      { id: 'w1', from: { compId: 'v1', pinId: 'pos' }, to: { compId: 'sw1', pinId: 'pin1' } },
      { id: 'w2', from: { compId: 'sw1', pinId: 'pin2' }, to: { compId: 'r1', pinId: 'pin1' } },
      { id: 'w3', from: { compId: 'r1', pinId: 'pin2' }, to: { compId: 'd1', pinId: 'anode' } },
      { id: 'w4', from: { compId: 'd1', pinId: 'cathode' }, to: { compId: 'gnd1', pinId: 'gnd' } },
      { id: 'w5', from: { compId: 'gnd1', pinId: 'gnd' }, to: { compId: 'v1', pinId: 'neg' } }
    ];

    this.selectElement(null);
    this.render();
    this.updateNetlist();
  }
}

// Instantiate and start CAD environment when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.cadApp = new CircuitCADApp();
});
