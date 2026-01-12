/**
 * Unit tests for elementFinder utility
 */

import {
  findElement,
  getElementBounds,
  scrollToElement,
  isElementVisible,
} from './elementFinder';

describe('elementFinder', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('findElement', () => {
    it('should find an existing element', async () => {
      const div = document.createElement('div');
      div.id = 'test-element';
      document.body.appendChild(div);

      const element = await findElement('#test-element');
      expect(element).toBe(div);
    });

    it('should return null if element not found', async () => {
      const element = await findElement('#non-existent', 1, 100);
      expect(element).toBeNull();
    });

    it('should retry finding element', async () => {
      const startTime = Date.now();

      setTimeout(() => {
        const div = document.createElement('div');
        div.id = 'delayed-element';
        document.body.appendChild(div);
      }, 300);

      const element = await findElement('#delayed-element', 3, 200);
      const duration = Date.now() - startTime;

      expect(element).toBeTruthy();
      expect(duration).toBeGreaterThanOrEqual(200);
    });
  });

  describe('getElementBounds', () => {
    it('should return element bounding rect', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      // Mock getBoundingClientRect
      jest.spyOn(div, 'getBoundingClientRect').mockReturnValue({
        top: 10,
        left: 20,
        width: 100,
        height: 50,
        bottom: 60,
        right: 120,
        x: 20,
        y: 10,
        toJSON: () => ({}),
      });

      const rect = getElementBounds(div);
      expect(rect.top).toBe(10);
      expect(rect.left).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });
  });

  describe('scrollToElement', () => {
    it('should scroll to element', async () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
      jest.spyOn(div, 'getBoundingClientRect').mockReturnValue({
        top: 500,
        left: 0,
        width: 100,
        height: 50,
        bottom: 550,
        right: 100,
        x: 0,
        y: 500,
        toJSON: () => ({}),
      });

      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        value: 0,
      });

      const scrollPromise = scrollToElement(div, 100);

      // Simulate scroll completion
      setTimeout(() => {
        Object.defineProperty(window, 'pageYOffset', {
          writable: true,
          value: 400,
        });
      }, 50);

      await scrollPromise;

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 400,
        behavior: 'smooth',
      });

      scrollToSpy.mockRestore();
    });
  });

  describe('isElementVisible', () => {
    it('should return true if element is visible', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      jest.spyOn(div, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        left: 100,
        width: 200,
        height: 200,
        bottom: 300,
        right: 300,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 768,
      });

      expect(isElementVisible(div)).toBe(true);
    });

    it('should return false if element is outside viewport', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      jest.spyOn(div, 'getBoundingClientRect').mockReturnValue({
        top: -100,
        left: -100,
        width: 50,
        height: 50,
        bottom: -50,
        right: -50,
        x: -100,
        y: -100,
        toJSON: () => ({}),
      });

      expect(isElementVisible(div)).toBe(false);
    });
  });
});
