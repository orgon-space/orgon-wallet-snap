/**
 * Network service
 * Business logic for network management
 */

import type { OrgonNetworkConfig, NetworkSwitchResult, SwitchNetworkParams } from '../types';
import { getAllNetworks, getNetworkConfig, getDefaultNetwork } from '../blockchain';
import { getState, updateState } from '../storage';
import { STORAGE_KEY_CURRENT_NETWORK, ERROR_MESSAGES } from '../constants';
import { validateRequired } from '../utils/validation';

/**
 * Get all supported networks
 * @returns Array of network configurations
 */
export async function getSupportedNetworks(): Promise<OrgonNetworkConfig[]> {
  return getAllNetworks();
}

/**
 * Get current network
 * @returns Current network configuration
 */
export async function getCurrentNetwork(): Promise<NetworkSwitchResult> {
  try {
    const state = await getState();
    const currentNetworkId = state[STORAGE_KEY_CURRENT_NETWORK];

    if (currentNetworkId) {
      const networkConfig = getNetworkConfig(currentNetworkId);

      if (networkConfig) {
        return {
          success: true,
          network: networkConfig,
        };
      }
    }

    // Return default network if no current network is set
    const defaultNetwork = getDefaultNetwork();
    return {
      success: true,
      network: defaultNetwork,
    };
  } catch {
    // Return default network as fallback
    const defaultNetwork = getDefaultNetwork();
    return {
      success: true,
      network: defaultNetwork,
    };
  }
}

/**
 * Switch to a different network
 * @param params - Switch parameters
 * @returns Switch result with new network
 */
export async function switchNetwork(params: SwitchNetworkParams): Promise<NetworkSwitchResult> {
  const { chainId } = params;

  validateRequired(chainId, 'Chain ID');

  const networkConfig = getNetworkConfig(chainId);

  if (!networkConfig) {
    throw new Error(`${ERROR_MESSAGES.UNSUPPORTED_NETWORK}: ${chainId}`);
  }

  // Store the current network preference
  const currentState = await getState();
  await updateState({
    ...currentState,
    [STORAGE_KEY_CURRENT_NETWORK]: chainId,
  });

  return {
    success: true,
    network: networkConfig,
  };
}


