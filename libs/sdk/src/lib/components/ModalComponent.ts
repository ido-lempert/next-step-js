/**
 * ModalComponent - Modal-based training experience
 */

import { Script, ScriptStep, ModalConfig, AnalyticsEvent } from '../types';
import { MODAL_STYLES } from '../styles';
import { isDismissed, markAsDismissed } from '../utils/storage';

export class ModalComponent {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private script: Script | null = null;
  private currentStepIndex = 0;
  private config: Required<Omit<ModalConfig, 'dismissalExpiryDays'>> & { dismissalExpiryDays?: number };
  private startTime: number = 0;
  private stepStartTime: number = 0;
  private isActive = false;
  private keyboardHandler: (e: KeyboardEvent) => void;
  private dontShowAgainChecked = false;
  private animationDirection: 'forward' | 'backward' | null = null;

  constructor(config: ModalConfig = {}) {
    // Merge config with defaults
    this.config = {
      animationDuration: config.animationDuration ?? 300,
      showDontShowAgain: config.showDontShowAgain ?? true,
      dismissalExpiryDays: config.dismissalExpiryDays,
      displayDelay: config.displayDelay ?? 0,
      onStepChange: config.onStepChange ?? (() => {}),
      onComplete: config.onComplete ?? (() => {}),
      onSkip: config.onSkip ?? (() => {}),
      onDismiss: config.onDismiss ?? (() => {}),
      onError: config.onError ?? (() => {}),
    };

    // Create container and attach shadow root
    this.container = document.createElement('div');
    this.container.id = 'nextstep-modal';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = MODAL_STYLES;
    this.shadowRoot.appendChild(styleSheet);

    // Setup keyboard handler
    this.keyboardHandler = (e: KeyboardEvent) => this.handleKeyboard(e);
  }

  /**
   * Start the modal with a script
   */
  async start(script: Script): Promise<void> {
    if (this.isActive) {
      console.warn('Modal is already active');
      return;
    }

    if (!script.steps || script.steps.length === 0) {
      this.config.onError(new Error('Script has no steps'));
      return;
    }

    // Check if modal has been dismissed
    if (isDismissed(script.id)) {
      console.log('Modal has been dismissed by user');
      return;
    }

    this.script = script;
    this.currentStepIndex = 0;
    this.isActive = true;
    this.startTime = Date.now();
    this.dontShowAgainChecked = false;

    // Apply display delay if configured
    if (this.config.displayDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.displayDelay)
      );
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Append container to body
    document.body.appendChild(this.container);

    // Render modal
    this.render();

    // Add keyboard listener
    document.addEventListener('keydown', this.keyboardHandler);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      const backdrop = this.shadowRoot.querySelector('.nextstep-modal-backdrop');
      const modal = this.shadowRoot.querySelector('.nextstep-modal');
      backdrop?.classList.add('visible');
      modal?.classList.add('visible');
    });

    // Show first step
    await this.showCurrentStep();

    // Setup focus trap
    this.setupFocusTrap();
  }

  /**
   * Render the modal structure
   */
  private render(): void {
    if (!this.script) return;

    const modalHTML = `
      <div class="nextstep-modal-backdrop" role="presentation">
        <div class="nextstep-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="nextstep-modal-header">
            <h2 id="modal-title" class="nextstep-modal-title">${this.escapeHtml(
              this.currentStep.title
            )}</h2>
            <button 
              class="nextstep-modal-close" 
              aria-label="Close modal"
              type="button"
            >×</button>
          </div>
          <div class="nextstep-modal-body">
            <div class="nextstep-modal-step-content">
              ${this.renderStepContent()}
            </div>
          </div>
          <div class="nextstep-modal-footer">
            <div class="nextstep-modal-footer-left">
              ${
                this.config.showDontShowAgain
                  ? `
                <div class="nextstep-modal-checkbox-container">
                  <input 
                    type="checkbox" 
                    id="dont-show-again" 
                    class="nextstep-modal-checkbox"
                  />
                  <label 
                    for="dont-show-again" 
                    class="nextstep-modal-checkbox-label"
                  >Don't show this again</label>
                </div>
              `
                  : ''
              }
              <div class="nextstep-modal-progress">
                Step ${this.currentStepIndex + 1} of ${this.script.steps.length}
              </div>
            </div>
            <div class="nextstep-modal-buttons">
              <button 
                class="nextstep-modal-btn nextstep-modal-btn-secondary" 
                data-action="previous"
                type="button"
                ${this.currentStepIndex === 0 ? 'disabled' : ''}
              >Previous</button>
              <button 
                class="nextstep-modal-btn nextstep-modal-btn-primary" 
                data-action="next"
                type="button"
              >${
                this.currentStepIndex === this.script.steps.length - 1
                  ? 'Done'
                  : 'Next'
              }</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = '';
    const styleSheet = document.createElement('style');
    styleSheet.textContent = MODAL_STYLES;
    this.shadowRoot.appendChild(styleSheet);
    this.shadowRoot.innerHTML += modalHTML;

    this.attachEventListeners();
  }

  /**
   * Render the current step's content
   */
  private renderStepContent(): string {
    const step = this.currentStep;
    let html = '';

    // Add image if provided
    if (step.imageUrl) {
      html += `
        <div class="nextstep-modal-image-container">
          <img 
            src="${this.escapeHtml(step.imageUrl)}" 
            alt="${this.escapeHtml(step.title)}"
            class="nextstep-modal-image"
            loading="lazy"
          />
        </div>
      `;
    }

    // Add description
    if (step.description) {
      html += `
        <p class="nextstep-modal-description">${this.escapeHtml(
          step.description
        )}</p>
      `;
    }

    return html;
  }

  /**
   * Attach event listeners to modal elements
   */
  private attachEventListeners(): void {
    // Close button
    const closeBtn = this.shadowRoot.querySelector('.nextstep-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Backdrop click (optional: close on backdrop click)
    const backdrop = this.shadowRoot.querySelector('.nextstep-modal-backdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    // Previous button
    const prevBtn = this.shadowRoot.querySelector('[data-action="previous"]');
    prevBtn?.addEventListener('click', () => this.previous());

    // Next button
    const nextBtn = this.shadowRoot.querySelector('[data-action="next"]');
    nextBtn?.addEventListener('click', () => this.next());

    // Don't show again checkbox
    const checkbox = this.shadowRoot.querySelector('#dont-show-again') as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        this.dontShowAgainChecked = (e.target as HTMLInputElement).checked;
      });
    }
  }

  /**
   * Show the current step
   */
  private async showCurrentStep(): Promise<void> {
    if (!this.script || !this.isActive) return;

    const step = this.script.steps[this.currentStepIndex];
    this.stepStartTime = Date.now();

    // Update title
    const titleElement = this.shadowRoot.querySelector('.nextstep-modal-title');
    if (titleElement) {
      titleElement.textContent = step.title;
    }

    // Update step content with animation
    const contentElement = this.shadowRoot.querySelector(
      '.nextstep-modal-step-content'
    );
    if (contentElement) {
      contentElement.classList.remove('visible', 'animate-forward', 'animate-backward');

      // Wait for fade out
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.animationDuration / 2)
      );

      contentElement.innerHTML = this.renderStepContent();

      // Apply animation class
      if (this.animationDirection) {
        contentElement.classList.add(
          this.animationDirection === 'forward'
            ? 'animate-forward'
            : 'animate-backward'
        );
      }

      contentElement.classList.add('visible');
    }

    // Update progress
    const progressElement = this.shadowRoot.querySelector('.nextstep-modal-progress');
    if (progressElement) {
      progressElement.textContent = `Step ${this.currentStepIndex + 1} of ${
        this.script.steps.length
      }`;
    }

    // Update buttons
    this.updateButtons();

    // Fire callbacks
    this.config.onStepChange(step, this.currentStepIndex);
    this.trackEvent({
      type: 'step_view',
      scriptId: this.script.id,
      stepId: step.id,
      stepIndex: this.currentStepIndex,
      timestamp: Date.now(),
    });
  }

  /**
   * Update button states
   */
  private updateButtons(): void {
    if (!this.script) return;

    const prevBtn = this.shadowRoot.querySelector(
      '[data-action="previous"]'
    ) as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector(
      '[data-action="next"]'
    ) as HTMLButtonElement;

    if (prevBtn) {
      prevBtn.disabled = this.currentStepIndex === 0;
    }

    if (nextBtn) {
      nextBtn.textContent =
        this.currentStepIndex === this.script.steps.length - 1 ? 'Done' : 'Next';
    }
  }

  /**
   * Navigate to next step
   */
  private async next(): Promise<void> {
    if (!this.script || !this.isActive) return;

    this.animationDirection = 'forward';

    // Track navigation
    this.trackStepNavigation('next');

    if (this.currentStepIndex < this.script.steps.length - 1) {
      this.currentStepIndex++;
      await this.showCurrentStep();
    } else {
      // Last step, complete modal
      await this.complete();
    }
  }

  /**
   * Navigate to previous step
   */
  private async previous(): Promise<void> {
    if (!this.script || !this.isActive) return;

    this.animationDirection = 'backward';

    // Track navigation
    this.trackStepNavigation('back');

    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      await this.showCurrentStep();
    }
  }

  /**
   * Close/skip the modal
   */
  private async close(): Promise<void> {
    if (!this.isActive) return;

    // Track skip
    this.trackStepNavigation('skip');

    // Handle "don't show again" if checked
    if (this.dontShowAgainChecked && this.script) {
      markAsDismissed(this.script.id, this.config.dismissalExpiryDays);
      this.config.onDismiss();
      this.trackEvent({
        type: 'dismiss',
        scriptId: this.script.id,
        timestamp: Date.now(),
        action: 'dismiss',
      });
    }

    this.config.onSkip();
    await this.destroy();
  }

  /**
   * Complete the modal
   */
  private async complete(): Promise<void> {
    if (!this.script || !this.isActive) return;

    // Handle "don't show again" if checked
    if (this.dontShowAgainChecked) {
      markAsDismissed(this.script.id, this.config.dismissalExpiryDays);
      this.config.onDismiss();
      this.trackEvent({
        type: 'dismiss',
        scriptId: this.script.id,
        timestamp: Date.now(),
        action: 'dismiss',
      });
    }

    // Track completion
    this.trackEvent({
      type: 'complete',
      scriptId: this.script.id,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
    });

    this.config.onComplete();
    await this.destroy();
  }

  /**
   * Handle keyboard events
   */
  private handleKeyboard(e: KeyboardEvent): void {
    if (!this.isActive) return;

    // Check if the event is from within the modal's shadow root
    const path = e.composedPath();
    const isFromModal = path.some((el) => el === this.container);

    if (!isFromModal) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'ArrowRight':
      case 'Enter':
        // Don't prevent Enter if checkbox or button is focused
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT'
        ) {
          return;
        }
        e.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (this.currentStepIndex > 0) {
          this.previous();
        }
        break;
    }
  }

  /**
   * Setup focus trap within modal
   */
  private setupFocusTrap(): void {
    const modal = this.shadowRoot.querySelector('.nextstep-modal');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    requestAnimationFrame(() => {
      firstElement.focus();
    });

    // Trap focus within modal
    const trapFocus = (e: Event) => {
      if (!(e instanceof KeyboardEvent) || e.key !== 'Tab' || !this.isActive) return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement || !modal.contains(document.activeElement as Node)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement || !modal.contains(document.activeElement as Node)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.shadowRoot.addEventListener('keydown', trapFocus);
  }

  /**
   * Track step navigation
   */
  private trackStepNavigation(action: 'next' | 'back' | 'skip'): void {
    if (!this.script) return;

    const step = this.script.steps[this.currentStepIndex];
    this.trackEvent({
      type: 'navigation',
      scriptId: this.script.id,
      stepId: step.id,
      stepIndex: this.currentStepIndex,
      timestamp: Date.now(),
      duration: Date.now() - this.stepStartTime,
      action,
    });
  }

  /**
   * Track analytics event
   */
  private trackEvent(event: AnalyticsEvent): void {
    try {
      const key = 'nextstep_analytics';
      const existing = localStorage.getItem(key);
      const events: AnalyticsEvent[] = existing ? JSON.parse(existing) : [];
      events.push(event);

      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }

      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      // localStorage might be disabled
      console.warn('Failed to track event:', error);
    }
  }

  /**
   * Destroy the modal and cleanup
   */
  async destroy(): Promise<void> {
    this.isActive = false;

    // Remove keyboard listener
    document.removeEventListener('keydown', this.keyboardHandler);

    // Restore body scroll
    document.body.style.overflow = '';

    // Trigger exit animation
    const backdrop = this.shadowRoot.querySelector('.nextstep-modal-backdrop');
    const modal = this.shadowRoot.querySelector('.nextstep-modal');
    backdrop?.classList.remove('visible');
    modal?.classList.remove('visible');

    // Wait for animation to complete
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.animationDuration)
    );

    // Remove container
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Reset state
    this.script = null;
    this.currentStepIndex = 0;
    this.dontShowAgainChecked = false;
    this.animationDirection = null;
  }

  /**
   * Get the current step
   */
  private get currentStep(): ScriptStep {
    if (!this.script) {
      throw new Error('No script loaded');
    }
    return this.script.steps[this.currentStepIndex];
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if modal is currently active
   */
  isModalActive(): boolean {
    return this.isActive;
  }

  /**
   * Get the current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}
