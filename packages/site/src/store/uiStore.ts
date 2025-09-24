import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // State
  activeTab: string;
  showBalances: boolean;
  exportModalOpen: boolean;
  exportWalletData: {
    name: string;
    address: string;
    privateKey: string;
  } | null;

  // Actions
  setActiveTab: (tab: string) => void;
  setShowBalances: (show: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setExportWalletData: (data: UIState['exportWalletData']) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      activeTab: 'overview',
      showBalances: true,
      exportModalOpen: false,
      exportWalletData: null,

      // Actions
      setActiveTab: (activeTab) => set({ activeTab }, false, 'setActiveTab'),
      
      setShowBalances: (showBalances) => set({ showBalances }, false, 'setShowBalances'),
      
      setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }, false, 'setExportModalOpen'),
      
      setExportWalletData: (exportWalletData) => set({ exportWalletData }, false, 'setExportWalletData'),
      
      reset: () => set({
        activeTab: 'overview',
        showBalances: true,
        exportModalOpen: false,
        exportWalletData: null
      }, false, 'reset')
    }),
    { name: 'ui-store' }
  )
);

// Selectors for better performance
export const useActiveTab = () => useUIStore(state => state.activeTab);
export const useShowBalances = () => useUIStore(state => state.showBalances);
export const useExportModal = () => {
  const isOpen = useUIStore(state => state.exportModalOpen);
  const data = useUIStore(state => state.exportWalletData);
  
  return {
    isOpen,
    data
  };
};
export const useUIActions = () => {
  const setActiveTab = useUIStore(state => state.setActiveTab);
  const setShowBalances = useUIStore(state => state.setShowBalances);
  const setExportModalOpen = useUIStore(state => state.setExportModalOpen);
  const setExportWalletData = useUIStore(state => state.setExportWalletData);
  const reset = useUIStore(state => state.reset);

  return {
    setActiveTab,
    setShowBalances,
    setExportModalOpen,
    setExportWalletData,
    reset
  };
};
