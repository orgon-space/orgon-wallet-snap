import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Plus,
} from 'lucide-react';

import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { WalletCard } from './WalletCard';

import { useWalletManager } from '../hooks/wallet';
import { formatAddress } from '../utils/helpers';

interface WalletManagementProps {
  onExportWallet: (walletId: string) => void;
  onDeleteWallet: (walletId: string) => void;
  onRefreshWallet: (walletId: string) => void;
  refreshingWallets: Set<string>;
  currentNetwork?: any;
  showCreateForm?: boolean;
  showImportForm?: boolean;
}

export const WalletManagement: React.FC<WalletManagementProps> = ({
  onExportWallet,
  onDeleteWallet,
  onRefreshWallet,
  refreshingWallets,
  currentNetwork,
  showCreateForm = false,
  showImportForm = false,
}) => {
  const walletManager = useWalletManager();

  // Create/Import states
  const [accountName, setAccountName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [importName, setImportName] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<any>(null);
  const [importedAccount, setImportedAccount] = useState<any>(null);

  // Mnemonic import states
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [mnemonicImportName, setMnemonicImportName] = useState('');
  const [importedMnemonicAccount, setImportedMnemonicAccount] =
    useState<any>(null);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    walletManager.clearError();

    try {
      const account = await walletManager.createAccount(
        accountName || undefined,
      );
      if (account && account.id) {
        setCreatedAccount(account);
        setAccountName('');
      } else {
        throw new Error(
          'Failed to create account: Invalid account data returned',
        );
      }
    } catch (err) {
      console.error('Failed to create account:', err);
    }
  };

  const handleImportAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    walletManager.clearError();

    try {
      // Remove 0x prefix if present
      const cleanPrivateKey = privateKey.trim().replace(/^0x/i, '');

      const account = await walletManager.importAccount(
        cleanPrivateKey,
        importName || undefined,
      );
      if (account && account.id) {
        setImportedAccount(account);
        setPrivateKey('');
        setImportName('');
      } else {
        throw new Error(
          'Failed to import account: Invalid account data returned',
        );
      }
    } catch (err) {
      console.error('Failed to import account:', err);
    }
  };

  const handleImportFromMnemonic = async (e: React.FormEvent) => {
    e.preventDefault();
    walletManager.clearError();

    try {
      const account = await walletManager.importAccountFromMnemonic(
        mnemonicPhrase,
        mnemonicImportName || undefined,
      );
      if (account && account.id) {
        setImportedMnemonicAccount(account);
        setMnemonicPhrase('');
        setMnemonicImportName('');
      } else {
        throw new Error(
          'Failed to import account from mnemonic: Invalid account data returned',
        );
      }
    } catch (err) {
      console.error('Failed to import account from mnemonic:', err);
    }
  };

  const handleRefreshAll = async () => {
    await walletManager.refreshAllBalances();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create/Import Forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New Wallet */}
        <Card className="orgon-card orgon-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus size={20} />
              Create New Wallet
            </CardTitle>
            <CardDescription>
              Generate a new Orgon wallet with a secure recovery phrase
              (mnemonic)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateAccount}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">
                  Wallet Name (Optional)
                </label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="My Orgon Wallet"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your wallet a friendly name to identify it easily
                </p>
              </div>

              <Button
                type="submit"
                disabled={walletManager.loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {walletManager.loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Create New Wallet
                  </>
                )}
              </Button>

              {createdAccount && (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>
                    <strong>Wallet created successfully!</strong>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium">{createdAccount.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                        {formatAddress(createdAccount.address)}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Import Existing Wallet */}
        <Card className="orgon-card orgon-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Download size={20} />
              Import Existing Wallet
            </CardTitle>
            <CardDescription>
              Import an existing Orgon wallet using your private key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleImportAccount}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">
                  Private Key
                </label>
                <div className="relative">
                  <Textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your 64-character private key (hex format)"
                    rows={3}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your private key in hexadecimal format (64 characters)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">
                  Wallet Name (Optional)
                </label>
                <Input
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="My Imported Wallet"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your imported wallet a friendly name
                </p>
              </div>

              <Button
                type="submit"
                disabled={walletManager.loading || !privateKey.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {walletManager.loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Import Wallet
                  </>
                )}
              </Button>

              {importedAccount && (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>
                    <strong>Wallet imported successfully!</strong>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium">{importedAccount.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                        {formatAddress(importedAccount.address)}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Import from Mnemonic */}
        <Card className="orgon-card orgon-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Download size={20} />
              Import from Recovery Phrase
            </CardTitle>
            <CardDescription>
              Import an existing Orgon wallet using your recovery phrase
              (mnemonic)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleImportFromMnemonic}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">
                  Recovery Phrase
                </label>
                <Textarea
                  value={mnemonicPhrase}
                  onChange={(e) => setMnemonicPhrase(e.target.value)}
                  placeholder="Enter your 12-word recovery phrase separated by spaces"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 12-word recovery phrase (mnemonic) separated by
                  spaces
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">
                  Wallet Name (Optional)
                </label>
                <Input
                  value={mnemonicImportName}
                  onChange={(e) => setMnemonicImportName(e.target.value)}
                  placeholder="My Recovered Wallet"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your recovered wallet a friendly name
                </p>
              </div>

              <Button
                type="submit"
                disabled={walletManager.loading || !mnemonicPhrase.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {walletManager.loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Import from Phrase
                  </>
                )}
              </Button>

              {importedMnemonicAccount && (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>
                    <strong>Wallet imported successfully!</strong>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium">
                        {importedMnemonicAccount.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                        {formatAddress(importedMnemonicAccount.address)}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Wallet List - Only show when not in create/import mode */}
      {!showCreateForm &&
        !showImportForm &&
        walletManager.accounts &&
        walletManager.accounts.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Wallets</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={walletManager.loading}
              >
                Refresh All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(walletManager.accounts || [])
                .filter((account) => account && account.id) // Filter out null/undefined accounts
                .map((account) => (
                  <WalletCard
                    key={account.id}
                    wallet={{
                      ...account,
                      balance: walletManager.balances[account.id],
                    }}
                    onRefresh={() => onRefreshWallet(account.id)}
                    onDelete={onDeleteWallet}
                    onExport={onExportWallet}
                    isRefreshing={refreshingWallets.has(account.id)}
                    currentNetwork={currentNetwork}
                  />
                ))}
            </div>
          </div>
        )}

      {/* Error Display */}
      {walletManager.error && (
        <Alert variant="destructive">
          <AlertCircle size={16} />
          <AlertDescription>{walletManager.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
