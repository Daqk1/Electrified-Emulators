// @vitest-environment node
import { describe, expect, it } from 'vitest';
import metadata from '../test/fixtures/templates.json';
import { COMPONENT_TEMPLATES, isComponentType } from './templates';

describe('component metadata', () => {
  it('matches all ten original templates, including pin order and exact offsets', () => {
    expect(COMPONENT_TEMPLATES).toEqual(metadata);
    expect(Object.keys(COMPONENT_TEMPLATES)).toHaveLength(10);
    expect(Object.values(COMPONENT_TEMPLATES).every((template) => !('render' in template))).toBe(true);
  });

  it.each(['constructor', '__proto__', 'toString', '', 'op_amp', null, 1])('rejects unknown type %s', (value) => {
    expect(isComponentType(value)).toBe(false);
  });

  it('recognizes every supported type', () => {
    for (const type of Object.keys(metadata)) expect(isComponentType(type)).toBe(true);
  });
});
