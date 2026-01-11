# Story 7.2: Third-Party Analytics Integration

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **integrate Next-Step analytics with my existing tools (Google Analytics, Mixpanel, Segment)**,
so that **I can correlate training data with other user behavior metrics**.

## Acceptance Criteria

1. ✅ SDK provides event hooks for all tracking events
2. ✅ Documentation includes integration examples (GA, Mixpanel, Segment)
3. ✅ Customers can disable built-in tracking (privacy)
4. ✅ Events include standard properties (script_id, step_id, etc.)
5. ✅ Integration does not impact SDK performance

**Priority:** P2 (Medium)

## Business Context

**Flexibility in analytics** is important for enterprise customers. They want to use their existing analytics stack, not learn a new dashboard.

**Key Business Value:**

- Enterprise readiness (integrate with existing tools)
- Deeper insights (combine training data with user behavior)
- Customer preference (use familiar tools)

**Dependencies:**

- Story 6.2 complete (SDK event system)
- Story 7.1 complete (core analytics)

## Tasks / Subtasks

### SDK Configuration

- [ ] **Task 1:** Disable built-in tracking (AC: #3)
  - [ ] 1.1: Init option
    - `NextStep.init({ projectId, analytics: false })`
    - Disables automatic event sending to API
    - Event hooks still work (for custom tracking)
  - [ ] 1.2: Privacy documentation
    - Explain what data is collected
    - How to disable tracking
    - GDPR compliance notes

### Integration Examples

- [ ] **Task 2:** Google Analytics integration (AC: #2, #4)
  - [ ] 2.1: Documentation
    - Add section: "Google Analytics Integration"
    - Code example (gtag.js)
    - Event naming conventions
  - [ ] 2.2: Example implementation
    - Listen to SDK events
    - Map to GA4 events
    - Include standard properties

- [ ] **Task 3:** Mixpanel integration (AC: #2, #4)
  - [ ] 3.1: Documentation
    - Add section: "Mixpanel Integration"
    - Code example
  - [ ] 3.2: Example implementation
    - Use Mixpanel's track() method
    - Map event properties

- [ ] **Task 4:** Segment integration (AC: #2, #4)
  - [ ] 4.1: Documentation
    - Add section: "Segment Integration"
    - Code example
  - [ ] 4.2: Example implementation
    - Use analytics.track()
    - Segment routes to all destinations

### Performance

- [ ] **Task 5:** Performance testing (AC: #5)
  - [ ] 5.1: Measure event dispatch overhead
    - Benchmark: < 5ms per event
    - Test with multiple listeners
  - [ ] 5.2: Memory profiling
    - Ensure no memory leaks with long-running sessions
    - Test listener cleanup

### Developer Experience

- [ ] **Task 6:** Developer documentation
  - [ ] 6.1: Quick start guides
    - "5-Minute Integration" for each tool
    - Copy-paste code snippets
  - [ ] 6.2: Event reference
    - List all event types
    - Event properties schema
    - When each event fires

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Event Hooks** [Source: architecture.md#SDK Events]
   - Use EventEmitter pattern (from Story 6.2)
   - Synchronous dispatch (no async overhead)
   - No dependencies on third-party libraries

2. **Privacy** [Source: architecture.md#Privacy]
   - Allow disabling built-in tracking
   - Customer controls what data is sent
   - GDPR-compliant by default

### Project Structure Notes

**Documentation:**

```
docs/
├── integrations/
│   ├── google-analytics.md
│   ├── mixpanel.md
│   ├── segment.md
│   └── custom.md
└── sdk-reference.md
```

### Critical Implementation Details

1. **Google Analytics 4 Integration:**

```html
<!-- Customer's site -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Next-Step SDK -->
<script src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js" data-project-id="proj_abc123"></script>

<script>
  NextStep.onReady(() => {
    // Disable built-in tracking (optional)
    // NextStep.init({ projectId: 'proj_abc123', analytics: false });

    // Track script shown
    NextStep.addEventListener('script_shown', (event) => {
      gtag('event', 'nextstep_script_shown', {
        script_id: event.scriptId,
        timestamp: event.timestamp,
      });
    });

    // Track step completed
    NextStep.addEventListener('step_completed', (event) => {
      gtag('event', 'nextstep_step_completed', {
        script_id: event.scriptId,
        step_id: event.stepId,
        timestamp: event.timestamp,
      });
    });

    // Track script completed
    NextStep.addEventListener('script_completed', (event) => {
      gtag('event', 'nextstep_script_completed', {
        script_id: event.scriptId,
        timestamp: event.timestamp,
      });
    });
  });
</script>
```

2. **Mixpanel Integration:**

```html
<!-- Mixpanel SDK -->
<script type="text/javascript">
  (function(f,b){...mixpanel loading code...})(document,window.mixpanel||[]);
  mixpanel.init("YOUR_TOKEN");
</script>

<!-- Next-Step SDK -->
<script src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js" data-project-id="proj_abc123"></script>

<script>
  NextStep.onReady(() => {
    // Map all SDK events to Mixpanel
    const eventTypes = ['script_shown', 'script_dismissed', 'step_viewed', 'step_completed', 'script_completed'];

    eventTypes.forEach((type) => {
      NextStep.addEventListener(type, (event) => {
        mixpanel.track(`NextStep: ${type}`, {
          script_id: event.scriptId,
          step_id: event.stepId,
          timestamp: event.timestamp,
        });
      });
    });

    // Track script completion as a user property
    NextStep.addEventListener('script_completed', (event) => {
      mixpanel.people.increment('nextstep_scripts_completed');
    });
  });
</script>
```

3. **Segment Integration:**

```html
<!-- Segment SDK -->
<script>
  !function(){...segment loading code...}();
  analytics.load("YOUR_WRITE_KEY");
  analytics.page();
</script>

<!-- Next-Step SDK -->
<script src="https://cdn.nextstep.app/sdk/latest/nextstep.min.js" data-project-id="proj_abc123"></script>

<script>
  NextStep.onReady(() => {
    // Segment automatically routes to all destinations (GA, Mixpanel, etc.)
    NextStep.addEventListener('script_shown', (event) => {
      analytics.track('Training Script Shown', {
        script_id: event.scriptId,
        source: 'NextStep',
      });
    });

    NextStep.addEventListener('step_completed', (event) => {
      analytics.track('Training Step Completed', {
        script_id: event.scriptId,
        step_id: event.stepId,
        source: 'NextStep',
      });
    });

    NextStep.addEventListener('script_completed', (event) => {
      analytics.track('Training Script Completed', {
        script_id: event.scriptId,
        source: 'NextStep',
      });
    });
  });
</script>
```

4. **Custom Analytics Integration:**

```javascript
// For customers with custom tracking
NextStep.onReady(() => {
  // Send events to your own analytics service
  NextStep.addEventListener('step_completed', async (event) => {
    await fetch('https://my-analytics.example.com/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'nextstep_step_completed',
        properties: {
          script_id: event.scriptId,
          step_id: event.stepId,
          user_id: getCurrentUserId(), // Your app's user ID
          timestamp: event.timestamp,
        },
      }),
    });
  });
});
```

5. **Event Properties Schema (Documentation):**

```typescript
// Event types
type EventType =
  | 'script_shown'       // Training script displayed
  | 'script_dismissed'   // User closed script
  | 'step_viewed'        // User viewed a step
  | 'step_completed'     // User completed a step
  | 'script_completed';  // User completed entire script

// Event object
interface NextStepEvent {
  type: EventType;
  scriptId: string;      // Always present
  stepId?: string;       // Present for step events
  timestamp: number;     // Unix timestamp (ms)
}

// Usage
NextStep.addEventListener(type: EventType, callback: (event: NextStepEvent) => void);
```

6. **Disable Built-in Tracking:**

```typescript
// In SDK core (NextStep.ts)
async init(options: InitOptions) {
  // ... existing code

  // Only initialize analytics if not disabled
  if (options.analytics !== false) {
    this.analyticsClient = new AnalyticsClient(options.apiUrl, options.projectId);

    // Auto-track events
    ['script_shown', 'step_completed', 'script_completed'].forEach(type => {
      this.eventEmitter.addEventListener(type as EventType, (event) => {
        this.analyticsClient!.track(event);
      });
    });
  }
}
```

### Testing Standards

**Performance Tests:**

- Benchmark event dispatch (should be < 5ms)
- Test with 10+ listeners (simulate multiple integrations)
- Memory leak test (long-running session)

**Integration Tests:**

- Mock GA/Mixpanel/Segment and verify events sent
- Test with analytics disabled
- Test all event types

### Documentation Requirements

**Each integration guide must include:**

1. Quick overview (2-3 sentences)
2. Prerequisites (account setup, SDK installation)
3. Step-by-step code example
4. Event mapping table
5. Troubleshooting tips
6. Link to vendor's docs

### References

- [Source: docs/planning-artifacts/prd.md#Epic 7] - User Story 7.2
- [Source: docs/planning-artifacts/architecture.md#Analytics] - Analytics hooks

### Important Gotchas

⚠️ **CRITICAL:**

- Event listeners must be added in `onReady` callback
- Async operations in listeners should not block SDK
- Customer's analytics tool must be loaded before SDK events fire

⚠️ **Common Mistakes:**

- Not checking if analytics tool is loaded (e.g., `if (typeof gtag !== 'undefined')`)
- Sending too much data (keep event properties minimal)
- Not handling errors in custom listeners

⚠️ **UX:**

- Provide copy-paste examples (developers love this)
- Show before/after dashboard screenshots
- Warn if built-in tracking disabled (some users do this by mistake)

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 7 - Analytics & Tracking (Part 2 of 2)
