/**
 * Staking transaction creation utilities
 * Creates freeze/unfreeze transactions using OrgonWebService
 */

import { createOrgonWebService } from './orgonWeb';

interface NetworkConfig {
  rpcUrl: string;
  apiKey?: string;
}

/**
 * Create a freeze balance transaction (freezeBalanceV2)
 * @param from - Sender address
 * @param resource - Resource type ('ENERGY' or 'BANDWIDTH')
 * @param amount - Amount in ORGON to freeze
 * @param memo - Optional memo
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createFreezeTransaction(
  from: string,
  resource: 'ENERGY' | 'BANDWIDTH',
  amount: string,
  memo?: string,
  network?: NetworkConfig,
): Promise<any> {
  try {
    // Validate and parse amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount provided');
    }

    // Create OrgonWeb service
    const orgonWebService = createOrgonWebService(network?.rpcUrl, undefined);

    // Convert amount to sun (ORGON has 6 decimals like TRX)
    const amountSun = orgonWebService.orgonWeb.toSun(amountNum.toString());

    // Create freeze transaction
    let transaction =
      await orgonWebService.orgonWeb.transactionBuilder.freezeBalanceV2(
        amountSun,
        resource,
        from,
      );

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create freeze transaction');
    }

    // Add memo if provided
    if (memo && memo.trim() !== '') {
      transaction =
        await orgonWebService.orgonWeb.transactionBuilder.addUpdateData(
          transaction,
          orgonWebService.orgonWeb.toHex(memo.trim()),
          'utf8',
        );
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create freeze transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create an unfreeze balance transaction (unfreezeBalanceV2)
 * @param from - Sender address
 * @param resource - Resource type ('ENERGY' or 'BANDWIDTH')
 * @param memo - Optional memo
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createUnfreezeTransaction(
  from: string,
  resource: 'ENERGY' | 'BANDWIDTH',
  amount: string,
  memo?: string,
  network?: NetworkConfig,
): Promise<any> {
  try {
    // Validate and parse amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount provided');
    }

    // Create TronWeb service
    const OrgonWebService = createOrgonWebService(network?.rpcUrl, undefined);

    // Convert amount to sun (ORGON has 6 decimals like TRX)
    const amountSun = OrgonWebService.orgonWeb.toSun(amountNum.toString());

    // Create unfreeze transaction
    let transaction =
      await OrgonWebService.orgonWeb.transactionBuilder.unfreezeBalanceV2(
        amountSun,
        resource,
        from,
      );

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create unfreeze transaction');
    }

    // Add memo if provided
    if (memo && memo.trim() !== '') {
      transaction =
        await OrgonWebService.orgonWeb.transactionBuilder.addUpdateData(
          transaction,
          OrgonWebService.orgonWeb.toHex(memo.trim()),
          'utf8',
        );
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create unfreeze transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create a withdraw expire unfreeze transaction (withdrawExpireUnfreeze)
 * @param from - Sender address
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createWithdrawExpireUnfreezeTransaction(
  from: string,
  network?: NetworkConfig,
): Promise<any> {
  try {
    // Create OrgonWeb service
    const orgonWebService = createOrgonWebService(network?.rpcUrl, undefined);

    // Create withdraw expire unfreeze transaction
    const transaction =
      await orgonWebService.orgonWeb.transactionBuilder.withdrawExpireUnfreeze(
        from,
      );

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create withdraw expire unfreeze transaction');
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create withdraw expire unfreeze transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create a delegate resource transaction (delegateResource)
 * @param from - Sender address
 * @param receiver - Receiver address
 * @param resource - Resource type ('ENERGY' or 'BANDWIDTH')
 * @param amount - Amount in ORGON to delegate
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createDelegateResourceTransaction(
  from: string,
  receiver: string,
  resource: 'ENERGY' | 'BANDWIDTH',
  amount: string,
  network?: NetworkConfig,
): Promise<any> {
  try {
    // Validate and parse amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount provided');
    }

    // Create OrgonWeb service
    const orgonWebService = createOrgonWebService(network?.rpcUrl, undefined);

    // Convert amount to sun (ORGON has 6 decimals like TRX)
    const amountSun = orgonWebService.orgonWeb.toSun(amountNum.toString());

    // Create delegate resource transaction using tronWeb.transactionBuilder
    const transaction = await orgonWebService.orgonWeb.transactionBuilder.delegateResource(
      amountSun,
      receiver,
      resource,
      from,
      false, // lock - not used
      0, // lockPeriod - not used
      { permissionId: 0 }
    );

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create delegate resource transaction');
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create delegate resource transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create an undelegate resource transaction (undelegateResource)
 * @param from - Sender address
 * @param receiver - Receiver address
 * @param resource - Resource type ('ENERGY' or 'BANDWIDTH')
 * @param amount - Amount in ORGON to undelegate
 * @param network - Network configuration
 * @returns Unsigned transaction object
 */
export async function createUndelegateResourceTransaction(
  from: string,
  receiver: string,
  resource: 'ENERGY' | 'BANDWIDTH',
  amount: string,
  network?: NetworkConfig,
): Promise<any> {
  try {
    // Validate and parse amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount provided');
    }

    // Create OrgonWeb service
    const orgonWebService = createOrgonWebService(network?.rpcUrl, undefined);

    // Convert amount to sun (ORGON has 6 decimals like TRX)
    const amountSun = orgonWebService.orgonWeb.toSun(amountNum.toString());

    // Create undelegate resource transaction using tronWeb.transactionBuilder
    const transaction = await orgonWebService.orgonWeb.transactionBuilder.undelegateResource(
      amountSun,
      receiver,
      resource,
      from,
      { permissionId: 0 }
    );

    if (!transaction || !transaction.raw_data) {
      throw new Error('Failed to create undelegate resource transaction');
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create undelegate resource transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
