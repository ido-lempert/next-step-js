/**
 * SpotlightOverlay component - handles backdrop and spotlight effect
 */

import { debounce } from '../utils/animations';

export class SpotlightOverlay {
  private overlay: HTMLDivElement;
  private spotlight: HTMLDivElement;
  private targetElement: HTMLElement | null = null;
  private spotlightPadding: number;
  private resizeHandler: () => void;
  private scrollHandler: () => void;

  constructor(
    private shadowRoot: ShadowRoot,
    private backdropOpacity = 0.7,
    spotlightPadding = 8
  ) {
    this.spotlightPadding = spotlightPadding;

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'nextstep-overlay';

    // Create spotlight element
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'nextstep-spotlight';

    this.overlay.appendChild(this.spotlight);

    // Setup event handlers
    this.resizeHandler = debounce(() => this.updateSpotlight(), 100);
    this.scrollHandler = debounce(() => this.updateSpotlight(), 50);
  }

  /**
   * Mount the overlay to the shadow root
   */
  mount(): void {
    this.shadowRoot.appendChild(this.overlay);

    // Add event listeners
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('scroll', this.scrollHandler, true);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
      this.overlay.classList.add('visible');
    });
  }

  /**
   * Unmount the overlay and cleanup
   */
  unmount(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('scroll', this.scrollHandler, true);

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  /**
   * Set the target element to spotlight
   */
  setTarget(element: HTMLElement | null): void {
    this.targetElement = element;
    this.updateSpotlight();
  }

  /**
   * Update the spotlight position and size
   */
  private updateSpotlight(): void {
    if (!this.targetElement) {
      // No target, hide spotlight
      this.spotlight.style.display = 'none';
      return;
    }

    const rect = this.targetElement.getBoundingClientRect();

    // Position spotlight with padding
    const x = rect.left - this.spotlightPadding;
    const y = rect.top - this.spotlightPadding;
    const width = rect.width + this.spotlightPadding * 2;
    const height = rect.height + this.spotlightPadding * 2;

    this.spotlight.style.display = 'block';
    this.spotlight.style.left = `${x}px`;
    this.spotlight.style.top = `${y}px`;
    this.spotlight.style.width = `${width}px`;
    this.spotlight.style.height = `${height}px`;

    // Update box-shadow with backdrop opacity
    const shadowOpacity = this.backdropOpacity;
    this.spotlight.style.boxShadow = `0 0 0 9999px rgba(0, 0, 0, ${shadowOpacity})`;
  }

  /**
   * Get the current target element
   */
  getTarget(): HTMLElement | null {
    return this.targetElement;
  }
}
