import { useState, useCallback, useMemo } from 'react';
import { createServices } from '../services';
import { useInvokeSnap } from './useInvokeSnap';
import type { OrgonTransaction } from '../types/snap';

export const useTransactionManager = () => {
  const invokeSnap = useInvokeSnap();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create services (memoized to prevent recreation on every render)
  const services = useMemo(() => createServices(invokeSnap, () => Promise.resolve(null)), [invokeSnap]);

  const sendTransaction = useCallback(async (transaction: OrgonTransaction) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await services.transaction.sendTransaction(transaction);
      return result;
    } catch (err: any) {
      console.error('Failed to send transaction:', err);
      setError(err.message || 'Failed to send transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [services.transaction]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    sendTransaction,
    clearError,
  };
};
