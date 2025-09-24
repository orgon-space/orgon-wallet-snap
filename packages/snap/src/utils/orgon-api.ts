import { OrgonNetworkConfig, OrgonSignedTransaction } from './orgon-crypto';

export interface OrgonBalance {
  org: string;
  usd?: string;
}

export interface OrgonTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface OrgonAccountInfo {
  address: string;
  balance: OrgonBalance;
  transactions: OrgonTransaction[];
}

/**
 * Orgon API Client for handling all network requests
 */
class OrgonApiClient {
  private network: OrgonNetworkConfig;

  constructor(network: OrgonNetworkConfig) {
    this.network = network;
  }

  /**
   * Make a request to the Orgon network
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'POST', body?: any): Promise<any> {
    const url = `${this.network.rpcUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (this.network.apiKey) {
      headers['TRON-PRO-API-KEY'] = this.network.apiKey;
    }

    console.log('Making request to:', url);
    console.log('Request method:', method);
    console.log('Request headers:', headers);
    console.log('Request body size:', body ? JSON.stringify(body).length : 0);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Response data received, size:', JSON.stringify(responseData).length);
      return responseData;
    } catch (error) {
      console.error('Network request failed:', error);
      console.error('Error details:', error.message, error.stack);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(address: string): Promise<OrgonBalance> {
    try {
      const data = await this.makeRequest('/wallet/getaccount', 'POST', {
        address: address,
        visible: true
      });
      
      // Convert from sun to ORG (1 ORG = 1,000,000 sun)
      const orgBalance = (data.balance || 0) / 1000000;
      
      return {
        org: orgBalance.toString()
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(address: string, limit: number = 20): Promise<OrgonTransaction[]> {
    try {
      const data = await this.makeRequest(`/v1/accounts/${address}/transactions/trc20`, 'GET');
      
      return (data.data || []).slice(0, limit).map((tx: any) => ({
        hash: tx.transaction_id,
        from: tx.from,
        to: tx.to,
        amount: tx.value,
        timestamp: tx.block_timestamp,
        status: 'confirmed' as const
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Get complete account information
   */
  async getAccountInfo(address: string): Promise<OrgonAccountInfo> {
    try {
      const [balance, transactions] = await Promise.all([
        this.getAccountBalance(address),
        this.getAccountTransactions(address)
      ]);

      return {
        address,
        balance,
        transactions
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw new Error('Failed to fetch account information');
    }
  }

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(signedTransaction: OrgonSignedTransaction): Promise<string> {
    try {
      console.log('Broadcasting transaction to network:', this.network.rpcUrl);
      console.log('Signed transaction data:', JSON.stringify(signedTransaction, null, 2));
      
      const data = await this.makeRequest('/wallet/broadcasttransaction', 'POST', signedTransaction);
      console.log('Broadcast response:', data);
      
      if (data.result !== true) {
        console.error('Transaction broadcast failed:', data);
        throw new Error(data.message || 'Transaction failed');
      }

      console.log('Transaction broadcast successful, txId:', data.txid);
      return data.txid;
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      console.error('Error details:', error.message, error.stack);
      throw new Error(`Failed to broadcast transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction information
   */
  async getTransactionInfo(txId: string): Promise<any> {
    try {
      return await this.makeRequest('/wallet/gettransactioninfobyid', 'POST', {
        value: txId
      });
    } catch (error) {
      console.error('Error getting transaction info:', error);
      throw new Error('Failed to get transaction info');
    }
  }

  /**
   * Get account resources (bandwidth, energy)
   */
  async getAccountResources(address: string): Promise<any> {
    try {
      return await this.makeRequest('/wallet/getaccountresource', 'POST', {
        address: address
      });
    } catch (error) {
      console.error('Error getting account resources:', error);
      throw new Error('Failed to get account resources');
    }
  }
}

/**
 * Get account balance from Orgon network
 */
export async function getAccountBalance(
  address: string, 
  network: OrgonNetworkConfig
): Promise<OrgonBalance> {
  const client = new OrgonApiClient(network);
  return await client.getAccountBalance(address);
}

/**
 * Get account transactions from Orgon network
 */
export async function getAccountTransactions(
  address: string,
  network: OrgonNetworkConfig,
  limit: number = 20
): Promise<OrgonTransaction[]> {
  const client = new OrgonApiClient(network);
  return await client.getAccountTransactions(address, limit);
}

/**
 * Get complete account information
 */
export async function getAccountInfo(
  address: string,
  network: OrgonNetworkConfig
): Promise<OrgonAccountInfo> {
  const client = new OrgonApiClient(network);
  return await client.getAccountInfo(address);
}

/**
 * Estimate transaction fee
 */
export async function estimateTransactionFee(
  from: string,
  to: string,
  amount: string,
  network: OrgonNetworkConfig
): Promise<string> {
  try {
    // Orgon transaction fee is typically 0.1 ORG for basic transactions
    // This is a simplified estimation
    return '0.1';
  } catch (error) {
    console.error('Error estimating fee:', error);
    return '0.1'; // Default fee
  }
}

/**
 * Broadcast a signed transaction
 */
export async function broadcastTransaction(
  signedTransaction: OrgonSignedTransaction,
  network: OrgonNetworkConfig
): Promise<string> {
  try {
    console.log('Starting broadcast transaction with network:', network);
    const client = new OrgonApiClient(network);
    console.log('OrgonApiClient created, calling broadcastTransaction...');
    const result = await client.broadcastTransaction(signedTransaction);
    console.log('Broadcast transaction completed, result:', result);
    return result;
  } catch (error) {
    console.error('Error in broadcastTransaction wrapper:', error);
    console.error('Error details:', error.message, error.stack);
    throw error;
  }
}

/**
 * Get transaction information
 */
export async function getTransactionInfo(
  txId: string,
  network: OrgonNetworkConfig
): Promise<any> {
  const client = new OrgonApiClient(network);
  return await client.getTransactionInfo(txId);
}

/**
 * Get account resources (bandwidth, energy)
 */
export async function getAccountResources(
  address: string,
  network: OrgonNetworkConfig
): Promise<any> {
  const client = new OrgonApiClient(network);
  return await client.getAccountResources(address);
}
