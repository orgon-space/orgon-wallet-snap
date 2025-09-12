import type { OrgonTransaction } from '../types/snap';

export interface TransactionServiceInterface {
  sendTransaction(transaction: OrgonTransaction): Promise<{ success: boolean; txId: string }>;
}

export class TransactionService implements TransactionServiceInterface {
  constructor(
    private invokeSnap: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
  ) {}

  async sendTransaction(transaction: OrgonTransaction): Promise<{ success: boolean; txId: string }> {
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
