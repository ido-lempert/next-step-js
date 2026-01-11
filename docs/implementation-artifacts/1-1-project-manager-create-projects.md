# Story 1.1: Create Projects - Multi-Tenant Project Management

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **create projects to organize my training content by product or feature area**,
so that **I can efficiently manage and structure training materials across different products and features in a multi-tenant environment**.

## Acceptance Criteria

1. ✅ User can create a new project with a name and description
2. ✅ User can view a list of all projects
3. ✅ User can edit project details
4. ✅ User can delete projects (with confirmation)
5. ✅ Projects are isolated by tenant (multi-tenant)

**Priority:** P0 (Critical)

## Business Context

This is the **foundational story for Epic 1** - establishing the core organizational hierarchy (Projects → Products → Scripts) for the Next-Step training platform. Projects serve as the top-level organizational unit, allowing Product Managers to segment training content by product lines, feature areas, or any logical grouping that makes sense for their organization.

**Key Business Value:**

- Enables multi-tenant SaaS architecture from day one
- Provides clear content organization for enterprise customers
- Foundation for all subsequent features in the platform

## Tasks / Subtasks

### Backend Implementation

- [ ] **Task 1:** Database schema for projects (AC: #5)
  - [ ] 1.1: Create `projects` table with tenant isolation
    - Columns: id (UUID), tenant_id (UUID), name (VARCHAR), description (TEXT), created_at, updated_at
    - Add indexes on tenant_id for query performance
    - Enforce NOT NULL on tenant_id for multi-tenant isolation
  - [ ] 1.2: Set up Prisma/Drizzle ORM schema definition
  - [ ] 1.3: Create and run database migrations

- [ ] **Task 2:** API endpoints for CRUD operations (AC: #1-4)
  - [ ] 2.1: POST /api/projects - Create new project
    - Validate: name (required, max 255 chars), description (optional)
    - Auto-inject tenant_id from authenticated user context
    - Return 201 with created project object
  - [ ] 2.2: GET /api/projects - List all projects for tenant
    - Filter by tenant_id automatically from auth context
    - Support pagination (limit/offset or cursor-based)
    - Return 200 with array of projects
  - [ ] 2.3: PUT /api/projects/:id - Update project
    - Validate: name, description
    - Verify tenant_id match before update
    - Return 200 with updated project
  - [ ] 2.4: DELETE /api/projects/:id - Delete project
    - Verify tenant_id match
    - Check for dependent products (block delete if products exist)
    - Return 204 on success
- [ ] **Task 3:** Multi-tenant security middleware (AC: #5)
  - [ ] 3.1: Create tenant context middleware
    - Extract tenant_id from JWT/session
    - Inject into request context
    - Block requests without valid tenant
  - [ ] 3.2: Row-level security checks
    - Verify all queries filter by tenant_id
    - Prevent cross-tenant data access

### Frontend Implementation (Angular Back Office)

- [ ] **Task 4:** Project list view component (AC: #2)
  - [ ] 4.1: Create ProjectListComponent
    - Display projects in card/table format
    - Show: project name, description, created date
    - Add "Create New Project" button
    - Handle empty state with helpful message
  - [ ] 4.2: Implement project service for API calls
    - Injectable ProjectService with HttpClient
    - Methods: getProjects(), createProject(), updateProject(), deleteProject()
    - Error handling with toasts/snackbars

- [ ] **Task 5:** Project create/edit form (AC: #1, #3)
  - [ ] 5.1: Create ProjectFormComponent (reusable for create/edit)
    - Form fields: name (required), description (optional textarea)
    - Use Angular Reactive Forms
    - Validation: name required, max length 255
  - [ ] 5.2: Modal/dialog for form display
    - Angular Material Dialog
    - "Create" vs "Edit" mode based on input
    - Cancel and Save buttons with proper state handling

- [ ] **Task 6:** Project delete confirmation (AC: #4)
  - [ ] 6.1: Confirmation dialog component
    - Display project name in confirmation message
    - Warn about dependent products if applicable
    - Cancel and Delete buttons
  - [ ] 6.2: Handle delete success/error
    - Remove from list on success
    - Show error message if products exist

### Testing

- [ ] **Task 7:** Backend API tests
  - [ ] 7.1: Unit tests for project service/controller
  - [ ] 7.2: Integration tests for CRUD endpoints
  - [ ] 7.3: Multi-tenant isolation tests (critical!)
    - Verify tenant A cannot access tenant B's projects
    - Test all CRUD operations with different tenant contexts

- [ ] **Task 8:** Frontend component tests
  - [ ] 8.1: Unit tests for ProjectListComponent
  - [ ] 8.2: Unit tests for ProjectFormComponent
  - [ ] 8.3: Integration tests for user flows
    - Create → List → Edit → Delete flow

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Multi-Tenant Architecture** [Source: architecture.md#Multi-Tenant Architecture]
   - CRITICAL: All database queries MUST filter by `tenant_id`
   - Use row-level security or middleware injection
   - Never expose tenant_id in API responses or allow client to set it
   - JWT/session contains tenant_id - extract server-side only

2. **Technology Stack** [Source: architecture.md#Technical Stack]
   - **Backend:** Express.js (Node.js v5.x)
   - **Frontend:** Angular v20+ with Signals
   - **Database:** PostgreSQL (or in-memory for MVP/dev)
   - **ORM:** Prisma or Drizzle ORM
   - **Validation:** Express Validator
   - **UI:** Angular Material

3. **API Design Patterns** [Source: architecture.md#API Architecture]
   - RESTful endpoints following resource-based naming
   - Use HTTP status codes correctly (201 created, 204 no content, etc.)
   - Include proper error messages with consistent format
   - CORS configuration for Back Office access

4. **Security Headers** [Source: architecture.md#Security]
   - Use Helmet.js for security headers
   - CORS middleware properly configured
   - Input validation on all endpoints
   - Authentication middleware before all protected routes

### Project Structure Notes

**Backend Structure:**

```
apps/api/src/
├── routes/
│   └── projects.ts          # Project CRUD routes
├── controllers/
│   └── projectController.ts # Business logic
├── models/
│   └── project.ts           # Prisma/Drizzle schema
├── middleware/
│   └── tenantContext.ts     # Tenant isolation middleware
└── validators/
    └── projectValidators.ts # Express Validator rules
```

**Frontend Structure:**

```
apps/back-office/src/app/
├── features/
│   └── projects/
│       ├── components/
│       │   ├── project-list/
│       │   ├── project-form/
│       │   └── project-delete-dialog/
│       ├── services/
│       │   └── project.service.ts
│       └── models/
│           └── project.model.ts
```

### Critical Implementation Details

1. **Database Schema (PostgreSQL with Prisma):**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
```

2. **Tenant Context Middleware (Express):**

```typescript
// Extract tenant from JWT and inject into request
export const tenantContext = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.tenantId = decoded.tenant_id;

  if (!req.tenantId) {
    return res.status(401).json({ error: 'Invalid tenant context' });
  }

  next();
};
```

3. **Angular Signals for Reactive State (Angular 20+):**

```typescript
// Use signals for reactive project list
export class ProjectListComponent {
  projects = signal<Project[]>([]);
  loading = signal(false);

  constructor(private projectService: ProjectService) {
    this.loadProjects();
  }

  loadProjects() {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
    });
  }
}
```

### Testing Standards

**Backend Tests:**

- Use Jest or Mocha/Chai
- Mock database calls with in-memory DB or mocks
- Test multi-tenant isolation with different tenant_id values
- Minimum 80% code coverage

**Frontend Tests:**

- Use Jasmine/Karma (default Angular) or Jest
- Mock HttpClient with HttpClientTestingModule
- Test component inputs/outputs
- Test form validation logic
- Minimum 70% code coverage

### References

- [Source: docs/planning-artifacts/prd.md#Epic 1] - User Story 1.1 requirements
- [Source: docs/planning-artifacts/architecture.md#Technical Stack] - Angular v20+, Express.js, PostgreSQL
- [Source: docs/planning-artifacts/architecture.md#Multi-Tenant Architecture] - Tenant isolation patterns
- [Source: docs/planning-artifacts/architecture.md#Security] - Helmet.js, CORS, authentication middleware

### Important Gotchas & Anti-Patterns to Avoid

⚠️ **CRITICAL SECURITY:**

- Never trust client-provided tenant_id - ALWAYS extract from server-side auth token
- Test cross-tenant access thoroughly - this is a security vulnerability if broken
- Ensure all database queries include tenant_id filter

⚠️ **Common Mistakes:**

- Forgetting to check for dependent products before delete
- Not handling concurrent edits (consider optimistic locking or timestamps)
- Missing proper error handling in API responses
- Not validating input lengths (SQL injection, buffer overflow risks)

⚠️ **Performance Considerations:**

- Index tenant_id for fast queries
- Consider pagination from the start (even if small dataset initially)
- Cache project list if frequently accessed

### Latest Technical Information

**Angular 20 (Latest Stable):**

- Signals are now the preferred reactivity primitive (replaces RxJS for simple state)
- Standalone components are the default (no NgModules needed)
- Improved performance with deferred views and built-in lazy loading
- Use `inject()` function instead of constructor injection for better tree-shaking

**Express.js v5:**

- Async/await support without needing try-catch wrappers (use express-async-errors)
- Improved error handling middleware
- Better TypeScript support with @types/express

**PostgreSQL Best Practices:**

- Use UUID v4 for primary keys (better for distributed systems)
- Use TIMESTAMP WITH TIME ZONE for all datetime fields
- Use TEXT instead of VARCHAR for description (no performance penalty, more flexible)

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
**Next Action:** Run `dev-story` workflow to begin implementation

This story document provides comprehensive context for flawless implementation. All architectural constraints, security requirements, and technical patterns have been extracted and included to prevent common developer mistakes.
