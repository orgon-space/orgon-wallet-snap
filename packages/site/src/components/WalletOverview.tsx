import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  Plus, 
  RefreshCw,
  Copy,
  ExternalLink,
  Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
import { NetworkSwitcher } from './NetworkSwitcher';
import { WalletCard } from './WalletCard';
import { formatAddress, formatBalance, copyToClipboard } from '../utils/shared';
import type { OrgonAccount, OrgonBalance, OrgonNetwork } from '../types/snap';

interface WalletOverviewProps {
  onCreateWallet: () => void;
  onSendTransaction: () => void;
  onImportWallet: () => void;
  onNetworkChange?: (network: any) => void;
  onRefreshWallet?: (id: string) => void;
  onDeleteWallet?: (id: string) => void;
  onExportWallet?: (id: string) => void;
  onRefreshAll?: () => void;
  currentNetwork?: any;
  accounts?: OrgonAccount[];
  balances?: Record<string, OrgonBalance>;
  loading?: boolean;
  refreshingWallets?: Set<string>;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  onCreateWallet,
  onSendTransaction,
  onImportWallet,
  onNetworkChange,
  onRefreshWallet,
  onDeleteWallet,
  onExportWallet,
  onRefreshAll,
  currentNetwork: parentCurrentNetwork,
  accounts: parentAccounts = [],
  balances: parentBalances = {},
  loading = false,
  refreshingWallets = new Set()
}) => {

  const handleNetworkChange = (network: any) => {
    // Call parent's network change handler if provided
    if (onNetworkChange) {
      onNetworkChange(network);
    }
  };

  const totalBalance = parentAccounts.reduce((sum, account) => {
    if (!account || !account.id) {
      return sum;
    }
    const balance = parentBalances[account.id];
    return sum + (balance ? parseFloat(balance.trx) : 0);
  }, 0);

  const displayBalance = (balance: number) => {
    return formatBalance(balance.toString());
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Overview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Manage your Orgon wallets across different networks
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your wallets and send transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={onCreateWallet}
              className="flex-1 h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Create Wallet</span>
            </Button>
            <Button
              onClick={onImportWallet}
              variant="outline"
              className="flex-1 h-24 flex flex-col items-center justify-center space-y-2 border-dashed"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-xs">Import Wallet</span>
            </Button>
            <Button
              onClick={onSendTransaction}
              variant="outline"
              className="flex-1 h-24 flex flex-col items-center justify-center space-y-2"
              disabled={parentAccounts.length === 0}
            >
              <Send className="w-5 h-5" />
              <span className="text-xs">Send TRX</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet List */}
      {parentAccounts && parentAccounts.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Network Switcher - positioned above Your Wallets */}
          <div className="flex justify-center mb-2">
            <NetworkSwitcher 
              onNetworkChange={handleNetworkChange}
              className="w-full max-w-lg"
              currentNetwork={parentCurrentNetwork}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Wallets</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshAll}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh All
                </>
              )}
            </Button>
          </div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(parentAccounts || [])
                .filter((account) => account && account.id) // Filter out null/undefined accounts
                .map((account) => (
                  <WalletCard
                    key={account.id}
                    wallet={{ ...account, balance: parentBalances[account.id] }}
                    onRefresh={() => onRefreshWallet?.(account.id)}
                    onDelete={onDeleteWallet}
                    onExport={onExportWallet}
                    isRefreshing={refreshingWallets.has(account.id)}
                    currentNetwork={parentCurrentNetwork}
                  />
                ))}
            </div>
            {loading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Updating balances...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
