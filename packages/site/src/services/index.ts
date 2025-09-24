import { WalletService } from './walletService';
import { NetworkService } from './networkService';
import { TransactionService } from './transactionService';

export interface Services {
  wallet: WalletService;
  network: NetworkService;
  transaction: TransactionService;
}

export const createServices = (
  invokeSnap: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>,
  request: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
): Services => {
  return {
    wallet: new WalletService(invokeSnap, request),
    network: new NetworkService(invokeSnap),
    transaction: new TransactionService(invokeSnap),
  };
};

export * from './walletService';
export * from './networkService';
export * from './transactionService';
