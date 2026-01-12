/**
 * Utility functions for smart tooltip positioning
 */

import { Position, TooltipPosition } from '../types';

export interface PositionConfig {
  targetRect: DOMRect;
  tooltipWidth: number;
  tooltipHeight: number;
  padding?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

/**
 * Calculate the best position for a tooltip relative to a target element
 * @param config - Position configuration
 * @returns Position and arrow placement
 */
export function calculateTooltipPosition(
  config: PositionConfig
): { position: Position; arrow: TooltipPosition } {
  const {
    targetRect,
    tooltipWidth,
    tooltipHeight,
    padding = 10,
    viewportWidth = window.innerWidth,
    viewportHeight = window.innerHeight,
  } = config;

  // Try positions in order of preference: bottom, top, right, left
  const positions: Array<{
    position: Position;
    arrow: TooltipPosition;
    priority: number;
  }> = [
    {
      position: {
        x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        y: targetRect.bottom + padding,
      },
      arrow: 'top' as TooltipPosition,
      priority: 1,
    },
    {
      position: {
        x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        y: targetRect.top - tooltipHeight - padding,
      },
      arrow: 'bottom' as TooltipPosition,
      priority: 2,
    },
    {
      position: {
        x: targetRect.right + padding,
        y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      },
      arrow: 'left' as TooltipPosition,
      priority: 3,
    },
    {
      position: {
        x: targetRect.left - tooltipWidth - padding,
        y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      },
      arrow: 'right' as TooltipPosition,
      priority: 4,
    },
  ];

  // Find the first position that fits in the viewport
  for (const option of positions) {
    if (
      fitsInViewport(
        option.position,
        tooltipWidth,
        tooltipHeight,
        viewportWidth,
        viewportHeight
      )
    ) {
      // Adjust horizontal position if needed to stay in viewport
      const adjustedX = Math.max(
        padding,
        Math.min(option.position.x, viewportWidth - tooltipWidth - padding)
      );

      return {
        position: { x: adjustedX, y: option.position.y },
        arrow: option.arrow,
      };
    }
  }

  // Fallback: center of viewport
  return {
    position: {
      x: viewportWidth / 2 - tooltipWidth / 2,
      y: viewportHeight / 2 - tooltipHeight / 2,
    },
    arrow: 'center' as TooltipPosition,
  };
}

/**
 * Check if a tooltip fits in the viewport
 */
function fitsInViewport(
  position: Position,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + width <= viewportWidth &&
    position.y + height <= viewportHeight
  );
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
