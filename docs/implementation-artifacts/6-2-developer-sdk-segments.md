# Story 6.2: SDK Segment Management & Dynamic Script Updates

Status: ready-for-dev

## Story

As a **Developer**,
I want to **update user segments dynamically and have training scripts respond in real-time**,
so that **users see contextually relevant training based on their current state**.

## Acceptance Criteria

1. ✅ SDK provides `updateSegments(segments)` method
2. ✅ Segments are evaluated on every page load
3. ✅ Training scripts show/hide based on segment match
4. ✅ SDK provides hooks for analytics integration
5. ✅ SDK emits events (script_shown, step_completed, etc.)
6. ✅ Segments stored in localStorage for persistence

**Priority:** P1 (High)

## Business Context

**Contextual training** is a core differentiator. Users only see training that applies to them based on their role, plan, or behavior.

**Key Business Value:**

- Higher engagement (relevant content only)
- Personalized onboarding flows
- Reduced cognitive overload

**Dependencies:**

- Story 6.1 complete (SDK initialized)
- Story 2.1/3.1 complete (components to show/hide)

## Tasks / Subtasks

### Segment Management

- [ ] **Task 1:** updateSegments() API (AC: #1, #6)
  - [ ] 1.1: Method signature
    - `NextStep.updateSegments({ role: 'admin', plan: 'pro' })`
    - Accepts key-value pairs
    - Overwrites existing segments
  - [ ] 1.2: Persistence
    - Store in localStorage
    - Key: `nextstep_segments_{projectId}`
    - JSON serialization
  - [ ] 1.3: Validation
    - Segment values must be strings or booleans
    - Warn on invalid values

- [ ] **Task 2:** Segment evaluation (AC: #2, #3)
  - [ ] 2.1: Load segments on init
    - Read from localStorage
    - Merge with defaults
  - [ ] 2.2: Script filtering
    - Each script has segment rules (from API)
    - Evaluate rules: `{ role: ['admin', 'editor'] }`
    - Show script if user matches ANY value
  - [ ] 2.3: Re-evaluation on update
    - When segments change, re-filter scripts
    - Show/hide components dynamically

### Event System

- [ ] **Task 3:** Event emitter (AC: #4, #5)
  - [ ] 3.1: Event types
    - `script_shown` - script displayed to user
    - `script_dismissed` - user closed script
    - `step_viewed` - user on a step
    - `step_completed` - user completed step
    - `script_completed` - user finished entire script
  - [ ] 3.2: addEventListener API
    - `NextStep.addEventListener('step_completed', callback)`
    - Callback receives event data
  - [ ] 3.3: Internal event dispatch
    - Components call `NextStep.emit(eventType, data)`
    - Event data includes: scriptId, stepId, timestamp

### Analytics Integration

- [ ] **Task 4:** Analytics hooks (AC: #4)
  - [ ] 4.1: Track to API (optional)
    - POST /api/public/analytics/events
    - Send event batch (every 30 seconds or 10 events)
    - Anonymous by default (no user ID unless opted in)
  - [ ] 4.2: Third-party integration examples
    - Google Analytics: `gtag('event', 'step_completed', {...})`
    - Mixpanel: `mixpanel.track('step_completed', {...})`
    - Provide code snippets in docs

### Dynamic Script Loading

- [ ] **Task 5:** Script updates (AC: #3)
  - [ ] 5.1: Poll for updates (optional)
    - Background polling (every 5 minutes)
    - Check for new scripts or segment rule changes
    - Update in-memory cache
  - [ ] 5.2: Manual refresh
    - `NextStep.refreshScripts()` method
    - Re-fetch from API
    - Re-evaluate segments

### Testing

- [ ] **Task 6:** Segment and event tests
  - [ ] 6.1: Test segment evaluation
    - Test matching logic
    - Test multiple segments
    - Test no segments (show all)
  - [ ] 6.2: Test event system
    - Test event dispatch
    - Test listeners
    - Test multiple listeners
  - [ ] 6.3: Test localStorage persistence
    - Test save/load segments
    - Test cross-session persistence

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Segment Evaluation** [Source: architecture.md#Segmentation]
   - Client-side evaluation (no server calls)
   - Simple key-value matching (no complex rules)
   - OR logic: user matches ANY value in array

2. **Analytics** [Source: architecture.md#Analytics]
   - Anonymous by default
   - Batched events (reduce API calls)
   - Third-party integration via event hooks

3. **Performance** [Source: architecture.md#Performance]
   - Segment evaluation < 10ms
   - Event dispatch synchronous
   - Polling does not block UI

### Project Structure Notes

```
libs/sdk/src/
├── core/
│   ├── SegmentManager.ts       # Segment storage & evaluation
│   ├── EventEmitter.ts         # Event system
│   └── AnalyticsClient.ts      # API event tracking
├── utils/
│   └── storage.ts              # localStorage wrapper
└── types.ts                    # TypeScript types
```

### Critical Implementation Details

1. **Segment Manager:**

```typescript
// src/core/SegmentManager.ts
export class SegmentManager {
  private segments: Record<string, string | boolean> = {};
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.load();
  }

  update(segments: Record<string, string | boolean>) {
    this.segments = { ...this.segments, ...segments };
    this.save();
  }

  matches(rules: Record<string, Array<string | boolean>>): boolean {
    if (!rules || Object.keys(rules).length === 0) {
      return true; // No rules = show to everyone
    }

    for (const [key, allowedValues] of Object.entries(rules)) {
      const userValue = this.segments[key];
      if (allowedValues.includes(userValue)) {
        return true; // Match found
      }
    }

    return false; // No match
  }

  private save() {
    localStorage.setItem(`nextstep_segments_${this.projectId}`, JSON.stringify(this.segments));
  }

  private load() {
    const stored = localStorage.getItem(`nextstep_segments_${this.projectId}`);
    if (stored) {
      try {
        this.segments = JSON.parse(stored);
      } catch (e) {
        console.error('[NextStep] Failed to parse segments', e);
      }
    }
  }
}
```

2. **Event Emitter:**

```typescript
// src/core/EventEmitter.ts
export type EventType = 'script_shown' | 'script_dismissed' | 'step_viewed' | 'step_completed' | 'script_completed';

export interface Event {
  type: EventType;
  scriptId: string;
  stepId?: string;
  timestamp: number;
}

export class EventEmitter {
  private listeners: Map<EventType, Array<(event: Event) => void>> = new Map();

  addEventListener(type: EventType, callback: (event: Event) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  removeEventListener(type: EventType, callback: (event: Event) => void) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(type: EventType, data: Omit<Event, 'type' | 'timestamp'>) {
    const event: Event = {
      type,
      timestamp: Date.now(),
      ...data,
    };

    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
  }
}
```

3. **Analytics Client (Optional Tracking):**

```typescript
// src/core/AnalyticsClient.ts
export class AnalyticsClient {
  private apiUrl: string;
  private projectId: string;
  private eventQueue: Event[] = [];
  private flushInterval: number;

  constructor(apiUrl: string, projectId: string) {
    this.apiUrl = apiUrl;
    this.projectId = projectId;

    // Flush every 30 seconds
    this.flushInterval = window.setInterval(() => this.flush(), 30000);
  }

  track(event: Event) {
    this.eventQueue.push(event);

    // Flush if queue reaches 10 events
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(`${this.apiUrl}/api/public/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: this.projectId,
          events,
        }),
      });
    } catch (error) {
      console.error('[NextStep] Failed to send analytics', error);
    }
  }

  destroy() {
    clearInterval(this.flushInterval);
    this.flush(); // Send remaining events
  }
}
```

4. **Updated SDK Class:**

```typescript
// src/core/NextStep.ts
export class NextStepSDK {
  private segmentManager: SegmentManager;
  private eventEmitter: EventEmitter;
  private analyticsClient?: AnalyticsClient;

  async init(options: InitOptions) {
    // ... existing init code

    this.segmentManager = new SegmentManager(options.projectId);
    this.eventEmitter = new EventEmitter();

    if (options.analytics !== false) {
      this.analyticsClient = new AnalyticsClient(options.apiUrl, options.projectId);

      // Auto-track all events
      ['script_shown', 'step_completed', 'script_completed'].forEach((type) => {
        this.eventEmitter.addEventListener(type as EventType, (event) => {
          this.analyticsClient!.track(event);
        });
      });
    }

    // Filter scripts by segments
    this.filterScriptsBySegments();
  }

  updateSegments(segments: Record<string, string | boolean>) {
    this.segmentManager.update(segments);
    this.filterScriptsBySegments();
  }

  private filterScriptsBySegments() {
    const activeScripts = this.scripts.filter((script) => {
      return this.segmentManager.matches(script.segments || {});
    });

    // Show/hide components based on filtered scripts
    this.renderComponents(activeScripts);
  }

  addEventListener(type: EventType, callback: (event: Event) => void) {
    this.eventEmitter.addEventListener(type, callback);
  }

  removeEventListener(type: EventType, callback: (event: Event) => void) {
    this.eventEmitter.removeEventListener(type, callback);
  }

  // Internal: components call this
  emit(type: EventType, data: Omit<Event, 'type' | 'timestamp'>) {
    this.eventEmitter.emit(type, data);
  }
}
```

5. **Usage Example:**

```html
<script>
  // Set user segments after login
  NextStep.onReady(() => {
    NextStep.updateSegments({
      role: 'admin',
      plan: 'pro',
      hasCompletedOnboarding: false,
    });

    // Track events to your analytics tool
    NextStep.addEventListener('step_completed', (event) => {
      gtag('event', 'nextstep_step_completed', {
        script_id: event.scriptId,
        step_id: event.stepId,
      });
    });
  });
</script>
```

### Testing Standards

**Unit Tests:**

- Test segment matching logic
- Test event emitter (add/remove listeners)
- Test analytics batching
- Minimum 80% coverage

**Integration Tests:**

- Test segment updates trigger re-render
- Test event dispatch end-to-end
- Test localStorage persistence across sessions

### References

- [Source: docs/planning-artifacts/prd.md#Epic 6] - User Story 6.2
- [Source: docs/planning-artifacts/architecture.md#Segmentation] - Segment rules

### Important Gotchas

⚠️ **CRITICAL:**

- Segment rules are OR logic (match ANY value)
- localStorage has size limits (~5MB per domain)
- Event listeners not cleaned up = memory leaks

⚠️ **Common Mistakes:**

- Not re-evaluating segments after update
- Not validating segment values (must be strings or booleans)
- Not debouncing frequent segment updates

⚠️ **UX:**

- Scripts should appear/disappear smoothly (CSS transitions)
- Don't flash content during segment evaluation
- Provide clear debug mode to test segments

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 6 - SDK Integration (Part 2 of 2)
