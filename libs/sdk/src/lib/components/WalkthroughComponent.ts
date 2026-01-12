/**
 * WalkthroughComponent - Main walkthrough orchestrator
 */

import { Script, ScriptStep, WalkthroughConfig, AnalyticsEvent } from '../types';
import { WALKTHROUGH_STYLES } from '../styles';
import { SpotlightOverlay } from './SpotlightOverlay';
import { StepTooltip } from './StepTooltip';
import { findElement, scrollToElement } from '../utils/elementFinder';
import { ActionDetector } from '../actions/ActionDetector';

export class WalkthroughComponent {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private spotlight: SpotlightOverlay;
  private tooltip: StepTooltip;
  private script: Script | null = null;
  private currentStepIndex = 0;
  private config: Required<WalkthroughConfig>;
  private startTime: number = 0;
  private stepStartTime: number = 0;
  private isActive = false;
  private keyboardHandler: (e: KeyboardEvent) => void;
  private actionDetector: ActionDetector;

  constructor(config: WalkthroughConfig = {}) {
    // Merge config with defaults
    this.config = {
      backdropOpacity: config.backdropOpacity ?? 0.7,
      spotlightPadding: config.spotlightPadding ?? 8,
      animationDuration: config.animationDuration ?? 300,
      scrollOffset: config.scrollOffset ?? 100,
      maxRetries: config.maxRetries ?? 3,
      onStepChange: config.onStepChange ?? (() => {}),
      onComplete: config.onComplete ?? (() => {}),
      onSkip: config.onSkip ?? (() => {}),
      onError: config.onError ?? (() => {}),
    };

    // Create container and attach shadow root
    this.container = document.createElement('div');
    this.container.id = 'nextstep-walkthrough';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = WALKTHROUGH_STYLES;
    this.shadowRoot.appendChild(styleSheet);

    // Initialize components
    this.spotlight = new SpotlightOverlay(
      this.shadowRoot,
      this.config.backdropOpacity,
      this.config.spotlightPadding
    );

    this.tooltip = new StepTooltip(this.shadowRoot, {
      onNext: () => this.next(),
      onBack: () => this.back(),
      onSkip: () => this.skip(),
    });

    // Initialize action detector
    this.actionDetector = new ActionDetector();

    // Setup keyboard handler
    this.keyboardHandler = (e: KeyboardEvent) => this.handleKeyboard(e);
  }

  /**
   * Start the walkthrough with a script
   */
  async start(script: Script): Promise<void> {
    if (this.isActive) {
      console.warn('Walkthrough is already active');
      return;
    }

    if (!script.steps || script.steps.length === 0) {
      this.config.onError(new Error('Script has no steps'));
      return;
    }

    this.script = script;
    this.currentStepIndex = 0;
    this.isActive = true;
    this.startTime = Date.now();

    // Append container to body
    document.body.appendChild(this.container);

    // Mount components
    this.spotlight.mount();
    this.tooltip.mount();

    // Add keyboard listener
    document.addEventListener('keydown', this.keyboardHandler);

    // Show first step
    await this.showCurrentStep();
  }

  /**
   * Show the current step
   */
  private async showCurrentStep(): Promise<void> {
    if (!this.script || !this.isActive) return;

    const step = this.script.steps[this.currentStepIndex];
    this.stepStartTime = Date.now();

    try {
      // Find target element if selector is provided
      let targetElement: HTMLElement | null = null;

      if (step.elementSelector) {
        targetElement = await findElement(
          step.elementSelector,
          this.config.maxRetries
        );

        if (!targetElement) {
          throw new Error(
            `Element not found: ${step.elementSelector}`
          );
        }

        // Scroll to element
        await scrollToElement(targetElement, this.config.scrollOffset);

        // Set spotlight target
        this.spotlight.setTarget(targetElement);
      } else {
        // No target element, clear spotlight
        this.spotlight.setTarget(null);
        targetElement = document.body; // Use body for tooltip positioning
      }

      // Show tooltip
      await this.tooltip.show(
        step,
        targetElement,
        this.currentStepIndex,
        this.script.steps.length,
        this.currentStepIndex === 0,
        this.currentStepIndex === this.script.steps.length - 1
      );

      // Attach action detector for auto-progress
      if (step.autoProgress) {
        this.actionDetector.attach(step, () => this.handleAutoProgress());
      }

      // Fire callbacks
      this.config.onStepChange(step, this.currentStepIndex);
      this.trackEvent({
        type: 'step_view',
        scriptId: this.script.id,
        stepId: step.id,
        stepIndex: this.currentStepIndex,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error showing step:', error);
      this.config.onError(error as Error);
      this.trackEvent({
        type: 'error',
        scriptId: this.script.id,
        stepId: step.id,
        stepIndex: this.currentStepIndex,
        timestamp: Date.now(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Navigate to next step
   */
  private async next(): Promise<void> {
    if (!this.script || !this.isActive) return;

    // Detach action detector
    this.actionDetector.detach();

    // Track navigation
    this.trackStepNavigation('next');

    if (this.currentStepIndex < this.script.steps.length - 1) {
      this.currentStepIndex++;
      await this.showCurrentStep();
    } else {
      // Last step, complete walkthrough
      await this.complete();
    }
  }

  /**
   * Handle auto-progress when action is completed
   */
  private async handleAutoProgress(): Promise<void> {
    if (!this.script || !this.isActive) return;

    const step = this.script.steps[this.currentStepIndex];

    // Track action completion
    this.trackEvent({
      type: 'action_completed',
      scriptId: this.script.id,
      stepId: step.id,
      stepIndex: this.currentStepIndex,
      timestamp: Date.now(),
      duration: Date.now() - this.stepStartTime,
      action: 'auto_advance',
    });

    // Detach action detector before progressing
    this.actionDetector.detach();

    // Track navigation with auto_advance action
    this.trackEvent({
      type: 'navigation',
      scriptId: this.script.id,
      stepId: step.id,
      stepIndex: this.currentStepIndex,
      timestamp: Date.now(),
      duration: Date.now() - this.stepStartTime,
      action: 'auto_advance',
    });

    if (this.currentStepIndex < this.script.steps.length - 1) {
      this.currentStepIndex++;
      await this.showCurrentStep();
    } else {
      // Last step, complete walkthrough
      await this.complete();
    }
  }

  /**
   * Navigate to previous step
   */
  private async back(): Promise<void> {
    if (!this.script || !this.isActive) return;

    // Detach action detector
    this.actionDetector.detach();

    // Track navigation
    this.trackStepNavigation('back');

    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      await this.showCurrentStep();
    }
  }

  /**
   * Skip the walkthrough
   */
  private async skip(): Promise<void> {
    if (!this.isActive) return;

    // Track skip
    this.trackStepNavigation('skip');

    this.config.onSkip();
    await this.destroy();
  }

  /**
   * Complete the walkthrough
   */
  private async complete(): Promise<void> {
    if (!this.script || !this.isActive) return;

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

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.skip();
        break;
      case 'ArrowRight':
      case 'Enter':
        e.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.back();
        break;
    }
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
    // Store in local storage for later retrieval
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
      // LocalStorage might be disabled
      console.warn('Failed to track event:', error);
    }
  }

  /**
   * Destroy the walkthrough and cleanup
   */
  async destroy(): Promise<void> {
    this.isActive = false;

    // Detach action detector
    this.actionDetector.detach();

    // Remove keyboard listener
    document.removeEventListener('keydown', this.keyboardHandler);

    // Hide components
    this.tooltip.hide();

    // Wait for animation to complete
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.animationDuration)
    );

    // Unmount components
    this.tooltip.unmount();
    this.spotlight.unmount();

    // Remove container
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Reset state
    this.script = null;
    this.currentStepIndex = 0;
  }

  /**
   * Check if walkthrough is currently active
   */
  isWalkthroughActive(): boolean {
    return this.isActive;
  }

  /**
   * Get the current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}
