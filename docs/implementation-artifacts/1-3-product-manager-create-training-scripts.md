# Story 1.3: Create Training Scripts - Core Content Management

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **create training scripts (walkthroughs or modals) for my products**,
so that **I can build, manage, and publish interactive training experiences with multiple steps that guide users through my application**.

## Acceptance Criteria

1. ✅ User can create a new script with type (walkthrough/modal)
2. ✅ User can add/edit/remove steps within a script
3. ✅ User can reorder steps via drag-and-drop
4. ✅ User can preview scripts in iframe mode
5. ✅ User can publish/unpublish scripts
6. ✅ Scripts have versioning (future)

**Priority:** P0 (Critical)

## Business Context

This is the **final story in Epic 1** - completing the core organizational hierarchy (Projects → Products → **Scripts**) and enabling the primary value proposition of Next-Step: creating and managing interactive training content. Scripts are the atomic unit of training delivery, containing sequences of steps that guide end users.

**Key Business Value:**

- Delivers core product functionality - training content creation
- Enables two primary training modalities: walkthroughs (overlay) and modals (popup)
- Foundation for all downstream features (AI generation, SDK delivery, analytics)
- Completes Epic 1's organizational system

**Dependencies:**

- Story 1.1 complete (projects)
- Story 1.2 complete (products)
- Inherits tenant isolation through product → project chain

## Tasks / Subtasks

### Backend Implementation

- [ ] **Task 1:** Database schema for scripts and steps (AC: #1, #2)
  - [ ] 1.1: Create `scripts` table
    - Columns: id (UUID), product_id (UUID), name (VARCHAR), type (ENUM: walkthrough/modal), status (ENUM: draft/published), created_at, updated_at
    - Foreign key to products(id) with CASCADE delete
    - Add index on product_id
  - [ ] 1.2: Create `script_steps` table
    - Columns: id (UUID), script_id (UUID), order_index (INTEGER), title (VARCHAR), description (TEXT), element_selector (VARCHAR), action_type (VARCHAR), config (JSONB), created_at, updated_at
    - Foreign key to scripts(id) with CASCADE delete
    - Add unique constraint on (script_id, order_index)
    - Add index on script_id
  - [ ] 1.3: Set up Prisma/Drizzle ORM schema
    - Define relationships: Product hasMany Scripts, Script hasMany ScriptSteps
  - [ ] 1.4: Create and run database migrations

- [ ] **Task 2:** API endpoints for script CRUD (AC: #1, #5)
  - [ ] 2.1: POST /api/products/:productId/scripts - Create script
    - Validate: name (required), type (walkthrough|modal)
    - Verify product exists and belongs to tenant
    - Default status: draft
    - Return 201 with created script
  - [ ] 2.2: GET /api/products/:productId/scripts - List scripts
    - Verify product ownership (tenant isolation)
    - Support filtering by type, status
    - Support pagination
    - Return 200 with array of scripts
  - [ ] 2.3: GET /api/scripts/:id - Get single script with steps
    - Verify script's product belongs to tenant
    - Include all steps ordered by order_index
    - Return 200 with script and nested steps
  - [ ] 2.4: PUT /api/scripts/:id - Update script metadata
    - Validate: name, type
    - Return 200 with updated script
  - [ ] 2.5: PATCH /api/scripts/:id/publish - Publish script
    - Change status from draft → published
    - Validate script has at least one step
    - Return 200 with updated script
  - [ ] 2.6: PATCH /api/scripts/:id/unpublish - Unpublish script
    - Change status from published → draft
    - Return 200 with updated script
  - [ ] 2.7: DELETE /api/scripts/:id - Delete script
    - Verify ownership
    - CASCADE delete all steps
    - Return 204 on success

- [ ] **Task 3:** API endpoints for step management (AC: #2, #3)
  - [ ] 3.1: POST /api/scripts/:scriptId/steps - Add step
    - Validate: title, description, element_selector (optional for modals), action_type
    - Auto-assign order_index (max + 1)
    - Return 201 with created step
  - [ ] 3.2: PUT /api/scripts/:scriptId/steps/:stepId - Update step
    - Validate: title, description, element_selector, action_type, config
    - Return 200 with updated step
  - [ ] 3.3: PATCH /api/scripts/:scriptId/steps/reorder - Reorder steps
    - Accept array of step IDs in new order
    - Update order_index for all steps atomically
    - Return 200 with reordered steps
  - [ ] 3.4: DELETE /api/scripts/:scriptId/steps/:stepId - Delete step
    - Verify ownership
    - Renumber remaining steps
    - Return 204 on success

- [ ] **Task 4:** Tenant isolation through chain (AC: implicit)
  - [ ] 4.1: Create ownership verification middleware
    - For scripts: verify product.project.tenant_id matches
    - For steps: verify script.product.project.tenant_id matches
  - [ ] 4.2: Query optimization
    - Use joins to validate ownership in single query
    - Cache ownership checks where appropriate

### Frontend Implementation (Angular Back Office)

- [ ] **Task 5:** Script list view within product (AC: #1, #5)
  - [ ] 5.1: Create ScriptListComponent
    - Display scripts in card/table format
    - Show: name, type badge, status badge, step count, last updated
    - Filter by type (walkthrough/modal)
    - Filter by status (draft/published)
    - Add "Create New Script" button
  - [ ] 5.2: Create ScriptService for API calls
    - Injectable ScriptService with HttpClient
    - Methods: getScripts(productId), createScript(), updateScript(), deleteScript(), publishScript(), unpublishScript()

- [ ] **Task 6:** Script editor component (AC: #2, #3, #4)
  - [ ] 6.1: Create ScriptEditorComponent
    - Header: script name (editable inline), type selector, publish/unpublish toggle
    - Main area: step list with drag-and-drop reordering
    - Each step: expandable card showing title, description, selector, actions
    - Add "Add Step" button
  - [ ] 6.2: Implement drag-and-drop with Angular CDK
    - Use @angular/cdk/drag-drop
    - Update order_index via API on drop
    - Visual feedback during drag
    - Optimistic UI update with rollback on error

- [ ] **Task 7:** Step editor form (AC: #2)
  - [ ] 7.1: Create StepFormComponent
    - Fields: title (required), description (textarea), element_selector (conditionally required), action_type (dropdown)
    - Different fields based on script type (walkthrough vs modal)
    - Validation based on type
  - [ ] 7.2: Inline editing vs modal
    - Inline for quick edits
    - Modal/drawer for detailed editing

- [ ] **Task 8:** Script preview integration (AC: #4)
  - [ ] 8.1: Create PreviewComponent
    - Iframe loading target website
    - Overlay controls (play, pause, step forward/back)
    - Show current step info
  - [ ] 8.2: Preview mode integration
    - Requires Chrome Extension installed
    - Show installation prompt if not detected
    - Handle postMessage communication with iframe
    - Load script steps into preview renderer

- [ ] **Task 9:** Publish/unpublish workflow (AC: #5)
  - [ ] 9.1: Publish validation
    - Check script has at least one step
    - Show warning dialog with validation results
    - Confirm publish action
  - [ ] 9.2: Status indicator
    - Visual badge showing draft/published
    - Disable preview for draft scripts (optional)

- [ ] **Task 10:** Navigation and routing
  - [ ] 10.1: Update routing
    - Route: /projects/:projectId/products/:productId/scripts
    - Route: /scripts/:scriptId/editor
    - Route: /scripts/:scriptId/preview
  - [ ] 10.2: Breadcrumb navigation
    - Projects → [Project] → Products → [Product] → Scripts → [Script]

### Testing

- [ ] **Task 11:** Backend API tests
  - [ ] 11.1: Unit tests for script/step controllers
  - [ ] 11.2: Integration tests for CRUD endpoints
  - [ ] 11.3: Reorder logic tests (edge cases)
  - [ ] 11.4: Tenant isolation tests (chain validation)
    - Verify cross-tenant access blocked at script level
    - Verify cross-tenant access blocked at step level

- [ ] **Task 12:** Frontend component tests
  - [ ] 12.1: Unit tests for ScriptListComponent
  - [ ] 12.2: Unit tests for ScriptEditorComponent
  - [ ] 12.3: Unit tests for drag-and-drop reordering
  - [ ] 12.4: Integration tests for complete workflows
    - Create script → Add steps → Reorder → Publish → Preview

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Multi-Level Tenant Isolation** [Source: architecture.md#Multi-Tenant Architecture]
   - Scripts inherit tenant through: script → product → project → tenant
   - All queries MUST validate complete ownership chain
   - Performance optimization: use joins, not sequential queries
   - Cache ownership results per request

2. **Script Types & Configuration** [Source: architecture.md#Script System]
   - **Walkthrough:** Overlay on existing page, requires element_selector per step
   - **Modal:** Standalone popup, element_selector optional
   - Use JSONB config field for extensibility (positioning, styling, timing)
   - Future: support for branches, conditions, dynamic content

3. **Technology Stack** [Source: architecture.md#Technical Stack]
   - Same stack as previous stories
   - Add: Angular CDK for drag-and-drop
   - Add: postMessage API for iframe communication

4. **Preview System** [Source: architecture.md#Chrome Extension]
   - Preview requires Chrome Extension installed
   - Extension injects SDK into iframe
   - postMessage communication: back-office ↔ extension ↔ iframe
   - Security: validate message origins

### Project Structure Notes

**Backend Structure:**

```
apps/api/src/
├── routes/
│   ├── scripts.ts                # Script CRUD routes
│   └── scriptSteps.ts            # Step management routes
├── controllers/
│   ├── scriptController.ts
│   └── scriptStepController.ts
├── models/
│   ├── script.ts                 # Prisma/Drizzle schema
│   └── scriptStep.ts
├── middleware/
│   └── scriptOwnership.ts        # Verify ownership chain
└── validators/
    ├── scriptValidators.ts
    └── stepValidators.ts
```

**Frontend Structure:**

```
apps/back-office/src/app/
├── features/
│   └── scripts/
│       ├── components/
│       │   ├── script-list/
│       │   ├── script-editor/
│       │   ├── step-form/
│       │   ├── script-preview/
│       │   └── publish-dialog/
│       ├── services/
│       │   ├── script.service.ts
│       │   └── preview-bridge.service.ts
│       └── models/
│           ├── script.model.ts
│           └── script-step.model.ts
```

### Critical Implementation Details

1. **Database Schema (PostgreSQL with Prisma):**

```sql
-- Script types enum
CREATE TYPE script_type AS ENUM ('walkthrough', 'modal');
CREATE TYPE script_status AS ENUM ('draft', 'published');

-- Scripts table
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type script_type NOT NULL,
  status script_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
);

-- Script steps table
CREATE TABLE script_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL,
  order_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  element_selector VARCHAR(500),  -- CSS selector for walkthrough target
  action_type VARCHAR(50),        -- click, input, navigate, etc.
  config JSONB,                   -- positioning, styling, timing
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_script FOREIGN KEY (script_id)
    REFERENCES scripts(id) ON DELETE CASCADE,
  CONSTRAINT unique_step_order UNIQUE (script_id, order_index)
);

CREATE INDEX idx_scripts_product_id ON scripts(product_id);
CREATE INDEX idx_script_steps_script_id ON script_steps(script_id);
```

2. **Ownership Chain Validation (Express):**

```typescript
// Verify complete ownership chain
export const verifyScriptOwnership = async (req, res, next) => {
  const scriptId = req.params.scriptId || req.params.id;

  const script = await db.scripts.findUnique({
    where: { id: scriptId },
    include: {
      product: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!script || script.product.project.tenant_id !== req.tenantId) {
    return res.status(404).json({ error: 'Script not found' });
  }

  req.script = script;
  next();
};
```

3. **Step Reordering Logic (Backend):**

```typescript
// Atomic reorder operation
export const reorderSteps = async (scriptId: string, stepIds: string[]) => {
  // Use transaction to ensure atomicity
  return await db.$transaction(async (tx) => {
    for (let i = 0; i < stepIds.length; i++) {
      await tx.scriptSteps.update({
        where: { id: stepIds[i], script_id: scriptId },
        data: { order_index: i },
      });
    }

    return tx.scriptSteps.findMany({
      where: { script_id: scriptId },
      orderBy: { order_index: 'asc' },
    });
  });
};
```

4. **Drag-and-Drop with Angular CDK:**

```typescript
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export class ScriptEditorComponent {
  steps = signal<ScriptStep[]>([]);

  drop(event: CdkDragDrop<ScriptStep[]>) {
    const steps = this.steps();
    moveItemInArray(steps, event.previousIndex, event.currentIndex);

    // Optimistic update
    this.steps.set(steps);

    // Persist to backend
    const stepIds = steps.map((s) => s.id);
    this.scriptService.reorderSteps(this.scriptId(), stepIds).subscribe({
      error: () => {
        // Rollback on error
        this.loadSteps();
      },
    });
  }
}
```

5. **Preview Integration with postMessage:**

```typescript
// preview-bridge.service.ts
export class PreviewBridgeService {
  private iframe!: HTMLIFrameElement;

  loadScript(script: Script) {
    // Send script to iframe via postMessage
    this.iframe.contentWindow?.postMessage(
      {
        type: 'LOAD_SCRIPT',
        payload: script,
      },
      '*',
    ); // TODO: validate origin
  }

  constructor() {
    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'SCRIPT_STEP_COMPLETED') {
        console.log('Step completed:', event.data.payload);
      }
    });
  }
}
```

### Learnings from Stories 1.1 & 1.2

**From Previous Implementations:**

- Reuse tenant isolation patterns with ownership chain validation
- Follow validation structure established in 1.1 and 1.2
- Use Angular Material components consistently
- Apply same error handling and loading state patterns

**New Patterns in This Story:**

- Drag-and-drop with Angular CDK (new capability)
- iframe communication with postMessage (new integration)
- Atomic transaction for reordering (database pattern)
- JSONB for flexible configuration storage

### Testing Standards

**Backend Tests:**

- Test CASCADE delete (delete script → steps deleted)
- Test reorder edge cases (empty list, single item, reverse order)
- Test ownership chain validation (3 levels deep)
- Test publish validation (requires at least one step)
- Minimum 80% code coverage

**Frontend Tests:**

- Test drag-and-drop reordering with CDK test harness
- Test preview iframe communication (mock postMessage)
- Test publish workflow with validation
- Test step CRUD operations
- Minimum 70% code coverage

### References

- [Source: docs/planning-artifacts/prd.md#Epic 1] - User Story 1.3 requirements
- [Source: docs/planning-artifacts/architecture.md#Technical Stack] - Angular CDK for drag-drop
- [Source: docs/planning-artifacts/architecture.md#Chrome Extension] - Preview system requirements
- [Source: docs/planning-artifacts/architecture.md#Script System] - Script types and configuration
- [Source: docs/implementation-artifacts/1-1-project-manager-create-projects.md] - Tenant isolation patterns
- [Source: docs/implementation-artifacts/1-2-product-manager-create-products.md] - Hierarchical ownership patterns

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL SECURITY:**

- Scripts inherit tenant through 3-level chain - validate complete path
- Preview iframe postMessage MUST validate origin
- Never trust step order from client - validate and renumber server-side

⚠️ **Common Mistakes:**

- Not handling concurrent edits to step order (race conditions)
- Forgetting to CASCADE delete steps when script deleted
- Not validating script type matches step requirements (walkthrough needs selectors)
- Missing error handling in drag-and-drop rollback
- Not checking for Chrome Extension before enabling preview

⚠️ **Performance Considerations:**

- Use single query with joins for ownership validation (not N queries)
- Cache ownership validation result per request
- Index script_id in script_steps for fast lookups
- Paginate steps for very long scripts (100+ steps)

⚠️ **UX Considerations:**

- Provide visual feedback during drag-and-drop
- Show loading state during preview initialization
- Clear error messages if preview fails (extension not installed)
- Warn before publishing scripts with no steps or incomplete steps

### Latest Technical Information

**Angular CDK Drag & Drop:**

- `@angular/cdk/drag-drop` provides accessible drag-drop primitives
- Use `cdkDropList` and `cdkDrag` directives
- Built-in animations and accessibility
- Supports touch devices

**postMessage Security:**

- Always validate `event.origin` before processing messages
- Use structured data format (type + payload)
- Consider using MessageChannel for two-way communication
- Implement timeout handling for missing responses

**JSONB in PostgreSQL:**

- Efficient storage for dynamic configuration
- Supports indexing on nested properties (GIN indexes)
- Use `jsonb_set` for partial updates
- Query with `->>` operator for JSON path access

## Dev Agent Record

### Agent Model Used

_To be filled by Dev agent_

### Debug Log References

_To be filled by Dev agent_

### Completion Notes List

_To be filled by Dev agent_

### File List

_To be filled by Dev agent_

---

## Story Completion Status

**Status:** ready-for-dev
**Created:** 2026-01-11
**Dependencies:** Stories 1.1 and 1.2 must be complete
**Next Action:** Run `dev-story` workflow to begin implementation

**This completes Epic 1!** With this story, the entire organizational hierarchy (Projects → Products → Scripts) is in place, and Product Managers can create the core training content that will be delivered to end users via the SDK.

After completing this story, Epic 1 is done and ready for retrospective. The next epic can focus on the Walkthrough Component (Epic 2) or Modal Component (Epic 3) to enable actual content delivery to end users.
