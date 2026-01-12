/**
 * Utility functions for DOM element finding with retry logic
 */

/**
 * Find an element in the DOM with retry logic
 * @param selector - CSS selector
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in milliseconds
 * @returns Promise that resolves with the element or null
 */
export async function findElement(
  selector: string,
  maxRetries = 3,
  retryDelay = 500
): Promise<HTMLElement | null> {
  for (let i = 0; i < maxRetries; i++) {
    const element = document.querySelector(selector);
    if (element) {
      return element as HTMLElement;
    }

    // Wait before retrying (element might not be in DOM yet)
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return null;
}

/**
 * Get the bounding rect of an element relative to the viewport
 * @param element - Target element
 * @returns Bounding rectangle
 */
export function getElementBounds(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * Scroll an element into view smoothly
 * @param element - Element to scroll to
 * @param offset - Additional offset from the top (for fixed headers)
 */
export async function scrollToElement(
  element: HTMLElement,
  offset = 0
): Promise<void> {
  const elementRect = element.getBoundingClientRect();
  const absoluteTop = window.pageYOffset + elementRect.top;
  const scrollToY = absoluteTop - offset;

  window.scrollTo({
    top: scrollToY,
    behavior: 'smooth',
  });

  // Wait for scroll to complete
  return new Promise((resolve) => {
    let lastScrollY = window.pageYOffset;
    let sameCount = 0;

    const checkScroll = () => {
      const currentScrollY = window.pageYOffset;
      if (Math.abs(currentScrollY - lastScrollY) < 1) {
        sameCount++;
        if (sameCount >= 3) {
          resolve();
          return;
        }
      } else {
        sameCount = 0;
      }
      lastScrollY = currentScrollY;
      requestAnimationFrame(checkScroll);
    };

    requestAnimationFrame(checkScroll);
  });
}

/**
 * Check if an element is visible in the viewport
 * @param element - Element to check
 * @returns True if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}
