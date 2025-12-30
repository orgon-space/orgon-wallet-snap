/**
 * MetaMask Integration - Complete MetaMask and Snap functionality
 * Combines: Context, Request, InvokeSnap, RequestSnap, and MetaMask detection hooks
 */

import type {
  MetaMaskInpageProvider,
  RequestArguments,
} from '@metamask/providers';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { GetSnapsResponse, Snap } from '../types';
import { defaultSnapOrigin } from '../config';
import { getSnapsProvider } from '../utils/metamask';
import { createOrgonWebService } from '../utils/orgonWeb';

// ============================================================================
// Error Decoding and Translation Utilities
// ============================================================================

/**
 * Convert hex address to readable Orgon address
 */
function convertHexToOrgonAddress(hexAddress: string): string {
  try {
    const orgonWebService = createOrgonWebService();
    return orgonWebService.orgonWeb.address.fromHex(hexAddress);
  } catch (error) {
    console.warn('Failed to convert hex address:', error);
    return hexAddress; // Return original if conversion fails
  }
}

/**
 * Decode hex string to readable text
 */
export function decodeHexError(hexString: string): string {
  try {
    // Remove 0x prefix if present
    const cleanHex = hexString.replace(/^0x/, '');

    // Convert hex to string
    let decoded = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substr(i, 2), 16);
      decoded += String.fromCharCode(byte);
    }

    return decoded;
  } catch (error) {
    console.warn('Failed to decode hex error:', error);
    return hexString; // Return original if decoding fails
  }
}

/**
 * Translate common blockchain errors to Russian
 */
export function translateBlockchainError(errorText: string): string {
  let translatedText = errorText;

  // Common error patterns
  // Check for withdraw time error first (most specific)
  if (errorText.includes('The last withdraw time is') && errorText.includes('less than 24 hours')) {
    // Extract timestamp from error
    const timestampMatch = errorText.match(/The last withdraw time is (\d+)/);
    if (timestampMatch && timestampMatch[1]) {
      let timestamp = parseInt(timestampMatch[1]);

      // Check if timestamp is in seconds (10 digits) or milliseconds (13 digits)
      // If it's in seconds, convert to milliseconds
      if (timestamp.toString().length === 10) {
        timestamp *= 1000;
      }

      const now = Date.now();
      const timeDiff = now - timestamp;

      // Calculate hours, minutes, seconds since last withdrawal
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      const timeSinceLastWithdraw = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Calculate remaining time until next withdrawal (24 hours from last withdrawal)
      const nextWithdrawTime = timestamp + 24 * 60 * 60 * 1000;
      const timeUntilNext = nextWithdrawTime - now;
      const remainingHours = Math.max(0, Math.floor(timeUntilNext / (1000 * 60 * 60)));
      const remainingMinutes = Math.max(0, Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60)));
      const remainingSeconds = Math.max(0, Math.floor((timeUntilNext % (1000 * 60)) / 1000));

      const timeUntilNextWithdraw = `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

      return `Ошибка: Награду можно получать только раз в 24 часа.\nПрошло с последнего получения: ${timeSinceLastWithdraw}\nДо следующего получения: ${timeUntilNextWithdraw}`;
    }
    return 'Ошибка: Награду можно получать только раз в 24 часа.';
  }

  if (errorText.includes('Account[') && errorText.includes('not exists')) {
    // Also convert any hex addresses in validate errors
    translatedText = errorText.replace(/([a-f0-9]{40,})/gi, (match) => {
      try {
        return convertHexToOrgonAddress(match);
      } catch {
        return match; // Return original if conversion fails
      }
    });
    return `Ошибка валидации контракта: ${translatedText}`;
  }

  if (errorText.includes('insufficient funds') || errorText.includes('insufficient balance')) {
    return 'Ошибка: Недостаточно средств для выполнения транзакции.';
  }

  if (errorText.includes('nonce too low')) {
    return 'Ошибка: Неверный nonce транзакции. Попробуйте обновить страницу.';
  }

  if (errorText.includes('gas required exceeds allowance')) {
    return 'Ошибка: Превышен лимит газа для транзакции.';
  }

  if (errorText.includes('execution reverted')) {
    return 'Ошибка: Транзакция была отменена смарт-контрактом.';
  }

  // Convert any remaining hex addresses in the error text
  translatedText = errorText.replace(/([a-f0-9]{40,})/gi, (match) => {
    try {
      return convertHexToOrgonAddress(match);
    } catch {
      return match; // Return original if conversion fails
    }
  });

  // Return translated text if no specific translation found
  return translatedText;
}

/**
 * Process MetaMask error and return user-friendly message
 */
export function processMetaMaskError(error: any): string {
  let errorMessage = error?.message || 'Неизвестная ошибка';

  // Check if error contains hex-encoded message
  const hexMatch = errorMessage.match(/([0-9a-fA-F]{20,})/);
  if (hexMatch) {
    const decodedError = decodeHexError(hexMatch[1]);
    const translatedError = translateBlockchainError(decodedError);

    // Log both original and decoded error
    console.error('MetaMask Error (Original):', errorMessage);
    console.error('MetaMask Error (Decoded):', decodedError);
    console.error('MetaMask Error (Translated):', translatedError);

    return translatedError;
  }

  // Check for other common error patterns
  if (errorMessage.includes('User rejected')) {
    return 'Транзакция была отклонена пользователем.';
  }

  if (errorMessage.includes('Failed to send transaction')) {
    return 'Не удалось отправить транзакцию. Проверьте данные и попробуйте снова.';
  }

  if (errorMessage.includes('Network error')) {
    return 'Ошибка сети. Проверьте подключение к интернету.';
  }

  // For other errors, return the original message
  return errorMessage;
}

// ============================================================================
// MetaMask Context
// ============================================================================

type MetaMaskContextType = {
  provider: MetaMaskInpageProvider | null;
  installedSnap: Snap | null;
  error: Error | null;
  setInstalledSnap: (snap: Snap | null) => void;
  setError: (error: Error) => void;
};

export const MetaMaskContext = createContext<MetaMaskContextType>({
  provider: null,
  installedSnap: null,
  error: null,
  setInstalledSnap: () => {
    /* no-op */
  },
  setError: () => {
    /* no-op */
  },
});

/**
 * MetaMask context provider to handle MetaMask and snap status.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<MetaMaskInpageProvider | null>(null);
  const [installedSnap, setInstalledSnap] = useState<Snap | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getSnapsProvider().then(setProvider).catch(console.error);
  }, []);

  // MetaMask Provider Event Listeners
  useEffect(() => {
    if (provider) {
      const handleConnect = (...args: unknown[]) => {
        console.log('🔗 MetaMask Connected:', args);
      };

      const handleDisconnect = (...args: unknown[]) => {
        console.log('🔌 MetaMask Disconnected:', args);
      };

      const handleChainChanged = (...args: unknown[]) => {
        console.log('⛓️ MetaMask Chain Changed:', args);
      };

      const handleAccountsChanged = (...args: unknown[]) => {
        console.log('👤 MetaMask Accounts Changed:', args);
      };

      const handleMessage = (message: any) => {
        console.log('📨 MetaMask Message:', message);
      };

      // Subscribe to events
      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);
      provider.on('chainChanged', handleChainChanged);
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('message', handleMessage);

      // Cleanup function
      return () => {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('message', handleMessage);
      };
    }

    return undefined;
  }, [provider]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 10000);

      return () => {
        clearTimeout(timeout);
      };
    }

    return undefined;
  }, [error]);

  return (
    <MetaMaskContext.Provider
      value={{ provider, error, setError, installedSnap, setInstalledSnap }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

/**
 * Utility hook to consume the MetaMask context.
 */
export function useMetaMaskContext() {
  return useContext(MetaMaskContext);
}

// ============================================================================
// Request Hook with MetaMask Request/Response Interception
// ============================================================================

export type Request = (params: RequestArguments) => Promise<unknown | null>;

// Request ID generator for tracking
let requestCounter = 0;
const generateRequestId = () => `req-${++requestCounter}-${Date.now()}`;

// Logger for MetaMask requests/responses
const logMetaMaskRequest = (type: 'request' | 'response' | 'error', requestId: string, data: any) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    requestId,
    type,
    ...data
  };

  switch (type) {
    case 'request':
      console.log(`🚀 MetaMask Request [${requestId}]:`, logData);
      break;
    case 'response':
      console.log(`✅ MetaMask Response [${requestId}]:`, logData);
      break;
    case 'error':
      console.error(`❌ MetaMask Error [${requestId}]:`, logData);
      break;
  }

  // Store in localStorage for debugging (last 50 requests)
  try {
    const stored = JSON.parse(localStorage.getItem('metamask_requests') || '[]');
    stored.push(logData);
    if (stored.length > 50) stored.shift();
    localStorage.setItem('metamask_requests', JSON.stringify(stored));
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Utility hook to consume the provider `request` method with request/response interception.
 */
export const useRequest = () => {
  const { provider, setError } = useMetaMaskContext();

  const request: Request = useCallback(
    async ({ method, params }) => {
      const requestId = generateRequestId();
      const startTime = Date.now();

      // Log outgoing request
      logMetaMaskRequest('request', requestId, {
        method,
        params,
        duration: 0
      });

      try {
        const data =
          (await provider?.request({
            method,
            params,
          } as RequestArguments)) ?? null;

        const duration = Date.now() - startTime;

        // Log successful response
        logMetaMaskRequest('response', requestId, {
          method,
          params,
          data,
          duration: `${duration}ms`
        });

        return data;
      } catch (requestError: any) {
        const duration = Date.now() - startTime;

        // Process error to decode hex strings and translate to Russian
        const processedError = processMetaMaskError(requestError);

        // Log error response with processed message
        logMetaMaskRequest('error', requestId, {
          method,
          params,
          error: processedError,
          originalError: requestError.message,
          code: requestError.code,
          duration: `${duration}ms`
        });

        // Create new error with processed message
        const processedRequestError = new Error(processedError);
        (processedRequestError as any).code = requestError.code;
        (processedRequestError as any).originalMessage = requestError.message;

        setError(processedRequestError);
        return null;
      }
    },
    [provider, setError],
  );

  return request;
};

// ============================================================================
// InvokeSnap Hook with Transaction Logging
// ============================================================================

export type InvokeSnapParams = {
  method: string;
  params?: Record<string, unknown>;
};

// Transaction logger for detailed tracking
const logTransaction = (type: 'start' | 'success' | 'error', transactionId: string, data: any) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    transactionId,
    type,
    ...data
  };

  switch (type) {
    case 'start':
      console.log(`🎯 Transaction Started [${transactionId}]:`, logData);
      break;
    case 'success':
      console.log(`🎉 Transaction Success [${transactionId}]:`, logData);
      break;
    case 'error':
      console.error(`💥 Transaction Error [${transactionId}]:`, logData);
      break;
  }

  // Store transaction logs separately
  try {
    const stored = JSON.parse(localStorage.getItem('transaction_logs') || '[]');
    stored.push(logData);
    if (stored.length > 20) stored.shift(); // Keep last 20 transactions
    localStorage.setItem('transaction_logs', JSON.stringify(stored));
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Utility hook to wrap the `wallet_invokeSnap` method with transaction logging.
 */
export const useInvokeSnap = (snapId = defaultSnapOrigin) => {
  const request = useRequest();

  const invokeSnap = useCallback(
    async ({ method, params }: InvokeSnapParams) => {
      // Special handling for transaction methods
      if (method === 'orgon_sendTransaction') {
        const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Log transaction start
        logTransaction('start', transactionId, {
          method,
          params: {
            ...params,
            // Don't log sensitive data like private keys
            from: (params as any)?.from,
            to: (params as any)?.to,
            amount: (params as any)?.amount,
            memo: (params as any)?.memo,
            networkId: (params as any)?.networkId,
          }
        });

        try {
          const result = await request({
            method: 'wallet_invokeSnap',
            params: {
              snapId,
              request: params ? { method, params } : { method },
            },
          });

          // Log transaction success
          logTransaction('success', transactionId, {
            method,
            result: {
              success: (result as any)?.success,
              txId: (result as any)?.txId,
            }
          });

          return result;
        } catch (error: any) {
          // Log transaction error
          logTransaction('error', transactionId, {
            method,
            error: error.message,
            code: error.code,
          });

          throw error;
        }
      }

      // For non-transaction methods, use regular request
      return request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: params ? { method, params } : { method },
        },
      });
    },
    [request, snapId],
  );

  return invokeSnap;
};

// ============================================================================
// Debug Utilities
// ============================================================================

/*
USAGE: Open browser console and use these commands:

// Show all MetaMask requests
debugMetaMask.showRequests()

// Show transaction logs
debugMetaMask.showTransactions()

// Clear all logs
debugMetaMask.clearLogs()

// Enable/disable verbose logging
debugMetaMask.enableVerbose()
debugMetaMask.disableVerbose()

LOGS ARE STORED IN:
- localStorage.metamask_requests (last 50 requests)
- localStorage.transaction_logs (last 20 transactions)
*/

// Global debug utilities for console
if (typeof window !== 'undefined') {
  (window as any).debugMetaMask = {
    // Show all MetaMask requests from localStorage
    showRequests: () => {
      try {
        const requests = JSON.parse(localStorage.getItem('metamask_requests') || '[]');
        console.table(requests.map((r: any) => ({
          time: r.timestamp,
          type: r.type,
          method: r.method,
          duration: r.duration,
          hasError: r.type === 'error'
        })));
        return requests;
      } catch (e) {
        console.error('No MetaMask requests found');
        return [];
      }
    },

    // Show transaction logs
    showTransactions: () => {
      try {
        const transactions = JSON.parse(localStorage.getItem('transaction_logs') || '[]');
        console.table(transactions.map((t: any) => ({
          time: t.timestamp,
          type: t.type,
          txId: t.transactionId,
          method: t.method,
          success: t.result?.success,
          error: t.error
        })));
        return transactions;
      } catch (e) {
        console.error('No transaction logs found');
        return [];
      }
    },

    // Clear all logs
    clearLogs: () => {
      localStorage.removeItem('metamask_requests');
      localStorage.removeItem('transaction_logs');
      console.log('All MetaMask logs cleared');
    },

    // Enable verbose logging
    enableVerbose: () => {
      localStorage.setItem('debug_metamask_verbose', 'true');
      console.log('Verbose MetaMask logging enabled');
    },

    // Disable verbose logging
    disableVerbose: () => {
      localStorage.removeItem('debug_metamask_verbose');
      console.log('Verbose MetaMask logging disabled');
    },

    // Test hex decoding (for debugging)
    testHexDecode: (hexString: string) => {
      const decoded = decodeHexError(hexString);
      const translated = translateBlockchainError(decoded);
      console.log('Hex:', hexString);
      console.log('Decoded:', decoded);
      console.log('Translated:', translated);
      return { decoded, translated };
    },

    // Test error translation (for debugging)
    testErrorTranslation: (errorText: string) => {
      const translated = translateBlockchainError(errorText);
      console.log('Original:', errorText);
      console.log('Translated:', translated);
      return { original: errorText, translated };
    },

    // Test address conversion (for debugging)
    testAddressConversion: (hexAddress: string) => {
      try {
        const readableAddress = convertHexToOrgonAddress(hexAddress);
        console.log('Hex Address:', hexAddress);
        console.log('Readable Address:', readableAddress);
        return { hexAddress, readableAddress };
      } catch (error: unknown) {
        console.error('Address conversion failed:', error);
        return { hexAddress, error: error instanceof Error ? error.message : String(error) };
      }
    }
  };
}

// ============================================================================
// RequestSnap Hook
// ============================================================================

/**
 * Utility hook to wrap the `wallet_requestSnaps` method.
 */
export const useRequestSnap = (
  snapId = defaultSnapOrigin,
  version?: string,
) => {
  const request = useRequest();
  const { setInstalledSnap } = useMetaMaskContext();

  const requestSnap = useCallback(async () => {
    const snaps = (await request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: version ? { version } : {},
      },
    })) as Record<string, Snap>;

    setInstalledSnap(snaps?.[snapId] ?? null);
  }, [request, snapId, version, setInstalledSnap]);

  return requestSnap;
};

// ============================================================================
// MetaMask Detection Hook
// ============================================================================

/**
 * A hook to retrieve useful data from MetaMask.
 */
export const useMetaMask = () => {
  const { provider, setInstalledSnap, installedSnap } = useMetaMaskContext();
  const request = useRequest();

  const [isFlask, setIsFlask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const snapsDetected = provider !== null;

  /**
   * Detect if the version of MetaMask is Flask.
   */
  const detectFlask = async () => {
    const clientVersion = await request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    setIsFlask(isFlaskDetected);
  };

  /**
   * Get the Snap informations from MetaMask.
   */
  const getSnap = async () => {
    const snaps = (await request({
      method: 'wallet_getSnaps',
    })) as GetSnapsResponse;

    setInstalledSnap(snaps[defaultSnapOrigin] ?? null);
  };

  useEffect(() => {
    const detect = async () => {
      if (provider) {
        setIsLoading(true);
        await detectFlask();
        await getSnap();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    detect().catch((error) => {
      console.error(error);
      setIsLoading(false);
    });
  }, [provider]);

  return { isFlask, snapsDetected, installedSnap, isLoading, getSnap };
};
