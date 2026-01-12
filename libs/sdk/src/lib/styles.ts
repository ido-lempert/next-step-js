/**
 * CSS styles for the walkthrough component (injected into Shadow DOM)
 */

export const WALKTHROUGH_STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  .nextstep-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .nextstep-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 0.3s ease;
  }

  .nextstep-spotlight {
    position: absolute;
    background: transparent;
    pointer-events: auto;
    transition: all 0.3s ease;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
    border-radius: 4px;
  }

  .nextstep-tooltip {
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 0;
    z-index: 1000000;
    max-width: 400px;
    min-width: 280px;
    pointer-events: auto;
    transition: all 0.3s ease;
    opacity: 0;
    transform: scale(0.95);
  }

  .nextstep-tooltip.visible {
    opacity: 1;
    transform: scale(1);
  }

  .nextstep-tooltip-arrow {
    position: absolute;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
  }

  .nextstep-tooltip-arrow.top {
    bottom: -6px;
    left: 50%;
    margin-left: -6px;
  }

  .nextstep-tooltip-arrow.bottom {
    top: -6px;
    left: 50%;
    margin-left: -6px;
  }

  .nextstep-tooltip-arrow.left {
    right: -6px;
    top: 50%;
    margin-top: -6px;
  }

  .nextstep-tooltip-arrow.right {
    left: -6px;
    top: 50%;
    margin-top: -6px;
  }

  .nextstep-tooltip-content {
    padding: 20px;
  }

  .nextstep-tooltip-header {
    margin: 0 0 12px 0;
    padding: 0;
  }

  .nextstep-tooltip-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.4;
  }

  .nextstep-tooltip-description {
    font-size: 14px;
    line-height: 1.6;
    color: #4a5568;
    margin: 0;
  }

  .nextstep-tooltip-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
  }

  .nextstep-progress {
    font-size: 13px;
    color: #718096;
    font-weight: 500;
  }

  .nextstep-progress-dots {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 8px;
  }

  .nextstep-progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e0;
    transition: all 0.2s ease;
  }

  .nextstep-progress-dot.completed {
    background: #3182ce;
  }

  .nextstep-progress-dot.current {
    background: #3182ce;
    transform: scale(1.25);
  }

  .nextstep-buttons {
    display: flex;
    gap: 8px;
  }

  .nextstep-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
  }

  .nextstep-btn:focus-visible {
    outline: 2px solid #3182ce;
    outline-offset: 2px;
  }

  .nextstep-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nextstep-btn-secondary {
    background: #e2e8f0;
    color: #2d3748;
  }

  .nextstep-btn-secondary:hover:not(:disabled) {
    background: #cbd5e0;
  }

  .nextstep-btn-primary {
    background: #3182ce;
    color: white;
  }

  .nextstep-btn-primary:hover:not(:disabled) {
    background: #2c5aa0;
  }

  .nextstep-btn-skip {
    background: transparent;
    color: #718096;
    padding: 8px 12px;
  }

  .nextstep-btn-skip:hover:not(:disabled) {
    color: #4a5568;
    background: #f7fafc;
  }

  /* Fade in animation */
  @keyframes nextstep-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .nextstep-overlay.visible {
    animation: nextstep-fade-in 0.3s ease;
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
