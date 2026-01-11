# Story 3.1: Modal Training Component - Popup Training Experience

Status: ready-for-dev

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

- [ ] **Task 1:** Modal component creation (AC: #1, #2, #3)
  - [ ] 1.1: Create ModalComponent class
    - Use Shadow DOM for CSS isolation
    - Center modal on screen
    - Semi-transparent backdrop
  - [ ] 1.2: Modal structure
    - Header: Title, close button
    - Body: Step content (text + image)
    - Footer: Navigation buttons, progress indicator
  - [ ] 1.3: Step rendering
    - Display current step's title and description
    - Render image if provided (lazy load)
    - Support rich text/markdown (sanitized)

- [ ] **Task 2:** Navigation controls (AC: #4, #5)
  - [ ] 2.1: Button implementation
    - Previous button (disabled on first step)
    - Next button (changes to "Done" on last step)
    - Close button (X in corner)
    - Keyboard support (arrows, ESC, Enter)
  - [ ] 2.2: Progress indicator
    - Step counter: "Step 2 of 5"
    - Optional: Dot pagination
    - Optional: Progress bar
  - [ ] 2.3: Step navigation logic
    - Track current step index
    - Handle step transitions with animation
    - Fire analytics events

- [ ] **Task 3:** "Don't show again" feature (AC: #6, #7)
  - [ ] 3.1: Checkbox implementation
    - Checkbox: "Don't show this again"
    - Store preference in localStorage
    - Key format: `nextstep-modal-{scriptId}-dismissed`
  - [ ] 3.2: Preference checking
    - Check localStorage before showing modal
    - Respect user's dismissal choice
    - Optional: Expiration date (show again after X days)

- [ ] **Task 4:** Display triggers and timing (AC: #1)
  - [ ] 4.1: Trigger configuration
    - On page load (immediate or delayed)
    - On specific event (scroll, click, time-based)
    - Once per session vs once ever
  - [ ] 4.2: Display logic
    - Check if already seen (localStorage)
    - Check if script published
    - Check if user matches segments
    - Delay if configured (e.g., 2 seconds after load)

- [ ] **Task 5:** Animations and transitions
  - [ ] 5.1: Modal entrance/exit
    - Fade in backdrop
    - Scale/fade in modal
    - Smooth animations (CSS transitions)
  - [ ] 5.2: Step transitions
    - Slide or fade between steps
    - Direction-aware (forward vs backward)

### Testing

- [ ] **Task 6:** SDK tests
  - [ ] 6.1: Unit tests for ModalComponent
    - Test step navigation logic
    - Test localStorage persistence
    - Test keyboard navigation
  - [ ] 6.2: Integration tests
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

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 3 - Modal Component
