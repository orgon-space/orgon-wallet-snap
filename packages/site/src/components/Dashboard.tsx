import React, { useEffect } from 'react';
import { Wallet, Download, AlertCircle, RefreshCw, Eye, Plus, Send, Cog } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { WalletOverview } from './WalletOverview';
import { WalletManagement } from './WalletManagement';
import { TransactionSender } from './TransactionSender';
import { ExportWalletModal } from './ExportWalletModal';
import { MobileHeader } from './MobileHeader';

import { useMetaMask, useRequestSnap, useMetaMaskContext, useWalletManager, useNetworkManager } from '../hooks';
import { useUIStore, useUIActions, useExportModal } from '../store/uiStore';
import { defaultSnapOrigin } from '../config';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';

export const Dashboard: React.FC = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  
  const walletManager = useWalletManager();
  const networkManager = useNetworkManager();
  
  const activeTab = useUIStore(state => state.activeTab);
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
    if (walletManager.accounts && walletManager.accounts.length > 0 && networkManager.currentNetwork) {
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
      const wallet = walletManager.accounts?.find(acc => acc.id === walletId);
      
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

  // If snap is not installed, show installation UI
  if (!installedSnap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                <Wallet size={40} color="white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Orgon Snap</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Connect to MetaMask and install the Orgon Snap to manage your Orgon wallets
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

            <div className="flex flex-col gap-4">
              {!isMetaMaskReady && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download size={20} />
                      Install MetaMask Flask
                    </CardTitle>
                    <CardDescription>
                      Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg">
                      Install MetaMask Flask
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isMetaMaskReady && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet size={20} />
                      Connect Orgon Snap
                    </CardTitle>
                    <CardDescription>
                      Get started by connecting to and installing the Orgon Snap to manage your Orgon wallets.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
      <MobileHeader 
        walletCount={walletManager.accounts?.length || 0}
        totalBalance={Object.values(walletManager.balances)
          .reduce((sum, balance) => sum + parseFloat(balance.trx), 0)
          .toString()}
        onRefresh={walletManager.refreshAllBalances}
        activeTab={activeTab}
        onTabChange={uiActions.setActiveTab}
        showTabs={true}
        showReconnect={shouldDisplayReconnectButton(installedSnap)}
        onReconnect={requestSnap}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8 lg:pt-8 pt-[120px]">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle size={16} />
            <AlertDescription>
              <strong>An error happened:</strong> {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Compact Desktop Reconnect Button */}
        {shouldDisplayReconnectButton(installedSnap) && (
          <div className="hidden lg:flex justify-end mb-4">
            <Button
              onClick={requestSnap}
              disabled={!installedSnap}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reconnect Snap
            </Button>
          </div>
        )}

        <div className="max-w-full">
          <Tabs value={activeTab} onValueChange={uiActions.setActiveTab}>
            {/* Desktop Tabs - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto scrollbar-hide tab-scroll-container">
              <TabsList className="inline-flex w-max min-w-full">
                <TabsTrigger value="overview" className="flex items-center gap-2">
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
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Cog className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
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
                onRefreshWallet={walletManager.refreshWalletBalance}
                onDeleteWallet={walletManager.deleteAccount}
                onExportWallet={handleExportWallet}
                onRefreshAll={walletManager.refreshAllBalances}
                currentNetwork={networkManager.currentNetwork}
                accounts={walletManager.accounts || []}
                balances={walletManager.balances}
                loading={walletManager.loading || walletManager.refreshingAllBalances || networkManager.switching}
                refreshingWallets={walletManager.refreshingWallets}
              />
            </TabsContent>

            <TabsContent value="create">
              <WalletManagement
                onExportWallet={handleExportWallet}
                onDeleteWallet={walletManager.deleteAccount}
                onRefreshWallet={walletManager.refreshWalletBalance}
                refreshingWallets={walletManager.refreshingWallets}
                currentNetwork={networkManager.currentNetwork}
                showCreateForm={true}
                showImportForm={true}
              />
            </TabsContent>

            <TabsContent value="send">
              <TransactionSender />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="w-5 h-5" />
                    Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your Orgon Snap preferences and manage your account settings.
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
                        We're working on bringing you comprehensive settings to customize your Orgon Snap experience.
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
                    Browse your complete transaction history and wallet activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <RefreshCw className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      History Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      View all your past transactions and wallet activities in one place.
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
