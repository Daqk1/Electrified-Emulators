import type { ComponentType as ReactComponentType } from 'react';
import { COMPONENT_TEMPLATES } from '../core/templates';
import type { ComponentType } from '../core/types';
import { Pin } from './Pin';
import { Resistor } from './parts/Resistor';
import { Capacitor } from './parts/Capacitor';
import { Inductor } from './parts/Inductor';
import { Switch } from './parts/Switch';
import { Led } from './parts/Led';
import { Diode } from './parts/Diode';
import { DcSource } from './parts/DcSource';
import { Ground } from './parts/Ground';
import { AndGate } from './parts/AndGate';
import { OrGate } from './parts/OrGate';
import type { PartProps } from './parts/shared';

export const PART_SYMBOLS: Record<ComponentType, ReactComponentType<PartProps>> = {
  resistor: Resistor, capacitor: Capacitor, inductor: Inductor, switch: Switch,
  led: Led, diode: Diode, dc_source: DcSource, ground: Ground, and_gate: AndGate, or_gate: OrGate,
};

export function PartGraphic({ type, variant = 'canvas', hoverPinId }: PartProps & {
  type: ComponentType; hoverPinId?: string;
}) {
  const Body = PART_SYMBOLS[type];
  return <>
    <Body variant={variant} />
    {COMPONENT_TEMPLATES[type].pins.map((pin) =>
      <Pin key={pin.id} pin={pin} variant={variant} snapTarget={hoverPinId === pin.id} />)}
  </>;
}
