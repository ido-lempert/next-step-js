// Background Service Worker for Next-Step Preview Extension
// Handles declarativeNetRequest rules for CSP/X-Frame-Options bypass

const RULE_ID_CSP = 1;
const RULE_ID_XFRAME = 2;
const RULE_ID_CORS = 3;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE_PREVIEW') {
    enablePreviewMode(message.tabId)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Failed to enable preview mode:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (message.type === 'DISABLE_PREVIEW') {
    disablePreviewMode(message.tabId)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Failed to disable preview mode:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_PREVIEW_STATE') {
    getPreviewState(message.tabId)
      .then((isEnabled) => {
        sendResponse({ enabled: isEnabled });
      })
      .catch((error) => {
        console.error('Failed to get preview state:', error);
        sendResponse({ enabled: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

/**
 * Enable preview mode for a specific tab
 * @param {number} tabId - The tab ID to enable preview mode for
 */
async function enablePreviewMode(tabId) {
  console.log(`Enabling preview mode for tab ${tabId}`);

  // Create rules to remove security headers
  const rules = [
    {
      id: RULE_ID_CSP,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'content-security-policy', operation: 'remove' },
          { header: 'content-security-policy-report-only', operation: 'remove' },
        ],
      },
      condition: {
        tabIds: [tabId],
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    },
    {
      id: RULE_ID_XFRAME,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'x-frame-options', operation: 'remove' },
        ],
      },
      condition: {
        tabIds: [tabId],
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    },
    {
      id: RULE_ID_CORS,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'x-content-type-options', operation: 'remove' },
        ],
      },
      condition: {
        tabIds: [tabId],
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    },
  ];

  // Update dynamic rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID_CSP, RULE_ID_XFRAME, RULE_ID_CORS],
    addRules: rules,
  });

  // Store preview state for this tab
  await chrome.storage.local.set({ [`preview_${tabId}`]: true });

  // Update icon badge
  await chrome.action.setBadgeText({ text: 'ON', tabId });
  await chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId });

  // Inject content script to notify page
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PREVIEW_ENABLED' });
  } catch (error) {
    console.log('Could not send message to tab (may not have content script yet):', error.message);
  }

  console.log(`Preview mode enabled for tab ${tabId}`);
}

/**
 * Disable preview mode for a specific tab
 * @param {number} tabId - The tab ID to disable preview mode for
 */
async function disablePreviewMode(tabId) {
  console.log(`Disabling preview mode for tab ${tabId}`);

  // Remove dynamic rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID_CSP, RULE_ID_XFRAME, RULE_ID_CORS],
  });

  // Remove preview state for this tab
  await chrome.storage.local.remove([`preview_${tabId}`]);

  // Clear icon badge
  await chrome.action.setBadgeText({ text: '', tabId });

  // Notify content script
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PREVIEW_DISABLED' });
  } catch (error) {
    console.log('Could not send message to tab:', error.message);
  }

  console.log(`Preview mode disabled for tab ${tabId}`);
}

/**
 * Get preview state for a specific tab
 * @param {number} tabId - The tab ID to check
 * @returns {Promise<boolean>} - Whether preview mode is enabled
 */
async function getPreviewState(tabId) {
  const result = await chrome.storage.local.get([`preview_${tabId}`]);
  return result[`preview_${tabId}`] || false;
}

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log(`Tab ${tabId} closed, cleaning up`);
  await chrome.storage.local.remove([`preview_${tabId}`]);
});

// Clean up when tabs are updated (navigated away)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // Check if preview mode was enabled for this tab
    const result = await chrome.storage.local.get([`preview_${tabId}`]);
    if (result[`preview_${tabId}`]) {
      console.log(`Tab ${tabId} navigated, re-applying preview mode`);
      // Re-apply preview mode for new page
      await enablePreviewMode(tabId);
    }
  }
});

console.log('Next-Step Preview Extension background service worker initialized');
