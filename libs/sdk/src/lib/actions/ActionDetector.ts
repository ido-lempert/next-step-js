/**
 * ActionDetector - Main action detection framework
 * Manages event listeners for auto-progression based on user actions
 */

import { ScriptStep } from '../types';

export type ActionCompletionCallback = () => void;

// Inject success feedback styles into the main document
const injectSuccessStyles = () => {
  const styleId = 'nextstep-action-success-styles';
  
  if (document.getElementById(styleId)) {
    return; // Already injected
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes nextstep-action-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(49, 130, 206, 0.7);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(49, 130, 206, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(49, 130, 206, 0);
      }
    }

    .nextstep-action-success {
      animation: nextstep-action-pulse 0.6s ease-out;
    }
  `;
  
  document.head.appendChild(style);
};

// Initialize styles on module load
injectSuccessStyles();

export abstract class BaseActionDetector {
  protected listeners: Array<() => void> = [];

  /**
   * Attach action listener to target element
   */
  abstract attach(
    target: Element,
    step: ScriptStep,
    onComplete: ActionCompletionCallback
  ): void;

  /**
   * Detach all listeners and cleanup
   */
  detach(): void {
    this.listeners.forEach((cleanup) => cleanup());
    this.listeners = [];
  }

  /**
   * Show success feedback on target element
   */
  protected showSuccessFeedback(target: Element): void {
    // Add success class for animation
    target.classList.add('nextstep-action-success');

    // Remove after animation completes
    setTimeout(() => {
      target.classList.remove('nextstep-action-success');
    }, 600);
  }
}

export class ActionDetector {
  private currentDetector: BaseActionDetector | null = null;

  /**
   * Attach action detector based on step configuration
   */
  attach(step: ScriptStep, onComplete: ActionCompletionCallback): void {
    // Detach any existing detector
    this.detach();

    // Check if auto-progress is enabled
    if (!step.autoProgress || !step.autoProgressAction) {
      return;
    }

    // Get target element
    const selector = step.autoProgressSelector || step.elementSelector;
    if (!selector) {
      console.warn('No selector provided for auto-progress action');
      return;
    }

    const target = document.querySelector(selector);
    if (!target) {
      console.warn(`Target element not found: ${selector}`);
      return;
    }

    // Create appropriate detector based on action type
    switch (step.autoProgressAction) {
      case 'click':
        this.currentDetector = new ClickActionDetector();
        break;
      case 'input':
        this.currentDetector = new InputActionDetector();
        break;
      case 'submit':
        this.currentDetector = new SubmitActionDetector();
        break;
      case 'custom':
        this.currentDetector = new CustomActionDetector();
        break;
      default:
        console.warn(`Unknown action type: ${step.autoProgressAction}`);
        return;
    }

    // Attach the detector
    this.currentDetector.attach(target, step, onComplete);
  }

  /**
   * Detach current detector and cleanup
   */
  detach(): void {
    if (this.currentDetector) {
      this.currentDetector.detach();
      this.currentDetector = null;
    }
  }
}

/**
 * Click Action Detector
 */
class ClickActionDetector extends BaseActionDetector {
  attach(
    target: Element,
    step: ScriptStep,
    onComplete: ActionCompletionCallback
  ): void {
    const handler = (event: Event) => {
      // Verify click is on the target element (not a child)
      if (event.target === target || event.currentTarget === target) {
        // Show success feedback
        this.showSuccessFeedback(target);

        // Auto-advance after brief delay
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    // Use capture phase to intercept before other handlers
    target.addEventListener('click', handler, { capture: true });
    this.listeners.push(() =>
      target.removeEventListener('click', handler, { capture: true })
    );
  }
}

/**
 * Input Action Detector
 */
class InputActionDetector extends BaseActionDetector {
  attach(
    target: Element,
    step: ScriptStep,
    onComplete: ActionCompletionCallback
  ): void {
    const inputElement = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    const handler = () => {
      // Check if input meets validation criteria (if provided)
      if (step.autoProgressValidator) {
        try {
          const validator = new Function('value', step.autoProgressValidator);
          if (!validator(inputElement.value)) {
            return;
          }
        } catch (error) {
          console.warn('Error in autoProgressValidator:', error);
          return;
        }
      } else {
        // Default validation: check if input has value
        if (!inputElement.value || inputElement.value.trim() === '') {
          return;
        }
      }

      // Show success feedback
      this.showSuccessFeedback(target);

      // Auto-advance after brief delay
      setTimeout(() => {
        onComplete();
      }, 300);
    };

    // Listen to multiple input events
    const events = ['input', 'change', 'blur'];
    events.forEach((eventName) => {
      target.addEventListener(eventName, handler);
      this.listeners.push(() => target.removeEventListener(eventName, handler));
    });
  }
}

/**
 * Submit Action Detector
 */
class SubmitActionDetector extends BaseActionDetector {
  attach(
    target: Element,
    step: ScriptStep,
    onComplete: ActionCompletionCallback
  ): void {
    const formElement = target as HTMLFormElement;

    const handler = (event: Event) => {
      // Optionally prevent actual submission (for demo mode)
      if (step.config?.['preventSubmit']) {
        event.preventDefault();
      }

      // Show success feedback
      this.showSuccessFeedback(target);

      // Auto-advance after brief delay
      setTimeout(() => {
        onComplete();
      }, 300);
    };

    formElement.addEventListener('submit', handler);
    this.listeners.push(() => formElement.removeEventListener('submit', handler));
  }
}

/**
 * Custom Action Detector
 */
class CustomActionDetector extends BaseActionDetector {
  attach(
    target: Element,
    step: ScriptStep,
    onComplete: ActionCompletionCallback
  ): void {
    if (!step.config?.['customEvent']) {
      console.warn('Custom action requires customEvent in config');
      return;
    }

    const eventName = step.config['customEvent'] as string;

    const handler = () => {
      // Show success feedback
      this.showSuccessFeedback(target);

      // Auto-advance after brief delay
      setTimeout(() => {
        onComplete();
      }, 300);
    };

    target.addEventListener(eventName, handler);
    this.listeners.push(() => target.removeEventListener(eventName, handler));
  }
}
