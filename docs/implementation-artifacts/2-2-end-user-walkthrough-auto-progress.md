# Story 2.2: Auto-Progress Walkthrough - Interactive Detection

Status: ready-for-dev

## Story

As an **end user**,
I want **the walkthrough to automatically progress when I perform the expected action**,
so that **I have a seamless learning experience without manually clicking "Next" after every interaction**.

## Acceptance Criteria

1. ✅ Walkthrough detects click events on target elements
2. ✅ Walkthrough detects input/form submissions
3. ✅ Walkthrough progresses to next step automatically
4. ✅ Manual "Next" button still available
5. ✅ Configurable: auto-progress on/off per step

**Priority:** P1 (High)

## Business Context

This story enhances the walkthrough component with **intelligent action detection**, making training feel more natural and interactive. Instead of reading → clicking → manually advancing, users perform the actual action and the walkthrough automatically advances, creating a "learning by doing" experience.

**Key Business Value:**

- Improves user engagement and completion rates
- Creates more natural training flow
- Reduces cognitive load (fewer buttons to click)

**Dependencies:**

- Story 2.1 complete (base walkthrough component)

## Tasks / Subtasks

### SDK Enhancement

- [ ] **Task 1:** Action detection framework (AC: #1, #2, #3)
  - [ ] 1.1: Define action types in step config
    - click: detect clicks on target element
    - input: detect text entry in input field
    - submit: detect form submission
    - navigate: detect URL change
    - custom: support custom event listeners
  - [ ] 1.2: Implement event listener attachment
    - Attach listeners when step starts
    - Listen on target element (from CSS selector)
    - Clean up listeners when step changes
  - [ ] 1.3: Auto-advance trigger
    - When action detected, wait brief delay (300ms)
    - Show checkmark or success animation
    - Progress to next step automatically
    - Fire analytics event for action completion

- [ ] **Task 2:** Click detection (AC: #1)
  - [ ] 2.1: Attach click listener to target element
    - Use capture phase to intercept before other handlers
    - Verify click is on correct element (not child)
  - [ ] 2.2: Visual feedback
    - Show success indicator on target element
    - Brief animation before advancing

- [ ] **Task 3:** Input detection (AC: #2)
  - [ ] 3.1: Attach input/change listeners
    - Detect text entry in input fields
    - Detect select changes
    - Detect checkbox/radio changes
  - [ ] 3.2: Validation (optional)
    - Check if input meets expected criteria
    - Only advance if valid input entered

- [ ] **Task 4:** Form submission detection (AC: #2)
  - [ ] 4.1: Attach submit listener to form
    - Detect form submit event
    - Handle both button click and Enter key
  - [ ] 4.2: Prevent actual submission (optional)
    - preventDefault() if in demo mode
    - Allow natural flow in production

- [ ] **Task 5:** Configuration and fallback (AC: #4, #5)
  - [ ] 5.1: Per-step configuration
    - Add `autoProgress` field to step config (boolean)
    - Add `actionType` field (click, input, submit, navigate)
    - Add `actionSelector` field (optional, defaults to element_selector)
  - [ ] 5.2: Manual override
    - Keep "Next" button visible
    - Allow manual advancement even when auto-progress enabled
    - Show both options simultaneously

### Back Office Updates

- [ ] **Task 6:** UI for auto-progress configuration
  - [ ] 6.1: Add auto-progress toggle to step form
    - Checkbox: "Auto-advance when user completes action"
    - Dropdown: Select action type (click, input, submit)
    - Text input: Custom selector (advanced)
  - [ ] 6.2: Visual indicator in step list
    - Show icon/badge for steps with auto-progress enabled

### Testing

- [ ] **Task 7:** SDK tests for action detection
  - [ ] 7.1: Unit tests for event listeners
    - Test click detection on target element
    - Test input detection with various input types
    - Test form submission detection
  - [ ] 7.2: Integration tests
    - Test auto-progress flow end-to-end
    - Test manual override still works
    - Test cleanup of event listeners

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Event Handling** [Source: architecture.md#SDK Events]
   - Use capture phase to intercept events before host page handlers
   - Clean up all event listeners on step change
   - Don't interfere with host page functionality

2. **Configuration Extension** [Source: architecture.md#Script Config]
   - Extend step config schema with auto-progress fields
   - Backward compatible (auto-progress is optional)
   - Store in JSONB config column

### Project Structure Notes

**SDK Updates:**

```
libs/sdk/src/
├── components/
│   └── WalkthroughComponent.ts    # Extended with action detection
├── actions/
│   ├── ActionDetector.ts          # Main action detection class
│   ├── ClickAction.ts             # Click detection
│   ├── InputAction.ts             # Input detection
│   └── SubmitAction.ts            # Form submission detection
└── types/
    └── StepConfig.ts              # Extended with autoProgress fields
```

**Back Office Updates:**

```
apps/back-office/src/app/features/scripts/
└── components/
    └── step-form/
        └── auto-progress-config/   # New component for auto-progress UI
```

### Critical Implementation Details

1. **Step Config Extension:**

```typescript
interface StepConfig {
  id: string;
  title: string;
  description: string;
  element_selector: string;

  // New fields for auto-progress
  autoProgress?: boolean;
  actionType?: 'click' | 'input' | 'submit' | 'navigate' | 'custom';
  actionSelector?: string; // Optional, defaults to element_selector
  actionValidator?: string; // Optional JS function for input validation
}
```

2. **Action Detector Class:**

```typescript
export class ActionDetector {
  private listeners: Array<() => void> = [];

  attach(step: StepConfig, onComplete: () => void) {
    if (!step.autoProgress) return;

    const target = document.querySelector(step.actionSelector || step.element_selector);
    if (!target) return;

    switch (step.actionType) {
      case 'click':
        this.attachClickListener(target, onComplete);
        break;
      case 'input':
        this.attachInputListener(target, onComplete);
        break;
      case 'submit':
        this.attachSubmitListener(target, onComplete);
        break;
    }
  }

  private attachClickListener(target: Element, onComplete: () => void) {
    const handler = (e: Event) => {
      // Show success feedback
      this.showSuccess(target);

      // Auto-advance after brief delay
      setTimeout(onComplete, 300);
    };

    target.addEventListener('click', handler, { capture: true });
    this.listeners.push(() => target.removeEventListener('click', handler, { capture: true }));
  }

  detach() {
    // Clean up all listeners
    this.listeners.forEach((cleanup) => cleanup());
    this.listeners = [];
  }
}
```

3. **Database Migration for Config:**

```sql
-- No schema change needed - use existing config JSONB field
-- Example step config with auto-progress:
UPDATE script_steps SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{autoProgress}',
  'true'::jsonb
) WHERE id = 'step-id';
```

### Learnings from Story 2.1

**From Previous Implementation:**

- Reuse event listener cleanup patterns
- Follow Shadow DOM isolation rules
- Use same animation timing functions
- Maintain accessibility (keyboard users can still use Next button)

### Testing Standards

**Unit Tests:**

- Test each action type (click, input, submit)
- Test listener cleanup on step change
- Test configuration parsing
- Minimum 80% code coverage

**Integration Tests:**

- Test auto-progress on sample forms
- Test manual override works alongside auto-progress
- Test action detection doesn't interfere with host page

### References

- [Source: docs/planning-artifacts/prd.md#Epic 2] - User Story 2.2 requirements
- [Source: docs/implementation-artifacts/2-1-end-user-interactive-walkthrough.md] - Base walkthrough implementation
- [Source: docs/planning-artifacts/architecture.md#SDK Events] - Event handling patterns

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL:**

- MUST clean up event listeners on step change (memory leaks)
- Use capture phase to intercept before host page handlers
- Don't prevent default behavior unless explicitly configured

⚠️ **Common Mistakes:**

- Not handling nested elements (click on child triggers parent)
- Forgetting to detach listeners causes duplicate firing
- Interfering with host page's event handlers

⚠️ **UX Considerations:**

- Show visual feedback before auto-advancing (checkmark animation)
- Keep manual "Next" button visible for users who prefer it
- Brief delay before auto-advance (feels more natural)

## Dev Agent Record

### Agent Model Used

_To be filled by Dev agent_

### Completion Notes

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Dependencies:** Story 2.1 complete  
**Completes:** Epic 2 - Walkthrough Component
