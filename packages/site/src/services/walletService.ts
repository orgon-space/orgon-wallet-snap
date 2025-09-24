import type { OrgonAccount, OrgonBalance } from '../types/snap';

export interface WalletServiceInterface {
  getAccounts(): Promise<OrgonAccount[]>;
  createAccount(name?: string): Promise<OrgonAccount>;
  importAccount(privateKey: string, name?: string): Promise<OrgonAccount>;
  importAccountFromMnemonic(mnemonic: string, name?: string): Promise<OrgonAccount>;
  deleteAccount(accountId: string): Promise<void>;
  exportAccount(accountId: string): Promise<{ privateKey: string; address: string }>;
  getAccountMnemonic(accountId: string): Promise<{ accountId: string; address: string; mnemonic: string }>;
  getBalance(address: string, networkId?: string): Promise<OrgonBalance>;
}

export class WalletService implements WalletServiceInterface {
  constructor(
    private invokeSnap: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>,
    private request: (params: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
  ) {}

  async getAccounts(): Promise<OrgonAccount[]> {
    try {
      const accounts = await this.invokeSnap({
        method: 'keyring_listAccounts',
      });
      return accounts as OrgonAccount[];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      throw new Error('Failed to get accounts');
    }
  }

  async createAccount(name?: string): Promise<OrgonAccount> {
    try {
      console.log('Creating account with name:', name);
      
      const account = await this.invokeSnap({
        method: 'keyring_createAccount',
        params: { name },
      });
      
      console.log('Account created successfully:', account);
      return account as OrgonAccount;
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      // Check if it's a permissions error
      if (error?.message?.includes('Unauthorized') || error?.code === 4100) {
        try {
          console.log('Requesting keyring permissions...');
          await this.requestKeyringPermissions();
          
          // Retry the account creation after requesting permissions
          const account = await this.invokeSnap({
            method: 'keyring_createAccount',
            params: { name },
          });
          
          console.log('Account created successfully after permission request:', account);
          return account as OrgonAccount;
        } catch (permissionError) {
          throw new Error('Please grant the required permissions to create Orgon accounts. You may need to reinstall the snap.');
        }
      } else {
        throw new Error(error?.message || 'Failed to create account');
      }
    }
  }

  async importAccount(privateKey: string, name?: string): Promise<OrgonAccount> {
    try {
      const account = await this.invokeSnap({
        method: 'keyring_importAccount',
        params: { privateKey, name },
      });
      return account as OrgonAccount;
    } catch (error: any) {
      console.error('Failed to import account:', error);
      throw new Error(error?.message || 'Failed to import account');
    }
  }

  async importAccountFromMnemonic(mnemonic: string, name?: string): Promise<OrgonAccount> {
    try {
      const account = await this.invokeSnap({
        method: 'keyring_importAccountFromMnemonic',
        params: { mnemonic, name },
      });
      return account as OrgonAccount;
    } catch (error: any) {
      console.error('Failed to import account from mnemonic:', error);
      throw new Error(error?.message || 'Failed to import account from mnemonic');
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      await this.invokeSnap({
        method: 'keyring_deleteAccount',
        params: { accountId },
      });
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      throw new Error(error?.message || 'Failed to delete account');
    }
  }

  async exportAccount(accountId: string): Promise<{ privateKey: string; address: string }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_exportAccount',
        params: { accountId },
      });
      return result as { privateKey: string; address: string };
    } catch (error: any) {
      console.error('Failed to export account:', error);
      throw new Error(error?.message || 'Failed to export account');
    }
  }

  async getAccountMnemonic(accountId: string): Promise<{ accountId: string; address: string; mnemonic: string }> {
    try {
      const result = await this.invokeSnap({
        method: 'keyring_getAccountMnemonic',
        params: { accountId },
      });
      return result as { accountId: string; address: string; mnemonic: string };
    } catch (error: any) {
      console.error('Failed to get account mnemonic:', error);
      throw new Error(error?.message || 'Failed to get account mnemonic');
    }
  }

  async getBalance(address: string, networkId?: string): Promise<OrgonBalance> {
    try {
      console.log('Getting balance for:', { address, networkId });
      const balance = await this.invokeSnap({
        method: 'orgon_getBalance',
        params: { address, networkId },
      });
      console.log('Balance result:', balance);
      return balance as OrgonBalance;
    } catch (error: any) {
      console.error('Failed to get balance:', error);
      throw new Error(error?.message || 'Failed to get balance');
    }
  }

  private async requestKeyringPermissions(): Promise<void> {
    try {
      await this.request({
        method: 'wallet_requestPermissions',
        params: [{
          'wallet_snap': {}
        }] as any
      });
    } catch (error) {
      console.error('Error requesting keyring permissions:', error);
      throw error;
    }
  }
}
