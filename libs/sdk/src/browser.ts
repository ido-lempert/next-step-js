/**
 * Browser entry point for NextStep SDK
 * Provides auto-initialization from script tag and global API
 */

import { NextStepSDK } from './lib/core/NextStepSDK';
import { parseScriptTagConfig } from './lib/core/config';

// Create singleton SDK instance
const sdk = new NextStepSDK();

/**
 * Auto-initialize from script tag data attributes
 */
function autoInit(): void {
  // Get the current script tag
  const currentScript = document.currentScript as HTMLScriptElement | null;
  
  if (!currentScript) {
    // If currentScript is not available (e.g., async/defer), try to find the script
    const scripts = document.querySelectorAll('script[data-project-id]');
    if (scripts.length > 0) {
      const config = parseScriptTagConfig(scripts[scripts.length - 1] as HTMLScriptElement);
      if (config) {
        sdk.init(config).catch((error) => {
          console.error('[NextStep] Auto-initialization failed:', error);
        });
      }
    }
    return;
  }

  // Parse configuration from script tag
  const config = parseScriptTagConfig(currentScript);
  if (config) {
    sdk.init(config).catch((error) => {
      console.error('[NextStep] Auto-initialization failed:', error);
    });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  // DOM already loaded
  autoInit();
}

// Expose global API
declare global {
  interface Window {
    NextStep: NextStepSDK;
  }
}

window.NextStep = sdk;

// Also export for module usage
export default sdk;
export { NextStepSDK };
export * from './lib/types';
export * from './lib/core/config';
