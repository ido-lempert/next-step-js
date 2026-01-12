/**
 * Tests for utility functions
 */

import {
  getElementRect,
  getViewportSize,
  findElement,
  scrollToElement,
  fitsInViewport,
  calculateTooltipPosition,
  debounce,
} from './utils';

describe('utils', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('getElementRect', () => {
    it('should return rect with numeric values', () => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '100px';
      element.style.top = '50px';
      element.style.width = '200px';
      element.style.height = '150px';
      document.body.appendChild(element);

      const rect = getElementRect(element);

      expect(typeof rect.width).toBe('number');
      expect(typeof rect.height).toBe('number');
      expect(typeof rect.x).toBe('number');
      expect(typeof rect.y).toBe('number');
    });
  });

  describe('getViewportSize', () => {
    it('should return viewport dimensions', () => {
      const viewport = getViewportSize();

      expect(viewport.width).toBe(window.innerWidth);
      expect(viewport.height).toBe(window.innerHeight);
    });
  });

  describe('findElement', () => {
    it('should find element by selector', async () => {
      const testDiv = document.createElement('div');
      testDiv.id = 'test-element';
      document.body.appendChild(testDiv);

      const element = await findElement('#test-element');

      expect(element).toBe(testDiv);
    });

    it('should return null if element not found', async () => {
      const element = await findElement('#non-existent', 1, 100);

      expect(element).toBeNull();
    });

    it('should retry finding element', async () => {
      jest.useRealTimers(); // Use real timers for this test
      
      // Add element after a delay
      setTimeout(() => {
        const testDiv = document.createElement('div');
        testDiv.id = 'delayed-element';
        document.body.appendChild(testDiv);
      }, 300);

      const element = await findElement('#delayed-element', 3, 200);

      expect(element).not.toBeNull();
      expect(element?.id).toBe('delayed-element');
      
      jest.useFakeTimers(); // Restore fake timers
    });
  });

  describe('scrollToElement', () => {
    it('should call window.scrollTo', async () => {
      // Mock window.scrollTo since jsdom doesn't implement it
      window.scrollTo = jest.fn();
      
      const element = document.createElement('div');
      document.body.appendChild(element);

      const scrollPromise = scrollToElement(element, 100);
      
      // Fast-forward time for setTimeout
      jest.advanceTimersByTime(500);
      
      await scrollPromise;

      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('fitsInViewport', () => {
    beforeEach(() => {
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
    });

    it('should return true when element fits', () => {
      const fits = fitsInViewport(100, 100, 200, 150);
      expect(fits).toBe(true);
    });

    it('should return false when element is too far right', () => {
      const fits = fitsInViewport(900, 100, 200, 150);
      expect(fits).toBe(false);
    });

    it('should return false when element is too far down', () => {
      const fits = fitsInViewport(100, 700, 200, 150);
      expect(fits).toBe(false);
    });

    it('should return false when element has negative position', () => {
      const fits = fitsInViewport(-10, 100, 200, 150);
      expect(fits).toBe(false);
    });
  });

  describe('calculateTooltipPosition', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    });

    it('should prefer bottom position when it fits', () => {
      const targetRect = { x: 400, y: 200, width: 100, height: 50 };
      const position = calculateTooltipPosition(targetRect, 300, 200);

      expect(position.position).toBe('bottom');
      expect(position.y).toBeGreaterThan(targetRect.y + targetRect.height);
    });

    it('should use top position when bottom does not fit', () => {
      const targetRect = { x: 400, y: 700, width: 100, height: 50 };
      const position = calculateTooltipPosition(targetRect, 300, 200);

      expect(position.position).toBe('top');
      expect(position.y).toBeLessThan(targetRect.y);
    });

    it('should fallback to center when no position fits', () => {
      const targetRect = { x: 0, y: 0, width: 100, height: 50 };
      const position = calculateTooltipPosition(targetRect, 1200, 900);

      expect(position.position).toBe('center');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous call when invoked again', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      jest.advanceTimersByTime(300);
      debouncedFn();
      jest.advanceTimersByTime(300);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
