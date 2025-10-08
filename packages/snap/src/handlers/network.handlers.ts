/**
 * Network request handlers
 * Handles all network-related RPC and keyring requests
 */

import { getSupportedNetworks, getCurrentNetwork, switchNetwork } from '../services';

/**
 * Handle orgon_getNetworks request
 */
export async function handleGetNetworks(): Promise<any> {
  const networks = await getSupportedNetworks();
  return networks.map((network) => ({
    chainId: network.chainId,
    name: network.name,
    rpcUrl: network.rpcUrl,
    explorerUrl: network.explorerUrl,
  }));
}

/**
 * Handle orgon_getAllNodes request (alias for getNetworks)
 */
export async function handleGetAllNodes(): Promise<any> {
  return await handleGetNetworks();
}

/**
 * Handle keyring_getSupportedNetworks request
 */
export async function handleGetSupportedNetworks(): Promise<any> {
  const networks = await getSupportedNetworks();
  return networks.map((network) => ({
    chainId: network.chainId,
    name: network.name,
    rpcUrl: network.rpcUrl,
    explorerUrl: network.explorerUrl,
  }));
}

/**
 * Handle keyring_getCurrentNetwork request
 */
export async function handleGetCurrentNetwork(): Promise<any> {
  return await getCurrentNetwork();
}

/**
 * Handle keyring_switchNetwork request
 * @param params - Request parameters
 */
export async function handleSwitchNetwork(params: any): Promise<any> {
  return await switchNetwork(params);
}


