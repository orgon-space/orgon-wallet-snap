import React, { useEffect } from 'react';
import {
  AlertCircle,
  Cog,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Send,
  Snowflake,
  Users,
  Wallet,
} from 'lucide-react';

import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { WalletOverview } from './WalletOverview';
import { WalletManagement } from './WalletManagement';
import { TransactionSender } from './TransactionSender';
import { FreezeUnfreeze } from './FreezeUnfreeze';
import { ResourceDelegation } from './ResourceDelegation';
import { ExportWalletModal } from './ExportWalletModal';
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';

import {
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../hooks/metamask';
import { useWalletManager } from '../hooks/wallet';
import { useNetworkManager } from '../hooks/network';
import { useTransactionManager } from '../hooks/transaction';
import { useExportModal, useUIActions, useUIStore } from '../hooks/uiStore';
import { createWithdrawExpireUnfreezeTransaction } from '../utils/staking-transactions';
import type { OrgonTransaction } from '../types';
import { defaultSnapOrigin } from '../config';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();

  const walletManager = useWalletManager();
  const networkManager = useNetworkManager();
  const transactionManager = useTransactionManager();

  const activeTab = useUIStore((state) => state.activeTab);
  const exportModal = useExportModal();
  const uiActions = useUIActions();

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  // Load initial data when snap is installed
  useEffect(() => {
    if (installedSnap) {
      walletManager.loadAccounts();
      networkManager.loadNetworks();
    }
  }, [installedSnap]);

  // Load balances when accounts and network are available
  useEffect(() => {
    if (
      walletManager.accounts &&
      walletManager.accounts.length > 0 &&
      networkManager.currentNetwork
    ) {
      walletManager.refreshAllBalances();
    }
  }, [walletManager.accounts?.length, networkManager.currentNetwork?.chainId]);

  // Handle network changes
  const handleNetworkChange = async (network: any) => {
    try {
      await networkManager.switchNetwork(network.chainId);
      // Refresh balances for the new network using the specific chainId
      await walletManager.refreshAllBalances(network.chainId);
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  // Handle wallet export
  const handleExportWallet = async (walletId: string) => {
    try {
      const result = await walletManager.exportAccount(walletId);
      const wallet = walletManager.accounts?.find((acc) => acc.id === walletId);

      if (wallet) {
        uiActions.setExportWalletData({
          name: wallet.name || 'Unnamed Wallet',
          address: result.address,
          privateKey: result.privateKey,
        });
        uiActions.setExportModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to export wallet:', err);
    }
  };

  // Handle withdraw expire unfreeze
  const handleWithdrawExpireUnfreeze = async (
    walletId: string,
    resourceType: 'BANDWIDTH' | 'ENERGY',
  ) => {
    try {
      const wallet = walletManager.accounts?.find((acc) => acc.id === walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Create withdraw expire unfreeze transaction
      const rawTransaction = await createWithdrawExpireUnfreezeTransaction(
        wallet.address,
        networkManager.currentNetwork
          ? { rpcUrl: networkManager.currentNetwork.rpcUrl }
          : undefined,
      );

      // Create transaction object
      const transaction: OrgonTransaction = {
        from: wallet.address,
        to: wallet.address, // withdrawExpireUnfreeze is sent to self
        amount: '0', // No amount needed for withdraw
        memo: `Withdraw expired unfreeze for ${resourceType}`,
        accountId: walletId,
        transaction: rawTransaction,
        ...(networkManager.currentNetwork?.chainId && {
          networkId: networkManager.currentNetwork.chainId,
        }),
      };

      // Send transaction
      const result = await transactionManager.sendTransaction(transaction);
      console.log('Withdraw expire unfreeze transaction sent:', result);

      // Refresh wallet balance after transaction
      await walletManager.refreshWalletBalance(walletId);
    } catch (err) {
      console.error('Failed to withdraw expire unfreeze:', err);
      // Error is handled by transactionManager internally
      throw err; // Re-throw to let UI handle it if needed
    }
  };

  // If snap is not installed, show installation UI
  if (!installedSnap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
                <Wallet size={48} color="white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  Orgon Snap
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Connect to MetaMask and install the Orgon Snap to manage your
                Orgon wallets with ease
              </p>
            </div>

            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle size={16} />
                <AlertDescription>
                  <strong>An error happened:</strong> {error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-6 max-w-md mx-auto">
              {!isMetaMaskReady && (
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4">
                      <Download size={24} color="white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Install MetaMask Flask
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Snaps is pre-release software only available in MetaMask
                      Flask, a canary distribution for developers with access to
                      upcoming features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      Install MetaMask Flask
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isMetaMaskReady && (
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                      <Wallet size={24} color="white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Connect Orgon Snap
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Get started by connecting to and installing the Orgon Snap
                      to manage your Orgon wallets.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                      onClick={requestSnap}
                      disabled={!isMetaMaskReady}
                    >
                      Connect Orgon Snap
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main wallet interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Desktop Header */}
      <DesktopHeader
        onReconnect={requestSnap}
        showReconnect={shouldDisplayReconnectButton(installedSnap) || false}
        error={error}
      />

      {/* Mobile Header */}
      <MobileHeader
        walletCount={walletManager.accounts?.length || 0}
        totalBalance={Object.values(walletManager.balances)
          .reduce((sum, balance) => sum + parseFloat(balance?.orgon || '0'), 0)
          .toString()}
        onRefresh={() => walletManager.refreshAllBalances()}
        activeTab={activeTab}
        onTabChange={uiActions.setActiveTab}
        showTabs={true}
        showReconnect={shouldDisplayReconnectButton(installedSnap) || false}
        onReconnect={requestSnap}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:pt-8 pt-[120px]">
        <div className="max-w-full">
          <Tabs value={activeTab} onValueChange={uiActions.setActiveTab}>
            {/* Desktop Tabs - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto scrollbar-hide tab-scroll-container">
              <TabsList className="inline-flex w-max min-w-full">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create & Import
                </TabsTrigger>
                <TabsTrigger value="send" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </TabsTrigger>
                <TabsTrigger
                  value="staking"
                  className="flex items-center gap-2"
                >
                  <Snowflake className="w-4 h-4" />
                  Staking
                </TabsTrigger>
                <TabsTrigger
                  value="delegation"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Delegation
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Cog className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <WalletOverview
                onCreateWallet={() => uiActions.setActiveTab('create')}
                onSendTransaction={() => uiActions.setActiveTab('send')}
                onImportWallet={() => uiActions.setActiveTab('create')}
                onNetworkChange={handleNetworkChange}
                onRefreshWallet={(accountId) =>
                  walletManager.refreshWalletBalance(accountId)
                }
                onDeleteWallet={(accountId) =>
                  walletManager.deleteAccount(accountId)
                }
                onExportWallet={handleExportWallet}
                onWithdrawExpireUnfreeze={handleWithdrawExpireUnfreeze}
                onRefreshAll={() => walletManager.refreshAllBalances()}
                currentNetwork={networkManager.currentNetwork}
                accounts={walletManager.accounts || []}
                balances={walletManager.balances}
                loading={
                  walletManager.loading ||
                  walletManager.refreshingAllBalances ||
                  networkManager.switching
                }
                refreshingWallets={walletManager.refreshingWallets}
                walletService={walletManager.walletService}
              />
            </TabsContent>

            <TabsContent value="create">
              <WalletManagement
                onExportWallet={handleExportWallet}
                onDeleteWallet={(accountId) =>
                  walletManager.deleteAccount(accountId)
                }
                onRefreshWallet={(accountId) =>
                  walletManager.refreshWalletBalance(accountId)
                }
                refreshingWallets={walletManager.refreshingWallets}
                currentNetwork={networkManager.currentNetwork}
                showCreateForm={true}
                showImportForm={true}
              />
            </TabsContent>

            <TabsContent value="send">
              <TransactionSender />
            </TabsContent>

            <TabsContent value="staking">
              <FreezeUnfreeze />
            </TabsContent>

            <TabsContent value="delegation">
              <ResourceDelegation />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="w-5 h-5" />
                    Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your Orgon Snap preferences and manage your
                    account settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Cog className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Settings Coming Soon
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        We're working on bringing you comprehensive settings to
                        customize your Orgon Snap experience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    History
                  </CardTitle>
                  <CardDescription>
                    Browse your complete transaction history and wallet
                    activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <RefreshCw className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      History Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      View all your past transactions and wallet activities in
                      one place.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {(walletManager.error || error) && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle size={16} />
            <AlertDescription>
              {walletManager.error || error?.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Export Wallet Modal */}
      {exportModal.data && (
        <ExportWalletModal
          isOpen={exportModal.isOpen}
          onClose={() => {
            uiActions.setExportModalOpen(false);
            uiActions.setExportWalletData(null);
          }}
          walletName={exportModal.data.name}
          walletAddress={exportModal.data.address}
          privateKey={exportModal.data.privateKey}
        />
      )}
    </div>
  );
};
