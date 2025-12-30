import React from 'react';
import { WalletOverviewView } from './WalletOverviewView';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useWalletActions } from '../hooks/useWalletActions';
import type { OrgonAccount, OrgonBalance } from '../types';
import type { WalletService } from '../hooks/wallet';

interface WalletOverviewContainerProps {
  // Actions
  onCreateWallet: () => void;
  onSendTransaction: () => void;
  onImportWallet: () => void;
  onNetworkChange?: (network: any) => void;
  onRefreshWallet?: (id: string) => void;
  onDeleteWallet?: (id: string) => void;
  onExportWallet?: (id: string) => void;
  onWithdrawExpireUnfreeze?: (
    walletId: string,
    resourceType: 'BANDWIDTH' | 'ENERGY',
  ) => void;
  onRefreshAll?: () => void;

  // Data
  accounts: OrgonAccount[];
  balances: Record<string, OrgonBalance>;
  loading: boolean;
  refreshingWallets: Set<string>;
  currentNetwork?: any;
  walletService?: WalletService;
}

export const WalletOverviewContainer: React.FC<WalletOverviewContainerProps> = ({
  onCreateWallet,
  onSendTransaction,
  onImportWallet,
  onNetworkChange,
  onRefreshWallet,
  onDeleteWallet,
  onExportWallet,
  onWithdrawExpireUnfreeze,
  onRefreshAll,
  accounts,
  balances,
  loading,
  refreshingWallets,
  currentNetwork,
  walletService,
}) => {
  // Business logic hooks
  const walletActions = useWalletActions({
    onCreateWallet,
    onSendTransaction,
    onImportWallet,
    onNetworkChange,
    onRefreshWallet,
    onDeleteWallet,
    onExportWallet,
    onWithdrawExpireUnfreeze,
    onRefreshAll,
  });

  const { totalBalance, displayBalance } = useWalletBalance({
    accounts,
    balances,
  });

  // Prepare view props - pure data for presentation
  const viewProps = {
    // Computed data
    totalBalance,
    displayBalance,
    hasWallets: accounts.length > 0,

    // Raw data
    accounts,
    balances,
    loading,
    refreshingWallets,
    currentNetwork,
    walletService,

    // Action handlers
    onCreateWallet: walletActions.handleCreateWallet,
    onSendTransaction: walletActions.handleSendTransaction,
    onImportWallet: walletActions.handleImportWallet,
    onRefreshWallet: walletActions.handleRefreshWallet,
    onDeleteWallet: walletActions.handleDeleteWallet,
    onExportWallet: walletActions.handleExportWallet,
    onWithdrawExpireUnfreeze: walletActions.handleWithdrawExpireUnfreeze,
    onRefreshAll: walletActions.handleRefreshAll,
  };

  return <WalletOverviewView {...viewProps} />;
};
