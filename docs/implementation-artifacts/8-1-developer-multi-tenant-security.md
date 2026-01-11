# Story 8.1: Multi-Tenant Architecture - Security & Isolation Validation

Status: ready-for-dev

## Story

As a **Developer**,
I want to **validate that multi-tenant isolation is enforced across all database queries and API endpoints**,
so that **no data leakage occurs between customers**.

## Acceptance Criteria

1. ✅ Row-level security (RLS) enforced on all tables
2. ✅ All queries include tenant_id filter
3. ✅ Middleware validates tenant context on every request
4. ✅ API keys scoped to specific tenants
5. ✅ Security tests validate isolation (cannot access other tenant's data)
6. ✅ Automated tests run on every PR

**Priority:** P0 (Critical)

## Business Context

**Security is non-negotiable** for SaaS products. A single data leak can destroy customer trust and violate regulations (GDPR, HIPAA).

**Key Business Value:**

- Customer trust (secure by design)
- Compliance (SOC 2, ISO 27001)
- Risk mitigation (no data breaches)

**Dependencies:**

- All previous stories (entire codebase must be validated)

## Tasks / Subtasks

### Database Security

- [ ] **Task 1:** Row-level security (AC: #1)
  - [ ] 1.1: Enable RLS on all tables
    - ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
    - For: projects, products, scripts, steps, analytics_events, etc.
  - [ ] 1.2: RLS policies
    - Policy: users can only see rows where tenant_id = current_tenant_id
    - Use Prisma middleware or database roles
  - [ ] 1.3: Test RLS
    - Connect as different tenants
    - Verify no cross-tenant queries succeed

- [ ] **Task 2:** Query validation (AC: #2)
  - [ ] 2.1: Prisma middleware
    - Intercept all queries
    - Automatically inject tenant_id filter
    - Block queries without tenant context
  - [ ] 2.2: Code review checklist
    - All Prisma queries include where: { tenantId }
    - No raw SQL without tenant filter
  - [ ] 2.3: Linting rule
    - Custom ESLint rule to detect missing tenant filters
    - Fail CI if violations found

### API Security

- [ ] **Task 3:** Tenant middleware (AC: #3, #4)
  - [ ] 3.1: JWT validation
    - Extract tenant_id from JWT payload
    - Attach to req.tenant
  - [ ] 3.2: API key validation
    - API keys scoped to tenant
    - Query: SELECT tenant_id FROM api_keys WHERE key = ?
    - Attach to req.tenant
  - [ ] 3.3: Request context
    - All routes have access to req.tenant
    - Reject requests without valid tenant

- [ ] **Task 4:** Endpoint audit (AC: #2)
  - [ ] 4.1: Review all API routes
    - Ensure all queries use req.tenant.id
    - Ensure no endpoints bypass tenant checks
  - [ ] 4.2: Dangerous patterns
    - Search for: findMany(), findFirst() without tenantId
    - Search for: DELETE FROM, UPDATE ... without tenant filter
  - [ ] 4.3: Automated scan
    - Script to detect queries without tenant filter
    - Run in CI pipeline

### Security Testing

- [ ] **Task 5:** Automated security tests (AC: #5, #6)
  - [ ] 5.1: Test suite setup
    - Create two test tenants (Tenant A, Tenant B)
    - Seed with test data
  - [ ] 5.2: Cross-tenant access tests
    - Test: Tenant A cannot read Tenant B's projects
    - Test: Tenant A cannot update Tenant B's scripts
    - Test: Tenant A cannot delete Tenant B's data
  - [ ] 5.3: API key scoping tests
    - Test: API key for Tenant A cannot access Tenant B's data
    - Test: Invalid API key returns 401
  - [ ] 5.4: JWT manipulation tests
    - Test: Modifying tenant_id in JWT fails signature validation
    - Test: Expired JWT returns 401
  - [ ] 5.5: CI integration
    - Run security tests on every PR
    - Fail build if any test fails

### Documentation

- [ ] **Task 6:** Security documentation
  - [ ] 6.1: Architecture doc update
    - Document multi-tenant isolation strategy
    - Database schema (tenant_id on all tables)
    - Middleware flow
  - [ ] 6.2: Developer onboarding
    - "Never query without tenant_id" rule
    - Examples of correct queries
    - Common pitfalls to avoid
  - [ ] 6.3: Security best practices
    - JWT handling
    - API key rotation
    - Audit logging

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Multi-Tenant Architecture** [Source: architecture.md#Multi-Tenant]
   - Row-level security enforced
   - Every table has tenant_id column
   - Database queries always include tenant filter

2. **Authentication** [Source: architecture.md#Authentication]
   - JWT contains tenant_id
   - API keys scoped to tenant
   - Middleware validates on every request

3. **Security Testing** [Source: architecture.md#Security]
   - Automated tests validate isolation
   - Run on every PR
   - No data leakage tolerated

### Project Structure Notes

**Security Tests:**

```
apps/api/src/
├── __tests__/
│   └── security/
│       ├── tenant-isolation.test.ts    # Core isolation tests
│       ├── api-key-scoping.test.ts     # API key tests
│       └── jwt-validation.test.ts      # JWT tests
└── middleware/
    └── tenant.middleware.ts            # Tenant context
```

### Critical Implementation Details

1. **Database Schema (All Tables):**

```sql
-- Example: projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their tenant's rows
CREATE POLICY tenant_isolation_policy ON projects
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Same for all other tables: products, scripts, steps, etc.
```

2. **Prisma Middleware (Tenant Injection):**

```typescript
// apps/api/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Middleware to inject tenant_id into all queries
prisma.$use(async (params, next) => {
  const tenantId = getTenantContext(); // From request context (req.tenant.id)

  if (!tenantId) {
    throw new Error('Tenant context missing');
  }

  // Add tenant_id filter to all queries
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      tenantId,
    };
  }

  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      tenantId,
    };
  }

  if (params.action === 'update' || params.action === 'updateMany') {
    params.args.where = {
      ...params.args.where,
      tenantId,
    };
  }

  if (params.action === 'delete' || params.action === 'deleteMany') {
    params.args.where = {
      ...params.args.where,
      tenantId,
    };
  }

  return next(params);
});

// Request context storage (AsyncLocalStorage)
import { AsyncLocalStorage } from 'async_hooks';

const tenantContext = new AsyncLocalStorage<string>();

export function setTenantContext(tenantId: string) {
  tenantContext.enterWith(tenantId);
}

export function getTenantContext(): string | undefined {
  return tenantContext.getStore();
}
```

3. **Tenant Middleware (Express):**

```typescript
// apps/api/src/middleware/tenant.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { setTenantContext } from '../lib/prisma';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
  };
}

export async function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    // Option 1: JWT (for authenticated users)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      req.tenant = {
        id: decoded.tenantId,
        name: decoded.tenantName,
      };

      setTenantContext(decoded.tenantId);
      return next();
    }

    // Option 2: API Key (for public endpoints)
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
      const key = await prisma.apiKey.findUnique({
        where: { key: apiKey },
        include: { tenant: true },
      });

      if (!key || key.revokedAt) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      req.tenant = {
        id: key.tenantId,
        name: key.tenant.name,
      };

      setTenantContext(key.tenantId);
      return next();
    }

    // No valid auth
    return res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication' });
  }
}

// Apply to all routes
app.use('/api', tenantMiddleware);
```

4. **Security Test Example:**

```typescript
// apps/api/src/__tests__/security/tenant-isolation.test.ts
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';

describe('Tenant Isolation', () => {
  let tenantA: any, tenantB: any;
  let projectA: any, projectB: any;
  let tokenA: string, tokenB: string;

  beforeAll(async () => {
    // Create two tenants
    tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } });
    tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } });

    // Create projects for each tenant
    projectA = await prisma.project.create({
      data: { name: 'Project A', tenantId: tenantA.id },
    });
    projectB = await prisma.project.create({
      data: { name: 'Project B', tenantId: tenantB.id },
    });

    // Generate JWTs
    tokenA = generateJWT({ tenantId: tenantA.id, tenantName: tenantA.name });
    tokenB = generateJWT({ tenantId: tenantB.id, tenantName: tenantB.name });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.project.deleteMany();
    await prisma.tenant.deleteMany();
  });

  test('Tenant A cannot read Tenant B project', async () => {
    const response = await request(app).get(`/api/projects/${projectB.id}`).set('Authorization', `Bearer ${tokenA}`);

    expect(response.status).toBe(404); // Not found (filtered out)
  });

  test('Tenant A cannot update Tenant B project', async () => {
    const response = await request(app).put(`/api/projects/${projectB.id}`).set('Authorization', `Bearer ${tokenA}`).send({ name: 'Hacked' });

    expect(response.status).toBe(404);

    // Verify project name unchanged
    const project = await prisma.project.findUnique({
      where: { id: projectB.id },
    });
    expect(project!.name).toBe('Project B');
  });

  test('Tenant A cannot delete Tenant B project', async () => {
    const response = await request(app).delete(`/api/projects/${projectB.id}`).set('Authorization', `Bearer ${tokenA}`);

    expect(response.status).toBe(404);

    // Verify project still exists
    const project = await prisma.project.findUnique({
      where: { id: projectB.id },
    });
    expect(project).not.toBeNull();
  });

  test('Tenant A only sees their own projects', async () => {
    const response = await request(app).get('/api/projects').set('Authorization', `Bearer ${tokenA}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(projectA.id);
  });

  test('Invalid JWT is rejected', async () => {
    const response = await request(app).get('/api/projects').set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  test('Manipulated JWT fails', async () => {
    // Try to change tenant_id in payload (will fail signature check)
    const fakeToken = tokenA.split('.')[0] + '.eyJ0ZW5hbnRJZCI6ImZha2UifQ.' + tokenA.split('.')[2];

    const response = await request(app).get('/api/projects').set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(401);
  });
});
```

5. **Custom ESLint Rule (Detect Missing Tenant Filters):**

```javascript
// tools/eslint-rules/require-tenant-filter.js
module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        // Check for Prisma queries
        if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'prisma' && ['findMany', 'findFirst', 'update', 'delete'].includes(node.callee.property.name)) {
          // Check if where clause exists
          const whereArg = node.arguments[0];
          if (!whereArg || !whereArg.properties) {
            context.report({
              node,
              message: 'Prisma query must include tenant filter',
            });
            return;
          }

          // Check if tenantId is in where clause
          const hasTenantId = whereArg.properties.some((prop) => prop.key && prop.key.name === 'tenantId');

          if (!hasTenantId) {
            context.report({
              node,
              message: 'Prisma query missing tenantId in where clause',
            });
          }
        }
      },
    };
  },
};
```

6. **CI Pipeline (GitHub Actions):**

```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:security
      - name: Fail if violations
        if: failure()
        run: echo "Security tests failed! Review tenant isolation."
```

### Testing Standards

**Security Tests Coverage:**

- All CRUD operations (Create, Read, Update, Delete)
- All resources (projects, products, scripts, steps)
- JWT validation
- API key scoping
- Cross-tenant access attempts

**Required Tests:**

- Minimum 20 security test cases
- 100% of multi-tenant tables covered
- Run on every PR

### References

- [Source: docs/planning-artifacts/prd.md#Epic 8] - User Story 8.1
- [Source: docs/planning-artifacts/architecture.md#Multi-Tenant] - Multi-tenant architecture

### Important Gotchas

⚠️ **CRITICAL:**

- **Never** query without tenant filter
- **Always** validate tenant context in middleware
- **Test** every API endpoint for cross-tenant access

⚠️ **Common Mistakes:**

- Raw SQL queries bypass Prisma middleware (use parameterized queries)
- Admin endpoints might need special handling (superuser access)
- Background jobs need tenant context (pass tenant_id explicitly)

⚠️ **Compliance:**

- GDPR: Data isolation prevents leaks
- SOC 2: Automated security tests demonstrate controls
- HIPAA: Row-level security meets technical safeguards

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 8 - Multi-Tenant Architecture
