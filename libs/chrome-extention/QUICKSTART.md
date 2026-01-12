# Quick Start Guide

## Installation (5 minutes)

### 1. Build the Extension
```bash
npx nx build chrome-extention
```

### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Navigate to and select: `dist/libs/chrome-extention`
5. Extension should now appear in your extensions list

### 3. Verify Installation
- Look for "Next-Step Preview Extension" in extensions list
- Check that extension icon appears in browser toolbar
- Click icon to open popup and verify UI loads

## Basic Usage

### Enable Preview Mode
1. Navigate to any website you want to test
2. Click the extension icon in toolbar
3. Toggle "Preview Mode" to ON
4. Page will reload with security headers removed
5. Icon badge will show "ON" in green

### Disable Preview Mode
1. Click extension icon
2. Toggle "Preview Mode" to OFF
3. Page will reload with normal security

### Verify SDK is Loaded
1. Enable preview mode on a page
2. Open DevTools console (F12)
3. Type: `window.NextStep`
4. Should see object with `previewMode: true`

## Testing with Back Office

Once Story 4.2 is complete:

1. Open Back Office in one tab
2. Navigate to Script Editor
3. In another tab, enable preview mode on target site
4. In Back Office, load target site URL in preview iframe
5. Test your training scripts!

## Troubleshooting

### Extension won't load
- Check Chrome version (needs 88+)
- Verify Developer mode is ON
- Check for manifest.json errors

### Preview mode not working
- Check page reloaded after enabling
- Look for errors in console
- Verify badge shows "ON"

### SDK not injecting
- Open console and look for load messages
- Check `window.NextStep` exists
- Verify preview mode is enabled

## Next Steps

See full documentation:
- `README.md` - Complete guide
- `TESTING.md` - 18 test cases
- Story file - Architecture details

## Support

For issues, check:
1. Browser console for errors
2. Extension background page console
3. Network tab for failed requests

Extension background console:
- Go to `chrome://extensions/`
- Find "Next-Step Preview Extension"
- Click "Inspect views: service worker"
