/**
 * All TypeScript type definitions for Orgon Snap frontend
 * Consolidated from multiple type files for easier navigation
 */

import type {
  EIP6963AnnounceProviderEvent,
  EIP6963RequestProviderEvent,
  MetaMaskInpageProvider,
} from '@metamask/providers';
import type { FunctionComponent, SVGProps } from 'react';

// ============================================================================
// MetaMask & Snap Types
// ============================================================================

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

// ============================================================================
// Orgon Blockchain Types
// ============================================================================

export type OrgonAccount = {
  id: string;
  name: string;
  address: string;
  balance?: any;
  mnemonic?: string;
};

export type OrgonNetwork = {
  chainId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
};

export type OrgonTransaction = {
  from: string;
  to: string;
  amount: string;
  memo?: string;
  networkId?: string;
  accountId: string;
};

// ============================================================================
// Window & Module Type Extensions
// ============================================================================

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: MetaMaskInpageProvider & {
      setProvider?: (provider: MetaMaskInpageProvider) => void;
      detected?: MetaMaskInpageProvider[];
      providers?: MetaMaskInpageProvider[];
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    'eip6963:requestProvider': EIP6963RequestProviderEvent;
    'eip6963:announceProvider': EIP6963AnnounceProviderEvent;
  }
}

// ============================================================================
// Styled Components Theme Extension
// ============================================================================

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  export interface DefaultTheme {
    fonts: Record<string, string>;
    fontSizes: Record<string, string>;
    breakpoints: string[];
    mediaQueries: Record<string, string>;
    radii: Record<string, string>;
    shadows: Record<string, string>;
    colors: Record<string, Record<string, string>>;
  }
}

// ============================================================================
// SVG Module Declaration
// ============================================================================

declare module '*.svg' {
  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
}


