// SDK Injection Script for Next-Step Preview Extension
// This script runs in the page context (not content script context)

(function () {
  console.log('Next-Step SDK injection script loaded');

  // Initialize SDK in preview mode
  window.NextStep = window.NextStep || {};
  window.NextStep.previewMode = true;
  window.NextStep.version = '1.0.0-preview';

  // SDK State
  let currentScript = null;
  let isInitialized = false;

  /**
   * Initialize the SDK
   */
  function initialize() {
    if (isInitialized) {
      console.log('SDK already initialized');
      return;
    }

    console.log('Initializing Next-Step SDK in preview mode');

    // Set up SDK API
    window.NextStep.loadScript = loadScript;
    window.NextStep.updateScript = updateScript;
    window.NextStep.getCurrentScript = () => currentScript;
    window.NextStep.clearScript = clearScript;

    // Listen for messages from content script
    window.addEventListener('message', handleMessage);

    isInitialized = true;

    // Notify that SDK is ready
    notifySDKReady();
  }

  /**
   * Handle messages from extension content script
   */
  function handleMessage(event) {
    if (event.data.source !== 'nextstep-extension') {
      return;
    }

    const message = event.data;

    if (message.type === 'NEXTSTEP_SDK_LOAD') {
      console.log('SDK received LOAD command:', message.payload);
      loadScript(message.payload);
    }

    if (message.type === 'NEXTSTEP_SDK_UPDATE') {
      console.log('SDK received UPDATE command:', message.payload);
      updateScript(message.payload);
    }

    if (message.type === 'NEXTSTEP_PREVIEW_DISABLED') {
      console.log('SDK received PREVIEW_DISABLED');
      clearScript();
    }
  }

  /**
   * Load a script for preview
   * @param {Object} scriptData - The script data to load
   */
  function loadScript(scriptData) {
    console.log('Loading script:', scriptData);
    currentScript = scriptData;

    // Fire script loaded event
    const event = new CustomEvent('nextstep:script-loaded', {
      detail: scriptData,
    });
    window.dispatchEvent(event);

    // Notify extension
    notifySDKEvent('script_loaded', { scriptId: scriptData.id });

    // Auto-start the script if configured
    if (scriptData.autoStart !== false) {
      startScript();
    }
  }

  /**
   * Update the current script
   * @param {Object} scriptData - Updated script data
   */
  function updateScript(scriptData) {
    console.log('Updating script:', scriptData);
    currentScript = scriptData;

    // Fire script updated event
    const event = new CustomEvent('nextstep:script-updated', {
      detail: scriptData,
    });
    window.dispatchEvent(event);

    // Notify extension
    notifySDKEvent('script_updated', { scriptId: scriptData.id });
  }

  /**
   * Start executing the current script
   */
  function startScript() {
    if (!currentScript) {
      console.warn('No script loaded to start');
      return;
    }

    console.log('Starting script execution:', currentScript.id);

    // Fire script started event
    const event = new CustomEvent('nextstep:script-started', {
      detail: currentScript,
    });
    window.dispatchEvent(event);

    // Notify extension
    notifySDKEvent('script_started', { scriptId: currentScript.id });

    // TODO: Actual script execution logic would go here
    // For now, this is a placeholder for the preview mode
    console.log('Script execution would start here with steps:', currentScript.steps);
  }

  /**
   * Clear the current script
   */
  function clearScript() {
    if (currentScript) {
      const scriptId = currentScript.id;
      currentScript = null;

      // Fire script cleared event
      const event = new CustomEvent('nextstep:script-cleared', {
        detail: { scriptId },
      });
      window.dispatchEvent(event);

      // Notify extension
      notifySDKEvent('script_cleared', { scriptId });
    }
  }

  /**
   * Notify extension of SDK events
   * @param {string} eventType - The event type
   * @param {Object} payload - Event payload
   */
  function notifySDKEvent(eventType, payload) {
    window.postMessage(
      {
        type: 'NEXTSTEP_SDK_EVENT',
        source: 'nextstep-sdk',
        payload: {
          eventType,
          ...payload,
          timestamp: Date.now(),
        },
      },
      '*'
    );
  }

  /**
   * Notify that SDK is ready
   */
  function notifySDKReady() {
    console.log('SDK ready for preview');
    notifySDKEvent('sdk_ready', { version: window.NextStep.version });
  }

  // Initialize immediately
  initialize();
})();
