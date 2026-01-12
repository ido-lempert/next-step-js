/**
 * Next-Step SDK - Interactive Walkthrough Component
 */

import { WalkthroughComponent } from './components/WalkthroughComponent';
import { Script, WalkthroughConfig } from './types';

export { WalkthroughComponent, Script, WalkthroughConfig };

/**
 * Initialize and start a walkthrough
 * @param script - The script to execute
 * @param config - Optional configuration
 * @returns WalkthroughComponent instance
 */
export async function startWalkthrough(
  script: Script,
  config?: WalkthroughConfig
): Promise<WalkthroughComponent> {
  const walkthrough = new WalkthroughComponent(config);
  await walkthrough.start(script);
  return walkthrough;
}

/**
 * Create a walkthrough component without starting it
 * @param config - Optional configuration
 * @returns WalkthroughComponent instance
 */
export function createWalkthrough(
  config?: WalkthroughConfig
): WalkthroughComponent {
  return new WalkthroughComponent(config);
}
