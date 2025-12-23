/**
 * Transaction Layer - Complete transaction functionality
 * Combines: TransactionService and useTransactionManager
 */

import { useCallback, useMemo, useState } from 'react';
import type { OrgonTransaction } from '../types';
import { useInvokeSnap } from './metamask';

// ============================================================================
// Transaction Service - Snap Communication
// ============================================================================

export interface TransactionServiceInterface {
  sendTransaction(
    transaction: OrgonTransaction,
  ): Promise<{ success: boolean; txId: string }>;
}

export class TransactionService implements TransactionServiceInterface {
  constructor(
    private invokeSnap: (params: {
      method: string;
      params?: Record<string, unknown>;
    }) => Promise<unknown>,
  ) {}

  async sendTransaction(
    transaction: OrgonTransaction,
  ): Promise<{ success: boolean; txId: string }> {
    try {
      console.log('Sending transaction:', transaction);
      const result = await this.invokeSnap({
        method: 'orgon_sendTransaction',
        params: transaction,
      });
      console.log('Transaction result:', result);
      return result as { success: boolean; txId: string };
    } catch (error: any) {
      console.error('Failed to send transaction:', error);
      throw new Error(error?.message || 'Failed to send transaction');
    }
  }
}

// ============================================================================
// Transaction Manager Hook - Main Interface
// ============================================================================

export const useTransactionManager = () => {
  const invokeSnap = useInvokeSnap();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create transaction service (memoized to prevent recreation on every render)
  const transactionService = useMemo(
    () => new TransactionService(invokeSnap),
    [invokeSnap],
  );

  const sendTransaction = useCallback(
    async (transaction: OrgonTransaction) => {
      try {
        setLoading(true);
        setError(null);

        const result = await transactionService.sendTransaction(transaction);
        return result;
      } catch (err: any) {
        console.error('Failed to send transaction:', err);
        setError(err.message || 'Failed to send transaction');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transactionService],
  );

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
