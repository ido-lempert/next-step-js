/**
 * Next-Step SDK - Interactive Walkthrough and Modal Components
 */

import { WalkthroughComponent } from './components/WalkthroughComponent';
import { ModalComponent } from './components/ModalComponent';
import { Script, WalkthroughConfig, ModalConfig } from './types';

export { WalkthroughComponent, ModalComponent, Script, WalkthroughConfig, ModalConfig };

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

/**
 * Initialize and start a modal
 * @param script - The script to execute
 * @param config - Optional configuration
 * @returns ModalComponent instance
 */
export async function startModal(
  script: Script,
  config?: ModalConfig
): Promise<ModalComponent> {
  const modal = new ModalComponent(config);
  await modal.start(script);
  return modal;
}

/**
 * Create a modal component without starting it
 * @param config - Optional configuration
 * @returns ModalComponent instance
 */
export function createModal(
  config?: ModalConfig
): ModalComponent {
  return new ModalComponent(config);
}
