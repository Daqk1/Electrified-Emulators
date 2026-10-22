import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

if (typeof window !== 'undefined' && !globalThis.PointerEvent) {
  class TestPointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
      this.isPrimary = init.isPrimary ?? true;
    }
  }

  Object.defineProperty(globalThis, 'PointerEvent', {
    configurable: true,
    writable: true,
    value: TestPointerEvent,
  });
}

// Model capture ownership for jsdom only. Real outside-canvas delivery is
// verified in the browser once pointer interactions arrive in phase 4.
let captures = new WeakMap<Element, Set<number>>();

if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function (pointerId: number) {
    const pointers = captures.get(this) ?? new Set<number>();
    pointers.add(pointerId);
    captures.set(this, pointers);
  };
  Element.prototype.hasPointerCapture = function (pointerId: number) {
    return captures.get(this)?.has(pointerId) ?? false;
  };
  Element.prototype.releasePointerCapture = function (pointerId: number) {
    captures.get(this)?.delete(pointerId);
  };
}

afterEach(() => {
  cleanup();
  captures = new WeakMap();
});
