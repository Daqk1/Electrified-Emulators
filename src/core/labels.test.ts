// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { part } from '../test/coreHelpers';
import { getNextLabel } from './labels';

describe('label allocation', () => {
  it('starts at 1 and fills gaps, ignoring unrelated or noncanonical labels', () => {
    expect(getNextLabel([], 'R')).toBe('R1');
    const parts = ['R1', 'R3', 'C2', 'R01', 'r2', 'R0'].map((label) => part({ id: label, label }));
    expect(getNextLabel(parts, 'R')).toBe('R2');
    expect(getNextLabel([...parts, part({ label: 'R2' })], 'R')).toBe('R4');
    expect(getNextLabel(parts, 'SW')).toBe('SW1');
  });
  it('shares D and U labels across component types and allows the demo GND label', () => {
    const parts = [part({ type: 'led', label: 'D1' }), part({ type: 'diode', label: 'D2' }),
      part({ type: 'and_gate', label: 'U1' }), part({ type: 'or_gate', label: 'U3' }), part({ type: 'ground', label: 'GND' })];
    expect(getNextLabel(parts, 'D')).toBe('D3');
    expect(getNextLabel(parts, 'U')).toBe('U2');
    expect(getNextLabel(parts, 'GND')).toBe('GND1');
  });
});
