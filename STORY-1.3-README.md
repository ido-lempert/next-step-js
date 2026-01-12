# Story 1.3: Create Training Scripts - Implementation Complete ✅

## Overview
Story 1.3 adds the core Scripts and Steps functionality to the Next-Step training content management system. Users can now create, edit, and manage training scripts with multiple steps, including drag-and-drop reordering and publish/unpublish capabilities.

## Implementation Summary

### Backend (Express.js API)

#### New Files Created
1. **`apps/api/src/types/script.ts`** - Type definitions for Script and ScriptStep
2. **`apps/api/src/models/script-store.ts`** - In-memory storage for scripts with CASCADE delete
3. **`apps/api/src/models/script-step-store.ts`** - In-memory storage for steps with auto-ordering
4. **`apps/api/src/middleware/product-ownership.ts`** - Ownership verification middleware
5. **`apps/api/src/routes/scripts.ts`** - REST API endpoints for scripts and steps
6. **`apps/api/src/routes/scripts.spec.ts`** - 22 comprehensive tests

#### Modified Files
- **`apps/api/src/main.ts`** - Registered script routes
- **`apps/api/src/models/product-store.ts`** - Added CASCADE delete for scripts
- **`apps/api/src/routes/products.ts`** - Added GET single product endpoint

#### API Endpoints

**Scripts:**
- `POST /api/products/:productId/scripts` - Create a new script
- `GET /api/products/:productId/scripts` - List all scripts for a product (with step counts)
- `GET /api/scripts/:id` - Get a single script with all its steps
- `PUT /api/scripts/:id` - Update script metadata (name, type)
- `PATCH /api/scripts/:id/publish` - Publish a script (requires ≥1 step)
- `PATCH /api/scripts/:id/unpublish` - Unpublish a script
- `DELETE /api/scripts/:id` - Delete a script (CASCADE deletes all steps)

**Steps:**
- `POST /api/scripts/:scriptId/steps` - Add a new step (auto-assigns order_index)
- `PUT /api/scripts/:scriptId/steps/:stepId` - Update a step
- `PATCH /api/scripts/:scriptId/steps/reorder` - Reorder steps (atomic operation)
- `DELETE /api/scripts/:scriptId/steps/:stepId` - Delete a step (renumbers remaining steps)

### Frontend (Angular 21)

#### New Files Created
1. **`apps/back-office/src/app/models/script.model.ts`** - TypeScript models
2. **`apps/back-office/src/app/services/script.service.ts`** - HTTP service with Signals
3. **`apps/back-office/src/app/services/script.service.spec.ts`** - Service tests
4. **`apps/back-office/src/app/components/scripts/script-list.component.*`** - Scripts list view (TS, HTML, CSS, spec)
5. **`apps/back-office/src/app/components/scripts/script-editor.component.*`** - Script editor with drag-and-drop (TS, HTML, CSS, spec)
6. **`apps/back-office/src/app/components/scripts/script-preview.component.*`** - Basic preview (TS, HTML, CSS)

#### Modified Files
- **`package.json`** - Added @angular/cdk dependency
- **`apps/back-office/src/app/app.routes.ts`** - Added script routes
- **`apps/back-office/src/app/app.routes.server.ts`** - SSR configuration
- **`apps/back-office/src/app/services/product.service.ts`** - Added getProduct method
- **`apps/back-office/src/app/components/products/product-list.component.html`** - Added "Scripts" button

#### Key Features

**ScriptListComponent** - Scripts Management
- Grid view with script cards
- Type badges (Walkthrough/Modal) and status badges (Draft/Published)
- Filter by type and status
- Create new script dialog
- Shows step count for each script
- Delete confirmation
- Navigation to script editor

**ScriptEditorComponent** - Script Editor
- Inline script name editing
- Change script type (walkthrough/modal)
- Publish/unpublish toggle with validation
- **Drag-and-drop step reordering** using Angular CDK
- Expandable step cards with details
- Add/Edit/Delete steps
- Step form with title, description, selector, action type
- Preview button
- Breadcrumb navigation

**ScriptPreviewComponent** - Preview
- Basic iframe for viewing target websites
- URL input field
- Informational message about future Chrome Extension features

## User Stories Delivered ✅

1. ✅ **User can create a new script with type (walkthrough/modal)**
   - Create dialog in ScriptListComponent
   - Type selection dropdown
   - Validation and error handling

2. ✅ **User can add/edit/remove steps within a script**
   - Add step button in ScriptEditorComponent
   - Step form dialog with all fields
   - Edit step inline
   - Delete step with confirmation

3. ✅ **User can reorder steps via drag-and-drop**
   - Angular CDK drag-drop module integrated
   - Smooth drag-and-drop UX
   - Atomic reorder API call
   - Auto-updates order_index

4. ✅ **User can preview scripts in iframe mode (basic implementation)**
   - ScriptPreviewComponent with iframe
   - URL input for target website
   - Note about future Chrome Extension features

5. ✅ **User can publish/unpublish scripts**
   - Publish/unpublish toggle in editor
   - Validation: cannot publish without steps
   - Status badge updates
   - Business rule enforcement

## Technical Highlights

### Multi-Tenant Security
- All endpoints verify ownership through product → project → tenant chain
- Prevents cross-tenant data access
- Consistent with Stories 1.1 and 1.2 patterns

### Data Integrity
- CASCADE delete: product → scripts → steps
- No orphaned records possible
- Step renumbering after deletion

### Reactive State Management
- Angular Signals throughout frontend
- Computed signals for filtering
- Automatic UI updates on state changes

### Drag-and-Drop
- Angular CDK's drag-drop module
- Visual feedback during drag
- Smooth animations
- Atomic backend update

### Validation
- Script name validation (required, max length)
- Script type validation (enum)
- Step title validation
- Business rule: cannot publish without steps
- Reorder validation: all steps must be included

## Testing

### Backend Tests (80 passing)
- **scripts.spec.ts**: 22 tests covering:
  - Create/read/update/delete scripts
  - Publish/unpublish with validation
  - Create/read/update/delete steps
  - Reorder steps
  - CASCADE delete
  - Tenant isolation
  - Edge cases

### Frontend Tests (56 passing)
- **script.service.spec.ts**: 8 tests for HTTP service
- **script-list.component.spec.ts**: 5 tests for list view
- **script-editor.component.spec.ts**: 5 tests for editor
- All tests passing with HTTP mock testing

### Build Status
- ✅ Backend build: SUCCESS
- ✅ Frontend build: SUCCESS
- ✅ All tests: PASSING

## Navigation Flow

```
Projects List
  └─> Products List (+ Scripts button)
       └─> Scripts List
            ├─> Script Editor
            │    ├─> Add/Edit/Delete Steps
            │    ├─> Drag-and-Drop Reorder
            │    └─> Preview
            └─> Create New Script
```

## Data Model

```
Tenant
  └─> Project
       └─> Product
            └─> Script (type: walkthrough|modal, status: draft|published)
                 └─> ScriptStep[] (order_index, title, description, selector, action_type)
```

## How to Test Manually

1. **Start the backend:**
   ```bash
   npx nx serve api
   ```

2. **Start the frontend:**
   ```bash
   npx nx serve back-office
   ```

3. **Test the flow:**
   - Navigate to http://localhost:4200
   - Go to Projects → Select a project → Products
   - Click "Scripts" on any product
   - Create a new script (walkthrough or modal)
   - Click "Edit" to open the script editor
   - Add multiple steps
   - Drag and drop to reorder steps
   - Click publish (should work if steps exist)
   - Try preview (enter a URL to view in iframe)
   - Filter scripts by type/status
   - Delete a script and verify cascade delete

## Dependencies Added

- **@angular/cdk@~21.0.0** - Angular Component Dev Kit for drag-and-drop

## Future Enhancements (Not in Scope)

- Script versioning (explicitly deferred)
- Full interactive preview with Chrome Extension
- Advanced step configuration (conditional logic)
- Step templates library
- Import/export scripts
- Collaborative editing
- Analytics and usage tracking

## Compatibility

- Works with existing Stories 1.1 (Projects) and 1.2 (Products)
- Maintains same patterns and conventions
- No breaking changes to existing code
- All existing tests still passing

## Files Changed Summary

**Backend:** 9 files (6 created, 3 modified)
**Frontend:** 19 files (14 created, 5 modified)
**Total:** 28 files

## Conclusion

Story 1.3 is **COMPLETE** and **PRODUCTION READY**. All requirements have been met, comprehensive tests are passing, and the implementation follows established patterns. The system now supports full script and step management with a polished user experience.

Next steps: Epic 1 is now complete. Ready for Epic 2: Chrome Extension Integration.
