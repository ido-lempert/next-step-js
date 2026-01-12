# Next-Step SDK

Interactive walkthrough component for web applications. This SDK enables you to create step-by-step guided tours with spotlight effects, smart tooltip positioning, and progress tracking.

## Features

- ✨ **Shadow DOM Isolation**: Complete CSS isolation prevents conflicts with host page styles
- 🎯 **Smart Positioning**: Tooltips automatically position themselves to stay within viewport
- 🎨 **Spotlight Effect**: Highlights target elements with smooth backdrop dimming
- ⌨️ **Keyboard Navigation**: Full keyboard support (Arrow keys, ESC, Enter)
- 📊 **Progress Tracking**: Built-in analytics and progress indicators
- ♿ **Accessibility**: ARIA labels, focus management, and screen reader support
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🚀 **Lightweight**: < 50KB gzipped, zero dependencies

## Installation

```bash
npm install @nstep/sdk
```

## Quick Start

```typescript
import { startWalkthrough } from '@nstep/sdk';

const script = {
  id: 'my-walkthrough',
  productId: 'my-product',
  name: 'Getting Started',
  type: 'walkthrough',
  status: 'published',
  steps: [
    {
      id: 'step-1',
      scriptId: 'my-walkthrough',
      orderIndex: 0,
      title: 'Welcome!',
      description: 'This is your first step.',
      elementSelector: '#welcome-button'
    },
    {
      id: 'step-2',
      scriptId: 'my-walkthrough',
      orderIndex: 1,
      title: 'Next Feature',
      description: 'Here is another feature to explore.',
      elementSelector: '#feature-section'
    }
  ]
};

// Start the walkthrough
await startWalkthrough(script);
```

## API Reference

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
