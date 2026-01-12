/**
 * Main Walkthrough Component
 * Handles the interactive step-by-step walkthrough overlay
 */

import {
  WalkthroughConfig,
  StepConfig,
  ElementRect,
  NavigationAction,
  ProgressEvent,
} from './types';
import {
  findElement,
  scrollToElement,
  getElementRect,
  calculateTooltipPosition,
  debounce,
} from './utils';
import { WALKTHROUGH_STYLES } from './styles';
import { ActionDetector } from './action-detector';

export class WalkthroughComponent {
  private config: WalkthroughConfig;
  private currentStepIndex = 0;
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private backdrop: HTMLDivElement;
  private highlightBorder: HTMLDivElement;
  private tooltip: HTMLDivElement;
  private targetElement: HTMLElement | null = null;
  private actionDetector: ActionDetector;
  private stepStartTime = 0;
  private isActive = false;

  constructor(config: WalkthroughConfig) {
    this.config = config;
    this.actionDetector = new ActionDetector();
    
    // Create container and attach shadow root
    this.container = document.createElement('div');
    this.container.id = 'nextstep-walkthrough';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = WALKTHROUGH_STYLES;
    this.shadowRoot.appendChild(styleSheet);

    // Create main elements
    this.backdrop = this.createBackdrop();
    this.highlightBorder = this.createHighlightBorder();
    this.tooltip = this.createTooltip();

    this.shadowRoot.appendChild(this.backdrop);
    this.shadowRoot.appendChild(this.highlightBorder);
    this.shadowRoot.appendChild(this.tooltip);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Start the walkthrough
   */
  public async start(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    document.body.appendChild(this.container);
    
    // Start from first step
    this.currentStepIndex = 0;
    await this.showStep(0);
  }

  /**
   * Stop and cleanup the walkthrough
   */
  public destroy(): void {
    this.isActive = false;
    this.actionDetector.detach();
    this.container.remove();
  }

  /**
   * Navigate to the next step
   */
  private async nextStep(): Promise<void> {
    if (this.currentStepIndex < this.config.steps.length - 1) {
      this.trackNavigation('next');
      this.currentStepIndex++;
      await this.showStep(this.currentStepIndex);
    } else {
      this.complete();
    }
  }

  /**
   * Navigate to the previous step
   */
  private async previousStep(): Promise<void> {
    if (this.currentStepIndex > 0) {
      this.trackNavigation('back');
      this.currentStepIndex--;
      await this.showStep(this.currentStepIndex);
    }
  }

  /**
   * Skip the walkthrough
   */
  private skip(): void {
    this.trackNavigation('skip');
    if (this.config.onSkip) {
      this.config.onSkip();
    }
    this.destroy();
  }

  /**
   * Complete the walkthrough
   */
  private complete(): void {
    this.trackNavigation('complete');
    if (this.config.onComplete) {
      this.config.onComplete();
    }
    this.destroy();
  }

  /**
   * Show a specific step
   */
  private async showStep(index: number): Promise<void> {
    const step = this.config.steps[index];
    this.stepStartTime = Date.now();
    
    // Detach previous action detector
    this.actionDetector.detach();

    // Find and scroll to target element
    if (step.element_selector) {
      this.targetElement = await findElement(step.element_selector);
      
      if (this.targetElement) {
        await scrollToElement(this.targetElement);
        this.highlightElement(this.targetElement);
      } else {
        // Handle missing element gracefully
        console.warn(`Element not found: ${step.element_selector}`);
        this.hideHighlight();
        
        // Call onElementNotFound callback if provided
        if (this.config.onElementNotFound) {
          this.config.onElementNotFound(step.element_selector, step);
        }
      }
    } else {
      this.hideHighlight();
    }

    // Update tooltip
    this.updateTooltip(step, index);

    // Setup auto-progress if enabled
    if (step.autoProgress && this.targetElement) {
      this.actionDetector.attach(step, this.targetElement, () => {
        this.nextStep();
      });
    }

    // Fire step change callback
    if (this.config.onStepChange) {
      this.config.onStepChange(step, index);
    }
  }

  /**
   * Highlight a target element
   */
  private highlightElement(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    
    this.highlightBorder.style.display = 'block';
    this.highlightBorder.style.left = `${rect.left}px`;
    this.highlightBorder.style.top = `${rect.top}px`;
    this.highlightBorder.style.width = `${rect.width}px`;
    this.highlightBorder.style.height = `${rect.height}px`;
  }

  /**
   * Hide the highlight
   */
  private hideHighlight(): void {
    this.highlightBorder.style.display = 'none';
  }

  /**
   * Update tooltip content and position
   */
  private updateTooltip(step: StepConfig, index: number): void {
    // Update content
    const titleEl = this.tooltip.querySelector('.nextstep-tooltip-title') as HTMLElement;
    const descEl = this.tooltip.querySelector('.nextstep-tooltip-description') as HTMLElement;
    const progressTextEl = this.tooltip.querySelector('.nextstep-progress-text') as HTMLElement;
    
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.description || '';
    if (progressTextEl) progressTextEl.textContent = `Step ${index + 1} of ${this.config.steps.length}`;

    // Update progress dots
    this.updateProgressDots(index);

    // Update button states
    this.updateButtons(index);

    // Position tooltip
    this.positionTooltip(step);

    // Show tooltip
    this.tooltip.classList.remove('hidden');
  }

  /**
   * Position the tooltip relative to target element
   */
  private positionTooltip(step: StepConfig): void {
    if (!this.targetElement || !step.element_selector) {
      // Center tooltip if no target element
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      this.tooltip.style.left = `${viewport.width / 2 - 200}px`;
      this.tooltip.style.top = `${viewport.height / 2 - 100}px`;
      return;
    }

    const targetRect = getElementRect(this.targetElement);
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    const position = calculateTooltipPosition(
      targetRect,
      tooltipRect.width,
      tooltipRect.height,
      16
    );

    this.tooltip.style.left = `${position.x}px`;
    this.tooltip.style.top = `${position.y}px`;

    // Update arrow position
    const arrow = this.tooltip.querySelector('.nextstep-tooltip-arrow') as HTMLElement;
    if (arrow) {
      arrow.className = 'nextstep-tooltip-arrow';
      arrow.classList.add(position.position);
    }
  }

  /**
   * Update progress dots
   */
  private updateProgressDots(currentIndex: number): void {
    const dotsContainer = this.tooltip.querySelector('.nextstep-progress-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < this.config.steps.length; i++) {
      const dot = document.createElement('div');
      dot.className = 'nextstep-progress-dot';
      
      if (i < currentIndex) {
        dot.classList.add('completed');
      } else if (i === currentIndex) {
        dot.classList.add('active');
      }
      
      dotsContainer.appendChild(dot);
    }
  }

  /**
   * Update button states
   */
  private updateButtons(index: number): void {
    const backBtn = this.tooltip.querySelector('.nextstep-button-back') as HTMLButtonElement;
    const nextBtn = this.tooltip.querySelector('.nextstep-button-next') as HTMLButtonElement;
    
    if (backBtn) {
      backBtn.disabled = index === 0;
    }
    
    if (nextBtn) {
      nextBtn.textContent = index === this.config.steps.length - 1 ? 'Finish' : 'Next';
    }
  }

  /**
   * Create backdrop element
   */
  private createBackdrop(): HTMLDivElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'nextstep-backdrop';
    return backdrop;
  }

  /**
   * Create highlight border element
   */
  private createHighlightBorder(): HTMLDivElement {
    const border = document.createElement('div');
    border.className = 'nextstep-highlight-border';
    border.style.display = 'none';
    return border;
  }

  /**
   * Create tooltip element
   */
  private createTooltip(): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'nextstep-tooltip hidden';
    
    tooltip.innerHTML = `
      <div class="nextstep-tooltip-arrow bottom"></div>
      <div class="nextstep-tooltip-header">
        <h3 class="nextstep-tooltip-title"></h3>
      </div>
      <p class="nextstep-tooltip-description"></p>
      <div class="nextstep-progress">
        <span class="nextstep-progress-text"></span>
        <div class="nextstep-progress-dots"></div>
      </div>
      <div class="nextstep-nav">
        <div class="nextstep-nav-left">
          <button class="nextstep-button nextstep-button-text nextstep-button-skip">Skip</button>
        </div>
        <div class="nextstep-nav-right">
          <button class="nextstep-button nextstep-button-secondary nextstep-button-back">Back</button>
          <button class="nextstep-button nextstep-button-primary nextstep-button-next">Next</button>
        </div>
      </div>
    `;
    
    return tooltip;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Navigation button listeners
    const backBtn = this.tooltip.querySelector('.nextstep-button-back');
    const nextBtn = this.tooltip.querySelector('.nextstep-button-next');
    const skipBtn = this.tooltip.querySelector('.nextstep-button-skip');
    
    backBtn?.addEventListener('click', () => this.previousStep());
    nextBtn?.addEventListener('click', () => this.nextStep());
    skipBtn?.addEventListener('click', () => this.skip());

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Reposition on resize/scroll
    const debouncedReposition = debounce(() => {
      if (this.isActive && this.targetElement) {
        this.highlightElement(this.targetElement);
        this.positionTooltip(this.config.steps[this.currentStepIndex]);
      }
    }, 100);

    window.addEventListener('resize', debouncedReposition);
    window.addEventListener('scroll', debouncedReposition, true);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        event.preventDefault();
        this.nextStep();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousStep();
        break;
      case 'Escape':
        event.preventDefault();
        this.skip();
        break;
    }
  }

  /**
   * Track navigation action
   */
  private trackNavigation(action: NavigationAction): void {
    const step = this.config.steps[this.currentStepIndex];
    const timeSpent = Date.now() - this.stepStartTime;
    
    const event: ProgressEvent = {
      scriptId: this.config.id,
      stepId: step.id,
      action,
      timestamp: Date.now(),
      timeSpent,
    };

    // Fire to analytics via callback if provided
    if (this.config.onAnalytics) {
      this.config.onAnalytics(event);
    } else {
      // Default: log to console
      console.log('Navigation event:', event);
    }
  }
}
