export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

export type OrgonAccount = {
  id: string;
  name: string;
  address: string;
};

export type OrgonNetwork = {
  chainId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
};

export type OrgonBalance = {
  org: string;
  usd?: string;
};

export type OrgonTransaction = {
  from: string;
  to: string;
  amount: string;
  memo?: string;
  networkId?: string;
  accountId: string;
};