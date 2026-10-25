import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

interface CustomMatchers<R = unknown> {
  toEqualHTML(html: string, options?: { ignoreAttrs?: string[] }): R;
}

declare module 'vitest' {
  interface Assertion<R extends void | Promise<void> = void, T = unknown>
    extends CustomMatchers<R> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
