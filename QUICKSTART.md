# Quick Start Guide - Projects Feature

## Prerequisites
- Node.js v20.x
- npm v10.x

## Installation

```bash
# Install dependencies (if not already done)
npm install
```

## Running the Application

### Option 1: Development Mode (Recommended)

```bash
# Terminal 1: Start API server
npx nx serve api
# API will be available at http://localhost:3333

# Terminal 2: Start Angular frontend
npx nx serve back-office
# UI will be available at http://localhost:4200
```

### Option 2: Production Build

```bash
# Build both applications
npx nx build api
npx nx build back-office

# Run built API
node dist/apps/api/main.js

# Serve built frontend
npx nx serve-static back-office
```

## Testing the Application

### Backend Tests

```bash
# Run all backend tests (21 tests)
npx nx test api

# Expected output:
# ✓ api src/services/project.service.spec.ts (13 tests)
# ✓ api src/controllers/project.controller.spec.ts (8 tests)
# Test Files: 2 passed (2)
# Tests: 21 passed (21)
```

### Manual API Testing

```bash
# Create a project
curl -X POST http://localhost:3333/api/projects \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-demo-001" \
  -d '{
    "name": "My First Project",
    "description": "This is a test project"
  }'

# List projects
curl -X GET http://localhost:3333/api/projects \
  -H "X-Tenant-Id: tenant-demo-001"

# Get single project
curl -X GET http://localhost:3333/api/projects/{project-id} \
  -H "X-Tenant-Id: tenant-demo-001"

# Update project
curl -X PUT http://localhost:3333/api/projects/{project-id} \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-demo-001" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'

# Delete project
curl -X DELETE http://localhost:3333/api/projects/{project-id} \
  -H "X-Tenant-Id: tenant-demo-001"
```

## Using the Frontend

1. Open http://localhost:4200 in your browser
2. You'll be redirected to `/projects`
3. Click "Create Project" to add a new project
4. View all projects in the card grid
5. Click "Edit" to modify a project
6. Click "Delete" to remove a project (with confirmation)

## Multi-Tenant Testing

To test tenant isolation:

```bash
# Create project for tenant 1
curl -X POST http://localhost:3333/api/projects \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-001" \
  -d '{"name": "Tenant 1 Project"}'

# Create project for tenant 2
curl -X POST http://localhost:3333/api/projects \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-002" \
  -d '{"name": "Tenant 2 Project"}'

# Verify tenant 1 only sees their project
curl -X GET http://localhost:3333/api/projects \
  -H "X-Tenant-Id: tenant-001"
# Should only return "Tenant 1 Project"

# Verify tenant 2 only sees their project
curl -X GET http://localhost:3333/api/projects \
  -H "X-Tenant-Id: tenant-002"
# Should only return "Tenant 2 Project"
```

## Troubleshooting

### API won't start
- Check if port 3333 is available
- Run `npm install` to ensure dependencies are installed
- Check `apps/api/src/main.ts` for errors

### Frontend won't start
- Check if port 4200 is available
- Run `npm install` to ensure dependencies are installed
- Clear Nx cache: `npx nx reset`

### CORS errors
- Ensure API is running on port 3333
- Check CORS headers in `apps/api/src/main.ts`
- Verify `X-Tenant-Id` header is being sent

### Tests failing
- Run `npx nx reset` to clear cache
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v20.x)

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Angular Frontend (Port 4200)          │
│                                                  │
│  ┌──────────────┐  ┌───────────────┐           │
│  │ Project List │  │ Project Form  │           │
│  │  Component   │  │   Component   │           │
│  └──────────────┘  └───────────────┘           │
│                                                  │
│         ┌──────────────────────┐               │
│         │  Project Service     │               │
│         │  (HTTP Client)       │               │
│         └──────────────────────┘               │
└──────────────────┬──────────────────────────────┘
                   │ HTTP + X-Tenant-Id header
                   ▼
┌─────────────────────────────────────────────────┐
│            Express.js API (Port 3333)           │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │      Tenant Context Middleware           │  │
│  │  (Extracts & validates tenant_id)        │  │
│  └──────────────────────────────────────────┘  │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │         Project Routes                   │  │
│  │  POST/GET/PUT/DELETE /api/projects       │  │
│  └──────────────────────────────────────────┘  │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │       Validation Middleware              │  │
│  └──────────────────────────────────────────┘  │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │      Project Controller                  │  │
│  └──────────────────────────────────────────┘  │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │      Project Service                     │  │
│  │   (In-Memory Storage with Map)           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Key Features

✅ **Multi-Tenant Security**: Strict tenant isolation
✅ **CRUD Operations**: Create, Read, Update, Delete
✅ **Validation**: Input validation on all endpoints
✅ **Error Handling**: User-friendly error messages
✅ **Responsive UI**: Material Design components
✅ **Type Safety**: Full TypeScript implementation
✅ **Testing**: 21 comprehensive backend tests

## Next Steps

- **Story 1.2**: Implement Products feature (child of Projects)
- **Authentication**: Replace header-based auth with JWT
- **Database**: Migrate from in-memory to PostgreSQL
- **Pagination**: Add pagination for large datasets
- **Search**: Implement project search functionality

## Support

For issues or questions:
1. Check the `IMPLEMENTATION_SUMMARY.md` for detailed documentation
2. Review test files for usage examples
3. Check the feature README at `apps/back-office/src/app/features/projects/README.md`
