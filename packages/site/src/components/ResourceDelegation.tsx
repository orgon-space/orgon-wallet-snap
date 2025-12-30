import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  Calculator,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  Users,
  Zap,
  Shield,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

import { useWalletManager } from '../hooks/wallet';
import { useNetworkManager } from '../hooks/network';
import { useTransactionManager } from '../hooks/transaction';
import {
  calculateTransactionFee,
  copyToClipboard,
  formatAddress,
} from '../utils/helpers';
import {
  createDelegateResourceTransaction,
  createUndelegateResourceTransaction,
} from '../utils/staking-transactions';
import { getDelegationState } from '../utils/delegation';
import { getExplorerUrlForNetwork } from '../utils/orgonWeb';
import type { OrgonAccount, OrgonTransaction } from '../types';
import { formatNumberCommaDot } from '../utils/formatNumberCommaDot';

type DelegationType = 'delegate';
type ResourceType = 'ENERGY' | 'BANDWIDTH';

interface DelegationState {
  address: string;
  maxDelegatable: {
    ENERGY: number;
    BANDWIDTH: number;
  };
  incoming: Array<{
    fromAddress: string;
    ENERGY: number;
    BANDWIDTH: number;
  }>;
  outgoing: Array<{
    toAddress: string;
    ENERGY: number;
    BANDWIDTH: number;
  }>;
  totals: {
    delegatedIn: { ENERGY: number; BANDWIDTH: number };
    delegatedOut: { ENERGY: number; BANDWIDTH: number };
  };
  stake: {
    ORGON: { ENERGY: number; BANDWIDTH: number };
    SUN: { ENERGY: number; BANDWIDTH: number };
  };
  prices: {
    staking: { ENERGY: number; BANDWIDTH: number };
  };
  resourcesFromStake: {
    ENERGY: number;
    BANDWIDTH: number;
  };
}

export const ResourceDelegation: React.FC = () => {
  const walletManager = useWalletManager();
  const networkManager = useNetworkManager();
  const transactionManager = useTransactionManager();

  // Form state
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [resourceType, setResourceType] = useState<ResourceType>('ENERGY');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('1');
  const [memo, setMemo] = useState('');
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('0.1');
  const [gasLimit, setGasLimit] = useState('1000000');

  // Delegation state
  const [delegationState, setDelegationState] = useState<DelegationState | null>(null);
  const [loadingDelegation, setLoadingDelegation] = useState(false);

  // Get selected account data
  const selectedAccountData = walletManager.accounts?.find(
    (acc: OrgonAccount) => acc.address === selectedAccount,
  );

  // Load delegation state when account is selected
  useEffect(() => {
    if (selectedAccountData) {
      loadDelegationState(selectedAccountData.address);
    }
  }, [selectedAccountData?.address]);

  const handleUndelegate = async (delegation: any, resourceType: 'ENERGY' | 'BANDWIDTH') => {
    if (!selectedAccount) {
      alert('Please select an account first');
      return;
    }

    const amount = resourceType === 'ENERGY' ? delegation.ENERGY : delegation.BANDWIDTH;
    if (amount <= 0) {
      alert(`No ${resourceType.toLowerCase()} delegated to undelegate`);
      return;
    }

    transactionManager.clearError();

    try {
      // Get network config
      const networkConfig = networkManager.currentNetwork
        ? {
            rpcUrl: networkManager.currentNetwork.rpcUrl,
          }
        : undefined;

      // Create undelegate transaction
      const rawTransaction = await createUndelegateResourceTransaction(
        selectedAccount,
        delegation.toAddress,
        resourceType,
        (amount / 1e6).toString(), // Convert from SUN to ORGON
        networkConfig,
      );

      // Create transaction object
      const transaction: OrgonTransaction = {
        from: selectedAccount,
        to: delegation.toAddress,
        amount: (amount / 1e6).toString(),
        memo: `Undelegate ${resourceType} - ${delegation.toAddress}`,
        accountId: selectedAccountData?.id || '',
        transaction: rawTransaction,
        ...(networkManager.currentNetwork?.chainId && {
          networkId: networkManager.currentNetwork.chainId,
        }),
      };

      // Send to snap for signing and broadcasting
      const result = await transactionManager.sendTransaction(transaction);

      // Reload delegation state
      if (selectedAccountData) {
        loadDelegationState(selectedAccountData.address);
      }
    } catch (err) {
      console.error('Failed to undelegate:', err);
    }
  };

  const loadDelegationState = async (address: string) => {
    setLoadingDelegation(true);
    try {
      const networkConfig = networkManager.currentNetwork
        ? {
            rpcUrl: networkManager.currentNetwork.rpcUrl,
          }
        : undefined;

      const state = await getDelegationState(address, networkConfig);
      setDelegationState(state);
    } catch (error) {
      console.error('Failed to load delegation state:', error);
    } finally {
      setLoadingDelegation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    transactionManager.clearError();
    setTransactionResult(null);

    if (!selectedAccount || !receiverAddress || !amount) {
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
      const networkConfig = networkManager.currentNetwork
        ? {
            rpcUrl: networkManager.currentNetwork.rpcUrl,
          }
        : undefined;

      // Create delegate transaction (only delegate operation now)
      const rawTransaction = await createDelegateResourceTransaction(
        selectedAccount,
        receiverAddress,
        resourceType,
        amount,
        networkConfig,
      );

      // Create transaction object
      const transaction: OrgonTransaction = {
        from: selectedAccount,
        to: receiverAddress,
        amount,
        memo: memo || `Resource delegate - ${resourceType}`,
        accountId: selectedAccountData?.id || '',
        transaction: rawTransaction,
        ...(networkManager.currentNetwork?.chainId && {
          networkId: networkManager.currentNetwork.chainId,
        }),
      };

      // Send to snap for signing and broadcasting
      const result = await transactionManager.sendTransaction(transaction);
      setTransactionResult(result);

      // Clear form
      setAmount('1');
      setReceiverAddress('');
      setMemo('');

      // Reload delegation state
      if (selectedAccountData) {
        loadDelegationState(selectedAccountData.address);
      }
    } catch (err) {
      console.error('Failed to send transaction:', err);
    }
  };

  const isFormValid =
    selectedAccount &&
    receiverAddress &&
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) >= 1;

  const selectedNetworkData = networkManager.currentNetwork;

  if (walletManager.loading || networkManager.loading) {
    return (
      <Card className="orgon-card orgon-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users size={20} />
            Resource Delegation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin mx-auto mb-4" />
            <div className="text-slate-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl orgon-card orgon-card-hover">
      <CardHeader className="text-center pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl mb-4 shadow-lg">
          <Users size={32} color="white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Resource Delegation
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
          Delegate Energy and Bandwidth resources to other accounts and view delegation overview
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="w-full space-y-8">
          {/* Delegate/Undelegate Section */}
          <div className="flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* From Account */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    From Account
                  </label>
                  <Select
                    value={selectedAccount}
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {walletManager.accounts?.map((account: OrgonAccount) => (
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


                {/* Resource Type */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Resource Type
                  </label>
                  <div className="orgon-card orgon-card-hover p-4 rounded-xl">
                    <RadioGroup
                      value={resourceType}
                      onValueChange={(value) =>
                        setResourceType(value as ResourceType)
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ENERGY" id="energy" />
                        <Label
                          htmlFor="energy"
                          className="flex items-center gap-2 cursor-pointer text-white"
                        >
                          <Zap size={16} className="text-yellow-300" />
                          Energy
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BANDWIDTH" id="bandwidth" />
                        <Label
                          htmlFor="bandwidth"
                          className="flex items-center gap-2 cursor-pointer text-white"
                        >
                          <Shield size={16} className="text-green-300" />
                          Bandwidth
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Receiver Address */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Receiver Address
                  </label>
                  <Input
                    type="text"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    maxLength={34}
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Amount (ORGON)
                  </label>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minimum amount is 1 ORGON
                  </p>
                </div>

                {/* Memo */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Memo (Optional)
                  </label>
                  <Textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Add a memo to your transaction"
                    rows={3}
                    maxLength={256}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Optional message to include with the transaction</span>
                    <span>{memo.length}/256</span>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-white"
                  >
                    <Calculator size={16} className="mr-2" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </Button>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-white">
                          Gas Price (ORGON)
                        </label>
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
                          <Calculator size={16} />
                          <span>
                            Estimated Fee:{' '}
                            {calculateTransactionFee(gasPrice, gasLimit)} ORGON
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transaction Preview */}
                {isFormValid && selectedAccountData && selectedNetworkData && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                      Transaction Preview
                    </h4>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          From:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {selectedAccountData.name} (
                          {formatAddress(selectedAccountData.address)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          To:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {formatAddress(receiverAddress)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Operation:
                        </span>
                        <span className="text-gray-900 dark:text-white uppercase">
                          delegate {resourceType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Amount:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {amount} ORGON
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Network:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedNetworkData.name}
                        </span>
                      </div>
                      {memo && (
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Memo:
                          </span>
                          <span className="font-mono text-gray-900 dark:text-white text-xs">
                            {memo}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Fee:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
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
                      <Users size={20} className="mr-2" />
                      Delegate Resources
                    </>
                  )}
                </Button>
              </form>
            </div>

            {transactionManager.error && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 dark:bg-red-900/20"
              >
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
                            onClick={() =>
                              copyToClipboard(transactionResult.txId)
                            }
                          >
                            <Copy size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                            onClick={() =>
                              window.open(
                                `${getExplorerUrlForNetwork(networkManager.currentNetwork?.chainId)}/transaction/${transactionResult.txId}`,
                                '_blank',
                              )
                            }
                          >
                            <ExternalLink size={12} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <Badge
                          variant={
                            transactionResult.success ? 'default' : 'destructive'
                          }
                          className="ml-2"
                        >
                          {transactionResult.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Delegation Overview Section */}
            <div className="border-t pt-8">
              <div className="flex items-center gap-2 mb-6">
                <Users size={20} className="text-blue-500 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Delegation Overview
                </h2>
              </div>
            {selectedAccount && (
              <div className="space-y-6">
                {loadingDelegation ? (
                  <div className="text-center py-8">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4" />
                    <div className="text-slate-500">Loading delegation data...</div>
                  </div>
                ) : delegationState ? (
                  <>
                    {/* Max Delegatable */}
                    <Card className="orgon-card orgon-card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Max Delegatable</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {formatNumberCommaDot(delegationState.maxDelegatable.ENERGY / 1e6)} Staked ORGON
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              ENERGY ≈ {formatNumberCommaDot(delegationState.maxDelegatable.ENERGY * delegationState.prices.staking.ENERGY / 1e6)} Energy
                            </div>
                          </div>
                          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {formatNumberCommaDot(delegationState.maxDelegatable.BANDWIDTH / 1e6)} Staked ORGON
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              BANDWIDTH ≈ {formatNumberCommaDot(delegationState.maxDelegatable.BANDWIDTH * delegationState.prices.staking.BANDWIDTH / 1e6)} Bandwidth
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Currently Delegated Out */}
                    <Card className="orgon-card orgon-card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Currently Delegated Out</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {formatNumberCommaDot(delegationState.totals.delegatedOut.ENERGY / 1e6)} ORGON
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              ENERGY ≈ {formatNumberCommaDot(delegationState.totals.delegatedOut.ENERGY * delegationState.prices.staking.ENERGY / 1e6)} Energy
                            </div>
                          </div>
                          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {formatNumberCommaDot(delegationState.totals.delegatedOut.BANDWIDTH / 1e6)} ORGON
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              BANDWIDTH ≈ {formatNumberCommaDot(delegationState.totals.delegatedOut.BANDWIDTH * delegationState.prices.staking.BANDWIDTH / 1e6)} Bandwidth
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delegated to others */}
                    <Card className="orgon-card orgon-card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Delegated to Others</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {delegationState.outgoing.length > 0 ? (
                          <div className="space-y-3">
                            {delegationState.outgoing.map((delegation, index) => (
                              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    To: {delegation.toAddress}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-slate-600 dark:text-slate-400">Energy</span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                                      {formatNumberCommaDot(delegation.ENERGY / 1e6)} ORGON
                                    </span>
                                    {delegation.ENERGY > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2 text-xs h-7"
                                        onClick={() => handleUndelegate(delegation, 'ENERGY')}
                                      >
                                        Undelegate Energy
                                      </Button>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-slate-600 dark:text-slate-400">Bandwidth</span>
                                    <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                                      {formatNumberCommaDot(delegation.BANDWIDTH / 1e6)} ORGON
                                    </span>
                                    {delegation.BANDWIDTH > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2 text-xs h-7"
                                        onClick={() => handleUndelegate(delegation, 'BANDWIDTH')}
                                      >
                                        Undelegate Bandwidth
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                            Ничего не делегировано другим аккаунтам
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Delegated to me */}
                    <Card className="orgon-card orgon-card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Delegated to Me</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {delegationState.incoming.length > 0 ? (
                          <div className="space-y-3">
                            {delegationState.incoming.map((delegation, index) => (
                              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    From: {delegation.fromAddress}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-slate-600 dark:text-slate-400">Energy</span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                                      {formatNumberCommaDot(delegation.ENERGY / 1e6)} ORGON
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-slate-600 dark:text-slate-400">Bandwidth</span>
                                    <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                                      {formatNumberCommaDot(delegation.BANDWIDTH / 1e6)} ORGON
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                            Ничего не делегировано этому аккаунту
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-slate-400 mb-4" />
                    <div className="text-slate-500">No delegation data available</div>
                  </div>
                )}
              </div>
            )}

            {!selectedAccount && (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-slate-400 mb-4" />
                <div className="text-slate-500">Select an account to view delegation information</div>
              </div>
            )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
