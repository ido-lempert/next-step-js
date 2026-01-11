# Story 4.1: Chrome Extension - Development Preview Tool

Status: ready-for-dev

## Story

As a **developer**,
I want to **install a Chrome Extension that allows me to preview scripts on customer websites without deploying to production**,
so that **I can test training content on live sites during development without security restrictions**.

## Acceptance Criteria

1. ✅ Extension available for Chrome/Edge
2. ✅ Extension injects SDK into any website
3. ✅ Extension bypasses CSP/X-Frame-Options for preview
4. ✅ Extension communicates with Back Office via postMessage
5. ✅ Extension enables iframe loading in Back Office
6. ✅ Extension icon shows active/inactive state

**Priority:** P0 (Critical)

## Business Context

The Chrome Extension is **critical for the preview workflow** - it solves the CSP/X-Frame-Options problem that prevents loading customer websites in iframes. This enables Product Managers to test scripts in the actual application context before publishing.

**Key Business Value:**

- Enables preview without production deployment
- Removes security barriers for development
- Core requirement for Back Office script editor

**Dependencies:**

- Story 1.3 complete (scripts)
- Story 2.1 or 3.1 (SDK components to inject)

## Tasks / Subtasks

### Extension Core

- [ ] **Task 1:** Manifest V3 setup (AC: #1)
  - [ ] 1.1: Create manifest.json
    - Version: Manifest V3
    - Permissions: activeTab, declarativeNetRequest, scripting, storage
    - Host permissions: <all_urls>
    - Background service worker
  - [ ] 1.2: Extension structure
    - background.js (service worker)
    - content.js (injected script)
    - popup.html/popup.js (extension icon UI)
    - icons (16x16, 48x48, 128x128)

- [ ] **Task 2:** CSP/X-Frame-Options bypass (AC: #3)
  - [ ] 2.1: declarativeNetRequest rules
    - Remove CSP header
    - Remove X-Frame-Options header
    - Remove X-Content-Type-Options if needed
    - Only modify headers for preview mode
  - [ ] 2.2: Dynamic rule registration
    - Add rules when extension activated
    - Remove rules when deactivated
    - Scope rules to specific tabs (preview iframe only)

- [ ] **Task 3:** SDK injection (AC: #2)
  - [ ] 3.1: Content script injection
    - Inject SDK script into page
    - Pass preview mode flag to SDK
    - Inject before page scripts run (document_start)
  - [ ] 3.2: SDK script loading
    - Load SDK from CDN or bundle with extension
    - Include version in injection
    - Handle SDK load failures gracefully

- [ ] **Task 4:** postMessage communication (AC: #4)
  - [ ] 4.1: Extension ↔ Back Office protocol
    - Listen for messages from Back Office
    - Messages: LOAD_SCRIPT, UPDATE_SCRIPT, RELOAD_PAGE
    - Forward to iframe via content script
  - [ ] 4.2: Content script ↔ SDK protocol
    - Forward script data to SDK
    - Listen for SDK events (step_completed, script_finished)
    - Forward events back to Back Office

- [ ] **Task 5:** Extension UI and state (AC: #6)
  - [ ] 5.1: Popup UI
    - Toggle: Enable/Disable preview mode
    - Status indicator: Active (green) / Inactive (gray)
    - Instructions for first-time users
  - [ ] 5.2: Icon badge
    - Show active state on icon
    - Update when enabled/disabled
    - Per-tab state management

### Testing

- [ ] **Task 6:** Extension tests
  - [ ] 6.1: Manual testing
    - Test on various websites (with/without CSP)
    - Test SDK injection
    - Test postMessage communication
  - [ ] 6.2: Automated tests (if possible)
    - Test rule creation/removal
    - Test message passing

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Manifest V3** [Source: architecture.md#Chrome Extension]
   - MUST use Manifest V3 (V2 deprecated)
   - declarativeNetRequest for header modification (V3 pattern)
   - Service worker for background script (not persistent page)

2. **Security Scope** [Source: architecture.md#Security]
   - Header modification ONLY in preview mode
   - Never modify headers in production SDK usage
   - Explicit user activation required

3. **Communication Protocol** [Source: architecture.md#Extension Communication]
   - postMessage for cross-origin iframe communication
   - Structured message format with type + payload
   - Origin validation on message receipt

### Project Structure Notes

**Extension Structure:**

```
libs/chrome-extension/
├── manifest.json              # Manifest V3 config
├── background.js              # Service worker
├── content.js                 # Content script (injected)
├── popup/
│   ├── popup.html            # Extension popup UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── sdk-inject.js             # SDK injection script
```

### Critical Implementation Details

1. **manifest.json (Manifest V3):**

```json
{
  "manifest_version": 3,
  "name": "Next-Step Preview Extension",
  "version": "1.0.0",
  "description": "Enable preview of Next-Step training scripts in iframe",
  "permissions": ["activeTab", "declarativeNetRequest", "declarativeNetRequestWithHostAccess", "scripting", "storage"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  }
}
```

2. **declarativeNetRequest Rules:**

```javascript
// background.js
const RULE_ID_CSP = 1;
const RULE_ID_XFRAME = 2;

async function enablePreviewMode(tabId) {
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
        responseHeaders: [{ header: 'x-frame-options', operation: 'remove' }],
      },
      condition: {
        tabIds: [tabId],
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    },
  ];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID_CSP, RULE_ID_XFRAME],
    addRules: rules,
  });

  // Store state
  await chrome.storage.local.set({ [`preview_${tabId}`]: true });
}
```

3. **SDK Injection via Content Script:**

```javascript
// content.js
(function () {
  // Check if preview mode enabled for this tab
  chrome.storage.local.get([`preview_${chrome.runtime.id}`], (result) => {
    if (result[`preview_${chrome.runtime.id}`]) {
      injectSDK();
    }
  });

  function injectSDK() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('sdk-inject.js');
    script.onload = () => {
      // SDK loaded, initialize in preview mode
      window.postMessage({ type: 'NEXTSTEP_PREVIEW_READY' }, '*');
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Listen for messages from Back Office
  window.addEventListener('message', (event) => {
    if (event.data.type === 'NEXTSTEP_LOAD_SCRIPT') {
      // Forward to SDK
      window.postMessage(
        {
          type: 'NEXTSTEP_SDK_LOAD',
          payload: event.data.payload,
        },
        '*',
      );
    }
  });
})();
```

4. **Popup UI State Management:**

```javascript
// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('preview-toggle');
  const status = document.getElementById('status');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if preview enabled for this tab
  const result = await chrome.storage.local.get([`preview_${tab.id}`]);
  const isEnabled = result[`preview_${tab.id}`] || false;

  toggle.checked = isEnabled;
  updateStatus(isEnabled);

  toggle.addEventListener('change', async () => {
    if (toggle.checked) {
      await chrome.runtime.sendMessage({ type: 'ENABLE_PREVIEW', tabId: tab.id });
      updateStatus(true);
    } else {
      await chrome.runtime.sendMessage({ type: 'DISABLE_PREVIEW', tabId: tab.id });
      updateStatus(false);
    }
  });
});

function updateStatus(enabled) {
  const status = document.getElementById('status');
  status.textContent = enabled ? 'Active' : 'Inactive';
  status.className = enabled ? 'status-active' : 'status-inactive';

  // Update icon badge
  chrome.action.setBadgeText({ text: enabled ? 'ON' : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
}
```

### Testing Standards

**Manual Testing:**

- Test on sites with strict CSP (GitHub, Google)
- Test on sites with X-Frame-Options: DENY
- Test SDK injection
- Test postMessage communication between Back Office and iframe
- Test on Chrome and Edge

**Extension Load Testing:**

- Load unpacked extension in Chrome
- Test on multiple tabs simultaneously
- Test state persistence across browser restarts

### References

- [Source: docs/planning-artifacts/prd.md#Epic 4] - User Story 4.1 requirements
- [Source: docs/planning-artifacts/architecture.md#Chrome Extension] - Manifest V3, security bypass

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL:**

- Manifest V3 required (V2 deprecated in 2024)
- declarativeNetRequest permission required for header modification
- Service worker for background (not persistent background page)

⚠️ **Common Mistakes:**

- Forgetting to include web_accessible_resources for injected scripts
- Not handling tab closure (cleanup rules)
- Not scoping rules to specific tabs (affects all browsing)

⚠️ **Security:**

- Only modify headers when explicitly enabled by user
- Clear rules when extension disabled
- Never enable by default

## Dev Agent Record

### Agent Model Used

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Dependencies:** Stories 1.3, 2.1 or 3.1  
**Next:** Story 4.2 (Back Office preview integration)
