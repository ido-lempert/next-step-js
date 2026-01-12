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

/**
 * CSS styles for the modal component (injected into Shadow DOM)
 */
export const MODAL_STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  .nextstep-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
    overflow-y: auto;
  }

  .nextstep-modal-backdrop.visible {
    opacity: 1;
  }

  .nextstep-modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
    position: relative;
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    transition: all 0.3s ease;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .nextstep-modal.visible {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .nextstep-modal-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .nextstep-modal-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.3;
    flex: 1;
  }

  .nextstep-modal-close {
    background: transparent;
    border: none;
    font-size: 28px;
    line-height: 1;
    color: #718096;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .nextstep-modal-close:hover {
    background: #f7fafc;
    color: #2d3748;
  }

  .nextstep-modal-close:focus-visible {
    outline: 2px solid #3182ce;
    outline-offset: 2px;
  }

  .nextstep-modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .nextstep-modal-step-content {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .nextstep-modal-step-content.visible {
    opacity: 1;
  }

  .nextstep-modal-description {
    font-size: 16px;
    line-height: 1.6;
    color: #4a5568;
    margin: 0 0 20px;
  }

  .nextstep-modal-image-container {
    margin: 0 0 20px;
    border-radius: 8px;
    overflow: hidden;
    background: #f7fafc;
  }

  .nextstep-modal-image {
    width: 100%;
    height: auto;
    display: block;
    max-height: 400px;
    object-fit: contain;
  }

  .nextstep-modal-image-loading {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0aec0;
    font-size: 14px;
  }

  .nextstep-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .nextstep-modal-footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .nextstep-modal-checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nextstep-modal-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #3182ce;
  }

  .nextstep-modal-checkbox-label {
    font-size: 14px;
    color: #4a5568;
    cursor: pointer;
    user-select: none;
  }

  .nextstep-modal-progress {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
    white-space: nowrap;
  }

  .nextstep-modal-buttons {
    display: flex;
    gap: 8px;
  }

  .nextstep-modal-btn {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
    white-space: nowrap;
  }

  .nextstep-modal-btn:focus-visible {
    outline: 2px solid #3182ce;
    outline-offset: 2px;
  }

  .nextstep-modal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nextstep-modal-btn-secondary {
    background: #e2e8f0;
    color: #2d3748;
  }

  .nextstep-modal-btn-secondary:hover:not(:disabled) {
    background: #cbd5e0;
  }

  .nextstep-modal-btn-primary {
    background: #3182ce;
    color: white;
  }

  .nextstep-modal-btn-primary:hover:not(:disabled) {
    background: #2c5aa0;
  }

  /* Step transition animations */
  @keyframes nextstep-modal-slide-in-right {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes nextstep-modal-slide-in-left {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .nextstep-modal-step-content.animate-forward {
    animation: nextstep-modal-slide-in-right 0.3s ease;
  }

  .nextstep-modal-step-content.animate-backward {
    animation: nextstep-modal-slide-in-left 0.3s ease;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .nextstep-modal {
      max-width: 100%;
      margin: 0;
      border-radius: 0;
      max-height: 100vh;
    }

    .nextstep-modal-header {
      padding: 20px 16px 12px;
    }

    .nextstep-modal-title {
      font-size: 20px;
    }

    .nextstep-modal-body {
      padding: 16px;
    }

    .nextstep-modal-footer {
      padding: 12px 16px;
      flex-direction: column;
      align-items: stretch;
    }

    .nextstep-modal-footer-left {
      flex-direction: column;
      align-items: flex-start;
    }

    .nextstep-modal-buttons {
      width: 100%;
    }

    .nextstep-modal-btn {
      flex: 1;
    }
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

  /* Prevent body scroll */
  body.nextstep-modal-open {
    overflow: hidden;
  }
`;
