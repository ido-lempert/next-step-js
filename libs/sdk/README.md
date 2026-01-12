# @nstep/sdk

Next-Step SDK - Interactive walkthrough and training component for web applications.

## Features

- 🎯 **Interactive Walkthroughs**: Guide users step-by-step through your application
- 🌓 **Shadow DOM Isolation**: Prevents CSS conflicts with host page
- 🤖 **Auto-Progress**: Automatically advance when users complete actions
- ⌨️ **Keyboard Navigation**: Full keyboard support (arrows, ESC, Enter)
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎨 **Smart Positioning**: Tooltips automatically adjust to fit viewport
- 🔍 **Element Targeting**: Highlight and scroll to specific elements
- 📊 **Progress Tracking**: Track user interactions and completion

## Installation

```bash
npm install @nstep/sdk
```

## Quick Start

```typescript
import { nextStep } from '@nstep/sdk';

// Define your walkthrough
const config = {
  id: 'welcome-tour',
  name: 'Welcome Tour',
  steps: [
    {
      id: 'step-1',
      title: 'Welcome!',
      description: 'Let me show you around',
      element_selector: '#welcome-section',
      order_index: 0
    },
    {
      id: 'step-2',
      title: 'Dashboard',
      description: 'This is your main dashboard',
      element_selector: '#dashboard',
      order_index: 1
    }
  ],
  onComplete: () => console.log('Tour completed!'),
  onSkip: () => console.log('Tour skipped')
};

// Start the walkthrough
await nextStep.startWalkthrough(config);
```

## Configuration

### WalkthroughConfig

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the walkthrough |
| `name` | string | Display name of the walkthrough |
| `steps` | StepConfig[] | Array of steps to show |
| `onComplete?` | () => void | Callback when walkthrough completes |
| `onSkip?` | () => void | Callback when walkthrough is skipped |
| `onStepChange?` | (step, index) => void | Callback when step changes |

### StepConfig

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the step |
| `title` | string | Step title |
| `description?` | string | Step description/content |
| `element_selector?` | string | CSS selector for target element |
| `order_index` | number | Order of the step |
| `autoProgress?` | boolean | Enable auto-progress for this step |
| `actionType?` | 'click' \| 'input' \| 'submit' | Type of action to detect |
| `actionSelector?` | string | CSS selector for action target (defaults to element_selector) |
| `config?` | Record<string, any> | Additional configuration |

## Auto-Progress Feature

The SDK supports automatic progression when users perform specific actions:

```typescript
const config = {
  id: 'interactive-tour',
  name: 'Interactive Tour',
  steps: [
    {
      id: 'step-1',
      title: 'Click the Button',
      description: 'Click this button to continue',
      element_selector: '#submit-button',
      order_index: 0,
      autoProgress: true,
      actionType: 'click'
    },
    {
      id: 'step-2',
      title: 'Fill the Form',
      description: 'Enter your name to proceed',
      element_selector: '#name-input',
      order_index: 1,
      autoProgress: true,
      actionType: 'input'
    },
    {
      id: 'step-3',
      title: 'Submit the Form',
      description: 'Submit the form to complete',
      element_selector: '#contact-form',
      order_index: 2,
      autoProgress: true,
      actionType: 'submit'
    }
  ]
};

await nextStep.startWalkthrough(config);
```

### Supported Action Types

- **click**: Detects clicks on the target element
- **input**: Detects text entry in input/textarea/select elements
- **submit**: Detects form submission

## Navigation

### Button Controls

- **Next**: Advance to next step (changes to "Finish" on last step)
- **Back**: Go to previous step (disabled on first step)
- **Skip**: Exit the walkthrough

### Keyboard Controls

- **Arrow Right / Enter**: Next step
- **Arrow Left**: Previous step
- **Escape**: Skip walkthrough

## API Reference

### NextStepSDK

```typescript
class NextStepSDK {
  // Start a walkthrough
  async startWalkthrough(config: WalkthroughConfig): Promise<void>
  
  // Stop the current walkthrough
  stopWalkthrough(): void
  
  // Check if a walkthrough is active
  isActive(): boolean
}
```

### Default Instance

```typescript
import { nextStep } from '@nstep/sdk';

// Start walkthrough
await nextStep.startWalkthrough(config);

// Stop walkthrough
nextStep.stopWalkthrough();

// Check if active
if (nextStep.isActive()) {
  console.log('Walkthrough is running');
}
```

### Custom Instance

```typescript
import { createNextStepSDK } from '@nstep/sdk';

const sdk = createNextStepSDK();
await sdk.startWalkthrough(config);
```

## Progress Tracking

The SDK automatically tracks user interactions:

```typescript
// Events are logged to console and can be captured
// for analytics integration
const config = {
  id: 'tour',
  name: 'Product Tour',
  steps: [...],
  onStepChange: (step, index) => {
    // Track step views
    analytics.track('step_viewed', { stepId: step.id, index });
  },
  onComplete: () => {
    // Track completion
    analytics.track('tour_completed', { tourId: 'tour' });
  }
};
```

## Styling

The SDK uses Shadow DOM for complete CSS isolation. All styles are scoped to the component and won't conflict with your application's styles.

To customize, you can:
1. Override CSS variables (if exposed)
2. Modify the source styles in `styles.ts`
3. Apply your own theme

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Examples

See `demo.html` for a complete working example.

## Development

### Building

Run `nx build sdk` to build the library.

### Running unit tests

Run `nx test sdk` to execute the unit tests via [Jest](https://jestjs.io).

## License

MIT

## Contributing

See the main repository README for contribution guidelines.
