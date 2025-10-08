/**
 * Orgon Network API Client
 * Handles all HTTP requests to Orgon blockchain nodes
 */

import type {
  OrgonBalance,
  OrgonTransactionHistory,
  OrgonAccountInfo,
  OrgonSignedTransaction,
  OrgonNetworkConfig,
} from '../types';
import { API_ENDPOINTS, ERROR_MESSAGES, ORGON_TO_SUN_MULTIPLIER } from '../constants';
import { ApiError } from '../utils/errors';

/**
 * Orgon API Client
 */
export class OrgonApiClient {
  constructor(private readonly network: OrgonNetworkConfig) {}

  /**
   * Make an HTTP request to the Orgon network
   * @param endpoint - API endpoint path
   * @param method - HTTP method
   * @param body - Request body
   * @returns Response data
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any,
  ): Promise<any> {
    const url = `${this.network.rpcUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.network.apiKey) {
      headers['ORGON-PRO-API-KEY'] = this.network.apiKey;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `${ERROR_MESSAGES.API_REQUEST_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get account balance
   * @param address - Account address
   * @returns Balance information
   */
  async getAccountBalance(address: string): Promise<OrgonBalance> {
    try {
      const data = await this.makeRequest(API_ENDPOINTS.GET_ACCOUNT, 'POST', {
        address,
        visible: true,
      });

      // Convert from sun to ORG (1 ORG = 1,000,000 sun)
      const orgonBalance = (data.balance || 0) / ORGON_TO_SUN_MULTIPLIER;

      return {
        orgon: orgonBalance.toString(),
      };
    } catch (error) {
      throw new ApiError(
        `${ERROR_MESSAGES.BALANCE_FETCH_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get account transactions
   * @param address - Account address
   * @param limit - Maximum number of transactions to return
   * @returns Array of transactions
   */
  async getAccountTransactions(
    address: string,
    limit: number = 20,
  ): Promise<OrgonTransactionHistory[]> {
    try {
      const data = await this.makeRequest(
        `${API_ENDPOINTS.GET_TRANSACTIONS}/${address}/transactions/orc20`,
        'GET',
      );

      return (data.data || []).slice(0, limit).map((tx: any) => ({
        hash: tx.transaction_id,
        from: tx.from,
        to: tx.to,
        amount: tx.value,
        timestamp: tx.block_timestamp,
        status: 'confirmed' as const,
      }));
    } catch (error) {
      // Return empty array if transactions fetch fails (account might be new)
      return [];
    }
  }

  /**
   * Get complete account information
   * @param address - Account address
   * @returns Complete account info including balance and transactions
   */
  async getAccountInfo(address: string): Promise<OrgonAccountInfo> {
    try {
      const [balance, transactions] = await Promise.all([
        this.getAccountBalance(address),
        this.getAccountTransactions(address),
      ]);

      return {
        address,
        balance,
        transactions,
      };
    } catch (error) {
      throw new ApiError(
        `${ERROR_MESSAGES.ACCOUNT_INFO_FETCH_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Broadcast a signed transaction
   * @param signedTransaction - Signed transaction object
   * @returns Transaction ID
   */
  async broadcastTransaction(signedTransaction: OrgonSignedTransaction): Promise<string> {
    try {
      const data = await this.makeRequest(
        API_ENDPOINTS.BROADCAST_TRANSACTION,
        'POST',
        signedTransaction,
      );

      if (data.result !== true) {
        throw new ApiError(data.message || ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      return data.txid;
    } catch (error) {
      throw new ApiError(
        `${ERROR_MESSAGES.TRANSACTION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get transaction information by ID
   * @param txId - Transaction ID
   * @returns Transaction information
   */
  async getTransactionInfo(txId: string): Promise<any> {
    try {
      return await this.makeRequest(API_ENDPOINTS.GET_TRANSACTION_INFO, 'POST', {
        value: txId,
      });
    } catch (error) {
      throw new ApiError(
        `Failed to get transaction info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get account resources (bandwidth, energy)
   * @param address - Account address
   * @returns Account resources
   */
  async getAccountResources(address: string): Promise<any> {
    try {
      return await this.makeRequest(API_ENDPOINTS.GET_ACCOUNT_RESOURCES, 'POST', {
        address,
      });
    } catch (error) {
      throw new ApiError(
        `Failed to get account resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

/**
 * Create an API client for a specific network
 * @param network - Network configuration
 * @returns API client instance
 */
export function createApiClient(network: OrgonNetworkConfig): OrgonApiClient {
  return new OrgonApiClient(network);
}


