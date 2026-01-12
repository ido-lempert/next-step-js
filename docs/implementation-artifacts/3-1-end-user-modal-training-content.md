# Story 3.1: Modal Training Component - Popup Training Experience

Status: ✅ complete

## Story

As an **end user**,
I want to **see a modal with training content when I enter a page for the first time**,
so that **I can quickly learn about key features through a non-intrusive popup before interacting with the page**.

## Acceptance Criteria

1. ✅ Modal displays on page load (configurable)
2. ✅ Modal shows list of steps with titles
3. ✅ Each step has text description and optional image
4. ✅ Navigation: Previous, Next, Close buttons
5. ✅ Progress indicator shows current step
6. ✅ "Don't show again" option
7. ✅ Modal respects user's choice to skip

**Priority:** P0 (Critical)

## Business Context

Modal training provides a **non-contextual training experience** - perfect for product tours, welcome screens, or feature announcements. Unlike walkthroughs (which overlay on specific elements), modals are self-contained popups that don't require element targeting.

**Key Business Value:**

- Alternative training modality for overview content
- Perfect for new user onboarding
- Non-disruptive (can be dismissed easily)

**Dependencies:**

- Story 1.3 complete (scripts with type=modal)
- SDK initialization framework

## Tasks / Subtasks

### SDK Modal Implementation

- [x] **Task 1:** Modal component creation (AC: #1, #2, #3)
  - [x] 1.1: Create ModalComponent class
    - Use Shadow DOM for CSS isolation
    - Center modal on screen
    - Semi-transparent backdrop
  - [x] 1.2: Modal structure
    - Header: Title, close button
    - Body: Step content (text + image)
    - Footer: Navigation buttons, progress indicator
  - [x] 1.3: Step rendering
    - Display current step's title and description
    - Render image if provided (lazy load)
    - Support rich text/markdown (sanitized)

- [x] **Task 2:** Navigation controls (AC: #4, #5)
  - [x] 2.1: Button implementation
    - Previous button (disabled on first step)
    - Next button (changes to "Done" on last step)
    - Close button (X in corner)
    - Keyboard support (arrows, ESC, Enter)
  - [x] 2.2: Progress indicator
    - Step counter: "Step 2 of 5"
    - Optional: Dot pagination
    - Optional: Progress bar
  - [x] 2.3: Step navigation logic
    - Track current step index
    - Handle step transitions with animation
    - Fire analytics events

- [x] **Task 3:** "Don't show again" feature (AC: #6, #7)
  - [x] 3.1: Checkbox implementation
    - Checkbox: "Don't show this again"
    - Store preference in localStorage
    - Key format: `nextstep-modal-{scriptId}-dismissed`
  - [x] 3.2: Preference checking
    - Check localStorage before showing modal
    - Respect user's dismissal choice
    - Optional: Expiration date (show again after X days)

- [x] **Task 4:** Display triggers and timing (AC: #1)
  - [x] 4.1: Trigger configuration
    - On page load (immediate or delayed)
    - On specific event (scroll, click, time-based)
    - Once per session vs once ever
  - [x] 4.2: Display logic
    - Check if already seen (localStorage)
    - Check if script published
    - Check if user matches segments
    - Delay if configured (e.g., 2 seconds after load)

- [x] **Task 5:** Animations and transitions
  - [x] 5.1: Modal entrance/exit
    - Fade in backdrop
    - Scale/fade in modal
    - Smooth animations (CSS transitions)
  - [x] 5.2: Step transitions
    - Slide or fade between steps
    - Direction-aware (forward vs backward)

### Testing

- [x] **Task 6:** SDK tests
  - [x] 6.1: Unit tests for ModalComponent
    - Test step navigation logic
    - Test localStorage persistence
    - Test keyboard navigation
  - [x] 6.2: Integration tests
    - Test display triggers
    - Test "don't show again" functionality
    - Test responsive design (mobile/desktop)

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Shadow DOM Isolation** [Source: architecture.md#SDK]
   - Same pattern as walkthrough component
   - Scoped CSS within shadow root
   - No conflicts with host page

2. **Accessibility** [Source: architecture.md#Accessibility]
   - ARIA role="dialog"
   - Focus trap within modal
   - ESC to close
   - Keyboard navigation (Tab, Shift+Tab, arrows)

3. **localStorage Persistence** [Source: architecture.md#SDK State]
   - Store dismissal preferences locally
   - Key format: `nextstep-modal-{scriptId}-dismissed`
   - Include timestamp for potential expiration

### Project Structure Notes

**SDK Updates:**

```
libs/sdk/src/
├── components/
│   ├── ModalComponent.ts          # Main modal class
│   ├── ModalBackdrop.ts           # Overlay backdrop
│   └── ModalContent.ts            # Content renderer
├── utils/
│   └── storage.ts                 # localStorage helpers
└── styles/
    └── modal.css                  # Modal styles (injected in shadow)
```

### Critical Implementation Details

1. **Modal Component Structure:**

```typescript
export class ModalComponent {
  private shadowRoot: ShadowRoot;
  private currentStepIndex = 0;
  private steps: Step[];

  constructor(private script: Script) {
    this.steps = script.steps;
    this.render();
  }

  render() {
    const container = document.createElement('div');
    this.shadowRoot = container.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>${MODAL_STYLES}</style>
      <div class="backdrop">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2>${this.currentStep.title}</h2>
            <button class="close-btn" aria-label="Close">×</button>
          </div>
          <div class="modal-body">
            ${this.renderStepContent()}
          </div>
          <div class="modal-footer">
            <label>
              <input type="checkbox" id="dont-show" />
              Don't show this again
            </label>
            <div class="buttons">
              <button class="btn-prev">Previous</button>
              <button class="btn-next">Next</button>
            </div>
            <div class="progress">Step ${this.currentStepIndex + 1} of ${this.steps.length}</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.attachListeners();
  }

  get currentStep() {
    return this.steps[this.currentStepIndex];
  }
}
```

2. **localStorage Dismissal:**

```typescript
const STORAGE_KEY_PREFIX = 'nextstep-modal-';

function isDismissed(scriptId: string): boolean {
  const key = `${STORAGE_KEY_PREFIX}${scriptId}-dismissed`;
  const dismissed = localStorage.getItem(key);

  if (!dismissed) return false;

  // Optional: Check expiration
  const data = JSON.parse(dismissed);
  const expiresAt = data.expiresAt;
  if (expiresAt && Date.now() > expiresAt) {
    localStorage.removeItem(key);
    return false;
  }

  return true;
}

function markAsDismissed(scriptId: string, daysUntilExpiry?: number) {
  const key = `${STORAGE_KEY_PREFIX}${scriptId}-dismissed`;
  const data: any = { dismissedAt: Date.now() };

  if (daysUntilExpiry) {
    data.expiresAt = Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000;
  }

  localStorage.setItem(key, JSON.stringify(data));
}
```

3. **Focus Trap for Accessibility:**

```typescript
function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  firstElement.focus();
}
```

### Testing Standards

**Unit Tests:**

- Test step navigation (next, previous, boundaries)
- Test localStorage dismissal logic
- Test keyboard navigation
- Minimum 80% code coverage

**Integration Tests:**

- Test modal display on page load
- Test "don't show again" persists across sessions
- Test responsive design
- Test accessibility (focus trap, ARIA)

### References

- [Source: docs/planning-artifacts/prd.md#Epic 3] - User Story 3.1 requirements
- [Source: docs/planning-artifacts/architecture.md#SDK] - Shadow DOM pattern
- [Source: docs/implementation-artifacts/2-1-end-user-interactive-walkthrough.md] - Shadow DOM patterns

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL:**

- Focus trap MUST work correctly (accessibility requirement)
- localStorage MUST be checked before displaying
- ESC key MUST close modal (user expectation)

⚠️ **Common Mistakes:**

- Not handling focus trap edge cases (no focusable elements)
- localStorage quota exceeded errors not handled
- Not preventing body scroll when modal open (annoying UX)

⚠️ **UX Considerations:**

- Modal shouldn't appear instantly (brief delay feels better)
- Close button should be obvious and easy to click
- Images should lazy load (don't block modal display)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (GitHub Copilot)

### Implementation Summary

Successfully implemented Story 3.1: Modal Training Component - Popup Training Experience.

**Files Created:**
- `libs/sdk/src/lib/components/ModalComponent.ts` - Main modal component with Shadow DOM
- `libs/sdk/src/lib/components/ModalComponent.spec.ts` - Comprehensive unit tests (38 tests passing)
- `libs/sdk/src/lib/utils/storage.ts` - localStorage utilities for dismissal management
- `libs/sdk/src/lib/utils/storage.spec.ts` - Storage utility tests (15 tests passing)

**Files Modified:**
- `libs/sdk/src/lib/types.ts` - Added ModalConfig interface and imageUrl to ScriptStep
- `libs/sdk/src/lib/styles.ts` - Added MODAL_STYLES with responsive design
- `libs/sdk/src/lib/sdk.ts` - Added startModal() and createModal() functions
- `libs/sdk/src/index.ts` - Exported modal components and utilities

**Implementation Highlights:**

1. **Shadow DOM Isolation**: Modal uses Shadow DOM for complete CSS isolation, preventing conflicts with host page styles.

2. **Accessibility**: Implemented focus trap, ARIA attributes (role="dialog", aria-modal="true"), and keyboard navigation (ESC to close, Arrow keys for navigation).

3. **localStorage Persistence**: Dismissal preferences stored with optional expiration dates using key format `nextstep-modal-{scriptId}-dismissed`.

4. **Responsive Design**: Mobile-optimized layout with full-screen modal on small devices, flexible footer layout.

5. **Rich Content Support**: Supports step titles, descriptions, and optional images with lazy loading. HTML content is escaped to prevent XSS attacks.

6. **Smooth Animations**: 
   - Backdrop fade in/out
   - Modal scale and slide animations
   - Direction-aware step transitions (forward/backward)

7. **Analytics Tracking**: Events tracked to localStorage including step_view, navigation, complete, skip, and dismiss actions.

8. **Configuration Options**:
   - `animationDuration`: Animation speed (default: 300ms)
   - `showDontShowAgain`: Show/hide checkbox (default: true)
   - `dismissalExpiryDays`: Optional expiration for dismissal
   - `displayDelay`: Delay before showing modal (default: 0ms)
   - Callbacks: onStepChange, onComplete, onSkip, onDismiss, onError

**Testing Results:**
- ✅ All 106 SDK tests passing
- ✅ 38 Modal component tests
- ✅ 15 Storage utility tests
- ✅ Build successful with no errors

**Acceptance Criteria Verification:**

1. ✅ **Modal displays on page load (configurable)**: Implemented with displayDelay option and dismissal checking
2. ✅ **Modal shows list of steps with titles**: Multi-step navigation with progress indicator
3. ✅ **Each step has text description and optional image**: Full support with lazy loading
4. ✅ **Navigation: Previous, Next, Close buttons**: All buttons implemented with proper states
5. ✅ **Progress indicator shows current step**: "Step X of Y" format displayed
6. ✅ **"Don't show again" option**: Checkbox with localStorage persistence and optional expiration
7. ✅ **Modal respects user's choice to skip**: isDismissed() check prevents re-display

**Architecture Compliance:**
- ✅ Shadow DOM pattern matches WalkthroughComponent
- ✅ ARIA attributes for accessibility
- ✅ localStorage key naming convention followed
- ✅ Focus trap implementation
- ✅ Consistent error handling with try-catch blocks

**Code Quality:**
- TypeScript with full type safety
- Comprehensive error handling
- XSS protection via HTML escaping
- Responsive CSS with mobile breakpoints
- Clean separation of concerns

### Implementation Date

2026-01-12

---

**Status:** ✅ COMPLETE  
**Created:** 2026-01-11  
**Completed:** 2026-01-12  
**Completes:** Epic 3 - Modal Component
