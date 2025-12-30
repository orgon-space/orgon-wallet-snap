import React from 'react';
import { WalletOverviewHeader } from './WalletOverviewHeader';
import { QuickActions } from './QuickActions';
import { WalletList } from './WalletList';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useWalletActions } from '../hooks/useWalletActions';
import type { OrgonAccount, OrgonBalance } from '../types';
import type { WalletService } from '../hooks/wallet';

interface WalletOverviewProps {
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

export const WalletOverview: React.FC<WalletOverviewProps> = ({
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
  // Use custom hooks for business logic
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

  const { totalBalance } = useWalletBalance({
    accounts,
    balances,
  });

  return (
    <div className="space-y-6">
      <WalletOverviewHeader />

      <QuickActions
        onCreateWallet={walletActions.handleCreateWallet}
        onSendTransaction={walletActions.handleSendTransaction}
        onImportWallet={walletActions.handleImportWallet}
        hasWallets={accounts.length > 0}
      />

      <WalletList
        accounts={accounts}
        balances={balances}
        loading={loading}
        refreshingWallets={refreshingWallets}
        currentNetwork={currentNetwork}
        walletService={walletService}
        onRefreshWallet={walletActions.handleRefreshWallet}
        onDeleteWallet={walletActions.handleDeleteWallet}
        onExportWallet={walletActions.handleExportWallet}
        onWithdrawExpireUnfreeze={walletActions.handleWithdrawExpireUnfreeze}
        onRefreshAll={walletActions.handleRefreshAll}
      />
    </div>
  );
};
