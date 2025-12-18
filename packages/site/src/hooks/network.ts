/**
 * Network Layer - Complete network functionality
 * Combines: NetworkService, NetworkStore, useNetworkManager, and NetworkProvider
 */

import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrgonNetwork } from '../types';
import { useInvokeSnap } from './metamask';

// ============================================================================
// Network Service - Snap Communication
// ============================================================================

export interface NetworkServiceInterface {
  getNetworks(): Promise<OrgonNetwork[]>;
  getCurrentNetwork(): Promise<{ success: boolean; network: OrgonNetwork | null }>;
  switchNetwork(chainId: string): Promise<{ success: boolean; network: OrgonNetwork | null }>;
}

export class NetworkService implements NetworkServiceInterface {
  constructor(
    private invokeSnap: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
  ) {}

  async getNetworks(): Promise<OrgonNetwork[]> {
    try {
      const networks = await this.invokeSnap({
        method: 'orgon_getNetworks',
      });
      return networks as OrgonNetwork[];
    } catch (error: any) {
      console.error('Failed to get networks:', error);
      throw new Error(error?.message || 'Failed to get networks');
    }
  }

  async getCurrentNetwork(): Promise<{ success: boolean; network: OrgonNetwork | null }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_getCurrentNetwork',
      });
      return result as { success: boolean; network: OrgonNetwork | null };
    } catch (error: any) {
      console.error('Failed to get current network:', error);
      throw new Error(error?.message || 'Failed to get current network');
    }
  }

  async switchNetwork(chainId: string): Promise<{ success: boolean; network: OrgonNetwork | null }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_switchNetwork',
        params: { chainId },
      });
      return result as { success: boolean; network: OrgonNetwork | null };
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      throw new Error(error?.message || 'Failed to switch network');
    }
  }
}

// ============================================================================
// Network Store - Zustand State Management
// ============================================================================

interface NetworkState {
  // State
  networks: OrgonNetwork[];
  currentNetwork: OrgonNetwork | null;
  loading: boolean;
  error: string | null;
  switching: boolean;

  // Actions
  setNetworks: (networks: OrgonNetwork[]) => void;
  setCurrentNetwork: (network: OrgonNetwork | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSwitching: (switching: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

export const useNetworkStore = create<NetworkState>()(
  devtools(
    (set) => ({
      // Initial state
      networks: [],
      currentNetwork: null,
      loading: false,
      error: null,
      switching: false,

      // Actions
      setNetworks: (networks) => set({ networks }, false, 'setNetworks'),
      
      setCurrentNetwork: (currentNetwork) => 
        set({ currentNetwork }, false, 'setCurrentNetwork'),
      
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      
      setError: (error) => set({ error }, false, 'setError'),
      
      setSwitching: (switching) => set({ switching }, false, 'setSwitching'),
      
      clearError: () => set({ error: null }, false, 'clearError'),
      
      reset: () => set({
        networks: [],
        currentNetwork: null,
        loading: false,
        error: null,
        switching: false
      }, false, 'reset')
    }),
    { name: 'network-store' }
  )
);

// Selectors for better performance
export const useNetworks = () => useNetworkStore(state => state.networks);
export const useCurrentNetwork = () => useNetworkStore(state => state.currentNetwork);
export const useNetworkLoading = () => useNetworkStore(state => state.loading);
export const useNetworkError = () => useNetworkStore(state => state.error);
export const useNetworkSwitching = () => useNetworkStore(state => state.switching);
export const useNetworkActions = () => {
  const setNetworks = useNetworkStore(state => state.setNetworks);
  const setCurrentNetwork = useNetworkStore(state => state.setCurrentNetwork);
  const setLoading = useNetworkStore(state => state.setLoading);
  const setError = useNetworkStore(state => state.setError);
  const setSwitching = useNetworkStore(state => state.setSwitching);
  const clearError = useNetworkStore(state => state.clearError);
  const reset = useNetworkStore(state => state.reset);

  return {
    setNetworks,
    setCurrentNetwork,
    setLoading,
    setError,
    setSwitching,
    clearError,
    reset
  };
};

// ============================================================================
// Network Manager Hook - Main Interface
// ============================================================================

export const useNetworkManager = () => {
  const invokeSnap = useInvokeSnap();
  
  // Store state
  const networks = useNetworkStore(state => state.networks);
  const currentNetwork = useNetworkStore(state => state.currentNetwork);
  const loading = useNetworkStore(state => state.loading);
  const error = useNetworkStore(state => state.error);
  const switching = useNetworkStore(state => state.switching);
  
  // Store actions
  const networkActions = useNetworkActions();
  
  // Create network service (memoized to prevent recreation on every render)
  const networkService = useMemo(() => new NetworkService(invokeSnap), [invokeSnap]);

  const loadNetworks = useCallback(async () => {
    try {
      networkActions.setLoading(true);
      networkActions.clearError();
      
      const [networksData, currentNetworkData] = await Promise.all([
        networkService.getNetworks(),
        networkService.getCurrentNetwork(),
      ]);
      
      networkActions.setNetworks(networksData);
      networkActions.setCurrentNetwork(currentNetworkData.network);
      
      return { networks: networksData, currentNetwork: currentNetworkData.network };
    } catch (err: any) {
      console.error('Failed to load networks:', err);
      networkActions.setError(err.message || 'Failed to load networks');
      throw err;
    } finally {
      networkActions.setLoading(false);
    }
  }, [networkService, networkActions]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (chainId === currentNetwork?.chainId) return currentNetwork;
    
    try {
      networkActions.setSwitching(true);
      networkActions.clearError();
      
      const result = await networkService.switchNetwork(chainId);
      networkActions.setCurrentNetwork(result.network);
      
      return result.network;
    } catch (err: any) {
      console.error('Failed to switch network:', err);
      networkActions.setError(err.message || 'Failed to switch network');
      throw err;
    } finally {
      networkActions.setSwitching(false);
    }
  }, [networkService, networkActions, currentNetwork]);

  return {
    // State
    networks,
    currentNetwork,
    loading,
    error,
    switching,

    // Actions
    loadNetworks,
    switchNetwork,
    clearError: networkActions.clearError,
  };
};


