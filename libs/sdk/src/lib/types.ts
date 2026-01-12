/**
 * Core type definitions for the Next-Step SDK
 */

export interface Script {
  id: string;
  productId: string;
  name: string;
  type: 'walkthrough' | 'modal';
  status: 'draft' | 'published';
  steps: ScriptStep[];
}

export interface ScriptStep {
  id: string;
  scriptId: string;
  orderIndex: number;
  title: string;
  description: string;
  elementSelector?: string;
  actionType?: string;
  config?: Record<string, unknown>;
}

export interface WalkthroughConfig {
  backdropOpacity?: number;
  spotlightPadding?: number;
  animationDuration?: number;
  scrollOffset?: number;
  maxRetries?: number;
  onStepChange?: (step: ScriptStep, index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onError?: (error: Error) => void;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ElementBounds extends Position, Dimensions {}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface AnalyticsEvent {
  type: 'step_view' | 'navigation' | 'complete' | 'skip' | 'error';
  scriptId: string;
  stepId?: string;
  stepIndex?: number;
  timestamp: number;
  duration?: number;
  action?: 'next' | 'back' | 'skip' | 'complete';
  error?: string;
}
