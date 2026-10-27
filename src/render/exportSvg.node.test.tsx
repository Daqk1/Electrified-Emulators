// @vitest-environment node
import { expect, it } from 'vitest';
import { createDemoCircuit } from '../core/demo';
import { exportSvg } from './exportSvg';

it('serializes a circuit without any DOM or browser globals', () => {
  expect(typeof document).toBe('undefined');
  expect(typeof window).toBe('undefined');
  expect(exportSvg(createDemoCircuit())).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
});
