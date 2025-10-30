/**
 * Generic state storage utilities
 * Wrapper around snap_manageState for type-safe state management
 */

import type { SnapState } from '../types';
import { StorageError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants';

/**
 * Get the entire snap state
 * @returns Current state or empty object
 */
export async function getState(): Promise<SnapState> {
  try {
    const state = (await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get',
      },
    })) as SnapState | null;

    return state ?? {};
  } catch (error) {
    throw new StorageError(
      `${ERROR_MESSAGES.STORAGE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Update the snap state
 * @param newState - New state to merge with existing state
 */
export async function updateState(newState: Partial<SnapState>): Promise<void> {
  try {
    const currentState = await getState();

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: {
          ...currentState,
          ...newState,
        },
      },
    });
  } catch (error) {
    throw new StorageError(
      `${ERROR_MESSAGES.STORAGE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}



