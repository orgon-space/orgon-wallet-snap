import React, { useState, useEffect } from 'react';
import { Snowflake, Zap, AlertCircle, CheckCircle, Loader2, Copy, Calculator, Clock, Shield, ExternalLink } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

import { useWalletManager } from '../hooks/wallet';
import { useNetworkManager } from '../hooks/network';
import { useTransactionManager } from '../hooks/transaction';
import { formatAddress, validateOrgonAddress, calculateTransactionFee, copyToClipboard } from '../utils/helpers';
import { createFreezeTransaction, createUnfreezeTransaction } from '../utils/staking-transactions';
import { getExplorerUrlForNetwork } from '../utils/orgonWeb';
import type { OrgonTransaction } from '../types';

type FreezeUnfreezeType = 'freeze' | 'unfreeze';
type ResourceType = 'ENERGY' | 'BANDWIDTH';

export const FreezeUnfreeze: React.FC = () => {
  const walletManager = useWalletManager();
  const networkManager = useNetworkManager();
  const transactionManager = useTransactionManager();

  // Form state
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [operationType, setOperationType] = useState<FreezeUnfreezeType>('freeze');
  const [resourceType, setResourceType] = useState<ResourceType>('ENERGY');
  const [amount, setAmount] = useState('1');
  const [memo, setMemo] = useState('');
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('0.1');
  const [gasLimit, setGasLimit] = useState('1000000');

  // Get selected account data
  const selectedAccountData = walletManager.accounts?.find((acc) => acc.address === selectedAccount);

  // Load balance when account is selected
  useEffect(() => {
    if (selectedAccountData && !walletManager.balances[selectedAccountData.id]) {
      walletManager.refreshWalletBalance(selectedAccountData.id);
    }
  }, [selectedAccountData?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    transactionManager.clearError();
    setTransactionResult(null);

    if (!selectedAccount || !amount) {
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Invalid amount. Please enter a positive number.');
      return;
    }
    if (amountNum < 1) {
      alert('Minimum amount is 1 ORGON.');
      return;
    }

    try {
      // Get network config
      const networkConfig = networkManager.currentNetwork ? {
        rpcUrl: networkManager.currentNetwork.rpcUrl,
      } : undefined;

      // Create raw transaction based on operation type
      let rawTransaction: any;

      if (operationType === 'freeze') {
        rawTransaction = await createFreezeTransaction(
          selectedAccount,
          resourceType,
          amount,
          memo || undefined,
          networkConfig,
        );
      } else {
        rawTransaction = await createUnfreezeTransaction(
          selectedAccount,
          resourceType,
          amount,
          memo || undefined,
          networkConfig,
        );
      }

      // Send to snap for signing and broadcasting
      const transaction: OrgonTransaction = {
        from: selectedAccount,
        to: '', // Not used for freeze/unfreeze
        amount,
        networkId: networkManager.currentNetwork?.chainId || '',
        accountId: walletManager.accounts?.find((acc) => acc.address === selectedAccount)?.id || '',
      };

      const result = await transactionManager.sendTransaction({
        ...transaction,
        transaction: rawTransaction,
      } as any);
      setTransactionResult(result);

      // Clear form
      setAmount('1');
      setMemo('');
    } catch (err) {
      console.error('Failed to send transaction:', err);
    }
  };

  const isFormValid = selectedAccount && amount && parseFloat(amount) > 0 && parseFloat(amount) >= 1;
  const selectedNetworkData = networkManager.currentNetwork;

  if (walletManager.loading || networkManager.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Snowflake size={20} />
            Staking Operations
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
    <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl mb-4 shadow-lg">
          <Snowflake size={32} color="white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Staking Operations
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
          Freeze or unfreeze ORGON to gain Energy or Bandwidth
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* From Account */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">From Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400">
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

            {/* Operation Type */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Operation Type</label>
              <RadioGroup value={operationType} onValueChange={(value) => setOperationType(value as FreezeUnfreezeType)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="freeze" id="freeze" />
                  <Label htmlFor="freeze" className="flex items-center gap-2 cursor-pointer">
                    <Snowflake size={16} className="text-blue-500" />
                    Freeze
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unfreeze" id="unfreeze" />
                  <Label htmlFor="unfreeze" className="flex items-center gap-2 cursor-pointer">
                    <Zap size={16} className="text-orange-500" />
                    Unfreeze
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Resource Type */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Resource Type</label>
              <RadioGroup value={resourceType} onValueChange={(value) => setResourceType(value as ResourceType)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ENERGY" id="energy" />
                  <Label htmlFor="energy" className="flex items-center gap-2 cursor-pointer">
                    <Zap size={16} className="text-yellow-500" />
                    Energy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BANDWIDTH" id="bandwidth" />
                  <Label htmlFor="bandwidth" className="flex items-center gap-2 cursor-pointer">
                    <Shield size={16} className="text-green-500" />
                    Bandwidth
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Amount (ORGON)
                {operationType === 'unfreeze' && (
                  <span className="text-xs text-gray-500 ml-2">
                    (amount to unfreeze)
                  </span>
                )}
              </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.000001"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.0"
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 pr-32"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Minimum amount is 1 ORGON
                </p>
              </div>

            {/* Memo */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Memo (Optional)</label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a memo to your transaction"
                rows={3}
                maxLength={200}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Optional message to include with the transaction</span>
                <span>{memo.length}/200</span>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Calculator size={16} className="mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Gas Price (ORGON)</label>
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
                      <span>Estimated Fee: {calculateTransactionFee(gasPrice, gasLimit)} ORGON</span>
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
                    <span className="text-blue-700 dark:text-blue-300">Operation:</span>
                    <span className="text-blue-900 dark:text-blue-100 uppercase">
                      {operationType} {resourceType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {amount} ORGON
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
                      {calculateTransactionFee(gasPrice, gasLimit)} ORGON
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={transactionManager.loading || !isFormValid}
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transactionManager.loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                <>
                  <Snowflake size={20} className="mr-2" />
                  {operationType === 'freeze' ? 'Freeze ORGON' : 'Unfreeze ORGON'}
                </>
              )}
            </Button>
          </form>

          {transactionManager.error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertCircle size={16} />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {transactionManager.error}
              </AlertDescription>
            </Alert>
          )}

          {transactionResult && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle size={16} className="text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Transaction sent successfully!</strong>
                <div className="mt-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="text-sm flex flex-col gap-2">
                    <div>
                      <strong>Transaction ID:</strong>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-mono text-xs break-all bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                          {transactionResult.txId}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                          onClick={() => copyToClipboard(transactionResult.txId)}
                        >
                          <Copy size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                          onClick={() => window.open(`${getExplorerUrlForNetwork(networkManager.currentNetwork?.chainId)}/transaction/${transactionResult.txId}`, '_blank')}
                        >
                          <ExternalLink size={12} />
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
        </div>
      </CardContent>
    </Card>
  );
};
