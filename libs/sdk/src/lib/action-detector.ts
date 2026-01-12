/**
 * Action Detector for Auto-Progress functionality
 * Detects user interactions and triggers automatic progression
 */

import { StepConfig } from './types';

export class ActionDetector {
  private listeners: Array<() => void> = [];
  private cleanupFunctions: Array<() => void> = [];

  /**
   * Attach action detection to a step
   * @param step Step configuration
   * @param targetElement Target element to monitor
   * @param onComplete Callback when action is detected
   */
  public attach(
    step: StepConfig,
    targetElement: HTMLElement,
    onComplete: () => void
  ): void {
    if (!step.autoProgress || !step.actionType) return;

    const actionTarget = step.actionSelector
      ? document.querySelector(step.actionSelector) as HTMLElement
      : targetElement;

    if (!actionTarget) {
      console.warn('Action target not found for auto-progress');
      return;
    }

    switch (step.actionType) {
      case 'click':
        this.attachClickListener(actionTarget, onComplete);
        break;
      case 'input':
        this.attachInputListener(actionTarget, onComplete);
        break;
      case 'submit':
        this.attachSubmitListener(actionTarget, onComplete);
        break;
      default:
        console.warn(`Unsupported action type: ${step.actionType}`);
    }
  }

  /**
   * Detach all event listeners
   */
  public detach(): void {
    // Clean up all event listeners
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = [];
    this.listeners = [];
  }

  /**
   * Attach click event listener
   */
  private attachClickListener(target: HTMLElement, onComplete: () => void): void {
    const handler = (event: Event) => {
      // Verify click is on the target element (not a child)
      if (event.target === target || target.contains(event.target as Node)) {
        this.showSuccessIndicator(target);
        
        // Auto-advance after brief delay for feedback
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    // Use capture phase to intercept before other handlers
    target.addEventListener('click', handler, { capture: true });
    
    this.cleanupFunctions.push(() => {
      target.removeEventListener('click', handler, { capture: true });
    });
  }

  /**
   * Attach input event listener
   */
  private attachInputListener(target: HTMLElement, onComplete: () => void): void {
    let hasInput = false;

    const handler = (event: Event) => {
      // Check if input has value
      const inputElement = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      if (inputElement.value && inputElement.value.trim().length > 0) {
        if (!hasInput) {
          hasInput = true;
          this.showSuccessIndicator(target);
          
          // Auto-advance after brief delay
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }
    };

    // Listen for input, change events
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.addEventListener('input', handler);
      target.addEventListener('change', handler);
      
      this.cleanupFunctions.push(() => {
        target.removeEventListener('input', handler);
        target.removeEventListener('change', handler);
      });
    } else if (target instanceof HTMLSelectElement) {
      target.addEventListener('change', handler);
      
      this.cleanupFunctions.push(() => {
        target.removeEventListener('change', handler);
      });
    }
  }

  /**
   * Attach form submit event listener
   */
  private attachSubmitListener(target: HTMLElement, onComplete: () => void): void {
    // Find parent form if target is not a form
    const form = target instanceof HTMLFormElement
      ? target
      : target.closest('form');

    if (!form) {
      console.warn('No form found for submit action detection');
      return;
    }

    const handler = (event: Event) => {
      // Show success but don't prevent default (allow form to submit naturally)
      this.showSuccessIndicator(form);
      
      // Auto-advance immediately
      setTimeout(() => {
        onComplete();
      }, 300);
    };

    form.addEventListener('submit', handler, { capture: true });
    
    this.cleanupFunctions.push(() => {
      form.removeEventListener('submit', handler, { capture: true });
    });
  }

  /**
   * Show a success indicator near the target element
   */
  private showSuccessIndicator(target: HTMLElement): void {
    const indicator = document.createElement('div');
    indicator.className = 'nextstep-success-indicator';
    indicator.textContent = '✓ Action completed';
    indicator.style.position = 'fixed';
    
    const rect = target.getBoundingClientRect();
    indicator.style.left = `${rect.left + rect.width / 2 - 80}px`;
    indicator.style.top = `${rect.top - 40}px`;
    indicator.style.zIndex = '1000001';
    
    document.body.appendChild(indicator);

    // Remove after animation
    setTimeout(() => {
      indicator.remove();
    }, 1000);
  }
}
