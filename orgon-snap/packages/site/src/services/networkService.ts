import type { OrgonNetwork } from '../types/snap';

export interface NetworkServiceInterface {
  getNetworks(): Promise<OrgonNetwork[]>;
  getCurrentNetwork(): Promise<{ success: boolean; network: OrgonNetwork | null }>;
  switchNetwork(chainId: string): Promise<{ success: boolean; network: OrgonNetwork | null }>;
}

export class NetworkService implements NetworkServiceInterface {
  constructor(
    private invokeSnap: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
  ) {}

  async getNetworks(): Promise<OrgonNetwork[]> {
    try {
      const networks = await this.invokeSnap({
        method: 'orgon_getNetworks',
      });
      return networks as OrgonNetwork[];
    } catch (error: any) {
      console.error('Failed to get networks:', error);
      throw new Error(error?.message || 'Failed to get networks');
    }
  }

  async getCurrentNetwork(): Promise<{ success: boolean; network: OrgonNetwork | null }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_getCurrentNetwork',
      });
      return result as { success: boolean; network: OrgonNetwork | null };
    } catch (error: any) {
      console.error('Failed to get current network:', error);
      throw new Error(error?.message || 'Failed to get current network');
    }
  }

  async switchNetwork(chainId: string): Promise<{ success: boolean; network: OrgonNetwork | null }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_switchNetwork',
        params: { chainId },
      });
      return result as { success: boolean; network: OrgonNetwork | null };
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      throw new Error(error?.message || 'Failed to switch network');
    }
  }
}
