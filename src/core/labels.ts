import type { CircuitComponent } from './types';

export function getNextLabel(components: readonly CircuitComponent[], prefix: string): string {
  const usedLabels = new Set(components.map((component) => component.label));
  let index = 1;
  while (usedLabels.has(`${prefix}${index}`)) index += 1;
  return `${prefix}${index}`;
}
