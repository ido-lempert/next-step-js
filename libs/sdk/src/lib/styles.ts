/**
 * CSS styles for the walkthrough component
 * These will be injected into the Shadow DOM
 */

export const WALKTHROUGH_STYLES = `
  :host {
    all: initial;
    display: block;
  }

  * {
    box-sizing: border-box;
  }

  /* Backdrop overlay that covers the entire page */
  .nextstep-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999998;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 0.3s ease;
  }

  .nextstep-backdrop.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* Spotlight overlay with cutout for target element */
  .nextstep-spotlight {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    pointer-events: none;
    transition: clip-path 0.3s ease;
  }

  /* Highlighted element border */
  .nextstep-highlight-border {
    position: absolute;
    pointer-events: none;
    border: 3px solid #4f46e5;
    border-radius: 4px;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
    z-index: 999999;
    transition: all 0.3s ease;
  }

  /* Tooltip container */
  .nextstep-tooltip {
    position: absolute;
    z-index: 1000000;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    padding: 20px;
    max-width: 400px;
    min-width: 300px;
    transition: all 0.3s ease;
  }

  .nextstep-tooltip.hidden {
    opacity: 0;
    transform: scale(0.9);
    pointer-events: none;
  }

  /* Tooltip arrow */
  .nextstep-tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
  }

  .nextstep-tooltip-arrow.bottom {
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: white;
  }

  .nextstep-tooltip-arrow.top {
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: white;
  }

  .nextstep-tooltip-arrow.right {
    left: -16px;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: white;
  }

  .nextstep-tooltip-arrow.left {
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: white;
  }

  /* Tooltip content */
  .nextstep-tooltip-header {
    margin-bottom: 12px;
  }

  .nextstep-tooltip-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .nextstep-tooltip-description {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #4b5563;
    margin: 0;
  }

  /* Progress indicator */
  .nextstep-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    color: #6b7280;
  }

  .nextstep-progress-dots {
    display: flex;
    gap: 6px;
    margin-left: 8px;
  }

  .nextstep-progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d1d5db;
    transition: background 0.2s ease;
  }

  .nextstep-progress-dot.active {
    background: #4f46e5;
  }

  .nextstep-progress-dot.completed {
    background: #10b981;
  }

  /* Navigation buttons */
  .nextstep-nav {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 20px;
  }

  .nextstep-nav-left {
    display: flex;
    gap: 8px;
  }

  .nextstep-nav-right {
    display: flex;
    gap: 8px;
  }

  .nextstep-button {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .nextstep-button:focus {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }

  .nextstep-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .nextstep-button-primary {
    background: #4f46e5;
    color: white;
  }

  .nextstep-button-primary:hover:not(:disabled) {
    background: #4338ca;
  }

  .nextstep-button-secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .nextstep-button-secondary:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .nextstep-button-text {
    background: transparent;
    color: #6b7280;
  }

  .nextstep-button-text:hover:not(:disabled) {
    color: #374151;
  }

  /* Success indicator for auto-progress */
  .nextstep-success-indicator {
    position: absolute;
    z-index: 1000001;
    background: #10b981;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    animation: successPop 0.3s ease;
  }

  @keyframes successPop {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Fade in animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .nextstep-backdrop,
  .nextstep-tooltip {
    animation: fadeIn 0.3s ease;
  }
`;
