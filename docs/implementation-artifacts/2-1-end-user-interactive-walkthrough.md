# Story 2.1: Interactive Walkthrough - Core SDK Component

Status: ready-for-dev

## Story

As an **end user**,
I want to **see an interactive walkthrough that highlights specific elements on the page and guides me step-by-step**,
so that **I can learn how to use features in my application with contextual, visual guidance**.

## Acceptance Criteria

1. ✅ Page darkens/dims when walkthrough starts
2. ✅ Target element is highlighted with spotlight effect
3. ✅ Step content displays near target element
4. ✅ Navigation buttons: Next, Back, Skip
5. ✅ Progress indicator shows current step (e.g., "2 of 5")
6. ✅ Walkthrough closes when completed or skipped
7. ✅ Walkthrough tracks user progress

**Priority:** P0 (Critical)

## Business Context

This is the **core delivery mechanism** for Next-Step's value proposition - the interactive walkthrough component that overlays training content on live websites. This component must work across any website without breaking their CSS, provide smooth animations, and handle edge cases (element not found, responsive layouts, etc.).

**Key Business Value:**
- Primary training delivery mechanism for end users
- Differentiator from static documentation
- Foundation for user engagement and product adoption

**Dependencies:**
- Story 1.3 complete (scripts and steps created in Back Office)
- SDK initialization framework (can be built in parallel)

## Tasks / Subtasks

### SDK Core Implementation

- [ ] **Task 1:** Shadow DOM isolation and initialization (AC: #1, #2, #3)
  - [ ] 1.1: Create WalkthroughComponent class
    - Use Shadow DOM for CSS isolation
    - Inject shadow root into document body
    - Load component styles (scoped)
  - [ ] 1.2: Implement page overlay/backdrop
    - Full-screen semi-transparent backdrop (z-index management)
    - Click-through to underlying page disabled
    - Smooth fade-in animation
  - [ ] 1.3: Implement spotlight highlight
    - Calculate target element position and dimensions
    - Create cutout/spotlight effect around target
    - Handle scrolling and responsive repositioning
    - Smooth transitions when moving between elements

- [ ] **Task 2:** Step content tooltip/popover (AC: #3)
  - [ ] 2.1: Create step content container
    - Position relative to target element (smart positioning)
    - Auto-adjust if would go off-screen
    - Arrow/pointer to target element
    - Responsive design (mobile/desktop)
  - [ ] 2.2: Render step content
    - Title, description, images
    - Support rich text/markdown (sanitized)
    - Accessible HTML structure

- [ ] **Task 3:** Navigation controls (AC: #4, #5, #6)
  - [ ] 3.1: Implement navigation buttons
    - Back button (disabled on first step)
    - Next button (changes to "Finish" on last step)
    - Skip button (closes walkthrough)
    - Keyboard support (arrows, ESC, Enter)
  - [ ] 3.2: Progress indicator
    - Show "Step X of Y"
    - Optional progress bar
    - Visual step dots (current, completed, upcoming)
  - [ ] 3.3: Completion and close handling
    - Fire completion event when finished
    - Fire skip event when closed early
    - Clean up DOM and event listeners
    - Remove shadow root

- [ ] **Task 4:** Element targeting and scrolling (AC: #2)
  - [ ] 4.1: CSS selector resolution
    - Parse element_selector from step config
    - Find element in DOM (with retry logic)
    - Handle missing elements gracefully (show error or skip)
  - [ ] 4.2: Auto-scroll to element
    - Smooth scroll element into view
    - Account for fixed headers/footers
    - Wait for scroll completion before showing step
  - [ ] 4.3: Responsive repositioning
    - Listen for window resize
    - Listen for scroll events
    - Reposition spotlight and tooltip dynamically

- [ ] **Task 5:** Progress tracking (AC: #7)
  - [ ] 5.1: Track step views
    - Fire analytics event when step shown
    - Include: scriptId, stepId, timestamp
  - [ ] 5.2: Track navigation actions
    - Fire event on next, back, skip, complete
    - Track time spent per step
  - [ ] 5.3: Local storage persistence (optional)
    - Remember which walkthroughs completed
    - Don't show again if user skipped/completed

### Testing

- [ ] **Task 6:** SDK component tests
  - [ ] 6.1: Unit tests for WalkthroughComponent
    - Test Shadow DOM creation
    - Test element positioning logic
    - Test navigation state machine
  - [ ] 6.2: Integration tests on sample pages
    - Test on various layouts (fixed, absolute, relative)
    - Test responsive behavior
    - Test with missing elements
  - [ ] 6.3: Cross-browser testing
    - Chrome, Firefox, Safari, Edge
    - Mobile browsers (iOS Safari, Chrome Android)

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Shadow DOM Isolation** [Source: architecture.md#SDK Architecture]
   - CRITICAL: Use Shadow DOM to prevent CSS conflicts with host page
   - Inject all styles within shadow root
   - No global styles or classname collisions
   - Handle z-index carefully (ensure above host page content)

2. **Technology Stack** [Source: architecture.md#SDK]
   - Vanilla JavaScript/TypeScript (no framework dependencies)
   - Minimal bundle size (< 50KB gzipped total SDK)
   - Web Components standard for Shadow DOM
   - CSS-in-JS or inline styles for shadow root

3. **Performance Requirements** [Source: architecture.md#NFR-1]
   - < 100ms initialization time
   - Smooth 60fps animations
   - No impact on host page performance
   - Lazy load images in step content

4. **Accessibility** [Source: architecture.md#Accessibility]
   - ARIA labels for all interactive elements
   - Keyboard navigation support
   - Focus management (trap focus in walkthrough)
   - Screen reader compatible announcements

### Project Structure Notes

**SDK Structure:**
```
libs/sdk/src/
├── components/
│   ├── WalkthroughComponent.ts    # Main walkthrough class
│   ├── SpotlightOverlay.ts        # Backdrop + spotlight
│   ├── StepTooltip.ts             # Content popover
│   └── ProgressIndicator.ts       # Progress UI
├── utils/
│   ├── positioning.ts             # Smart tooltip positioning
│   ├── elementFinder.ts           # CSS selector resolution
│   └── animations.ts              # Smooth transitions
├── styles/
│   └── walkthrough.css            # Component styles (injected in shadow)
└── index.ts                       # Public API
```

### Critical Implementation Details

1. **Shadow DOM Setup:**
```typescript
export class WalkthroughComponent {
  private shadowRoot: ShadowRoot;
  private container: HTMLDivElement;
  
  constructor() {
    // Create container and attach shadow root
    this.container = document.createElement('div');
    this.container.id = 'nextstep-walkthrough';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    
    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = WALKTHROUGH_STYLES;
    this.shadowRoot.appendChild(styleSheet);
    
    // Append to body
    document.body.appendChild(this.container);
  }
  
  destroy() {
    this.container.remove();
  }
}
```

2. **Spotlight Effect with CSS:**
```css
/* Backdrop with cutout for target element */
.spotlight-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.7);
  transition: clip-path 0.3s ease;
  clip-path: polygon(
    0% 0%, 0% 100%, 100% 100%, 100% 0%,
    0% 0%, /* hole: */ 
    var(--x) var(--y), 
    calc(var(--x) + var(--w)) var(--y),
    calc(var(--x) + var(--w)) calc(var(--y) + var(--h)),
    var(--x) calc(var(--y) + var(--h)),
    var(--x) var(--y)
  );
}
```

3. **Smart Tooltip Positioning:**
```typescript
function positionTooltip(targetRect: DOMRect, tooltipEl: HTMLElement) {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // Try positions in order: bottom, top, right, left
  const positions = [
    { x: targetRect.left, y: targetRect.bottom + 10 },
    { x: targetRect.left, y: targetRect.top - tooltipEl.offsetHeight - 10 },
    { x: targetRect.right + 10, y: targetRect.top },
    { x: targetRect.left - tooltipEl.offsetWidth - 10, y: targetRect.top }
  ];
  
  for (const pos of positions) {
    if (fitsInViewport(pos, tooltipEl, viewport)) {
      return pos;
    }
  }
  
  // Fallback: center of screen
  return { x: viewport.width / 2, y: viewport.height / 2 };
}
```

4. **Element Finder with Retry:**
```typescript
async function findElement(selector: string, maxRetries = 3): Promise<HTMLElement | null> {
  for (let i = 0; i < maxRetries; i++) {
    const element = document.querySelector(selector);
    if (element) return element as HTMLElement;
    
    // Wait 500ms and retry (element might not be in DOM yet)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return null;
}
```

### Testing Standards

**Unit Tests:**
- Test positioning algorithm with various viewport sizes
- Test element finder with missing/delayed elements
- Test navigation state transitions
- Minimum 80% code coverage

**Integration Tests:**
- Test on sample HTML pages with different layouts
- Test animations and transitions
- Test keyboard navigation
- Test accessibility with screen reader

**Cross-Browser Tests:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Android 90+

### References

- [Source: docs/planning-artifacts/prd.md#Epic 2] - User Story 2.1 requirements
- [Source: docs/planning-artifacts/architecture.md#SDK Architecture] - Shadow DOM, bundle size
- [Source: docs/planning-artifacts/architecture.md#NFR-1] - Performance requirements
- [Source: docs/implementation-artifacts/1-3-product-manager-create-training-scripts.md] - Script/step data structure

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL:**
- Shadow DOM isolation MUST be complete - no global CSS leakage
- Handle z-index carefully - ensure walkthrough above all host page content
- Element selector MUST be resilient to missing elements

⚠️ **Common Mistakes:**
- Not handling responsive layouts (fixed tooltips that don't reposition)
- Memory leaks from event listeners not cleaned up
- Not accounting for fixed headers when scrolling to elements
- Poor animation performance (use CSS transforms, not top/left)

⚠️ **Performance:**
- Use `requestAnimationFrame` for smooth animations
- Debounce scroll/resize event handlers
- Lazy load step images (don't preload all steps)

## Dev Agent Record

### Agent Model Used

_To be filled by Dev agent_

### Completion Notes

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Dependencies:** Story 1.3 (scripts), SDK init framework  
**Next:** Story 2.2 (auto-progress) builds on this foundation
