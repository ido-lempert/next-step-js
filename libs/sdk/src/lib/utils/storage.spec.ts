/**
 * Tests for storage utilities
 */

import { isDismissed, markAsDismissed, clearDismissal } from './storage';

describe('Storage Utilities', () => {
  const testScriptId = 'test-script-123';
  const storageKey = `nextstep-modal-${testScriptId}-dismissed`;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('isDismissed', () => {
    it('should return false when no dismissal record exists', () => {
      expect(isDismissed(testScriptId)).toBe(false);
    });

    it('should return true when dismissal record exists without expiry', () => {
      markAsDismissed(testScriptId);
      expect(isDismissed(testScriptId)).toBe(true);
    });

    it('should return true when dismissal record exists and not expired', () => {
      markAsDismissed(testScriptId, 30); // Expires in 30 days
      expect(isDismissed(testScriptId)).toBe(true);
    });

    it('should return false when dismissal record has expired', () => {
      // Manually create expired dismissal
      const data = {
        dismissedAt: Date.now() - 1000,
        expiresAt: Date.now() - 1, // Expired 1ms ago
      };
      localStorage.setItem(storageKey, JSON.stringify(data));

      expect(isDismissed(testScriptId)).toBe(false);
    });

    it('should clean up expired dismissal records', () => {
      const data = {
        dismissedAt: Date.now() - 1000,
        expiresAt: Date.now() - 1,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));

      isDismissed(testScriptId);

      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage disabled');
      });

      expect(isDismissed(testScriptId)).toBe(false);
    });

    it('should handle invalid JSON data gracefully', () => {
      localStorage.setItem(storageKey, 'invalid-json{');
      expect(isDismissed(testScriptId)).toBe(false);
    });
  });

  describe('markAsDismissed', () => {
    it('should store dismissal without expiry', () => {
      markAsDismissed(testScriptId);

      const value = localStorage.getItem(storageKey);
      expect(value).not.toBeNull();

      const data = JSON.parse(value!);
      expect(data.dismissedAt).toBeGreaterThan(0);
      expect(data.expiresAt).toBeUndefined();
    });

    it('should store dismissal with expiry', () => {
      const daysUntilExpiry = 7;
      markAsDismissed(testScriptId, daysUntilExpiry);

      const value = localStorage.getItem(storageKey);
      expect(value).not.toBeNull();

      const data = JSON.parse(value!);
      expect(data.dismissedAt).toBeGreaterThan(0);
      expect(data.expiresAt).toBeGreaterThan(Date.now());

      const expectedExpiry = Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000;
      expect(Math.abs(data.expiresAt - expectedExpiry)).toBeLessThan(100); // Within 100ms
    });

    it('should ignore negative expiry days', () => {
      markAsDismissed(testScriptId, -5);

      const value = localStorage.getItem(storageKey);
      const data = JSON.parse(value!);
      expect(data.expiresAt).toBeUndefined();
    });

    it('should ignore zero expiry days', () => {
      markAsDismissed(testScriptId, 0);

      const value = localStorage.getItem(storageKey);
      const data = JSON.parse(value!);
      expect(data.expiresAt).toBeUndefined();
    });

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      expect(() => markAsDismissed(testScriptId)).not.toThrow();
    });
  });

  describe('clearDismissal', () => {
    it('should remove dismissal record', () => {
      markAsDismissed(testScriptId);
      expect(localStorage.getItem(storageKey)).not.toBeNull();

      clearDismissal(testScriptId);
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('should not throw when clearing non-existent record', () => {
      expect(() => clearDismissal(testScriptId)).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage disabled');
      });

      expect(() => clearDismissal(testScriptId)).not.toThrow();
    });
  });
});
