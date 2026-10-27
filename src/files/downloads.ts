import { saveAs } from 'file-saver';
import { exportDimensions } from '../core/bounds';
import { serializeProject } from '../core/project';
import type { CircuitState } from '../core/types';
import { exportSvg } from '../render/exportSvg';
import { rasterizeSvg } from './rasterize';

export function downloadSvg(circuit: CircuitState, timestamp = Date.now()) {
  saveAs(new Blob([exportSvg(circuit)], { type: 'image/svg+xml;charset=utf-8' }), `CircuitEDU_Schematic_${timestamp}.svg`);
}

export function downloadJson(circuit: CircuitState, timestamp = Date.now()) {
  const contents = serializeProject(circuit, new Date(timestamp).toISOString());
  saveAs(new Blob([contents], { type: 'application/json' }), `circuit_project_${timestamp}.json`);
}

export async function downloadPng(circuit: CircuitState, timestamp = Date.now()) {
  const image = await rasterizeSvg(exportSvg(circuit, { format: 'png' }), exportDimensions(circuit, 'png'));
  saveAs(image, `CircuitEDU_Schematic_${timestamp}.png`);
}
