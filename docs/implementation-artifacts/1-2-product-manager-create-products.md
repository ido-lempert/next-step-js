# Story 1.2: Create Products - Hierarchical Content Organization

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **create products within projects to further organize my content**,
so that **I can structure training materials hierarchically and manage different products or feature sets within each project**.

## Acceptance Criteria

1. ✅ User can create products under a project
2. ✅ User can view products within a project
3. ✅ User can edit product details
4. ✅ User can delete products
5. ✅ Products inherit project permissions

**Priority:** P0 (Critical)

## Business Context

This is the **second story in Epic 1** - building on the project foundation to add the middle layer of the organizational hierarchy (Projects → **Products** → Scripts). Products allow Product Managers to segment content within projects, enabling granular organization by feature, product line, or logical grouping.

**Key Business Value:**

- Enables hierarchical content organization for complex products
- Provides flexibility for teams managing multiple products/features
- Foundation for script association and management

**Dependencies:**

- Story 1.1 must be complete (projects table and CRUD operations)
- Inherits tenant isolation from projects

## Tasks / Subtasks

### Backend Implementation

- [ ] **Task 1:** Database schema for products (AC: #1, #5)
  - [ ] 1.1: Create `products` table with project relationship
    - Columns: id (UUID), project_id (UUID), name (VARCHAR), description (TEXT), created_at, updated_at
    - Foreign key to projects(id) with CASCADE delete
    - Add index on project_id for query performance
    - Products inherit tenant through project relationship
  - [ ] 1.2: Set up Prisma/Drizzle ORM schema definition
    - Define relationship: Project hasMany Products
  - [ ] 1.3: Create and run database migrations

- [ ] **Task 2:** API endpoints for CRUD operations (AC: #1-4)
  - [ ] 2.1: POST /api/projects/:projectId/products - Create product
    - Validate: name (required, max 255), description (optional)
    - Verify project exists and belongs to tenant
    - Return 201 with created product object
  - [ ] 2.2: GET /api/projects/:projectId/products - List products
    - Verify project belongs to tenant (tenant isolation)
    - Support pagination
    - Return 200 with array of products
  - [ ] 2.3: PUT /api/products/:id - Update product
    - Verify product's project belongs to tenant
    - Validate: name, description
    - Return 200 with updated product
  - [ ] 2.4: DELETE /api/products/:id - Delete product
    - Verify product's project belongs to tenant
    - Check for dependent scripts (block delete if scripts exist)
    - Return 204 on success
- [ ] **Task 3:** Tenant isolation through project relationship (AC: #5)
  - [ ] 3.1: Query validation middleware
    - Ensure all product queries join to projects table
    - Verify project.tenant_id matches authenticated tenant
    - Block cross-tenant access attempts
  - [ ] 3.2: Cascade permissions from project
    - Product access = project access
    - No separate product permissions needed

### Frontend Implementation (Angular Back Office)

- [ ] **Task 4:** Product list view within project (AC: #2)
  - [ ] 4.1: Update ProjectDetailComponent
    - Add products section showing list of products
    - Display: product name, description, created date
    - Add "Create New Product" button
    - Handle empty state ("No products yet")
  - [ ] 4.2: Create ProductService for API calls
    - Injectable ProductService with HttpClient
    - Methods: getProducts(projectId), createProduct(projectId, data), updateProduct(id, data), deleteProduct(id)
    - Error handling with toasts/snackbars

- [ ] **Task 5:** Product create/edit form (AC: #1, #3)
  - [ ] 5.1: Create ProductFormComponent (reusable)
    - Form fields: name (required), description (optional textarea)
    - Use Angular Reactive Forms
    - Validation: name required, max length 255
    - Pass projectId as input
  - [ ] 5.2: Modal/dialog for form display
    - Angular Material Dialog
    - "Create" vs "Edit" mode
    - Cancel and Save buttons

- [ ] **Task 6:** Product delete confirmation (AC: #4)
  - [ ] 6.1: Confirmation dialog component
    - Display product name in confirmation
    - Warn about dependent scripts if applicable
    - Cancel and Delete buttons
  - [ ] 6.2: Handle delete success/error
    - Remove from list on success
    - Show error if scripts exist

- [ ] **Task 7:** Navigation integration
  - [ ] 7.1: Update routing
    - Route: /projects/:projectId/products
    - Route: /projects/:projectId/products/:productId
  - [ ] 7.2: Breadcrumb navigation
    - Projects → [Project Name] → Products

### Testing

- [ ] **Task 8:** Backend API tests
  - [ ] 8.1: Unit tests for product service/controller
  - [ ] 8.2: Integration tests for CRUD endpoints
  - [ ] 8.3: Tenant isolation tests (critical!)
    - Verify tenant A cannot access tenant B's products
    - Test cascade permissions from projects
    - Verify orphaned product access is blocked

- [ ] **Task 9:** Frontend component tests
  - [ ] 9.1: Unit tests for ProductListComponent
  - [ ] 9.2: Unit tests for ProductFormComponent
  - [ ] 9.3: Integration tests for user flows
    - Navigate to project → Create product → Edit → Delete

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Hierarchical Multi-Tenancy** [Source: architecture.md#Multi-Tenant Architecture]
   - Products inherit tenant isolation through project relationship
   - All product queries MUST join to projects and filter by tenant_id
   - Two-level permission check: project exists + project belongs to tenant
   - Never expose product without validating project ownership

2. **Technology Stack** [Source: architecture.md#Technical Stack]
   - Same stack as Story 1.1: Express.js, Angular v20+, PostgreSQL, Prisma/Drizzle
   - Reuse validation patterns from projects
   - Follow established routing conventions

3. **Database Relationships** [Source: architecture.md#Data Model]
   - Cascade delete: Deleting project deletes all products
   - Prevent orphaned products (foreign key constraint)
   - Consider soft delete for audit trail (future enhancement)

### Project Structure Notes

**Backend Structure:**

```
apps/api/src/
├── routes/
│   └── products.ts              # Product CRUD routes (nested under projects)
├── controllers/
│   └── productController.ts     # Business logic
├── models/
│   └── product.ts               # Prisma/Drizzle schema
├── middleware/
│   └── projectOwnership.ts      # Verify project belongs to tenant
└── validators/
    └── productValidators.ts     # Express Validator rules
```

**Frontend Structure:**

```
apps/back-office/src/app/
├── features/
│   ├── projects/
│   │   └── components/
│   │       └── project-detail/  # Shows products list
│   └── products/
│       ├── components/
│       │   ├── product-list/
│       │   ├── product-form/
│       │   └── product-delete-dialog/
│       ├── services/
│       │   └── product.service.ts
│       └── models/
│           └── product.model.ts
```

### Critical Implementation Details

1. **Database Schema (PostgreSQL with Prisma):**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_project_id ON products(project_id);
```

2. **Project Ownership Middleware (Express):**

```typescript
// Verify project belongs to authenticated tenant
export const verifyProjectOwnership = async (req, res, next) => {
  const projectId = req.params.projectId || req.body.project_id;

  const project = await db.projects.findUnique({
    where: {
      id: projectId,
      tenant_id: req.tenantId, // From auth middleware
    },
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  req.project = project;
  next();
};
```

3. **Nested Resource Routing (Express):**

```typescript
// products.ts routes
router.post('/projects/:projectId/products', authenticate, tenantContext, verifyProjectOwnership, validateProduct, productController.create);

router.get('/projects/:projectId/products', authenticate, tenantContext, verifyProjectOwnership, productController.list);
```

4. **Angular Hierarchical Navigation:**

```typescript
// product-list.component.ts
export class ProductListComponent {
  projectId = input.required<string>(); // Angular 20 input signal
  products = signal<Product[]>([]);

  constructor(private productService: ProductService) {
    effect(() => {
      // Automatically reload when projectId changes
      this.loadProducts(this.projectId());
    });
  }
}
```

### Learnings from Story 1.1

**From Previous Implementation:**

- Reuse tenant context middleware pattern
- Follow same validation structure with Express Validator
- Use Angular Material Dialog pattern established in projects
- Apply same testing patterns for isolation

**Code Patterns to Replicate:**

- Service layer structure (controller → service → repository)
- Error handling with consistent error format
- Angular signals for reactive state
- Form validation patterns

### Testing Standards

**Backend Tests:**

- Test CASCADE delete behavior (delete project → products deleted)
- Test orphaned product prevention (cannot create product for non-existent project)
- Test cross-tenant access (tenant A cannot access tenant B's products even with valid project_id)
- Minimum 80% code coverage

**Frontend Tests:**

- Test product list within project detail view
- Test hierarchical navigation (breadcrumbs)
- Test create/edit/delete flows
- Minimum 70% code coverage

### References

- [Source: docs/planning-artifacts/prd.md#Epic 1] - User Story 1.2 requirements
- [Source: docs/planning-artifacts/architecture.md#Technical Stack] - Same stack as Story 1.1
- [Source: docs/planning-artifacts/architecture.md#Multi-Tenant Architecture] - Cascade tenant isolation
- [Source: docs/implementation-artifacts/1-1-project-manager-create-projects.md] - Patterns from previous story

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL SECURITY:**

- Products inherit tenant isolation from projects - MUST validate project ownership first
- Never trust projectId from client without verification
- Test cascade delete behavior thoroughly

⚠️ **Common Mistakes:**

- Forgetting to check for dependent scripts before delete
- Not handling the case where project is deleted while viewing products
- Missing breadcrumb navigation back to projects
- Not reusing validation patterns from Story 1.1

⚠️ **Performance Considerations:**

- Index project_id for fast lookups
- Consider eager loading products when fetching project details
- Paginate product lists for projects with many products

### Latest Technical Information

**Same as Story 1.1:**

- Angular 20 Signals for reactivity
- Express.js v5 async/await patterns
- PostgreSQL CASCADE constraints for referential integrity

**New Pattern: Nested Resources:**

- Follow RESTful nested resource conventions
- Use `/projects/:projectId/products` for context-specific operations
- Use `/products/:id` for product-specific operations (still validate ownership)

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
**Dependencies:** Story 1.1 must be complete
**Next Action:** Run `dev-story` workflow to begin implementation

This story builds on Story 1.1's foundation, extending the organizational hierarchy to support products within projects. All security patterns, validation approaches, and UI patterns from 1.1 should be replicated and adapted for products.
