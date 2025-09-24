import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrgonNetwork } from '../types/snap';

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
