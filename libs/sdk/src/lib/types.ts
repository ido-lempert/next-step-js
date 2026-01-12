/**
 * Type definitions for Next-Step SDK
 */

/**
 * Position for tooltip relative to target element
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Action types for auto-progress detection
 */
export type ActionType = 'click' | 'input' | 'submit' | 'navigate' | 'custom';

/**
 * Configuration for a single walkthrough step
 */
export interface StepConfig {
  /** Unique identifier for the step */
  id: string;
  /** Step title */
  title: string;
  /** Step description/content */
  description?: string;
  /** CSS selector for the target element to highlight */
  element_selector?: string;
  /** Order index of the step */
  order_index: number;
  
  // Auto-progress configuration (Story 2.2)
  /** Enable automatic progression when user performs action */
  autoProgress?: boolean;
  /** Type of action to detect for auto-progress */
  actionType?: ActionType;
  /** CSS selector for the action target (defaults to element_selector) */
  actionSelector?: string;
  /** Additional configuration options */
  config?: Record<string, any>;
}

/**
 * Configuration for the entire walkthrough
 */
export interface WalkthroughConfig {
  /** Unique identifier for the script */
  id: string;
  /** Name of the walkthrough */
  name: string;
  /** Array of steps in order */
  steps: StepConfig[];
  /** Optional callback when walkthrough completes */
  onComplete?: () => void;
  /** Optional callback when walkthrough is skipped */
  onSkip?: () => void;
  /** Optional callback when step changes */
  onStepChange?: (step: StepConfig, index: number) => void;
  /** Optional callback for analytics/tracking events */
  onAnalytics?: (event: ProgressEvent) => void;
  /** Optional callback when element is not found */
  onElementNotFound?: (selector: string, step: StepConfig) => void;
}

/**
 * Position and dimensions of an element
 */
export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Navigation event types
 */
export type NavigationAction = 'next' | 'back' | 'skip' | 'complete';

/**
 * Progress tracking event data
 */
export interface ProgressEvent {
  scriptId: string;
  stepId: string;
  action: NavigationAction;
  timestamp: number;
  timeSpent?: number;
}
