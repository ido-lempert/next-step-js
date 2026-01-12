// Recorder - Captures user interactions for AI script generation
import { generateSelector, getElementText } from './selector-generator.js';

class Recorder {
  constructor() {
    this.isRecording = false;
    this.sessionId = null;
    this.interactions = [];
    this.startTime = null;
    this.startUrl = null;
    this.pageTitle = null;
    this.eventListeners = new Map();
  }

  /**
   * Start recording user interactions
   */
  start() {
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    this.isRecording = true;
    this.sessionId = this.generateSessionId();
    this.interactions = [];
    this.startTime = Date.now();
    this.startUrl = window.location.href;
    this.pageTitle = document.title;

    console.log('[Recorder] Started recording session:', this.sessionId);

    // Attach event listeners
    this.attachEventListeners();

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'RECORDING_STARTED',
      sessionId: this.sessionId,
    });
  }

  /**
   * Stop recording
   */
  stop() {
    if (!this.isRecording) {
      console.warn('No recording in progress');
      return null;
    }

    this.isRecording = false;
    const endTime = Date.now();

    // Remove event listeners
    this.removeEventListeners();

    const recording = {
      sessionId: this.sessionId,
      startUrl: this.startUrl,
      pageTitle: this.pageTitle,
      startTime: this.startTime,
      endTime,
      duration: endTime - this.startTime,
      interactions: this.interactions,
      metadata: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    console.log('[Recorder] Stopped recording. Total interactions:', this.interactions.length);

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'RECORDING_STOPPED',
      recording,
    });

    return recording;
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Attach event listeners to capture interactions
   */
  attachEventListeners() {
    // Click events
    const clickHandler = (e) => this.handleClick(e);
    document.addEventListener('click', clickHandler, true);
    this.eventListeners.set('click', clickHandler);

    // Input events (debounced)
    const inputHandler = this.debounce((e) => this.handleInput(e), 500);
    document.addEventListener('input', inputHandler, true);
    this.eventListeners.set('input', inputHandler);

    // Navigation events
    const navigationHandler = (e) => this.handleNavigation(e);
    window.addEventListener('popstate', navigationHandler);
    this.eventListeners.set('navigation', navigationHandler);

    // Scroll events (throttled)
    const scrollHandler = this.throttle((e) => this.handleScroll(e), 1000);
    window.addEventListener('scroll', scrollHandler, true);
    this.eventListeners.set('scroll', scrollHandler);
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    const clickHandler = this.eventListeners.get('click');
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true);
    }

    const inputHandler = this.eventListeners.get('input');
    if (inputHandler) {
      document.removeEventListener('input', inputHandler, true);
    }

    const navigationHandler = this.eventListeners.get('navigation');
    if (navigationHandler) {
      window.removeEventListener('popstate', navigationHandler);
    }

    const scrollHandler = this.eventListeners.get('scroll');
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler, true);
    }

    this.eventListeners.clear();
  }

  /**
   * Handle click events
   */
  handleClick(event) {
    if (!this.isRecording) return;

    const element = event.target;
    const selector = generateSelector(element);
    const elementText = getElementText(element);

    const interaction = {
      type: 'click',
      timestamp: Date.now(),
      selector,
      elementText,
      elementType: element.tagName.toLowerCase(),
      url: window.location.href,
    };

    this.interactions.push(interaction);
    console.log('[Recorder] Click:', interaction);

    // Request screenshot from background
    this.requestScreenshot(this.interactions.length - 1);
  }

  /**
   * Handle input events
   */
  handleInput(event) {
    if (!this.isRecording) return;

    const element = event.target;
    const selector = generateSelector(element);
    const elementText = getElementText(element);

    // Sanitize value (don't record passwords or sensitive data)
    let value = null;
    if (element.type !== 'password' && element.type !== 'hidden') {
      value = element.value ? '[user input]' : null;
    }

    const interaction = {
      type: 'input',
      timestamp: Date.now(),
      selector,
      elementText,
      elementType: element.tagName.toLowerCase(),
      value,
      url: window.location.href,
    };

    this.interactions.push(interaction);
    console.log('[Recorder] Input:', interaction);

    // Request screenshot from background
    this.requestScreenshot(this.interactions.length - 1);
  }

  /**
   * Handle navigation events
   */
  handleNavigation() {
    if (!this.isRecording) return;

    const interaction = {
      type: 'navigation',
      timestamp: Date.now(),
      url: window.location.href,
      selector: null,
    };

    this.interactions.push(interaction);
    console.log('[Recorder] Navigation:', interaction);
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    if (!this.isRecording) return;

    const interaction = {
      type: 'scroll',
      timestamp: Date.now(),
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY,
      },
      url: window.location.href,
      selector: null,
    };

    this.interactions.push(interaction);
    console.log('[Recorder] Scroll:', interaction);
  }

  /**
   * Request screenshot from background script
   */
  requestScreenshot(interactionIndex) {
    chrome.runtime.sendMessage({
      type: 'CAPTURE_SCREENSHOT',
      sessionId: this.sessionId,
      interactionIndex,
    });
  }

  /**
   * Add screenshot to an interaction
   */
  addScreenshot(interactionIndex, screenshot) {
    if (interactionIndex >= 0 && interactionIndex < this.interactions.length) {
      this.interactions[interactionIndex].screenshot = screenshot;
    }
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Get current recording data
   */
  getRecording() {
    return {
      sessionId: this.sessionId,
      startUrl: this.startUrl,
      pageTitle: this.pageTitle,
      startTime: this.startTime,
      interactions: this.interactions,
      metadata: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };
  }

  /**
   * Check if currently recording
   */
  isActive() {
    return this.isRecording;
  }
}

// Export singleton instance
export const recorder = new Recorder();
