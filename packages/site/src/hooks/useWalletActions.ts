import { useCallback } from 'react';
import type { OrgonNetwork } from '../types';

interface UseWalletActionsProps {
  onCreateWallet: () => void;
  onSendTransaction: () => void;
  onImportWallet: () => void;
  onNetworkChange?: ((network: any) => void) | undefined;
  onRefreshWallet?: ((id: string) => void) | undefined;
  onDeleteWallet?: ((id: string) => void) | undefined;
  onExportWallet?: ((id: string) => void) | undefined;
  onWithdrawExpireUnfreeze?: ((walletId: string, resourceType: 'BANDWIDTH' | 'ENERGY') => void) | undefined;
  onRefreshAll?: (() => void) | undefined;
}

export const useWalletActions = ({
  onCreateWallet,
  onSendTransaction,
  onImportWallet,
  onNetworkChange,
  onRefreshWallet,
  onDeleteWallet,
  onExportWallet,
  onWithdrawExpireUnfreeze,
  onRefreshAll,
}: UseWalletActionsProps) => {
  const handleCreateWallet = useCallback(() => {
    onCreateWallet();
  }, [onCreateWallet]);

  const handleSendTransaction = useCallback(() => {
    onSendTransaction();
  }, [onSendTransaction]);

  const handleImportWallet = useCallback(() => {
    onImportWallet();
  }, [onImportWallet]);

  const handleNetworkChange = useCallback(
    (network: any) => {
      if (onNetworkChange) {
        onNetworkChange(network as OrgonNetwork);
      }
    },
    [onNetworkChange]
  );

  const handleRefreshWallet = useCallback(
    (walletId: string) => {
      if (onRefreshWallet) {
        onRefreshWallet(walletId);
      }
    },
    [onRefreshWallet]
  );

  const handleDeleteWallet = useCallback(
    (walletId: string) => {
      if (onDeleteWallet) {
        onDeleteWallet(walletId);
      }
    },
    [onDeleteWallet]
  );

  const handleExportWallet = useCallback(
    (walletId: string) => {
      if (onExportWallet) {
        onExportWallet(walletId);
      }
    },
    [onExportWallet]
  );

  const handleWithdrawExpireUnfreeze = useCallback(
    (walletId: string, resourceType: 'BANDWIDTH' | 'ENERGY') => {
      if (onWithdrawExpireUnfreeze) {
        onWithdrawExpireUnfreeze(walletId, resourceType);
      }
    },
    [onWithdrawExpireUnfreeze]
  );

  const handleRefreshAll = useCallback(() => {
    if (onRefreshAll) {
      onRefreshAll();
    }
  }, [onRefreshAll]);

  return {
    handleCreateWallet,
    handleSendTransaction,
    handleImportWallet,
    handleNetworkChange,
    handleRefreshWallet,
    handleDeleteWallet,
    handleExportWallet,
    handleWithdrawExpireUnfreeze,
    handleRefreshAll,
  };
};
