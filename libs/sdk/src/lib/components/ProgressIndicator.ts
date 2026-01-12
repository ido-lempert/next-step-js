/**
 * ProgressIndicator component - shows current step progress
 */

export class ProgressIndicator {
  private container: HTMLDivElement;
  private textElement: HTMLSpanElement;
  private dotsContainer: HTMLDivElement;
  private currentStep: number;
  private totalSteps: number;

  constructor(private shadowRoot: ShadowRoot) {
    this.currentStep = 0;
    this.totalSteps = 0;

    // Create progress container
    this.container = document.createElement('div');
    this.container.className = 'nextstep-progress';

    // Create text element (e.g., "Step 1 of 5")
    this.textElement = document.createElement('span');
    this.container.appendChild(this.textElement);

    // Create dots container
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'nextstep-progress-dots';
    this.container.appendChild(this.dotsContainer);
  }

  /**
   * Update the progress indicator
   */
  update(currentStep: number, totalSteps: number): void {
    this.currentStep = currentStep;
    this.totalSteps = totalSteps;

    // Update text
    this.textElement.textContent = `Step ${currentStep + 1} of ${totalSteps}`;

    // Update dots
    this.updateDots();
  }

  /**
   * Update the visual dots representation
   */
  private updateDots(): void {
    // Clear existing dots
    this.dotsContainer.innerHTML = '';

    // Create dots for each step
    for (let i = 0; i < this.totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = 'nextstep-progress-dot';

      if (i < this.currentStep) {
        dot.classList.add('completed');
      } else if (i === this.currentStep) {
        dot.classList.add('current');
      }

      // Add ARIA label for accessibility
      dot.setAttribute('aria-label', `Step ${i + 1}`);
      dot.setAttribute('role', 'presentation');

      this.dotsContainer.appendChild(dot);
    }
  }

  /**
   * Get the DOM element
   */
  getElement(): HTMLDivElement {
    return this.container;
  }
}
