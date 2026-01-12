# Next-Step Preview Extension

A Chrome/Edge extension that enables developers to preview Next-Step training scripts on any website without security restrictions.

## Overview

This extension solves the CSP (Content Security Policy) and X-Frame-Options problem that prevents loading customer websites in iframes during development. It allows Product Managers and developers to test training scripts in the actual application context before publishing to production.

## Features

- ✅ **Security Header Bypass**: Removes CSP, X-Frame-Options, and X-Content-Type-Options headers for preview mode
- ✅ **SDK Injection**: Automatically injects the Next-Step SDK into target pages
- ✅ **postMessage Communication**: Enables communication between Back Office and preview iframe
- ✅ **Per-Tab Control**: Enable/disable preview mode independently for each browser tab
- ✅ **Visual Feedback**: Icon badge and popup UI show active/inactive state
- ✅ **Developer-Friendly**: Simple toggle interface with clear instructions

## Installation

### Development Installation (Unpacked)

1. **Build the extension:**
   ```bash
   nx build chrome-extention
   ```

2. **Load in Chrome/Edge:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/libs/chrome-extention` directory

3. **Verify installation:**
   - You should see "Next-Step Preview Extension" in your extensions list
   - The extension icon will appear in your browser toolbar

### Production Installation (Packaged)

1. **Package the extension:**
   ```bash
   nx build chrome-extention
   nx run chrome-extention:package
   ```

2. **Install the ZIP:**
   - The packaged extension will be at `dist/chrome-extention.zip`
   - Drag and drop this file onto `chrome://extensions/` page
   - Or use the Chrome Web Store for distribution

## Usage

### Basic Usage

1. **Navigate to the website** you want to preview training scripts on

2. **Click the extension icon** in your browser toolbar

3. **Toggle "Preview Mode" ON**
   - The extension will reload the page
   - Icon badge will show "ON" in green
   - Status indicator will show "Active"

4. **Open Back Office** script editor in another tab

5. **Load the preview iframe** with your target website URL

6. **Test your training scripts** in the live context

7. **Toggle OFF when done** to restore normal security headers

### Preview Workflow

```
Developer → Enable Extension → Load Website
     ↓
Back Office → Open Script Editor → Load Preview iframe
     ↓
SDK Injection → Script Execution → Test & Iterate
```

## Architecture

### Components

#### 1. Manifest (manifest.json)
- Manifest V3 configuration
- Permissions: `activeTab`, `declarativeNetRequest`, `scripting`, `storage`
- Host permissions: `<all_urls>` (for security header modification)

#### 2. Background Service Worker (background.js)
- Manages declarativeNetRequest rules
- Handles preview mode enable/disable
- Maintains per-tab state
- Cleans up rules when tabs close

#### 3. Content Script (content.js)
- Injected into all pages at `document_start`
- Checks preview mode state
- Injects SDK when enabled
- Forwards messages between Back Office and SDK

#### 4. SDK Injection (sdk-inject.js)
- Runs in page context (not content script context)
- Provides `window.NextStep` API
- Listens for script load/update commands
- Fires custom events for script execution

#### 5. Popup UI (popup.html/js/css)
- Simple toggle interface
- Status indicator (active/inactive)
- Usage instructions
- Version info

### Security Header Bypass

The extension uses `declarativeNetRequest` to remove these headers:

- `Content-Security-Policy`
- `Content-Security-Policy-Report-Only`
- `X-Frame-Options`
- `X-Content-Type-Options`

**Important:** Rules are scoped to specific tab IDs to avoid affecting other browsing.

### Communication Protocol

#### Back Office → Content Script → SDK
```javascript
// Back Office sends
postMessage({ 
  type: 'NEXTSTEP_LOAD_SCRIPT', 
  payload: { id, steps, ... } 
}, '*')

// Content script forwards
postMessage({ 
  type: 'NEXTSTEP_SDK_LOAD', 
  source: 'nextstep-extension',
  payload: { ... } 
}, '*')
```

#### SDK → Content Script → Back Office
```javascript
// SDK sends
postMessage({ 
  type: 'NEXTSTEP_SDK_EVENT',
  source: 'nextstep-sdk',
  payload: { eventType: 'script_loaded', ... }
}, '*')

// Content script forwards to parent frame
window.parent.postMessage({ 
  type: 'NEXTSTEP_SDK_EVENT',
  source: 'nextstep-extension',
  payload: { ... }
}, '*')
```

## Development

### Building

```bash
# Build extension
nx build chrome-extention

# Build and package
nx run chrome-extention:package
```

### Testing

#### Manual Testing

Test on various websites with strict security policies:

- ✅ GitHub (strict CSP)
- ✅ Google (strict CSP)
- ✅ Banking sites (X-Frame-Options: DENY)
- ✅ Your target application

**Test Cases:**

1. **Enable/Disable Toggle**
   - Enable preview mode
   - Verify page reloads
   - Verify badge shows "ON"
   - Disable preview mode
   - Verify badge clears

2. **SDK Injection**
   - Enable preview mode
   - Open console
   - Check for `window.NextStep` object
   - Verify `previewMode: true`

3. **Header Removal**
   - Enable preview mode on a site with CSP
   - Load site in Back Office iframe
   - Verify no CSP errors in console
   - Verify page loads correctly

4. **Multi-Tab Support**
   - Open multiple tabs
   - Enable preview in Tab A only
   - Verify Tab B not affected
   - Verify independent state

5. **Tab Cleanup**
   - Enable preview mode
   - Close tab
   - Verify state cleaned up in storage

#### Automated Testing

Currently, extension testing is primarily manual due to the nature of browser extensions. Future improvements could include:

- Puppeteer/Playwright tests for extension installation
- Unit tests for message handlers (if extracted to testable modules)

### Project Structure

```
libs/chrome-extention/
├── src/
│   ├── manifest.json          # Manifest V3 config
│   ├── background.js          # Service worker
│   ├── content.js             # Content script
│   ├── sdk-inject.js          # SDK injection
│   ├── popup/
│   │   ├── popup.html         # Popup UI
│   │   ├── popup.js           # Popup logic
│   │   └── popup.css          # Popup styles
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── README.md
└── project.json
```

## Troubleshooting

### Extension not loading
- Verify Developer mode is enabled in `chrome://extensions/`
- Check for errors in extension details page
- Reload extension after code changes

### Preview mode not working
- Check browser console for errors
- Verify page was reloaded after enabling
- Check extension icon badge (should show "ON")
- Open popup and verify status is "Active"

### SDK not injecting
- Open DevTools console
- Look for "Next-Step SDK injection script loaded" message
- Check `window.NextStep` exists
- Verify `web_accessible_resources` in manifest

### Headers still blocking iframe
- Verify preview mode is enabled for the correct tab
- Check if site uses additional security mechanisms
- Some sites may have multiple layers of protection

### State not persisting
- Extension state is per-tab and per-session
- State clears when tab closes (by design)
- Check storage in DevTools → Application → Storage

## Security Considerations

⚠️ **Important Security Notes:**

- **Developer Tool Only**: This extension should only be used on development/test sites
- **Never use in production**: Header removal creates security vulnerabilities
- **Explicit activation**: User must manually enable preview mode per tab
- **Tab-scoped rules**: Rules only affect the specific tab where enabled
- **No default activation**: Extension is inactive by default

## Browser Compatibility

- ✅ **Chrome 88+**: Full support (Manifest V3)
- ✅ **Edge 88+**: Full support (Manifest V3)
- ❌ **Firefox**: Not supported (requires Manifest V2 adaptation)
- ❌ **Safari**: Not supported (different extension model)

## Future Enhancements

- [ ] Add script selection UI in popup
- [ ] Store API endpoint configuration
- [ ] Add logging/debugging panel
- [ ] Export preview session data
- [ ] Firefox compatibility (Manifest V2)
- [ ] Automated testing framework

## Contributing

1. Make changes to files in `libs/chrome-extention/src/`
2. Build with `nx build chrome-extention`
3. Test manually in Chrome
4. Submit PR with test results

## License

Part of the Next-Step project. See main repository for license details.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for errors
- Open an issue in the main repository
