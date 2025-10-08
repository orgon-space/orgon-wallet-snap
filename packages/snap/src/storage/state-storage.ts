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

    return state || {};
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

/**
 * Get a specific value from state
 * @param key - State key
 * @returns Value or undefined
 */
export async function getStateValue<T = any>(key: string): Promise<T | undefined> {
  const state = await getState();
  return state[key] as T | undefined;
}

/**
 * Set a specific value in state
 * @param key - State key
 * @param value - Value to set
 */
export async function setStateValue(key: string, value: any): Promise<void> {
  await updateState({ [key]: value });
}

/**
 * Clear all state
 */
export async function clearState(): Promise<void> {
  try {
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'clear',
      },
    });
  } catch (error) {
    throw new StorageError(
      `${ERROR_MESSAGES.STORAGE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}


