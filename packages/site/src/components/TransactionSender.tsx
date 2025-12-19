import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader2, Copy, Calculator, Clock, Shield, Zap, ExternalLink } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

import { useWalletManager, useTokenBalances, type TokenBalance } from '../hooks/wallet';
import { useNetworkManager } from '../hooks/network';
import { useTransactionManager } from '../hooks/transaction';
import { formatAddress, validateOrgonAddress, calculateTransactionFee, copyToClipboard } from '../utils/helpers';
import { createOrgonTransaction, createOrc10Transaction, createOrc20Transaction } from '../utils/transaction';
import { getExplorerUrlForNetwork } from '../utils/orgonWeb';
import type { OrgonTransaction } from '../types';

export const TransactionSender: React.FC = () => {
  const walletManager = useWalletManager();
  const networkManager = useNetworkManager();
  const transactionManager = useTransactionManager();
  
  // Form state
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [toAddress, setToAddress] = useState('oZJ26HNoRGPDJDVezXe5ZWWgy9W49KMoUp');
  const [amount, setAmount] = useState('1');
  const [memo, setMemo] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>(''); // Format: "type|symbol|address|index"
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('0.1');
  const [gasLimit, setGasLimit] = useState('1000000');

  // Get selected account data and its token balances
  const selectedAccountData = walletManager.accounts?.find((acc) => acc.address === selectedAccount);
  
  // Combine account with its balance (like in WalletOverview)
  const accountWithBalance = selectedAccountData ? {
    ...selectedAccountData,
    balance: walletManager.balances[selectedAccountData.id]
  } : undefined;
  
  const tokens = useTokenBalances(accountWithBalance);
  
  // Parse selected token
  const currentToken = selectedToken
    ? (() => {
        const [type, symbol, address] = selectedToken.split('|').slice(0, 3);
        return tokens.find(t => t.type === type && t.symbol === symbol && (t.address || '') === address);
      })()
    : tokens[0]; // Default to first token (ORGON)


  // Load balance when account is selected
  useEffect(() => {
    if (selectedAccountData && !walletManager.balances[selectedAccountData.id]) {
      walletManager.refreshWalletBalance(selectedAccountData.id);
    }
  }, [selectedAccountData?.id]);

  // Set default token when tokens are loaded
  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) {
      const defaultToken = tokens[0];
      if (defaultToken) {
        setSelectedToken(`${defaultToken.type}|${defaultToken.symbol}|${defaultToken.address || ''}|0`);
      }
    }
  }, [tokens.length, selectedToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    transactionManager.clearError();
    setTransactionResult(null);

    if (!selectedAccount || !toAddress || !amount) {
      return;
    }

    try {
      // Get network config
      const networkConfig = selectedNetworkData ? {
        rpcUrl: selectedNetworkData.rpcUrl,
        apiKey: (selectedNetworkData as any).apiKey,
      } : undefined;

      // Create raw transaction based on token type
      let rawTransaction: any;
      const memoValue = memo && memo.trim() !== '' ? memo.trim() : undefined;
      
      if (currentToken?.type === 'orc10') {
        // ORC10 transaction
        if (!currentToken.address) {
          throw new Error('Token ID is required for ORC10 transactions');
        }
        const amountNum = parseFloat(amount);
        const decimals = currentToken.decimals || 6;
        const finalAmount = Math.floor(amountNum * Math.pow(10, decimals)).toString();
        
        rawTransaction = await createOrc10Transaction(
          selectedAccount,
          toAddress,
          finalAmount,
          currentToken.address,
          memoValue,
          networkConfig,
        );
      } else if (currentToken?.type === 'orc20') {
        // ORC20 transaction
        if (!currentToken.address) {
          throw new Error('Contract address is required for ORC20 transactions');
        }
        const amountNum = parseFloat(amount);
        const decimals = currentToken.decimals || 6;
        const finalAmount = Math.floor(amountNum * Math.pow(10, decimals)).toString();
        
        rawTransaction = await createOrc20Transaction(
          selectedAccount,
          toAddress,
          finalAmount,
          currentToken.address,
          memoValue,
          networkConfig,
        );
      } else {
        // Native ORGON transaction
        rawTransaction = await createOrgonTransaction(
          selectedAccount,
          toAddress,
          amount,
          memoValue,
          networkConfig,
        );
      }

      // Send to snap for signing and broadcasting
      const transaction: OrgonTransaction = {
        from: selectedAccount,
        to: toAddress,
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
      setToAddress('');
      setAmount('');
      setMemo('');
    } catch (err) {
      console.error('Failed to send transaction:', err);
    }
  };

  const selectedNetworkData = networkManager.currentNetwork;

  const isFormValid = selectedAccount && toAddress && amount && parseFloat(amount) > 0;

  if (walletManager.loading || networkManager.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send size={20} />
            Send Transaction
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-4 shadow-lg">
          <Send size={32} color="white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Send Transaction
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
          Transfer tokens to another Orgon address
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

            {/* Token Selection */}
            {selectedAccount && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Token</label>
                {tokens.length > 0 ? (
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400">
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token, index) => {
                        const tokenKey = `${token.type}|${token.symbol}|${token.address || ''}|${index}`;
                        const balance = (token.value / (10 ** token.decimals)).toFixed(token.decimals);
                        const displaySymbol = token.type === 'orc20' ? formatAddress(token.symbol) : token.symbol;

                        return (
                          <SelectItem key={tokenKey} value={tokenKey}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs uppercase">
                                  {token.type}
                                </Badge>
                                <span className="font-medium">{displaySymbol}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Balance: {balance}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading tokens...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* To Address */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">To Address</label>
              <div className="relative">
                <Input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="oRecipientAddress..."
                  className={`h-12 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-400 ${
                    toAddress && !validateOrgonAddress(toAddress) 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  required
                />
                {toAddress && validateOrgonAddress(toAddress) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                )}
              </div>
              {toAddress && !validateOrgonAddress(toAddress) && (
                <p className="text-sm text-red-600 dark:text-red-400">Invalid Orgon address format</p>
              )}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Amount {currentToken && `(${currentToken.type === 'orc20' ? formatAddress(currentToken.symbol) : currentToken.symbol})`}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 pr-32"
                  required
                />
              </div>
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
                <Zap size={16} className="mr-2" />
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
                    <span className="text-blue-700 dark:text-blue-300">To:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {formatAddress(toAddress)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                    <span className="font-mono text-blue-900 dark:text-blue-100">
                      {amount} {currentToken ? (currentToken.type === 'orc20' ? formatAddress(currentToken.symbol) : currentToken.symbol) : 'ORGON'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Token Type:</span>
                    <span className="text-blue-900 dark:text-blue-100 uppercase">
                      {currentToken?.type || 'native'}
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
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
