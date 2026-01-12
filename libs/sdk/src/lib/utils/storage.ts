/**
 * Storage utilities for managing modal dismissal preferences
 */

const STORAGE_KEY_PREFIX = 'nextstep-modal-';

export interface DismissalData {
  dismissedAt: number;
  expiresAt?: number;
}

/**
 * Check if a modal has been dismissed by the user
 * @param scriptId - The script ID to check
 * @returns true if dismissed and not expired, false otherwise
 */
export function isDismissed(scriptId: string): boolean {
  try {
    const key = `${STORAGE_KEY_PREFIX}${scriptId}-dismissed`;
    const value = localStorage.getItem(key);

    if (!value) return false;

    const data: DismissalData = JSON.parse(value);

    // Check if dismissal has expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      localStorage.removeItem(key);
      return false;
    }

    return true;
  } catch (error) {
    // localStorage might be disabled or quota exceeded
    console.warn('Failed to check dismissal status:', error);
    return false;
  }
}

/**
 * Mark a modal as dismissed
 * @param scriptId - The script ID to mark as dismissed
 * @param daysUntilExpiry - Optional number of days until the dismissal expires
 */
export function markAsDismissed(scriptId: string, daysUntilExpiry?: number): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${scriptId}-dismissed`;
    const data: DismissalData = {
      dismissedAt: Date.now(),
    };

    if (daysUntilExpiry && daysUntilExpiry > 0) {
      data.expiresAt = Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000;
    }

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // localStorage might be disabled or quota exceeded
    console.warn('Failed to mark modal as dismissed:', error);
  }
}

/**
 * Clear dismissal status for a modal (useful for testing or re-enabling)
 * @param scriptId - The script ID to clear
 */
export function clearDismissal(scriptId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${scriptId}-dismissed`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear dismissal status:', error);
  }
}
