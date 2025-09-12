import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader2, Copy, Calculator, Clock, Shield, Zap } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

import { useWalletManager, useNetworkManager, useTransactionManager } from '../hooks';
import { formatAddress, validateOrgonAddress, calculateTransactionFee, copyToClipboard } from '../utils/shared';
import type { OrgonTransaction } from '../types/snap';

export const TransactionSender: React.FC = () => {
  const walletManager = useWalletManager();
  const networkManager = useNetworkManager();
  const transactionManager = useTransactionManager();
  
  // Form state
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('0.1');
  const [gasLimit, setGasLimit] = useState('1000000');

  // Set default network when networks are loaded
  useEffect(() => {
    if (networkManager.networks.length > 0 && !selectedNetwork) {
      setSelectedNetwork(networkManager.networks[0].chainId);
    }
  }, [networkManager.networks.length, selectedNetwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    transactionManager.clearError();
    setTransactionResult(null);

    if (!selectedAccount || !toAddress || !amount) {
      return;
    }

    try {
      const transaction: OrgonTransaction = {
        from: selectedAccount,
        to: toAddress,
        amount,
        memo: memo || undefined,
        networkId: selectedNetwork || undefined,
        accountId: walletManager.accounts?.find((acc) => acc.address === selectedAccount)?.id || '',
      };

      const result = await transactionManager.sendTransaction(transaction);
      setTransactionResult(result);

      // Clear form
      setToAddress('');
      setAmount('');
      setMemo('');
    } catch (err) {
      console.error('Failed to send transaction:', err);
    }
  };

  const selectedAccountData = walletManager.accounts?.find((acc) => acc.address === selectedAccount);
  const selectedNetworkData = networkManager.networks?.find((net) => net.chainId === selectedNetwork);

  const isFormValid = selectedAccount && toAddress && amount && parseFloat(amount) > 0;

  if (walletManager.loading || networkManager.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send size={20} />
            Send TRX Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin mx-auto mb-4" />
            <div className="text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send size={20} />
          Send TRX Transaction
        </CardTitle>
        <CardDescription>
          Transfer TRX to another Orgon address with advanced options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {transactionManager.error && (
            <Alert variant="destructive">
              <AlertCircle size={16} />
              <AlertDescription>{transactionManager.error}</AlertDescription>
            </Alert>
          )}

          {transactionResult && (
            <Alert>
              <CheckCircle size={16} />
              <AlertDescription>
                <strong>Transaction sent successfully!</strong>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm flex flex-col gap-1">
                    <div>
                      <strong>Transaction ID:</strong> 
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs break-all">
                          {transactionResult.txId}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(transactionResult.txId)}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge variant={transactionResult.success ? "default" : "destructive"} className="ml-2">
                        {transactionResult.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* From Account */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">From Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {walletManager.accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.address}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name || 'Unnamed Wallet'}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatAddress(account.address)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Address */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">To Address</label>
              <div className="relative">
                <Input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="TRecipientAddress..."
                  className={toAddress && !validateOrgonAddress(toAddress) ? 'border-red-500' : ''}
                  required
                />
                {toAddress && validateOrgonAddress(toAddress) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                )}
              </div>
              {toAddress && !validateOrgonAddress(toAddress) && (
                <p className="text-xs text-red-500">Invalid Orgon address format</p>
              )}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Amount (TRX)</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs">TRX</Badge>
                </div>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calculator size={12} />
                  <span>≈ ${(parseFloat(amount) * 0.1).toFixed(2)} USD</span>
                </div>
              )}
            </div>

            {/* Memo */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Memo (Optional)</label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a memo to your transaction"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Optional message to include with the transaction</span>
                <span>{memo.length}/200</span>
              </div>
            </div>

            {/* Network */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Network</label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a network" />
                </SelectTrigger>
                <SelectContent>
                  {networkManager.networks?.map((network) => (
                    <SelectItem key={network.chainId} value={network.chainId}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{network.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Options */}
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Zap size={16} className="mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Gas Price (TRX)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={gasPrice}
                      onChange={(e) => setGasPrice(e.target.value)}
                      placeholder="0.1"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Gas Limit</label>
                    <Input
                      type="number"
                      min="0"
                      value={gasLimit}
                      onChange={(e) => setGasLimit(e.target.value)}
                      placeholder="1000000"
                    />
                  </div>
                  <div className="col-span-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>Estimated Fee: {calculateTransactionFee(gasPrice, gasLimit)} TRX</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Preview */}
            {isFormValid && selectedAccountData && selectedNetworkData && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">Transaction Preview</h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">From:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {selectedAccountData.name} ({formatAddress(selectedAccountData.address)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">To:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {formatAddress(toAddress)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {amount} TRX
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Network:</span>
                    <span className="text-blue-900 dark:text-blue-100">
                      {selectedNetworkData.name}
                    </span>
                  </div>
                  {memo && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Memo:</span>
                      <span className="font-mono text-blue-900 dark:text-blue-100 text-xs">
                        {memo}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Fee:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {calculateTransactionFee(gasPrice, gasLimit)} TRX
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={transactionManager.loading || !isFormValid}
              className="w-full h-12 text-lg"
            >
              {transactionManager.loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Sending Transaction...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Send Transaction
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
