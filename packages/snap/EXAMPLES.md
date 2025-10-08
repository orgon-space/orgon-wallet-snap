# Code Examples

## Using buildEndpoint with Dynamic URLs

### Example 1: Basic Usage in API Client

```typescript
import { API_ENDPOINTS, buildEndpoint } from '../constants';

// In your API client method:
async getTransactions(address: string) {
  // Build the endpoint with dynamic parameter
  const endpoint = buildEndpoint(API_ENDPOINTS.GETv1_TRANSACTIONS, { 
    address: address 
  });
  
  // Use the built endpoint in request
  const response = await this.makeRequest(endpoint, 'GET');
  return response.data;
}
```

### Example 2: Complete Implementation

```typescript
import { createApiClient } from './blockchain/api-client';
import { getDefaultNetwork } from './blockchain/crypto';

async function getUserTransactions(userAddress: string) {
  // Create API client
  const network = getDefaultNetwork();
  const apiClient = createApiClient(network);
  
  // Get transactions (buildEndpoint is used internally)
  const transactions = await apiClient.getAccountTransactionsV1(userAddress, 20);
  
  return transactions;
}

// Usage
const txs = await getUserTransactions('oAbc123...');
console.log('Transactions:', txs);
```

### Example 3: Custom Endpoint with Multiple Parameters

```typescript
import { buildEndpoint } from '../constants';

// Define custom endpoint
const CUSTOM_ENDPOINT = '/api/{version}/accounts/{address}/resources/{type}';

// Build with multiple parameters
const endpoint = buildEndpoint(CUSTOM_ENDPOINT, {
  version: 'v2',
  address: 'oAbc123...',
  type: 'energy'
});

// Result: '/api/v2/accounts/oAbc123.../resources/energy'
```

### Example 4: Error Handling

```typescript
import { buildEndpoint, API_ENDPOINTS } from '../constants';
import { validateRequired, isValidOrgonAddress } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants';

async function safeGetTransactions(address: string) {
  try {
    // Validate parameters
    validateRequired(address, 'Address');
    
    if (!isValidOrgonAddress(address)) {
      throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
    }
    
    // Build endpoint
    const endpoint = buildEndpoint(API_ENDPOINTS.GETv1_TRANSACTIONS, { address });
    
    // Make request
    const response = await fetch(`https://api.orgon.space${endpoint}`);
    return await response.json();
    
  } catch (error) {
    console.error('Failed to get transactions:', error);
    throw error;
  }
}
```

## Universal Transaction Signing

### Example 1: Simple Transfer

```typescript
// Create unsigned transaction
const unsignedTx = await tronWeb.transactionBuilder.sendTrx(
  'oRecipientAddress...',
  1000000, // 1 ORG in sun
  'oSenderAddress...'
);

// Sign and broadcast
const result = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:orgon-wallet-snap',
    request: {
      method: 'orgon_signTransaction',
      params: {
        accountId: 'orgon_account_1',
        transaction: unsignedTx
      }
    }
  }
});

console.log('Transaction sent:', result.txId);
```

### Example 2: TRC20 Token Transfer

```typescript
// Get contract instance
const tokenAddress = 'oTokenContractAddress...';
const contract = await tronWeb.contract().at(tokenAddress);

// Create unsigned transaction
const unsignedTx = await contract.transfer(
  'oRecipientAddress...',
  1000000 // amount in smallest unit
).txObject();

// Sign and broadcast
const result = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:orgon-wallet-snap',
    request: {
      method: 'orgon_signTransaction',
      params: {
        accountId: 'orgon_account_1',
        transaction: unsignedTx,
        networkId: 'orgon:mainnet'
      }
    }
  }
});

console.log('Token transfer complete:', result.txId);
```

### Example 3: Smart Contract Call

```typescript
// Get contract instance
const contractAddress = 'oContractAddress...';
const contract = await tronWeb.contract().at(contractAddress);

// Create unsigned transaction for contract method
const unsignedTx = await contract.stake(
  100000000, // amount to stake
  30 // days
).txObject();

// Sign and broadcast
const result = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:orgon-wallet-snap',
    request: {
      method: 'orgon_signTransaction',
      params: {
        accountId: 'orgon_account_1',
        transaction: unsignedTx
      }
    }
  }
});

console.log('Staking transaction:', result.txId);
```

## Combining Both Features

### Example: Get Transactions and Create New Transfer

```typescript
import { createApiClient } from './blockchain/api-client';
import { getDefaultNetwork } from './blockchain/crypto';

async function processTransactions(userAddress: string, accountId: string) {
  // 1. Get user's transaction history
  const network = getDefaultNetwork();
  const apiClient = createApiClient(network);
  const transactions = await apiClient.getAccountTransactionsV1(userAddress, 10);
  
  console.log(`Found ${transactions.length} transactions`);
  
  // 2. Calculate total received
  const totalReceived = transactions
    .filter(tx => tx.to === userAddress)
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  
  console.log(`Total received: ${totalReceived} ORG`);
  
  // 3. Create and sign a new transaction
  const tronWeb = new TronWeb({
    fullHost: network.rpcUrl
  });
  
  const unsignedTx = await tronWeb.transactionBuilder.sendTrx(
    'oSomeAddress...',
    1000000,
    userAddress
  );
  
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: 'npm:orgon-wallet-snap',
      request: {
        method: 'orgon_signTransaction',
        params: {
          accountId: accountId,
          transaction: unsignedTx
        }
      }
    }
  });
  
  return {
    history: transactions,
    totalReceived: totalReceived,
    newTransaction: result.txId
  };
}
```

## Testing

### Unit Test for buildEndpoint

```typescript
import { buildEndpoint } from '../constants';

describe('buildEndpoint', () => {
  it('replaces single parameter correctly', () => {
    const result = buildEndpoint('/accounts/{address}/tx', {
      address: 'oTest123'
    });
    expect(result).toBe('/accounts/oTest123/tx');
  });
  
  it('replaces multiple parameters correctly', () => {
    const result = buildEndpoint('/{version}/accounts/{address}', {
      version: 'v1',
      address: 'oTest123'
    });
    expect(result).toBe('/v1/accounts/oTest123');
  });
  
  it('handles missing parameters gracefully', () => {
    const result = buildEndpoint('/accounts/{address}/tx', {});
    expect(result).toBe('/accounts/{address}/tx');
  });
});
```

