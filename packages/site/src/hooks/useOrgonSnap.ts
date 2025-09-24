import { useState, useCallback } from 'react';
import { useInvokeSnap } from './useInvokeSnap';
import { useRequest } from './useRequest';
import type { OrgonAccount, OrgonNetwork, OrgonBalance, OrgonTransaction } from '../types/snap';

export const useOrgonSnap = () => {
  const invokeSnap = useInvokeSnap();
  const request = useRequest();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Request necessary permissions for keyring operations
  const requestKeyringPermissions = useCallback(async () => {
    try {
      // Request permissions for keyring operations
      await request({
        method: 'wallet_requestPermissions',
        params: [{
          'wallet_snap': {}
        }]
      });
    } catch (err) {
      console.error('Error requesting keyring permissions:', err);
      throw err;
    }
  }, [request]);

  // Get all Orgon accounts
  const getAccounts = useCallback(async (): Promise<OrgonAccount[]> => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await invokeSnap({
        method: 'keyring_listAccounts',
      });
      return accounts as OrgonAccount[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get accounts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Create a new Orgon account
  const createAccount = useCallback(async (name?: string): Promise<OrgonAccount> => {
    setLoading(true);
    setError(null);
    try {
      console.log('Creating account with name:', name);
      console.log('Invoking snap with method: keyring_createAccount');
      
      const account = await invokeSnap({
        method: 'keyring_createAccount',
        params: { name },
      });
      
      console.log('Account created successfully:', account);
      return account as OrgonAccount;
    } catch (err: any) {
      console.error('Error creating account:', err);
      
      // Check if it's a permissions error
      if (err?.message?.includes('Unauthorized') || err?.code === 4100) {
        try {
          console.log('Requesting keyring permissions...');
          await requestKeyringPermissions();
          
          // Retry the account creation after requesting permissions
          const account = await invokeSnap({
            method: 'keyring_createAccount',
            params: { name },
          });
          
          console.log('Account created successfully after permission request:', account);
          return account as OrgonAccount;
        } catch (permissionErr) {
          setError('Please grant the required permissions to create Orgon accounts. You may need to reinstall the snap.');
          throw permissionErr;
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
        setError(errorMessage);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [invokeSnap, requestKeyringPermissions]);

  // Import an existing Orgon account
  const importAccount = useCallback(async (privateKey: string, name?: string): Promise<OrgonAccount> => {
    setLoading(true);
    setError(null);
    try {
      const account = await invokeSnap({
        method: 'keyring_importAccount',
        params: { privateKey, name },
      });
      return account as OrgonAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Export account private key
  const exportAccount = useCallback(async (accountId: string): Promise<{ privateKey: string; address: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeSnap({
        method: 'keyring_exportAccount',
        params: { accountId },
      });
      return result as { privateKey: string; address: string };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Delete an account
  const deleteAccount = useCallback(async (accountId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await invokeSnap({
        method: 'keyring_deleteAccount',
        params: { accountId },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Get account balance
  const getBalance = useCallback(async (address: string, networkId?: string): Promise<OrgonBalance> => {
    console.log('useOrgonSnap getBalance called with:', { address, networkId });
    setLoading(true);
    setError(null);
    try {
      const balance = await invokeSnap({
        method: 'orgon_getBalance',
        params: { address, networkId },
      });
      console.log('useOrgonSnap getBalance result:', balance);
      return balance as OrgonBalance;
    } catch (err) {
      console.error('useOrgonSnap getBalance error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get balance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Get available networks
  const getNetworks = useCallback(async (): Promise<OrgonNetwork[]> => {
    setLoading(true);
    setError(null);
    try {
      const networks = await invokeSnap({
        method: 'orgon_getNetworks',
      });
      return networks as OrgonNetwork[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get networks';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction: OrgonTransaction): Promise<{ success: boolean; txId: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeSnap({
        method: 'orgon_sendTransaction',
        params: transaction,
      });
      return result as { success: boolean; txId: string };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);


  // Get current network
  const getCurrentNetwork = useCallback(async (): Promise<{ success: boolean; network: any }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeSnap({
        method: 'keyring_getCurrentNetwork',
      });
      return result as { success: boolean; network: any };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current network';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: string): Promise<{ success: boolean; network: any }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeSnap({
        method: 'keyring_switchNetwork',
        params: { chainId },
      });
      return result as { success: boolean; network: any };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch network';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap]);

  return {
    loading,
    error,
    clearError,
    requestKeyringPermissions,
    getAccounts,
    createAccount,
    importAccount,
    exportAccount,
    deleteAccount,
    getBalance,
    getNetworks,
    sendTransaction,
    getCurrentNetwork,
    switchNetwork,
  };
};
