// Content Script for Next-Step Preview Extension
// Injects SDK and manages communication between Back Office and SDK
// Also handles recording mode for AI script generation

import { recorder } from './lib/recorder.js';

(function () {
  console.log('Next-Step Preview Extension content script loaded');

  let isPreviewMode = false;
  let sdkInjected = false;

  // Check if this is inside an iframe (likely the Back Office preview iframe)
  // const isInIframe = window !== window.top;

  // Initialize: Check if preview mode is enabled
  async function initialize() {
    try {
      // Get current tab ID (if possible) or check storage
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PREVIEW_STATE',
        tabId: await getCurrentTabId(),
      });

      if (response.enabled) {
        isPreviewMode = true;
        injectSDK();
      }
    } catch (error) {
      console.log('Could not check preview state:', error);
    }
  }

  /**
   * Get current tab ID (helper for content scripts)
   */
  async function getCurrentTabId() {
    // Content scripts can't directly get tab ID, so we'll rely on storage pattern
    // The background script manages tab IDs, and we'll listen for messages instead
    return null;
  }

  /**
   * Inject the Next-Step SDK into the page
   */
  function injectSDK() {
    if (sdkInjected) {
      console.log('SDK already injected');
      return;
    }

    console.log('Injecting Next-Step SDK for preview mode');

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('sdk-inject.js');
    script.onload = () => {
      console.log('SDK script loaded');
      sdkInjected = true;

      // Notify page that preview mode is ready
      window.postMessage(
        {
          type: 'NEXTSTEP_PREVIEW_READY',
          source: 'nextstep-extension',
        },
        '*'
      );
    };

    script.onerror = () => {
      console.error('Failed to load SDK script');
    };

    (document.head || document.documentElement).appendChild(script);
  }

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    if (message.type === 'PREVIEW_ENABLED') {
      isPreviewMode = true;
      injectSDK();
      sendResponse({ success: true });
    }

    if (message.type === 'PREVIEW_DISABLED') {
      isPreviewMode = false;
      // Notify page to clean up SDK if needed
      window.postMessage(
        {
          type: 'NEXTSTEP_PREVIEW_DISABLED',
          source: 'nextstep-extension',
        },
        '*'
      );
      sendResponse({ success: true });
    }

    // Recording messages
    if (message.type === 'START_RECORDING') {
      recorder.start();
      sendResponse({ success: true });
    }

    if (message.type === 'STOP_RECORDING') {
      const recording = recorder.stop();
      sendResponse({ success: true, recording });
    }

    if (message.type === 'IS_RECORDING') {
      sendResponse({ isRecording: recorder.isActive() });
    }

    if (message.type === 'ADD_SCREENSHOT') {
      recorder.addScreenshot(message.interactionIndex, message.screenshot);
      sendResponse({ success: true });
    }

    return true;
  });

  /**
   * Listen for messages from the page (Back Office or SDK)
   */
  window.addEventListener('message', (event) => {
    // Only process messages if we're in preview mode
    if (!isPreviewMode && event.data.type !== 'NEXTSTEP_CHECK_PREVIEW') {
      return;
    }

    const message = event.data;

    // Handle messages from Back Office (in parent frame)
    if (message.type === 'NEXTSTEP_LOAD_SCRIPT') {
      console.log('Content script forwarding LOAD_SCRIPT to SDK:', message);
      // Forward to SDK in the page
      window.postMessage(
        {
          type: 'NEXTSTEP_SDK_LOAD',
          source: 'nextstep-extension',
          payload: message.payload,
        },
        '*'
      );
    }

    if (message.type === 'NEXTSTEP_UPDATE_SCRIPT') {
      console.log('Content script forwarding UPDATE_SCRIPT to SDK:', message);
      window.postMessage(
        {
          type: 'NEXTSTEP_SDK_UPDATE',
          source: 'nextstep-extension',
          payload: message.payload,
        },
        '*'
      );
    }

    if (message.type === 'NEXTSTEP_RELOAD_PAGE') {
      console.log('Content script received RELOAD_PAGE');
      window.location.reload();
    }

    // Handle messages from SDK
    if (message.type === 'NEXTSTEP_SDK_EVENT' && message.source === 'nextstep-sdk') {
      console.log('Content script forwarding SDK event to Back Office:', message);
      // Forward to Back Office (parent frame)
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'NEXTSTEP_SDK_EVENT',
            source: 'nextstep-extension',
            payload: message.payload,
          },
          '*'
        );
      }
    }

    // Respond to preview state checks
    if (message.type === 'NEXTSTEP_CHECK_PREVIEW') {
      window.postMessage(
        {
          type: 'NEXTSTEP_PREVIEW_STATE',
          source: 'nextstep-extension',
          enabled: isPreviewMode,
          sdkInjected: sdkInjected,
        },
        '*'
      );
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
