import React, { useMemo, createContext, useContext, ReactNode, FunctionComponent } from 'react';
import { useNetworkManager } from './network';
import type { OrgonNetwork } from '../types';

// ============================================================================
// Network Provider - Global Context Provider
// ============================================================================

export interface NetworkContextType {
  // State
  networks: OrgonNetwork[];
  currentNetwork: OrgonNetwork | null;
  loading: boolean;
  error: string | null;
  switching: boolean;

  // Actions
  loadNetworks: () => Promise<{ networks: OrgonNetwork[]; currentNetwork: OrgonNetwork | null }>;
  switchNetwork: (chainId: string) => Promise<OrgonNetwork | null>;
  clearError: () => void;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: FunctionComponent<NetworkProviderProps> = ({ children }) => {
  const networkManager = useNetworkManager();

  const contextValue = useMemo<NetworkContextType>(() => ({
    networks: networkManager.networks,
    currentNetwork: networkManager.currentNetwork,
    loading: networkManager.loading,
    error: networkManager.error,
    switching: networkManager.switching,
    loadNetworks: networkManager.loadNetworks,
    switchNetwork: networkManager.switchNetwork,
    clearError: networkManager.clearError,
  }), [
    networkManager.networks,
    networkManager.currentNetwork,
    networkManager.loading,
    networkManager.error,
    networkManager.switching,
    networkManager.loadNetworks,
    networkManager.switchNetwork,
    networkManager.clearError,
  ]);

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
