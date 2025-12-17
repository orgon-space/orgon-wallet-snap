import type { GatsbySSR } from 'gatsby';
import { StrictMode } from 'react';

import { Root } from './src/Root';

// Note: Buffer polyfill is only needed in browser (gatsby-browser.tsx)
// SSR doesn't need it as Node.js has Buffer natively

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => (
  <StrictMode>
    <Root>{element}</Root>
  </StrictMode>
);

