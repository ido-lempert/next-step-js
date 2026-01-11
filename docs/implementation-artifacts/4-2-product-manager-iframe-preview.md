# Story 4.2: Back Office Preview - iframe Integration

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **preview my scripts in an iframe within the Back Office using the Chrome Extension**,
so that **I can test training content on the actual target website before publishing**.

## Acceptance Criteria

1. ✅ Back Office loads customer website in iframe
2. ✅ Extension injects SDK into iframe
3. ✅ Scripts load and display correctly in iframe
4. ✅ User can test walkthrough/modal interactions
5. ✅ Changes to scripts reflect immediately in preview
6. ✅ Error messages display if extension not installed

**Priority:** P0 (Critical)

## Business Context

Completes the preview workflow by integrating the Chrome Extension with the Back Office. Product Managers can now edit scripts and immediately see them in action on the target website, creating a tight feedback loop for content creation.

**Key Business Value:**

- Enables iterative script development
- Reduces time to publish (test before deploy)
- Improves script quality (see actual behavior)

**Dependencies:**

- Story 4.1 complete (Chrome Extension)
- Story 1.3 complete (script editor)

## Tasks / Subtasks

### Back Office Preview Component

- [ ] **Task 1:** Preview iframe component (AC: #1, #2, #3)
  - [ ] 1.1: Create PreviewPaneComponent
    - Iframe element for loading target website
    - URL input for target site
    - Preview controls (reload, fullscreen)
  - [ ] 1.2: iframe setup
    - Load target URL in iframe
    - Handle iframe load events
    - Detect extension presence
  - [ ] 1.3: Extension detection (AC: #6)
    - Check for extension via postMessage ping
    - Show installation prompt if not detected
    - Link to Chrome Web Store for installation

- [ ] **Task 2:** Script injection via postMessage (AC: #3, #5)
  - [ ] 2.1: Create PreviewBridgeService
    - Send LOAD_SCRIPT message to extension
    - Include current script data in payload
    - Handle message responses from iframe
  - [ ] 2.2: Real-time updates
    - Watch for script changes in editor
    - Auto-reload script in preview
    - Debounce rapid changes (avoid spam)

- [ ] **Task 3:** Preview controls (AC: #4)
  - [ ] 3.1: Control UI
    - Play button: Start script
    - Reload button: Refresh iframe
    - Fullscreen toggle: Expand preview
    - Device selector: Desktop/mobile viewport
  - [ ] 3.2: Event feedback
    - Listen for script events from iframe
    - Show current step in preview header
    - Display completion/skip events

- [ ] **Task 4:** Error handling (AC: #6)
  - [ ] 4.1: Extension not installed
    - Detect missing extension
    - Show prominent warning with instructions
    - Link to installation guide
  - [ ] 4.2: iframe load errors
    - Handle CORS errors
    - Handle 404/500 errors
    - Show user-friendly error messages
  - [ ] 4.3: Script errors
    - Catch SDK errors from iframe
    - Display in preview console/log
    - Help debug selector issues

### Testing

- [ ] **Task 5:** Integration tests
  - [ ] 5.1: Test with extension enabled
    - Test script loading in iframe
    - Test real-time updates
    - Test preview controls
  - [ ] 5.2: Test without extension
    - Verify detection logic
    - Verify error messages shown
  - [ ] 5.3: Test various target sites
    - Different CSP policies
    - Responsive layouts
    - Complex DOM structures

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **postMessage Protocol** [Source: architecture.md#Extension Communication]
   - Structured messages: { type, payload }
   - Origin validation on receipt
   - Async request/response pattern

2. **iframe Security** [Source: architecture.md#Security]
   - Extension required to bypass CSP
   - No direct iframe content access
   - All communication via postMessage

### Project Structure Notes

**Back Office Updates:**

```
apps/back-office/src/app/features/scripts/
├── components/
│   ├── script-editor/
│   └── preview-pane/
│       ├── preview-pane.component.ts
│       ├── preview-pane.component.html
│       ├── preview-controls.component.ts
│       └── extension-prompt.component.ts
└── services/
    └── preview-bridge.service.ts
```

### Critical Implementation Details

1. **PreviewBridgeService:**

```typescript
@Injectable()
export class PreviewBridgeService {
  private iframe?: HTMLIFrameElement;
  private extensionDetected = signal(false);

  detectExtension(): Promise<boolean> {
    return new Promise((resolve) => {
      // Send ping to extension
      window.postMessage({ type: 'NEXTSTEP_EXTENSION_PING' }, '*');

      const timeout = setTimeout(() => {
        this.extensionDetected.set(false);
        resolve(false);
      }, 1000);

      // Listen for pong response
      const listener = (event: MessageEvent) => {
        if (event.data.type === 'NEXTSTEP_EXTENSION_PONG') {
          clearTimeout(timeout);
          window.removeEventListener('message', listener);
          this.extensionDetected.set(true);
          resolve(true);
        }
      };

      window.addEventListener('message', listener);
    });
  }

  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  loadScript(script: Script) {
    if (!this.iframe) return;

    this.iframe.contentWindow?.postMessage(
      {
        type: 'NEXTSTEP_LOAD_SCRIPT',
        payload: {
          scriptId: script.id,
          type: script.type,
          steps: script.steps,
        },
      },
      '*',
    );
  }

  reloadPreview() {
    if (!this.iframe) return;
    this.iframe.src = this.iframe.src; // Force reload
  }
}
```

2. **Preview Pane Component:**

```typescript
@Component({
  selector: 'app-preview-pane',
  template: `
    <div class="preview-container">
      @if (!extensionDetected()) {
        <app-extension-prompt />
      }

      <div class="preview-controls">
        <input type="url" [(ngModel)]="targetUrl" placeholder="Enter target website URL" (change)="loadUrl()" />
        <button (click)="playScript()">▶ Play</button>
        <button (click)="reloadPreview()">🔄 Reload</button>
        <button (click)="toggleFullscreen()">⛶ Fullscreen</button>
      </div>

      <iframe #previewFrame [src]="targetUrl | safe: 'resourceUrl'" (load)="onIframeLoad()" class="preview-iframe"></iframe>

      @if (currentStep()) {
        <div class="preview-status">Currently showing: Step {{ currentStep()?.order_index + 1 }}</div>
      }
    </div>
  `,
})
export class PreviewPaneComponent implements OnInit, OnDestroy {
  @ViewChild('previewFrame') iframeRef!: ElementRef<HTMLIFrameElement>;
  @Input() script = input.required<Script>();

  extensionDetected = signal(false);
  targetUrl = signal('');
  currentStep = signal<ScriptStep | null>(null);

  constructor(private previewBridge: PreviewBridgeService) {}

  async ngOnInit() {
    // Detect extension
    const detected = await this.previewBridge.detectExtension();
    this.extensionDetected.set(detected);

    // Listen for script events from iframe
    window.addEventListener('message', this.handleMessage);

    // Watch for script changes
    effect(() => {
      const script = this.script();
      if (script && this.extensionDetected()) {
        this.previewBridge.loadScript(script);
      }
    });
  }

  onIframeLoad() {
    this.previewBridge.setIframe(this.iframeRef.nativeElement);
  }

  playScript() {
    this.previewBridge.loadScript(this.script());
  }

  reloadPreview() {
    this.previewBridge.reloadPreview();
  }

  handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'NEXTSTEP_STEP_SHOWN') {
      this.currentStep.set(event.data.payload.step);
    }
  };

  ngOnDestroy() {
    window.removeEventListener('message', this.handleMessage);
  }
}
```

3. **Extension Prompt Component:**

```typescript
@Component({
  selector: 'app-extension-prompt',
  template: `
    <div class="extension-prompt">
      <h3>⚠️ Chrome Extension Required</h3>
      <p>To preview scripts, install the Next-Step Preview Extension.</p>
      <a href="https://chrome.google.com/webstore/..." target="_blank" class="btn-install"> Install Extension </a>
      <button (click)="checkAgain()">I've installed it</button>
    </div>
  `,
})
export class ExtensionPromptComponent {
  constructor(private previewBridge: PreviewBridgeService) {}

  async checkAgain() {
    await this.previewBridge.detectExtension();
  }
}
```

### Testing Standards

**Integration Tests:**

- Test with extension enabled
- Test without extension (show prompt)
- Test script loading and real-time updates
- Test iframe error handling

### References

- [Source: docs/planning-artifacts/prd.md#Epic 4] - User Story 4.2
- [Source: docs/implementation-artifacts/4-1-developer-chrome-extension-preview.md] - Extension implementation
- [Source: docs/implementation-artifacts/1-3-product-manager-create-training-scripts.md] - Script editor integration

### Important Gotchas

⚠️ **CRITICAL:**

- Extension detection MUST work reliably
- postMessage origin validation
- iframe sandbox attributes may block certain features

⚠️ **UX:**

- Show clear error messages if extension not installed
- Provide installation link and instructions
- Auto-reload preview when script changes (debounced)

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 4 - Chrome Extension
