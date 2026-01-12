/**
 * Utility functions for element positioning and calculation
 */

import { ElementRect } from './types';

/**
 * Get the position and dimensions of an element relative to the viewport
 */
export function getElementRect(element: HTMLElement): ElementRect {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Get viewport dimensions
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Find an element using a CSS selector with retry logic
 * @param selector CSS selector
 * @param maxRetries Maximum number of retries
 * @param retryDelay Delay between retries in milliseconds
 */
export async function findElement(
  selector: string,
  maxRetries = 3,
  retryDelay = 500
): Promise<HTMLElement | null> {
  for (let i = 0; i < maxRetries; i++) {
    const element = document.querySelector(selector);
    if (element) return element as HTMLElement;

    // Wait before retrying (element might not be in DOM yet)
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return null;
}

/**
 * Scroll an element into view smoothly
 * @param element Element to scroll to
 * @param offset Additional offset from top (for fixed headers)
 */
export function scrollToElement(element: HTMLElement, offset = 100): Promise<void> {
  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top - offset;

    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });

    // Wait for scroll to complete
    setTimeout(resolve, 500);
  });
}

/**
 * Check if a position fits within the viewport
 */
export function fitsInViewport(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  const viewport = getViewportSize();
  return x >= 0 && y >= 0 && x + width <= viewport.width && y + height <= viewport.height;
}

/**
 * Calculate the best position for a tooltip relative to a target element
 * @param targetRect Position and size of target element
 * @param tooltipWidth Width of tooltip
 * @param tooltipHeight Height of tooltip
 * @param spacing Spacing between tooltip and target
 */
export function calculateTooltipPosition(
  targetRect: ElementRect,
  tooltipWidth: number,
  tooltipHeight: number,
  spacing = 10
): { x: number; y: number; position: string } {
  const viewport = getViewportSize();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Try positions in order of preference: bottom, top, right, left
  const positions = [
    {
      name: 'bottom',
      x: targetRect.x + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.y + targetRect.height + spacing,
    },
    {
      name: 'top',
      x: targetRect.x + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.y - tooltipHeight - spacing,
    },
    {
      name: 'right',
      x: targetRect.x + targetRect.width + spacing,
      y: targetRect.y + targetRect.height / 2 - tooltipHeight / 2,
    },
    {
      name: 'left',
      x: targetRect.x - tooltipWidth - spacing,
      y: targetRect.y + targetRect.height / 2 - tooltipHeight / 2,
    },
  ];

  // Find first position that fits
  for (const pos of positions) {
    const viewportX = pos.x - scrollX;
    const viewportY = pos.y - scrollY;
    if (fitsInViewport(viewportX, viewportY, tooltipWidth, tooltipHeight)) {
      return { x: pos.x, y: pos.y, position: pos.name };
    }
  }

  // Fallback: center of viewport
  return {
    x: scrollX + viewport.width / 2 - tooltipWidth / 2,
    y: scrollY + viewport.height / 2 - tooltipHeight / 2,
    position: 'center',
  };
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait) as any;
  };
}
