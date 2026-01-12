/**
 * StepTooltip component - displays step content in a positioned popover
 */

import { ScriptStep, TooltipPosition } from '../types';
import { calculateTooltipPosition } from '../utils/positioning';
import { nextFrame } from '../utils/animations';
import { ProgressIndicator } from './ProgressIndicator';

export interface TooltipCallbacks {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export class StepTooltip {
  private tooltip: HTMLDivElement;
  private arrow: HTMLDivElement;
  private contentContainer: HTMLDivElement;
  private footerContainer: HTMLDivElement;
  private progressIndicator: ProgressIndicator;
  private callbacks: TooltipCallbacks;

  constructor(
    private shadowRoot: ShadowRoot,
    callbacks: TooltipCallbacks
  ) {
    this.callbacks = callbacks;
    this.progressIndicator = new ProgressIndicator(shadowRoot);

    // Create tooltip container
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'nextstep-tooltip';
    this.tooltip.setAttribute('role', 'dialog');
    this.tooltip.setAttribute('aria-modal', 'true');

    // Create arrow
    this.arrow = document.createElement('div');
    this.arrow.className = 'nextstep-tooltip-arrow';
    this.tooltip.appendChild(this.arrow);

    // Create content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'nextstep-tooltip-content';
    this.tooltip.appendChild(this.contentContainer);

    // Create footer container
    this.footerContainer = document.createElement('div');
    this.footerContainer.className = 'nextstep-tooltip-footer';
    this.tooltip.appendChild(this.footerContainer);
  }

  /**
   * Mount the tooltip to the shadow root
   */
  mount(): void {
    this.shadowRoot.appendChild(this.tooltip);
  }

  /**
   * Unmount the tooltip
   */
  unmount(): void {
    if (this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
  }

  /**
   * Show the tooltip with step content
   */
  async show(
    step: ScriptStep,
    targetElement: HTMLElement,
    currentStep: number,
    totalSteps: number,
    isFirstStep: boolean,
    isLastStep: boolean
  ): Promise<void> {
    // Update content
    this.updateContent(step);

    // Update footer with navigation and progress
    this.updateFooter(currentStep, totalSteps, isFirstStep, isLastStep);

    // Position tooltip
    await nextFrame();
    this.position(targetElement);

    // Show tooltip with animation
    await nextFrame();
    this.tooltip.classList.add('visible');

    // Set focus to tooltip for accessibility
    this.tooltip.focus();
  }

  /**
   * Hide the tooltip
   */
  hide(): void {
    this.tooltip.classList.remove('visible');
  }

  /**
   * Update the tooltip content
   */
  private updateContent(step: ScriptStep): void {
    this.contentContainer.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'nextstep-tooltip-header';

    const title = document.createElement('h2');
    title.className = 'nextstep-tooltip-title';
    title.textContent = step.title;
    title.id = 'nextstep-tooltip-title';
    header.appendChild(title);

    this.contentContainer.appendChild(header);

    // Create description
    if (step.description) {
      const description = document.createElement('p');
      description.className = 'nextstep-tooltip-description';
      description.textContent = step.description;
      description.id = 'nextstep-tooltip-description';
      this.contentContainer.appendChild(description);
    }

    // Set ARIA attributes
    this.tooltip.setAttribute('aria-labelledby', 'nextstep-tooltip-title');
    if (step.description) {
      this.tooltip.setAttribute(
        'aria-describedby',
        'nextstep-tooltip-description'
      );
    }
  }

  /**
   * Update the footer with navigation buttons and progress
   */
  private updateFooter(
    currentStep: number,
    totalSteps: number,
    isFirstStep: boolean,
    isLastStep: boolean
  ): void {
    this.footerContainer.innerHTML = '';

    // Add progress indicator
    this.progressIndicator.update(currentStep, totalSteps);
    this.footerContainer.appendChild(this.progressIndicator.getElement());

    // Create buttons container
    const buttons = document.createElement('div');
    buttons.className = 'nextstep-buttons';

    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'nextstep-btn nextstep-btn-skip';
    skipBtn.textContent = 'Skip';
    skipBtn.setAttribute('aria-label', 'Skip walkthrough');
    skipBtn.addEventListener('click', () => this.callbacks.onSkip());
    buttons.appendChild(skipBtn);

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'nextstep-btn nextstep-btn-secondary';
    backBtn.textContent = 'Back';
    backBtn.disabled = isFirstStep;
    backBtn.setAttribute('aria-label', 'Go to previous step');
    backBtn.addEventListener('click', () => this.callbacks.onBack());
    buttons.appendChild(backBtn);

    // Next/Finish button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'nextstep-btn nextstep-btn-primary';
    nextBtn.textContent = isLastStep ? 'Finish' : 'Next';
    nextBtn.setAttribute(
      'aria-label',
      isLastStep ? 'Finish walkthrough' : 'Go to next step'
    );
    nextBtn.addEventListener('click', () => this.callbacks.onNext());
    buttons.appendChild(nextBtn);

    this.footerContainer.appendChild(buttons);
  }

  /**
   * Position the tooltip relative to the target element
   */
  private position(targetElement: HTMLElement): void {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    const { position, arrow } = calculateTooltipPosition({
      targetRect,
      tooltipWidth: tooltipRect.width,
      tooltipHeight: tooltipRect.height,
      padding: 16,
    });

    // Set tooltip position
    this.tooltip.style.left = `${position.x}px`;
    this.tooltip.style.top = `${position.y}px`;

    // Update arrow position
    this.updateArrow(arrow);
  }

  /**
   * Update the arrow direction
   */
  private updateArrow(direction: TooltipPosition): void {
    // Remove all arrow classes
    this.arrow.className = 'nextstep-tooltip-arrow';

    if (direction !== 'center') {
      this.arrow.classList.add(direction);
      this.arrow.style.display = 'block';
    } else {
      this.arrow.style.display = 'none';
    }
  }

  /**
   * Get the tooltip element
   */
  getElement(): HTMLDivElement {
    return this.tooltip;
  }
}
