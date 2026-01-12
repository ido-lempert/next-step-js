/**
 * Next-Step SDK
 * Interactive walkthrough and training component for web applications
 */

import { WalkthroughComponent } from './walkthrough-component';
import { WalkthroughConfig } from './types';

export class NextStepSDK {
  private activeWalkthrough: WalkthroughComponent | null = null;

  /**
   * Start a walkthrough with the given configuration
   * @param config Walkthrough configuration
   */
  public async startWalkthrough(config: WalkthroughConfig): Promise<void> {
    // Stop any active walkthrough
    if (this.activeWalkthrough) {
      this.activeWalkthrough.destroy();
    }

    // Create and start new walkthrough
    this.activeWalkthrough = new WalkthroughComponent(config);
    await this.activeWalkthrough.start();
  }

  /**
   * Stop the current walkthrough
   */
  public stopWalkthrough(): void {
    if (this.activeWalkthrough) {
      this.activeWalkthrough.destroy();
      this.activeWalkthrough = null;
    }
  }

  /**
   * Check if a walkthrough is currently active
   */
  public isActive(): boolean {
    return this.activeWalkthrough !== null;
  }
}

/**
 * Create a new NextStep SDK instance
 */
export function createNextStepSDK(): NextStepSDK {
  return new NextStepSDK();
}

// Export default instance for convenience
export const nextStep = createNextStepSDK();

// Legacy export for backwards compatibility
export function sdk(): string {
  return 'sdk';
}
