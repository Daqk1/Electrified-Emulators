// @vitest-environment node
import { describe, expect, it } from 'vitest';
import legacy from '../test/fixtures/legacy-project.json';
import { createDemoCircuit } from './demo';

describe('demo circuit', () => {
  it('matches the original export exactly', () => {
    expect(createDemoCircuit()).toEqual({ components: legacy.components, wires: legacy.wires });
  });
  it('returns fresh components and endpoints for every load', () => {
    const first = createDemoCircuit();
    first.components[0]!.x = -999;
    first.wires[0]!.to.pinId = 'changed';
    expect(createDemoCircuit()).toEqual({ components: legacy.components, wires: legacy.wires });
  });
});
