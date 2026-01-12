# Story 1.1 Implementation - Multi-Tenant Project Management

## Overview
This implementation provides a complete CRUD (Create, Read, Update, Delete) system for managing projects with multi-tenant isolation. Projects are the top-level entity in the Next-Step training content management system.

## Features Implemented

### Backend (API)
- ✅ In-memory data store for projects using Map
- ✅ Multi-tenant isolation via X-Tenant-Id header
- ✅ RESTful API endpoints for project management
- ✅ Input validation (name required, max 255 characters)
- ✅ Comprehensive error handling
- ✅ Unit and integration tests

### Frontend (Angular)
- ✅ Project list view with table display
- ✅ Project create/edit form with reactive forms
- ✅ Delete confirmation dialog
- ✅ Angular 21 Signals for reactive state management
- ✅ HttpClient service integration
- ✅ Proper error handling and loading states
- ✅ Component unit tests

## API Endpoints

### Create Project
```
POST /api/projects
Headers: X-Tenant-Id: <tenant-id>
Body: { "name": "Project Name", "description": "Optional description" }
Response: 201 Created with project object
```

### List Projects
```
GET /api/projects
Headers: X-Tenant-Id: <tenant-id>
Response: 200 OK with array of projects
```

### Get Project
```
GET /api/projects/:id
Headers: X-Tenant-Id: <tenant-id>
Response: 200 OK with project object, or 404 Not Found
```

### Update Project
```
PUT /api/projects/:id
Headers: X-Tenant-Id: <tenant-id>
Body: { "name": "Updated Name", "description": "Updated description" }
Response: 200 OK with updated project object, or 404 Not Found
```

### Delete Project
```
DELETE /api/projects/:id
Headers: X-Tenant-Id: <tenant-id>
Response: 204 No Content, or 404 Not Found
```

## Data Model

```typescript
interface Project {
  id: string;              // UUID v4
  tenant_id: string;       // Tenant identifier
  name: string;            // Required, max 255 chars
  description?: string;    // Optional
  created_at: Date;        // Auto-generated
  updated_at: Date;        // Auto-updated
}
```

## Multi-Tenant Security

- All API endpoints require `X-Tenant-Id` header
- Projects are automatically filtered by tenant
- Tenant A cannot access Tenant B's projects
- Returns 404 if trying to access another tenant's project

## Running the Application

### Start Backend
```bash
npx nx serve api
# API runs on http://localhost:3333
```

### Start Frontend
```bash
npx nx serve back-office
# Frontend runs on http://localhost:4200
```

### Run Tests
```bash
# Backend tests
npx nx test api

# Frontend tests
npx nx test back-office

# All tests
npx nx run-many --target=test --all
```

## Testing

### Backend Tests
- Project store unit tests (13 tests)
- API route integration tests (20 tests)
- Multi-tenant isolation tests
- Validation tests

### Frontend Tests
- Service unit tests (7 tests)
- Component tests (18 tests)
- Form validation tests
- Navigation tests

### Manual Testing
Example curl commands:

```bash
# Create a project
curl -X POST http://localhost:3333/api/projects \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-1" \
  -d '{"name": "My Project", "description": "A test project"}'

# List projects
curl -H "X-Tenant-Id: tenant-1" http://localhost:3333/api/projects

# Update a project
curl -X PUT http://localhost:3333/api/projects/{id} \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-1" \
  -d '{"name": "Updated Name"}'

# Delete a project
curl -X DELETE -H "X-Tenant-Id: tenant-1" http://localhost:3333/api/projects/{id}
```

## File Structure

### Backend
```
apps/api/src/
├── main.ts                    # Express app setup and routing
├── types/
│   └── project.ts            # TypeScript interfaces
├── models/
│   ├── project-store.ts      # In-memory data store
│   └── project-store.spec.ts # Store unit tests
├── middleware/
│   └── tenant.ts             # Tenant context middleware
└── routes/
    ├── projects.ts           # Project API routes
    └── projects.spec.ts      # API integration tests
```

### Frontend
```
apps/back-office/src/app/
├── models/
│   └── project.model.ts      # TypeScript interfaces
├── services/
│   ├── project.service.ts    # HTTP service
│   └── project.service.spec.ts
└── components/
    └── projects/
        ├── project-list.component.ts
        ├── project-list.component.html
        ├── project-list.component.css
        ├── project-list.component.spec.ts
        ├── project-form.component.ts
        ├── project-form.component.html
        ├── project-form.component.css
        └── project-form.component.spec.ts
```

## Technology Stack

- **Backend**: Express.js, TypeScript, Vitest
- **Frontend**: Angular 21, Signals, Reactive Forms, Vitest
- **Testing**: Vitest, Supertest
- **Build Tool**: Nx

## Notes

- For MVP, tenant ID is passed via header. In production, this would come from JWT authentication.
- In-memory storage means data is lost on server restart. This is by design for MVP.
- The implementation follows the minimal change principle with surgical modifications.

## Next Steps

After Story 1.1, the following features can be built on this foundation:
- Story 1.2: Products (child of Projects)
- Story 1.3: Scripts (child of Products)
- User authentication and JWT-based tenant identification
- Database persistence (replacing in-memory store)
