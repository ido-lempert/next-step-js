# Story 6.1: SDK Initialization & CDN Distribution

Status: ready-for-dev

## Story

As a **Developer**,
I want to **initialize the SDK with a simple script tag from a CDN**,
so that **I can integrate Next-Step training into my application with minimal friction**.

## Acceptance Criteria

1. ✅ SDK hosted on CDN with versioning
2. ✅ Script tag initialization: `<script src="..." data-project-id="..."></script>`
3. ✅ SDK auto-initializes on page load
4. ✅ SDK fetches training scripts for the project
5. ✅ SDK provides init() method for programmatic initialization
6. ✅ SDK bundle size < 50KB gzipped
7. ✅ ETag caching for script bundles

**Priority:** P0 (Critical)

## Business Context

**Developer experience is critical** for SDK adoption. Simple script tag initialization lowers the barrier to entry.

**Key Business Value:**

- Fast time-to-value (< 5 minutes to first training)
- No build step required for customers
- Familiar integration pattern (like Google Analytics)

**Dependencies:**

- Story 1.2 complete (projects exist)
- Story 1.3 complete (scripts exist)
- Story 2.1/3.1 complete (SDK components to render)

## Tasks / Subtasks

### SDK Architecture

- [ ] **Task 1:** SDK core setup (AC: #6)
  - [ ] 1.1: Project structure
    - Vanilla TypeScript (no framework dependencies)
    - Rollup/Vite for bundling
    - Tree-shaking optimizations
    - Source maps for debugging
  - [ ] 1.2: Bundle configuration
    - Output: UMD format (browser globals)
    - Minification (Terser)
    - Target: ES2020 (modern browsers)
    - Bundle size analysis (bundlesize CI check)
  - [ ] 1.3: TypeScript configuration
    - Strict mode
    - Declaration files (.d.ts) for TypeScript users
    - JSDoc for IDE autocomplete

- [ ] **Task 2:** Auto-initialization (AC: #2, #3)
  - [ ] 2.1: Script tag parsing
    - Read `data-project-id` attribute
    - Read `data-api-key` attribute (optional for public scripts)
    - Read `data-environment` attribute (dev/staging/prod)
  - [ ] 2.2: DOMContentLoaded initialization
    - Wait for DOM ready
    - Auto-call init() if data attributes present
    - Expose global `window.NextStep` object
  - [ ] 2.3: Error handling
    - Validate required attributes
    - Console warnings if misconfigured
    - Fallback to manual init

### CDN Distribution

- [ ] **Task 3:** CDN hosting (AC: #1, #7)
  - [ ] 3.1: CDN provider selection
    - Options: Cloudflare CDN, AWS CloudFront, jsDelivr
    - Automatic cache invalidation on deploy
  - [ ] 3.2: Versioning strategy
    - Semantic versioning (1.0.0, 1.1.0, etc.)
    - Latest URL: `/sdk/latest/nextstep.min.js`
    - Pinned version: `/sdk/v1.0.0/nextstep.min.js`
  - [ ] 3.3: Cache headers
    - ETag for version validation
    - Max-age: 1 year for pinned versions
    - Max-age: 5 minutes for latest
    - CORS headers (allow all origins)

### API Integration

- [ ] **Task 4:** Fetch training scripts (AC: #4)
  - [ ] 4.1: API endpoint
    - GET /api/public/projects/:projectId/scripts
    - Returns active scripts for the project
    - Include steps, segment rules
  - [ ] 4.2: SDK data layer
    - Fetch on init
    - Cache in memory
    - Expose `getScripts()` method
  - [ ] 4.3: Error handling
    - Network errors (retry with exponential backoff)
    - 404 (project not found)
    - Auth errors (invalid API key)

### Programmatic API

- [ ] **Task 5:** Manual initialization (AC: #5)
  - [ ] 5.1: init() method
    - Signature: `NextStep.init({ projectId, apiKey?, environment? })`
    - Idempotent (ignore if already initialized)
    - Return promise (resolves when scripts loaded)
  - [ ] 5.2: Configuration options
    - `onReady` callback
    - `onError` callback
    - `debug` mode (verbose logging)
  - [ ] 5.3: Lifecycle methods
    - `NextStep.destroy()` - cleanup
    - `NextStep.isInitialized()` - check state

### Testing

- [ ] **Task 6:** SDK tests
  - [ ] 6.1: Unit tests
    - Test init logic
    - Test configuration parsing
    - Test API calls (mocked)
  - [ ] 6.2: Integration tests
    - Test auto-initialization in browser
    - Test manual initialization
    - Test error scenarios
  - [ ] 6.3: Bundle size test
    - CI check: fail if > 50KB gzipped
    - Track over time

### Documentation

- [ ] **Task 7:** Developer docs
  - [ ] 7.1: Quick start guide
    - Copy-paste script tag example
    - Show project ID location in back office
  - [ ] 7.2: API reference
    - init() options
    - Methods and properties
    - TypeScript types
  - [ ] 7.3: Examples
    - React integration
    - Vue integration
    - Vanilla JS example

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **SDK Architecture** [Source: architecture.md#SDK]
   - Vanilla JS/TypeScript (framework-agnostic)
   - Shadow DOM for CSS isolation
   - Web Components standard
   - Bundle size < 50KB gzipped

2. **CDN Strategy** [Source: architecture.md#CDN]
   - Global CDN for low latency
   - Versioning for cache-busting
   - CORS enabled for all origins

3. **API Security** [Source: architecture.md#Security]
   - Public endpoints for SDK (no auth required for public scripts)
   - Rate limiting per project
   - No sensitive data in client bundle

### Project Structure Notes

```
libs/sdk/
├── src/
│   ├── index.ts                # Entry point, auto-init
│   ├── core/
│   │   ├── NextStep.ts         # Main SDK class
│   │   ├── config.ts           # Configuration parser
│   │   └── api.ts              # API client
│   ├── components/
│   │   ├── walkthrough.ts      # From Story 2.1
│   │   └── modal.ts            # From Story 3.1
│   └── utils/
│       ├── dom.ts              # DOM helpers
│       └── logger.ts           # Debug logging
├── rollup.config.js            # Bundler config
├── package.json
└── README.md
```

**CDN Deployment:**

```
/cdn/
├── latest/
│   ├── nextstep.min.js         # Minified bundle
│   ├── nextstep.min.js.map     # Source map
│   └── nextstep.d.ts           # TypeScript definitions
└── v1.0.0/
    └── ... (same structure)
```

### Critical Implementation Details

1. **Auto-Initialization:**

```typescript
// src/index.ts
class NextStepSDK {
  private config: Config | null = null;
  private scripts: Script[] = [];

  async init(options: InitOptions) {
    if (this.config) {
      console.warn('[NextStep] Already initialized');
      return;
    }

    this.config = options;

    try {
      // Fetch scripts from API
      this.scripts = await this.fetchScripts(options.projectId);

      // Initialize components
      this.initComponents();

      if (options.onReady) {
        options.onReady();
      }
    } catch (error) {
      console.error('[NextStep] Initialization failed', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  }

  private async fetchScripts(projectId: string): Promise<Script[]> {
    const response = await fetch(`${this.config!.apiUrl}/api/public/projects/${projectId}/scripts`);

    if (!response.ok) {
      throw new Error(`Failed to fetch scripts: ${response.status}`);
    }

    return response.json();
  }

  private initComponents() {
    // Register web components
    if (!customElements.get('nextstep-walkthrough')) {
      customElements.define('nextstep-walkthrough', WalkthroughComponent);
    }
    if (!customElements.get('nextstep-modal')) {
      customElements.define('nextstep-modal', ModalComponent);
    }
  }
}

// Auto-init from script tag
const sdk = new NextStepSDK();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

function autoInit() {
  const script = document.currentScript as HTMLScriptElement;
  if (!script) return;

  const projectId = script.dataset.projectId;
  const apiKey = script.dataset.apiKey;
  const environment = script.dataset.environment || 'production';

  if (projectId) {
    sdk.init({ projectId, apiKey, environment });
  }
}

// Expose global API
window.NextStep = sdk;
```

2. **Bundle Configuration (Rollup):**

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/nextstep.min.js',
    format: 'umd',
    name: 'NextStep',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
    }),
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
      },
    }),
    visualizer({ filename: 'bundle-stats.html' }),
  ],
};
```

3. **API Endpoint (Public Scripts):**

```typescript
// apps/api/src/routes/public.ts
router.get('/api/public/projects/:projectId/scripts', async (req, res) => {
  const { projectId } = req.params;

  // No auth required for public scripts
  const scripts = await prisma.script.findMany({
    where: {
      projectId,
      status: 'active', // Only active scripts
    },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
      segments: true, // Segment rules for targeting
    },
  });

  // Remove sensitive fields
  const publicScripts = scripts.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    steps: s.steps.map((st) => ({
      title: st.title,
      description: st.description,
      elementSelector: st.elementSelector,
      order: st.order,
    })),
    segments: s.segments,
  }));

  res.json(publicScripts);
});
```

4. **Usage Example (Customer Site):**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <h1>Welcome to My App</h1>

    <!-- Next-Step SDK -->
    <script src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js" data-project-id="proj_abc123"></script>

    <script>
      // Optional: programmatic control
      NextStep.onReady(() => {
        console.log('Next-Step SDK ready');
      });
    </script>
  </body>
</html>
```

### Testing Standards

**Unit Tests:**

- Test config parsing
- Test API client (mocked fetch)
- Test component registration
- Minimum 80% coverage

**Integration Tests:**

- Test auto-init in real browser (Playwright)
- Test manual init
- Test error handling (network failures)

**Bundle Size Test:**

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/nextstep.min.js",
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ]
}
```

### References

- [Source: docs/planning-artifacts/prd.md#Epic 6] - User Story 6.1
- [Source: docs/planning-artifacts/architecture.md#SDK] - SDK architecture constraints

### Important Gotchas

⚠️ **CRITICAL:**

- Must support all modern browsers (Chrome, Firefox, Safari, Edge)
- No dependencies (increases bundle size)
- Shadow DOM not supported in older browsers (use polyfill or fallback)

⚠️ **Common Mistakes:**

- Not checking if already initialized (multiple script tags)
- Not handling network errors (API down)
- Not cleaning up event listeners (memory leaks)

⚠️ **UX:**

- Silent failures are bad (log errors to console)
- Provide clear error messages
- Show loading state if initialization takes time

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 6 - SDK Integration (Part 1 of 2)
