# Next-Step SDK

Interactive walkthrough and modal components for web applications. This SDK enables you to create step-by-step guided tours with spotlight effects, smart tooltip positioning, and progress tracking.

[![Bundle Size](https://img.shields.io/badge/bundle%20size-8.67KB-success)](https://bundlephobia.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## Features

- 🚀 **Simple Integration**: Add one script tag, start training users
- ✨ **Shadow DOM Isolation**: Complete CSS isolation prevents conflicts with host page styles
- 🎯 **Smart Positioning**: Tooltips automatically position themselves to stay within viewport
- 🎨 **Spotlight Effect**: Highlights target elements with smooth backdrop dimming
- ⌨️ **Keyboard Navigation**: Full keyboard support (Arrow keys, ESC, Enter)
- 📊 **Progress Tracking**: Built-in analytics and progress indicators
- ♿ **Accessibility**: ARIA labels, focus management, and screen reader support
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 📦 **Tiny Bundle**: Only 8.67KB gzipped
- 🎨 **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JS
- 🔄 **Auto-initialization**: Reads config from data attributes
- 🔌 **Zero Dependencies**: No external runtime dependencies

## Quick Start

### Option 1: CDN (Recommended)

Add this script tag to your HTML:

```html
<script 
  src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js"
  data-project-id="your-project-id"
></script>
```

That's it! The SDK will automatically initialize and fetch your scripts when the page loads.

### Option 2: npm Installation

```bash
npm install @nstep/sdk
```

#### Using the SDK via Global API

When using the CDN, the SDK is available via `window.NextStep`:

```javascript
// Get available scripts
const scripts = NextStep.getScripts();

// Start a walkthrough
const walkthrough = scripts.find(s => s.type === 'walkthrough');
if (walkthrough) {
  await NextStep.startWalkthrough(walkthrough.id);
}
```

#### Using the SDK via npm

```typescript
import { NextStepSDK } from '@nstep/sdk';

const sdk = new NextStepSDK();
await sdk.init({
  projectId: 'your-project-id',
  environment: 'production'
});

// Get and start scripts
const scripts = sdk.getScripts();
const walkthrough = scripts.find(s => s.type === 'walkthrough');
if (walkthrough) {
  await sdk.startWalkthrough(walkthrough.id);
}
```

## SDK Initialization API

### Global API (CDN)

When using the CDN, `window.NextStep` provides:

#### `NextStep.init(options): Promise<void>`

Initialize the SDK programmatically.

```javascript
await NextStep.init({
  projectId: 'your-project-id',
  environment: 'production',
  onReady: () => console.log('SDK ready'),
  onError: (error) => console.error('SDK error:', error)
});
```

#### `NextStep.isInitialized(): boolean`

Check if the SDK is initialized.

#### `NextStep.getScripts(): Script[]`

Get all available scripts for your project.

#### `NextStep.getScript(scriptId): Script | undefined`

Get a specific script by ID.

#### `NextStep.startWalkthrough(scriptId, config?): Promise<WalkthroughComponent>`

Start a walkthrough by script ID.

#### `NextStep.startModal(scriptId, config?): Promise<ModalComponent>`

Start a modal by script ID.

#### `NextStep.destroy(): void`

Clean up and destroy the SDK.

### Configuration Options

```typescript
interface InitOptions {
  projectId: string;              // Required: Your project ID
  apiKey?: string;                // Optional: API key for private projects
  environment?: 'development' | 'staging' | 'production';
  apiUrl?: string;                // Optional: Custom API endpoint
  debug?: boolean;                // Optional: Enable debug logs
  onReady?: () => void;          // Optional: Called when initialized
  onError?: (error: Error) => void; // Optional: Error callback
}
```

## Legacy API (Direct Usage)

You can still use the SDK directly without initialization:

### `startWalkthrough(script, config?)`

Initializes and starts a walkthrough immediately.

**Parameters:**
- `script`: Script object with steps
- `config?`: Optional configuration object

**Returns:** `Promise<WalkthroughComponent>`

### `createWalkthrough(config?)`

Creates a walkthrough component without starting it.

**Parameters:**
- `config?`: Optional configuration object

**Returns:** `WalkthroughComponent`

### Configuration Options

```typescript
interface WalkthroughConfig {
  backdropOpacity?: number;        // Default: 0.7
  spotlightPadding?: number;       // Default: 8 (pixels)
  animationDuration?: number;      // Default: 300 (ms)
  scrollOffset?: number;           // Default: 100 (pixels)
  maxRetries?: number;             // Default: 3
  onStepChange?: (step: ScriptStep, index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onError?: (error: Error) => void;
}
```

### Script Structure

```typescript
interface Script {
  id: string;
  productId: string;
  name: string;
  type: 'walkthrough' | 'modal';
  status: 'draft' | 'published';
  steps: ScriptStep[];
}

interface ScriptStep {
  id: string;
  scriptId: string;
  orderIndex: number;
  title: string;
  description: string;
  elementSelector?: string;  // CSS selector for target element
  actionType?: string;
  config?: Record<string, unknown>;
}
```

## Advanced Usage

### Custom Configuration

```typescript
import { startWalkthrough } from '@nstep/sdk';

await startWalkthrough(script, {
  backdropOpacity: 0.85,
  spotlightPadding: 12,
  scrollOffset: 120,
  onStepChange: (step, index) => {
    console.log(`Step ${index + 1}: ${step.title}`);
  },
  onComplete: () => {
    console.log('Walkthrough completed!');
    // Track completion in your analytics
  },
  onSkip: () => {
    console.log('User skipped the walkthrough');
  },
  onError: (error) => {
    console.error('Walkthrough error:', error);
  }
});
```

### Manual Control

```typescript
import { createWalkthrough } from '@nstep/sdk';

const walkthrough = createWalkthrough({
  onStepChange: (step) => {
    // Custom logic per step
  }
});

// Start when ready
await walkthrough.start(script);

// Check if active
if (walkthrough.isWalkthroughActive()) {
  console.log('Walkthrough is running');
}

// Get current step
const currentStep = walkthrough.getCurrentStepIndex();

// Destroy manually
await walkthrough.destroy();
```

### Analytics Integration

The SDK automatically tracks events in localStorage:

```typescript
// Retrieve analytics events
const events = localStorage.getItem('nextstep_analytics');
const analyticsData = JSON.parse(events || '[]');

analyticsData.forEach(event => {
  console.log(event.type, event.timestamp);
  // Send to your analytics service
});
```

Event types:
- `step_view`: When a step is shown
- `navigation`: User navigates (next, back, skip)
- `complete`: Walkthrough completed
- `skip`: Walkthrough skipped
- `error`: Error occurred

## Keyboard Shortcuts

- **→ / Enter**: Next step
- **←**: Previous step  
- **ESC**: Skip walkthrough

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Android 90+

## Building

Run `nx build sdk` to build the library.

## Running Unit Tests

Run `nx test sdk` to execute the unit tests via [Jest](https://jestjs.io).

## Demo

See `demo.html` for a complete working example.

## Architecture

The SDK uses:
- **Shadow DOM** for complete CSS isolation
- **Web Components** standards
- **TypeScript** for type safety
- **Zero dependencies** for minimal bundle size

Components:
- `WalkthroughComponent`: Main orchestrator
- `SpotlightOverlay`: Backdrop and spotlight effect
- `StepTooltip`: Content popover with smart positioning
- `ProgressIndicator`: Visual progress display

## License

See the LICENSE file in the project root.

## Support

For issues and feature requests, please use the GitHub issue tracker.
