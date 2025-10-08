/**
 * MetaMask Integration - Complete MetaMask and Snap functionality
 * Combines: Context, Request, InvokeSnap, RequestSnap, and MetaMask detection hooks
 */

import type { MetaMaskInpageProvider, RequestArguments } from '@metamask/providers';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { GetSnapsResponse, Snap } from '../types';
import { defaultSnapOrigin } from '../config';
import { getSnapsProvider } from '../utils/metamask';

// ============================================================================
// MetaMask Context
// ============================================================================

type MetaMaskContextType = {
  provider: MetaMaskInpageProvider | null;
  installedSnap: Snap | null;
  error: Error | null;
  setInstalledSnap: (snap: Snap | null) => void;
  setError: (error: Error) => void;
};

export const MetaMaskContext = createContext<MetaMaskContextType>({
  provider: null,
  installedSnap: null,
  error: null,
  setInstalledSnap: () => {
    /* no-op */
  },
  setError: () => {
    /* no-op */
  },
});

/**
 * MetaMask context provider to handle MetaMask and snap status.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<MetaMaskInpageProvider | null>(null);
  const [installedSnap, setInstalledSnap] = useState<Snap | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getSnapsProvider().then(setProvider).catch(console.error);
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 10000);

      return () => {
        clearTimeout(timeout);
      };
    }

    return undefined;
  }, [error]);

  return (
    <MetaMaskContext.Provider
      value={{ provider, error, setError, installedSnap, setInstalledSnap }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

/**
 * Utility hook to consume the MetaMask context.
 */
export function useMetaMaskContext() {
  return useContext(MetaMaskContext);
}

// ============================================================================
// Request Hook
// ============================================================================

export type Request = (params: RequestArguments) => Promise<unknown | null>;

/**
 * Utility hook to consume the provider `request` method with the available provider.
 */
export const useRequest = () => {
  const { provider, setError } = useMetaMaskContext();

  const request: Request = useCallback(async ({ method, params }) => {
    try {
      const data =
        (await provider?.request({
          method,
          params,
        } as RequestArguments)) ?? null;

      return data;
    } catch (requestError: any) {
      setError(requestError);

      return null;
    }
  }, [provider, setError]);

  return request;
};

// ============================================================================
// InvokeSnap Hook
// ============================================================================

export type InvokeSnapParams = {
  method: string;
  params?: Record<string, unknown>;
};

/**
 * Utility hook to wrap the `wallet_invokeSnap` method.
 */
export const useInvokeSnap = (snapId = defaultSnapOrigin) => {
  const request = useRequest();

  const invokeSnap = useCallback(async ({ method, params }: InvokeSnapParams) =>
    request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: params ? { method, params } : { method },
      },
    }), [request, snapId]);

  return invokeSnap;
};

// ============================================================================
// RequestSnap Hook
// ============================================================================

/**
 * Utility hook to wrap the `wallet_requestSnaps` method.
 */
export const useRequestSnap = (
  snapId = defaultSnapOrigin,
  version?: string,
) => {
  const request = useRequest();
  const { setInstalledSnap } = useMetaMaskContext();

  const requestSnap = useCallback(async () => {
    const snaps = (await request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: version ? { version } : {},
      },
    })) as Record<string, Snap>;

    setInstalledSnap(snaps?.[snapId] ?? null);
  }, [request, snapId, version, setInstalledSnap]);

  return requestSnap;
};

// ============================================================================
// MetaMask Detection Hook
// ============================================================================

/**
 * A hook to retrieve useful data from MetaMask.
 */
export const useMetaMask = () => {
  const { provider, setInstalledSnap, installedSnap } = useMetaMaskContext();
  const request = useRequest();

  const [isFlask, setIsFlask] = useState(false);

  const snapsDetected = provider !== null;

  /**
   * Detect if the version of MetaMask is Flask.
   */
  const detectFlask = async () => {
    const clientVersion = await request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    setIsFlask(isFlaskDetected);
  };

  /**
   * Get the Snap informations from MetaMask.
   */
  const getSnap = async () => {
    const snaps = (await request({
      method: 'wallet_getSnaps',
    })) as GetSnapsResponse;

    setInstalledSnap(snaps[defaultSnapOrigin] ?? null);
  };

  useEffect(() => {
    const detect = async () => {
      if (provider) {
        await detectFlask();
        await getSnap();
      }
    };

    detect().catch(console.error);
  }, [provider]);

  return { isFlask, snapsDetected, installedSnap, getSnap };
};

