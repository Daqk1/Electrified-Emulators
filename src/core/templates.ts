import type { ComponentTemplate, ComponentType } from './types';

// Exact prototype metadata; drawing belongs in render/.
export const COMPONENT_TEMPLATES = {
  "resistor": {
    "type": "resistor",
    "prefix": "R",
    "defaultValue": "1kΩ",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "pin1",
        "label": "1",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "pin2",
        "label": "2",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "capacitor": {
    "type": "capacitor",
    "prefix": "C",
    "defaultValue": "10µF",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "pin1",
        "label": "+",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "pin2",
        "label": "-",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "inductor": {
    "type": "inductor",
    "prefix": "L",
    "defaultValue": "100µH",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "pin1",
        "label": "1",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "pin2",
        "label": "2",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "switch": {
    "type": "switch",
    "prefix": "SW",
    "defaultValue": "SPST",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "pin1",
        "label": "1",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "pin2",
        "label": "2",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "led": {
    "type": "led",
    "prefix": "D",
    "defaultValue": "Red LED",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "anode",
        "label": "A",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "cathode",
        "label": "K",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "diode": {
    "type": "diode",
    "prefix": "D",
    "defaultValue": "1N4148",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "anode",
        "label": "A",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "cathode",
        "label": "K",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "dc_source": {
    "type": "dc_source",
    "prefix": "V",
    "defaultValue": "5V",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "neg",
        "label": "-",
        "relX": -30,
        "relY": 0
      },
      {
        "id": "pos",
        "label": "+",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "ground": {
    "type": "ground",
    "prefix": "GND",
    "defaultValue": "0V",
    "width": 30,
    "height": 30,
    "pins": [
      {
        "id": "gnd",
        "label": "GND",
        "relX": 0,
        "relY": -10
      }
    ]
  },
  "and_gate": {
    "type": "and_gate",
    "prefix": "U",
    "defaultValue": "74HC08",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "inA",
        "label": "A",
        "relX": -30,
        "relY": -8
      },
      {
        "id": "inB",
        "label": "B",
        "relX": -30,
        "relY": 8
      },
      {
        "id": "out",
        "label": "Y",
        "relX": 30,
        "relY": 0
      }
    ]
  },
  "or_gate": {
    "type": "or_gate",
    "prefix": "U",
    "defaultValue": "74HC32",
    "width": 60,
    "height": 30,
    "pins": [
      {
        "id": "inA",
        "label": "A",
        "relX": -30,
        "relY": -8
      },
      {
        "id": "inB",
        "label": "B",
        "relX": -30,
        "relY": 8
      },
      {
        "id": "out",
        "label": "Y",
        "relX": 30,
        "relY": 0
      }
    ]
  }
} as const satisfies Record<ComponentType, ComponentTemplate>;

export function isComponentType(value: unknown): value is ComponentType {
  return typeof value === 'string' && Object.hasOwn(COMPONENT_TEMPLATES, value);
}
