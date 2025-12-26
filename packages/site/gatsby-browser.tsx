import type { GatsbyBrowser } from 'gatsby';
import { StrictMode } from 'react';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment (needed for OrgonWeb/TronWeb)
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  // Also set global.Buffer for modules that check global instead of window
  if (typeof (globalThis as any).Buffer === 'undefined') {
    (globalThis as any).Buffer = Buffer;
  }
}

import { Root } from './src/Root';

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element,
}) => (
  <StrictMode>
    <Root>{element}</Root>
  </StrictMode>
);

