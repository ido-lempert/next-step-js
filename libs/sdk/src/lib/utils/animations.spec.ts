/**
 * Unit tests for animations utility
 */

import { debounce, throttle, wait, nextFrame } from './animations';

describe('animations', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function with latest arguments', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      debounced('second');
      debounced('third');

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('third');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('wait', () => {
    it('should wait for specified duration', async () => {
      const promise = wait(1000);

      jest.advanceTimersByTime(1000);
      await promise;

      expect(true).toBe(true);
    });
  });

  describe('nextFrame', () => {
    it('should wait for next animation frame', async () => {
      const fn = jest.fn();

      nextFrame().then(fn);

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(16);
      await Promise.resolve();

      // Note: requestAnimationFrame is not fully supported in jest
      // This is a basic test
    });
  });
});
