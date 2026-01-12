# NextStep SDK - Developer Guide

## Quick Start

### 1. Installation via CDN (Recommended)

Add the following script tag to your HTML:

```html
<script 
  src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js"
  data-project-id="your-project-id"
></script>
```

That's it! The SDK will automatically initialize when your page loads.

### 2. Installation via npm

```bash
npm install @nstep/sdk
```

```typescript
import { NextStepSDK } from '@nstep/sdk';

const sdk = new NextStepSDK();
await sdk.init({
  projectId: 'your-project-id',
  environment: 'production'
});
```

## Configuration Options

### Script Tag Attributes

When using the CDN approach, you can configure the SDK using data attributes:

```html
<script 
  src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js"
  data-project-id="your-project-id"
  data-api-key="your-api-key"
  data-environment="production"
  data-debug="false"
></script>
```

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-project-id` | ✅ Yes | - | Your project ID from the Back Office |
| `data-api-key` | No | - | API key for private projects |
| `data-environment` | No | `production` | `development`, `staging`, or `production` |
| `data-debug` | No | `false` | Enable debug logging |

### Programmatic Configuration

```typescript
interface InitOptions {
  projectId: string;              // Required: Your project ID
  apiKey?: string;                // Optional: API key
  environment?: 'development' | 'staging' | 'production';
  apiUrl?: string;                // Optional: Custom API endpoint
  debug?: boolean;                // Optional: Enable debug mode
  onReady?: () => void;          // Optional: Called when initialized
  onError?: (error: Error) => void; // Optional: Called on error
}
```

Example:

```javascript
NextStep.init({
  projectId: 'proj_abc123',
  environment: 'development',
  debug: true,
  onReady: () => {
    console.log('NextStep SDK ready!');
  },
  onError: (error) => {
    console.error('SDK error:', error);
  }
});
```

## API Reference

### Global API

When using the CDN, the SDK is available via `window.NextStep`:

#### `init(options: InitOptions): Promise<void>`

Initialize the SDK with configuration options.

```javascript
await NextStep.init({
  projectId: 'your-project-id',
  environment: 'production'
});
```

#### `isInitialized(): boolean`

Check if the SDK is initialized.

```javascript
if (NextStep.isInitialized()) {
  console.log('SDK is ready');
}
```

#### `getScripts(): Script[]`

Get all loaded scripts for the project.

```javascript
const scripts = NextStep.getScripts();
console.log(`Found ${scripts.length} scripts`);
```

#### `getScript(scriptId: string): Script | undefined`

Get a specific script by ID.

```javascript
const script = NextStep.getScript('script_123');
if (script) {
  console.log('Found script:', script.name);
}
```

#### `startWalkthrough(scriptId: string, config?: WalkthroughConfig): Promise<WalkthroughComponent | null>`

Start a walkthrough script.

```javascript
await NextStep.startWalkthrough('script_123', {
  onComplete: () => {
    console.log('Walkthrough completed!');
  }
});
```

#### `startModal(scriptId: string, config?: ModalConfig): Promise<ModalComponent | null>`

Start a modal script.

```javascript
await NextStep.startModal('script_456', {
  displayDelay: 2000,
  onComplete: () => {
    console.log('Modal completed!');
  }
});
```

#### `destroy(): void`

Clean up and destroy the SDK instance.

```javascript
NextStep.destroy();
```

## Environment Configuration

The SDK supports three environments:

| Environment | Default API URL | Use Case |
|-------------|-----------------|----------|
| `development` | `http://localhost:3333` | Local development |
| `staging` | `https://api-staging.nextstep.app` | Testing |
| `production` | `https://api.nextstep.app` | Production |

You can override the API URL:

```javascript
NextStep.init({
  projectId: 'your-project-id',
  apiUrl: 'https://custom-api.example.com'
});
```

## Framework Integration

### React

```tsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    if (window.NextStep && !window.NextStep.isInitialized()) {
      window.NextStep.init({
        projectId: process.env.REACT_APP_NEXTSTEP_PROJECT_ID!,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        onReady: () => console.log('NextStep ready'),
      });
    }

    return () => {
      // Clean up on unmount
      window.NextStep?.destroy();
    };
  }, []);

  const startTour = () => {
    const scripts = window.NextStep.getScripts();
    const tourScript = scripts.find(s => s.type === 'walkthrough');
    if (tourScript) {
      window.NextStep.startWalkthrough(tourScript.id);
    }
  };

  return (
    <div>
      <button onClick={startTour}>Start Tour</button>
    </div>
  );
}

export default App;
```

### Vue 3

```vue
<template>
  <div>
    <button @click="startTour">Start Tour</button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

onMounted(async () => {
  if (window.NextStep && !window.NextStep.isInitialized()) {
    await window.NextStep.init({
      projectId: import.meta.env.VITE_NEXTSTEP_PROJECT_ID,
      environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
      onReady: () => console.log('NextStep ready'),
    });
  }
});

onUnmounted(() => {
  window.NextStep?.destroy();
});

const startTour = () => {
  const scripts = window.NextStep.getScripts();
  const tourScript = scripts.find(s => s.type === 'walkthrough');
  if (tourScript) {
    window.NextStep.startWalkthrough(tourScript.id);
  }
};
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

declare global {
  interface Window {
    NextStep: any;
  }
}

@Component({
  selector: 'app-root',
  template: `
    <button (click)="startTour()">Start Tour</button>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  async ngOnInit() {
    if (window.NextStep && !window.NextStep.isInitialized()) {
      await window.NextStep.init({
        projectId: environment.nextStepProjectId,
        environment: environment.production ? 'production' : 'development',
        onReady: () => console.log('NextStep ready'),
      });
    }
  }

  ngOnDestroy() {
    window.NextStep?.destroy();
  }

  startTour() {
    const scripts = window.NextStep.getScripts();
    const tourScript = scripts.find(s => s.type === 'walkthrough');
    if (tourScript) {
      window.NextStep.startWalkthrough(tourScript.id);
    }
  }
}
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <button id="start-tour">Start Tour</button>

  <script 
    src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js"
    data-project-id="your-project-id"
  ></script>

  <script>
    document.getElementById('start-tour').addEventListener('click', () => {
      const scripts = NextStep.getScripts();
      const tourScript = scripts.find(s => s.type === 'walkthrough');
      if (tourScript) {
        NextStep.startWalkthrough(tourScript.id);
      }
    });
  </script>
</body>
</html>
```

## Error Handling

The SDK provides comprehensive error handling:

```javascript
NextStep.init({
  projectId: 'your-project-id',
  onError: (error) => {
    // Handle initialization errors
    if (error.message.includes('404')) {
      console.error('Project not found');
    } else if (error.message.includes('Network')) {
      console.error('Network error - check your connection');
    } else {
      console.error('Unknown error:', error);
    }
  }
});
```

Common error scenarios:

| Error | Cause | Solution |
|-------|-------|----------|
| `projectId is required` | Missing or empty project ID | Provide valid project ID |
| `Failed to fetch scripts: 404` | Project not found | Check project ID |
| `Network error` | API unreachable | Check network connection |
| `Failed to fetch scripts: 500` | Server error | Retry or contact support |

## Debug Mode

Enable debug mode to see detailed logs:

```html
<script 
  src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js"
  data-project-id="your-project-id"
  data-debug="true"
></script>
```

Or programmatically:

```javascript
NextStep.init({
  projectId: 'your-project-id',
  debug: true
});
```

Debug logs will include:
- Initialization status
- API requests and responses
- Component lifecycle events
- Error details

## TypeScript Support

The SDK includes TypeScript definitions. When using via npm:

```typescript
import { NextStepSDK, InitOptions, Script } from '@nstep/sdk';

const sdk = new NextStepSDK();

const options: InitOptions = {
  projectId: 'your-project-id',
  environment: 'production',
  debug: false
};

await sdk.init(options);

const scripts: Script[] = sdk.getScripts();
```

## Browser Support

The SDK supports all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

The SDK uses modern JavaScript (ES2020) for optimal performance and small bundle size.

## Bundle Size

The SDK is optimized for performance:

- **Minified**: ~45KB
- **Gzipped**: ~15KB

This ensures fast page load times and minimal impact on your application.

## CDN Caching

The SDK CDN uses aggressive caching for optimal performance:

- **Pinned versions** (e.g., `/sdk/v1.0.0/nextstep.min.js`): Cached for 1 year
- **Latest version** (e.g., `/sdk/latest/nextstep.min.js`): Cached for 5 minutes
- **ETag support**: For efficient cache validation

For production, we recommend using pinned versions:

```html
<script src="https://cdn.nextstep.app/sdk/v1.0.0/nextstep.min.js"></script>
```

## Versioning

The SDK follows semantic versioning (semver):

- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features, backward compatible
- **Patch** (x.x.1): Bug fixes

## Security

The SDK follows security best practices:

- **No sensitive data in client**: API keys are optional and only used for authentication
- **CORS enabled**: Works from any origin
- **Content Security Policy**: Compatible with strict CSP
- **No eval()**: Safe for environments that prohibit eval
- **XSS protection**: All user content is sanitized

## Troubleshooting

### SDK not initializing

1. Check the console for errors
2. Verify your project ID is correct
3. Ensure the script tag is loaded before your code runs
4. Enable debug mode to see detailed logs

### Scripts not loading

1. Verify the project exists in the Back Office
2. Check that scripts are published (not draft)
3. Verify network connectivity
4. Check CORS settings if using a custom API

### TypeScript errors

1. Ensure `@nstep/sdk` is installed
2. Add to `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "types": ["@nstep/sdk"]
     }
   }
   ```

### Module not found errors

When using via CDN, add TypeScript declarations:

```typescript
declare global {
  interface Window {
    NextStep: any;
  }
}
```

## Support

- **Documentation**: https://docs.nextstep.app
- **GitHub**: https://github.com/nextstep/sdk
- **Email**: support@nextstep.app

## License

MIT License - see LICENSE file for details
