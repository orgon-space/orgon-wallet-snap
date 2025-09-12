import { useCallback, useMemo } from 'react';
import { useNetworkStore, useNetworkActions } from '../store/networkStore';
import { createServices } from '../services';
import { useInvokeSnap } from './useInvokeSnap';
import type { OrgonNetwork } from '../types/snap';

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
  
  // Create services (memoized to prevent recreation on every render)
  const services = useMemo(() => createServices(invokeSnap, () => Promise.resolve(null)), [invokeSnap]);

  const loadNetworks = useCallback(async () => {
    try {
      networkActions.setLoading(true);
      networkActions.clearError();
      
      const [networksData, currentNetworkData] = await Promise.all([
        services.network.getNetworks(),
        services.network.getCurrentNetwork(),
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
  }, [services.network, networkActions]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (chainId === currentNetwork?.chainId) return currentNetwork;
    
    try {
      networkActions.setSwitching(true);
      networkActions.clearError();
      
      const result = await services.network.switchNetwork(chainId);
      networkActions.setCurrentNetwork(result.network);
      
      return result.network;
    } catch (err: any) {
      console.error('Failed to switch network:', err);
      networkActions.setError(err.message || 'Failed to switch network');
      throw err;
    } finally {
      networkActions.setSwitching(false);
    }
  }, [services.network, networkActions, currentNetwork]);

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
