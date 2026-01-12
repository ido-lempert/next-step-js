/**
 * Unit tests for positioning utility
 */

import { calculateTooltipPosition, clamp } from './positioning';

describe('positioning', () => {
  describe('calculateTooltipPosition', () => {
    const targetRect: DOMRect = {
      top: 200,
      left: 200,
      width: 100,
      height: 50,
      bottom: 250,
      right: 300,
      x: 200,
      y: 200,
      toJSON: () => ({}),
    };

    it('should position tooltip at bottom by default', () => {
      const result = calculateTooltipPosition({
        targetRect,
        tooltipWidth: 300,
        tooltipHeight: 200,
        padding: 10,
        viewportWidth: 1024,
        viewportHeight: 768,
      });

      expect(result.arrow).toBe('top');
      expect(result.position.y).toBe(260); // bottom + padding
    });

    it('should position tooltip at top if no room at bottom', () => {
      const lowTargetRect: DOMRect = {
        ...targetRect,
        top: 600,
        bottom: 650,
        y: 600,
      };

      const result = calculateTooltipPosition({
        targetRect: lowTargetRect,
        tooltipWidth: 300,
        tooltipHeight: 200,
        padding: 10,
        viewportWidth: 1024,
        viewportHeight: 768,
      });

      expect(result.arrow).toBe('bottom');
      expect(result.position.y).toBe(390); // top - height - padding
    });

    it('should adjust horizontal position to stay in viewport', () => {
      const rightTargetRect: DOMRect = {
        ...targetRect,
        left: 900,
        right: 1000,
        x: 900,
      };

      const result = calculateTooltipPosition({
        targetRect: rightTargetRect,
        tooltipWidth: 300,
        tooltipHeight: 200,
        padding: 10,
        viewportWidth: 1024,
        viewportHeight: 768,
      });

      // Should be adjusted to fit in viewport
      expect(result.position.x).toBeLessThanOrEqual(1024 - 300 - 10);
    });

    it('should fallback to center if no position fits', () => {
      const result = calculateTooltipPosition({
        targetRect,
        tooltipWidth: 2000,
        tooltipHeight: 2000,
        padding: 10,
        viewportWidth: 1024,
        viewportHeight: 768,
      });

      expect(result.arrow).toBe('center');
      expect(result.position.x).toBeCloseTo(1024 / 2 - 1000);
      expect(result.position.y).toBeCloseTo(768 / 2 - 1000);
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
