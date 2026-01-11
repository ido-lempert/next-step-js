# Projects Feature

This feature implements multi-tenant project management for the Next-Step training platform.

## Overview

Projects serve as the top-level organizational unit for training content, allowing Product Managers to segment content by product lines, feature areas, or any logical grouping.

## Architecture

### Backend (Express.js)

- **In-memory storage**: Uses JavaScript Map for MVP (easily replaceable with PostgreSQL)
- **Tenant isolation**: All operations strictly enforce tenant boundaries
- **RESTful API**: Standard CRUD operations at `/api/projects`
- **Validation**: Input validation on all endpoints
- **Security**: Tenant context middleware prevents cross-tenant access

### Frontend (Angular 21)

- **Signals**: Reactive state management using Angular Signals
- **Standalone Components**: No NgModules required
- **Material UI**: Consistent design with Angular Material
- **Lazy Loading**: Project list component lazy-loaded on route access

## API Endpoints

All endpoints require `X-Tenant-Id` header for authentication.

### Create Project
```
POST /api/projects
Content-Type: application/json
X-Tenant-Id: <tenant-uuid>

{
  "name": "Project Name",
  "description": "Optional description"
}

Response: 201 Created
{
  "id": "uuid",
  "tenantId": "tenant-uuid",
  "name": "Project Name",
  "description": "Optional description",
  "createdAt": "2026-01-11T...",
  "updatedAt": "2026-01-11T..."
}
```

### List Projects
```
GET /api/projects
X-Tenant-Id: <tenant-uuid>

Response: 200 OK
[
  { "id": "...", "name": "...", ... }
]
```

### Get Single Project
```
GET /api/projects/:id
X-Tenant-Id: <tenant-uuid>

Response: 200 OK / 404 Not Found
```

### Update Project
```
PUT /api/projects/:id
Content-Type: application/json
X-Tenant-Id: <tenant-uuid>

{
  "name": "Updated Name",
  "description": "Updated description"
}

Response: 200 OK / 404 Not Found
```

### Delete Project
```
DELETE /api/projects/:id
X-Tenant-Id: <tenant-uuid>

Response: 204 No Content / 404 Not Found
```

## Security

### Multi-Tenant Isolation

**CRITICAL**: The system enforces strict tenant isolation:

1. All API requests require `X-Tenant-Id` header
2. All database queries filter by `tenantId`
3. Cross-tenant access returns 404 (not 403 to avoid information leakage)
4. Tenant ID is NEVER accepted from client input - only from auth context

### Testing

Run backend tests to verify tenant isolation:

```bash
npx nx test api
```

All 21 tests should pass, including critical multi-tenant security tests.

## Frontend Usage

Navigate to `/projects` to access the projects management interface:

- **Empty State**: Shows when no projects exist with call-to-action
- **Project Cards**: Grid layout showing all projects
- **Create**: Click "Create Project" button to open form dialog
- **Edit**: Click "Edit" button on any project card
- **Delete**: Click "Delete" button with confirmation dialog

## Development

### Running the API

```bash
npx nx serve api
# API available at http://localhost:3333
```

### Running the Frontend

```bash
npx nx serve back-office
# UI available at http://localhost:4200
```

### Building

```bash
# Build API
npx nx build api

# Build Frontend
npx nx build back-office
```

### Testing

```bash
# Run API tests
npx nx test api

# Run Frontend tests (when implemented)
npx nx test back-office
```

## Future Enhancements

1. **Database**: Replace in-memory storage with PostgreSQL + Prisma
2. **Authentication**: Replace header-based auth with JWT tokens
3. **Pagination**: Add pagination support for large project lists
4. **Search**: Add project search and filtering
5. **Sorting**: Allow sorting by name, date, etc.
6. **Permissions**: Add role-based access control
7. **Audit Log**: Track all project changes
8. **Products**: Implement child products feature (Story 1.2)

## Implementation Notes

- Uses TypeScript for type safety
- Express middleware pattern for tenant context
- Angular Signals for reactivity (preferred over RxJS for simple state)
- Material UI for consistent design system
- Standalone components (Angular 21 best practice)
- Comprehensive error handling with user-friendly messages

## File Structure

```
apps/
├── api/src/
│   ├── controllers/project.controller.ts
│   ├── middleware/tenant-context.ts
│   ├── models/project.ts
│   ├── routes/projects.ts
│   ├── services/project.service.ts
│   └── validators/project-validators.ts
├── back-office/src/app/features/projects/
│   ├── components/
│   │   ├── project-list/
│   │   ├── project-form/
│   │   └── project-delete-dialog/
│   ├── models/project.model.ts
│   └── services/project.service.ts
```

## Related Stories

- **Story 1.1**: Create Projects (Current - COMPLETED)
- **Story 1.2**: Create Products (Next - depends on Projects)
- **Story 1.3**: Create Scripts (Future - depends on Products)
