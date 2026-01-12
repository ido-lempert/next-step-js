# Chrome Extension Testing Guide

## Manual Testing Procedures

This document outlines the testing procedures for the Next-Step Preview Extension.

## Prerequisites

1. Chrome or Edge browser (version 88+)
2. Extension built: `npx nx build chrome-extention`
3. Extension loaded in browser (see Installation below)

## Installation for Testing

1. Open Chrome/Edge
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select `dist/libs/chrome-extention` directory
6. Verify extension appears in list

## Test Cases

### Test 1: Extension Installation

**Objective:** Verify extension installs correctly

**Steps:**
1. Follow installation procedure above
2. Check extensions list shows "Next-Step Preview Extension"
3. Check extension icon appears in browser toolbar
4. Click extension icon to open popup

**Expected Results:**
- ✅ Extension appears in extensions list
- ✅ Extension icon visible in toolbar
- ✅ Popup opens with toggle UI
- ✅ Status shows "Inactive"
- ✅ Toggle is OFF

### Test 2: Enable Preview Mode

**Objective:** Verify preview mode can be enabled

**Steps:**
1. Navigate to any website (e.g., https://example.com)
2. Click extension icon
3. Toggle "Preview Mode" ON
4. Wait for page to reload

**Expected Results:**
- ✅ Toggle switches to ON
- ✅ Page reloads automatically
- ✅ Extension badge shows "ON" in green
- ✅ Status indicator shows "Active" in green
- ✅ Console shows "Next-Step SDK injection script loaded"
- ✅ `window.NextStep` object exists in console

**Verification:**
```javascript
// In browser console
console.log(window.NextStep);
// Should show: { previewMode: true, version: "1.0.0-preview", ... }
```

### Test 3: Disable Preview Mode

**Objective:** Verify preview mode can be disabled

**Steps:**
1. With preview mode enabled (from Test 2)
2. Click extension icon
3. Toggle "Preview Mode" OFF
4. Wait for page to reload

**Expected Results:**
- ✅ Toggle switches to OFF
- ✅ Page reloads automatically
- ✅ Extension badge clears (no "ON" text)
- ✅ Status indicator shows "Inactive" in gray
- ✅ `window.NextStep` may be undefined or cleaned up

### Test 4: Security Header Bypass (CSP)

**Objective:** Verify CSP headers are removed

**Test Sites:**
- GitHub.com (has strict CSP)
- Google.com (has strict CSP)

**Steps:**
1. Navigate to GitHub.com
2. Enable preview mode
3. Open DevTools → Network tab
4. Refresh page
5. Click on main document request
6. Check Response Headers

**Expected Results:**
- ✅ No `Content-Security-Policy` header in response
- ✅ No CSP errors in console
- ✅ Page loads normally

**Alternative Test:**
1. Create a test HTML file with iframe:
```html
<!DOCTYPE html>
<html>
<body>
  <iframe src="https://github.com" width="800" height="600"></iframe>
</body>
</html>
```
2. Open in browser
3. Without extension: should show blank/error
4. With preview mode: should load GitHub in iframe

### Test 5: Security Header Bypass (X-Frame-Options)

**Objective:** Verify X-Frame-Options headers are removed

**Steps:**
1. Find a site with X-Frame-Options: DENY (many banking sites)
2. Enable preview mode
3. Try to load site in an iframe (using test HTML from Test 4)

**Expected Results:**
- ✅ Site loads in iframe without errors
- ✅ No "Refused to display" errors in console

### Test 6: Multi-Tab Independence

**Objective:** Verify preview mode is per-tab

**Steps:**
1. Open Tab A: Navigate to example.com
2. Open Tab B: Navigate to github.com
3. In Tab A: Enable preview mode
4. In Tab B: Check extension popup

**Expected Results:**
- ✅ Tab A shows "Active" status
- ✅ Tab A badge shows "ON"
- ✅ Tab B shows "Inactive" status
- ✅ Tab B badge is empty
- ✅ Enabling in Tab B doesn't affect Tab A

### Test 7: Tab Cleanup

**Objective:** Verify state is cleaned up when tab closes

**Steps:**
1. Open a new tab
2. Enable preview mode
3. Note the tab ID (visible in popup if logged)
4. Close the tab
5. Open a new tab
6. Check extension storage

**Expected Results:**
- ✅ Old tab's preview state removed from storage
- ✅ New tab starts with preview mode OFF
- ✅ No memory leaks or lingering rules

**Verification:**
Open DevTools → Application → Storage → Extension storage
- Should not see `preview_{old_tab_id}` entries

### Test 8: Page Navigation

**Objective:** Verify preview mode persists across navigation

**Steps:**
1. Navigate to example.com
2. Enable preview mode
3. Click a link to navigate to another page on same domain
4. Check extension state

**Expected Results:**
- ✅ Preview mode remains enabled
- ✅ Badge still shows "ON"
- ✅ SDK re-injected on new page
- ✅ `window.NextStep` available on new page

### Test 9: postMessage Communication

**Objective:** Verify message passing works

**Steps:**
1. Enable preview mode on any site
2. Open browser console
3. Send test message from console:
```javascript
window.postMessage({
  type: 'NEXTSTEP_LOAD_SCRIPT',
  payload: { 
    id: 'test-123', 
    name: 'Test Script',
    steps: []
  }
}, '*');
```
4. Check console for logs

**Expected Results:**
- ✅ Content script receives message
- ✅ Message forwarded to SDK
- ✅ Console shows "SDK received LOAD command"
- ✅ SDK fires 'script_loaded' event

### Test 10: SDK Events

**Objective:** Verify SDK events are forwarded

**Steps:**
1. Enable preview mode
2. Open console
3. Listen for SDK events:
```javascript
window.addEventListener('nextstep:script-loaded', (e) => {
  console.log('Script loaded event:', e.detail);
});
```
4. Send load script message (from Test 9)

**Expected Results:**
- ✅ Custom event fires
- ✅ Event detail contains script data
- ✅ Event forwarded to parent frame (if in iframe)

### Test 11: Extension Popup UI

**Objective:** Verify popup UI is functional and styled

**Steps:**
1. Click extension icon
2. Examine popup UI

**Expected Results:**
- ✅ Popup is 350px wide
- ✅ Header has gradient background
- ✅ Toggle switch is styled and functional
- ✅ Status indicator changes color (green/gray)
- ✅ Instructions are visible and readable
- ✅ Warning section is visible
- ✅ Version number shown at bottom

### Test 12: Background Service Worker

**Objective:** Verify background service worker is running

**Steps:**
1. Go to `chrome://extensions/`
2. Find "Next-Step Preview Extension"
3. Click "Service worker" link (if active)
4. Or click "Inspect views: service worker"

**Expected Results:**
- ✅ Service worker console opens
- ✅ Console shows "Next-Step Preview Extension background service worker initialized"
- ✅ No errors in console
- ✅ Can send messages from popup to background

### Test 13: Web Accessible Resources

**Objective:** Verify sdk-inject.js is accessible

**Steps:**
1. Enable preview mode
2. Open DevTools → Network tab
3. Look for sdk-inject.js request

**Expected Results:**
- ✅ Request to `chrome-extension://[id]/sdk-inject.js` succeeds
- ✅ Status 200
- ✅ Script loads and executes
- ✅ No CORS or access errors

### Test 14: Error Handling

**Objective:** Verify graceful error handling

**Test scenarios:**

**A. Enable on extension error:**
1. Simulate background script error (if possible)
2. Try to enable preview mode
3. Should show error message

**B. Invalid message:**
1. Enable preview mode
2. Send invalid message format
3. Should not crash extension

**C. Tab doesn't exist:**
1. Get a tab ID for a closed tab
2. Try to enable preview for that tab
3. Should handle gracefully

**Expected Results:**
- ✅ No extension crashes
- ✅ Error messages shown to user
- ✅ Console logs errors for debugging
- ✅ Extension remains functional

## Performance Testing

### Test 15: Extension Performance

**Objective:** Verify extension doesn't slow down browsing

**Steps:**
1. Open 10+ tabs with preview mode disabled
2. Browse normally
3. Check Chrome Task Manager (Shift+Esc)

**Expected Results:**
- ✅ Minimal memory usage (<50MB)
- ✅ No CPU usage when inactive
- ✅ Page loads not delayed

### Test 16: With Preview Mode Enabled

**Steps:**
1. Enable preview mode on 5 tabs
2. Check Chrome Task Manager

**Expected Results:**
- ✅ Memory usage reasonable (<100MB)
- ✅ No significant CPU usage
- ✅ No impact on other tabs

## Browser Compatibility

### Test 17: Chrome Compatibility

**Objective:** Verify works on Chrome

**Chrome Versions to Test:**
- Chrome 88 (minimum Manifest V3 support)
- Chrome 120+ (current stable)
- Chrome Canary (latest dev)

**Expected Results:**
- ✅ Extension loads successfully
- ✅ All features work as expected

### Test 18: Edge Compatibility

**Objective:** Verify works on Edge

**Steps:**
1. Install extension on Edge
2. Run all test cases above

**Expected Results:**
- ✅ All tests pass on Edge
- ✅ No Edge-specific issues

## Regression Testing

After any code changes, run:

1. Test 1 (Installation)
2. Test 2 (Enable)
3. Test 3 (Disable)
4. Test 4 (CSP bypass)
5. Test 6 (Multi-tab)
6. Test 9 (postMessage)

## Known Limitations

- ❌ Does not work on `chrome://` or `chrome-extension://` URLs (browser security)
- ❌ Does not work on Chrome Web Store pages
- ❌ Does not work on `file://` URLs (requires additional permissions)
- ⚠️ Some sites may have additional security layers beyond headers

## Troubleshooting Test Failures

### Extension won't install
- Check Chrome version (needs 88+)
- Check Developer mode is enabled
- Check manifest.json syntax
- Check for file permission errors

### Preview mode enables but doesn't work
- Check browser console for errors
- Verify page reloaded after enabling
- Check Network tab for header removal
- Verify web_accessible_resources configured

### SDK not injecting
- Check content script is loaded (DevTools → Sources)
- Verify sdk-inject.js is accessible
- Check for JavaScript errors
- Verify `run_at: document_start` in manifest

### Messages not passing
- Check origin validation
- Verify postMessage format
- Check iframe context (parent/child)
- Look for console errors

## Test Results Template

```
Test Run: [Date]
Browser: [Chrome/Edge] [Version]
Extension Version: 1.0.0

[ ] Test 1: Extension Installation - PASS/FAIL
[ ] Test 2: Enable Preview Mode - PASS/FAIL
[ ] Test 3: Disable Preview Mode - PASS/FAIL
[ ] Test 4: Security Header Bypass (CSP) - PASS/FAIL
[ ] Test 5: Security Header Bypass (X-Frame) - PASS/FAIL
[ ] Test 6: Multi-Tab Independence - PASS/FAIL
[ ] Test 7: Tab Cleanup - PASS/FAIL
[ ] Test 8: Page Navigation - PASS/FAIL
[ ] Test 9: postMessage Communication - PASS/FAIL
[ ] Test 10: SDK Events - PASS/FAIL
[ ] Test 11: Extension Popup UI - PASS/FAIL
[ ] Test 12: Background Service Worker - PASS/FAIL
[ ] Test 13: Web Accessible Resources - PASS/FAIL
[ ] Test 14: Error Handling - PASS/FAIL
[ ] Test 15: Extension Performance - PASS/FAIL
[ ] Test 16: With Preview Mode Enabled - PASS/FAIL
[ ] Test 17: Chrome Compatibility - PASS/FAIL
[ ] Test 18: Edge Compatibility - PASS/FAIL

Notes: [Any issues or observations]
```

## Automated Testing (Future)

Currently not implemented. Future considerations:

- Puppeteer tests for extension loading
- Automated header verification
- Integration tests with Back Office
- E2E tests for full preview workflow

## Conclusion

This testing guide ensures comprehensive validation of the Chrome Extension Preview feature. All tests should pass before considering the implementation complete.