---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'architecture'
project_name: 'nstep'
user_name: 'Ido'
date: '2026-01-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Product Overview: Next-Step

A dynamic onboarding and training injection system that overlays educational content onto existing websites without requiring production code changes.

### Requirements Overview

**Functional Requirements:**

**MVP Features:**

1. **Walkthrough System**
   - Interactive step-by-step guidance overlaid on live websites
   - Screen darkening/dimming with spotlight focus on specific elements
   - Progress tracking through steps
   - Skip functionality
   - Automatic progression based on user actions

2. **Modal Training**
   - Static training content display
   - Multi-step closed list format
   - Text + image per step
   - Optional view on page entry with skip option

3. **Chrome Extension (Critical Component)**
   - SDK injection into target websites
   - Security header bypass (CSP/CORS relaxation)
   - Enable iframe loading of customer sites in Back Office
   - Parent-child window communication (postMessage)
   - Preview functionality without production deployment

**Future:**

- Training Dashboard - progress tracking and learning history

### System Components

**Back Office:**

- Multi-tenant architecture: Projects → Products → Scripts
- Script creation and management
- User behavior recording on target website
- AI-powered automatic tutorial generation from recordings
- Script editor (add/remove/reorder steps)
- Display configuration: timing, segments, targeting

**SDK (JavaScript Library):**

- Runs on client website
- Communicates with Back Office
- Renders training components (Walkthrough/Modal)
- User behavior tracking
- Event capture for recording

**Chrome Extension:**

- Inject SDK into client website (temporary)
- Bypass security headers (CSP/CORS/X-Frame-Options)
- Enable iframe loading in Back Office
- Parent-child window communication (postMessage)
- Live preview functionality without production deployment

---

### 🎯 עדכון אינדיקטורים ארכיטקטוניים

**Complexity Level:** High

- Real-time interaction tracking
- Dynamic content injection to third-party websites
- **Browser extension with security header manipulation**
- **Iframe-based preview system with cross-origin communication**
- AI-powered content generation
- Recording and playback system
- Multi-tenant architecture (projects → products → scripts)

**Primary Technical Domain:** Full-Stack SaaS + Browser Extension

- Client-side SDK (JavaScript injection)
- Chrome Extension (Manifest V3, CSP bypass, iframe communication)
- Backend API & Content Management
- AI Integration
- Analytics & Tracking

**Cross-Cutting Concerns (מעודכן):**

- **Security:**
  - SDK injection to third-party sites
  - Security header manipulation (CSP/X-Frame-Options bypass)
  - iframe ↔ parent postMessage communication security
  - Chrome Extension permissions model
  - Data privacy & CORS handling
- **Performance:**
  - Minimal impact on host website
  - Extension overhead
  - iframe loading performance

- **Browser Compatibility:**
  - Chrome Extension Manifest V3
  - Cross-browser support considerations
  - iframe sandbox policies

- **Developer Experience:**
  - Preview mode in Back Office without production deployment
  - Recording & playback system
  - Visual editor for script creation

---

## 📦 רכיבי המערכת המעודכנים

**1. Back Office (Web App)**

- ניהול פרויקטים/מוצרים/תסריטים
- עורך הדרכות עם AI
- **Preview Mode:** הצגת אתר הלקוח ב-iframe + ניהול תקשורת

**2. Chrome Extension**

- הזרקת SDK זמנית לאתר
- Bypass Security Headers (CSP, X-Frame-Options)
- iframe communication bridge
- Development/Testing tool

**3. SDK (JavaScript)**

- רץ על אתר הלקוח (production או via extension)
- תקשורת עם Back Office API
- הצגת Walkthrough/Modal
- מעקב אחר אינטראקציות

**4. Back Office (Web App)**

- ניהול פרויקטים/מוצרים/תסריטים
- עורך תסריטים עם iframe preview
- AI לייצור הדרכות
- API Server

---

### 🎯 השלכות ארכיטקטוניות מעודכנות

**Security & Isolation:**

- Extension Permissions: webRequest, declarativeNetRequest, activeTab
- CSP/X-Frame-Options bypass (רק ב-development/preview mode)
- postMessage security between iframe ↔ parent
- Origin validation לתקשורת cross-window

**Browser Compatibility:**

- Chrome/Edge (Manifest V3)
- צורך בהרחבה דומה ל-Firefox?

**Integration Complexity:**

- SDK injection mechanism via Extension
- Communication protocol: Extension ↔ Back Office ↔ iframe
- Preview mode vs Production mode (with/without Extension)

**Security Concerns:**

- Bypassing CSP/X-Frame-Options רק ב-development mode
- postMessage security (origin validation)
- Extension permissions scope
- Production SDK injection method (without Extension)

---

**האם הניתוח המעודכן נכון?**

עכשיו יש לנו:

1. **Back Office** (ניהול, עריכה, AI)
2. **SDK** (JavaScript בצד הלקוח)
3. **Chrome Extension** (preview mode, security bypass, SDK injection)
4. **Training Dashboard** (עתיד)

**האם זה מלא ומדויק?**

נמשיך להחלטות ארכיטקטוניות? **[C]**

---

## Technical Stack & Starter Template Decisions

### Technology Stack Selected

Based on project requirements and team preferences, the following technology stack was selected:

#### 1. Back Office - Angular Web Application

**Framework:** Angular (v20+)

- **Rationale:**
  - Full-featured framework ideal for complex enterprise applications
  - Strong TypeScript support and type safety
  - Excellent tooling and CLI
  - Built-in dependency injection
  - Perfect for multi-tenant back office with complex forms and UI
  - Latest signals-based reactivity (Angular 20+)
  - Improved performance with latest optimizations

**Initialization:**

```bash
npx @angular/cli@latest new back-office --routing --style=scss --ssr=false
```

**Key Features Provided:**

- TypeScript configuration with strict mode
- Routing with lazy loading support
- Signals for reactive state management (Angular 20+ feature)
- RxJS for reactive programming
- Angular CLI for scaffolding and build optimization
- Development server with hot reload
- Testing setup (Jasmine/Karma or Jest)
- Standalone components by default

**Styling:**

- **SCSS** for component styles
- **Angular Material** for pre-built UI components
- Component-scoped styling with ViewEncapsulation

---

#### 2. API Server - Express.js (Node.js)

**Framework:** Express.js (v5.x)

- **Rationale:**
  - Lightweight, flexible, and fast
  - Minimal overhead perfect for API-focused backend
  - Large ecosystem of middleware
  - Easy integration with AI services (OpenAI, Anthropic)
  - Simple to deploy

**Initialization:**

```bash
npx express-generator --view=none --git api
```

**Key Features:**

- RESTful API architecture
- Middleware support for authentication, logging, CORS
- Easy integration with databases
- TypeScript support via ts-node or tsx
- Simple deployment to any Node.js hosting

**Additional Libraries:**

- Express Validator for input validation
- Helmet for security headers
- CORS middleware
- Morgan for logging
- Compression for response optimization

---

#### 3. Database Strategy

**Default:** In-Memory Storage (Development/MVP)

- **Rationale:**
  - Fast iteration during development
  - Zero setup complexity
  - Perfect for prototyping and testing
  - Easy to swap later

**Production:** PostgreSQL

- **Rationale:**
  - Robust relational database
  - ACID compliance for data integrity
  - Multi-tenant support with schemas or row-level security
  - JSON/JSONB support for flexible data structures
  - Excellent scalability

**ORM/Query Builder:** Prisma or Drizzle ORM

- Type-safe database access
- Migration management
- Easy switch between in-memory and PostgreSQL

---

#### 4. SDK - Pure JavaScript with Shadow DOM

**Technology:** Vanilla JavaScript (ES6+)

- **Rationale:**
  - **Small bundle size** - critical for third-party script
  - No framework overhead
  - Maximum compatibility across websites
  - Fast loading and execution

**Architecture Decisions:**

**UI Isolation:** Shadow DOM

```javascript
// Complete UI isolation from host website
const shadow = container.attachShadow({ mode: 'closed' });
// All styles and DOM contained within shadow root
```

- **Benefits:**
  - CSS isolation - no style conflicts with host
  - DOM encapsulation - no selector collisions
  - Clean injection without breaking host site

**Data Strategy:** Cache-first with ETag

```javascript
// Load all training data on initialization
// Cache on client with ETag for efficient updates
fetch('/api/scripts', {
  headers: { 'If-None-Match': localStorage.getItem('etag') },
});
```

- Initial load: Full data payload with ETag
- Subsequent loads: 304 Not Modified if unchanged
- Bandwidth optimization for production

**Analytics:** Anonymous Event Tracking

```javascript
// Send anonymous user interactions
sdk.track('step_completed', { stepId: 'x', scriptId: 'y' });
// Optional: UserID for per-user tracking
sdk.identify(userId); // Optional
```

- Privacy-first: anonymous by default
- Optional user identification
- Custom analytics hooks:

```javascript
sdk.on('event', (data) => {
  // Customer's analytics (Google Analytics, Mixpanel, etc.)
  window.gtag('event', data.type, data.payload);
});
```

**Segmentation:** Dynamic Segment Updates

```javascript
// Segments passed on load
sdk.init({ segments: ['premium', 'new-user'] });

// Update segments dynamically during navigation
sdk.updateSegments(['premium', 'onboarded']);
```

**Build Strategy:**

- Rollup or esbuild for minimal bundle size
- Tree-shaking to eliminate unused code
- Minification + gzip compression
- Target: < 50KB gzipped
- Self-contained: All UI components included

---

#### 5. Chrome Extension - Manifest V3

**Technology:** Chrome Extension (Manifest V3)

- **Rationale:**
  - Required for CSP/X-Frame-Options bypass
  - SDK injection for preview mode
  - iframe ↔ parent communication bridge

**Key Manifest Permissions:**

```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["<all_urls>"],
  "declarativeNetRequest": {
    "rule_resources": [
      {
        "id": "csp-bypass",
        "enabled": true,
        "path": "rules.json"
      }
    ]
  }
}
```

**Architecture:**

- **Content Script:** Inject SDK into target website
- **Background Service Worker:** Handle header modification
- **declarativeNetRequest:** Modify CSP/X-Frame-Options headers
- **postMessage Bridge:** Enable Back Office ↔ iframe communication

**Communication Flow:**

```
Back Office (Angular)
  ↕ postMessage
iframe (Customer Website with Extension)
  ↕ SDK injection
Extension (Background + Content Script)
  ↕ REST API
API Server (Express)
```

---

#### 6. AI Integration

**Provider:** OpenAI API or Anthropic Claude

- **Use Case:** Auto-generate training scripts from recordings
- **Integration:** Server-side (Express API)
- **Flow:**
  1. User records interactions in Back Office
  2. Send recording data to API
  3. API calls AI service with prompt
  4. AI returns structured training script
  5. User edits in Back Office

---

### Monorepo Structure with Nx

**Existing Nx Workspace Structure:**

```
apps/
  api/                    # Express.js API
  back-office/           # Angular application
  back-office-e2e/       # E2E tests

libs/
  sdk/                   # Pure JS SDK
  chrome-extension/      # Chrome Extension
```

**Benefits:**

- Shared TypeScript types across projects
- Unified build and test commands via Nx
- Code generation with Nx schematics
- Dependency graph visualization
- Efficient CI/CD with affected commands

---

### Development Workflow

**1. Local Development:**

```bash
# Start all services
nx run-many --target=serve --projects=api,back-office

# SDK development
cd libs/sdk && npm run dev

# Extension development (load unpacked in Chrome)
nx build chrome-extension --watch
```

**2. Preview Mode:**

- User installs Chrome Extension
- Extension bypasses CSP/X-Frame-Options
- Back Office loads customer site in iframe
- SDK injected via Extension
- Live preview and editing

**3. Production Deployment:**

- **Back Office:** Vercel, Netlify, or traditional hosting
- **API:** Railway, Render, Fly.io, or any Node.js host
- **SDK:** CDN (Cloudflare, jsDelivr) or self-hosted
- **Extension:** Chrome Web Store (optional, for users)

---

### Deployment Strategy

**Back Office (Angular):**

- Static hosting (Vercel, Netlify, S3+CloudFront)
- SSR disabled for simplicity
- Environment variables for API endpoints

**API (Express):**

- Container deployment (Docker)
- Platform-as-a-Service (Railway, Render)
- Or traditional VPS with PM2

**SDK:**

- CDN delivery for performance
- Version pinning for stability
- Semantic versioning

**Database:**

- Development: In-memory or SQLite
- Production: Managed PostgreSQL (Supabase, Neon, Railway)

---

### Summary of Key Architectural Decisions

| Component       | Technology                   | Rationale                                  |
| --------------- | ---------------------------- | ------------------------------------------ |
| **Back Office** | Angular 20+                  | Enterprise-grade, signals-based reactivity |
| **API**         | Express.js 5.x               | Lightweight, flexible, easy AI integration |
| **Database**    | In-Memory → PostgreSQL       | Fast dev, robust production                |
| **SDK**         | Pure JavaScript + Shadow DOM | Small size, isolated UI, no conflicts      |
| **Extension**   | Manifest V3                  | CSP bypass, SDK injection, iframe bridge   |
| **Monorepo**    | Nx                           | Shared code, unified tooling               |
| **AI**          | OpenAI/Claude                | Auto-generate training content             |
| **Caching**     | ETag + localStorage          | Bandwidth optimization                     |
| **Analytics**   | Anonymous + hooks            | Privacy-first, extensible                  |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Technology stack selected (Angular 20+, Express.js 5.x, PostgreSQL)
- SDK architecture defined (Pure JS, Shadow DOM, ETag caching)
- Chrome Extension architecture (Manifest V3, CSP bypass)
- Monorepo structure (Nx workspace)

**Important Decisions (Shape Architecture):**

- Data layer with Prisma ORM
- Authentication with JWT + Passport.js
- SDK distribution via CDN
- Multi-tenant data isolation strategy
- AI integration approach

**Deferred Decisions (Post-MVP):**

- Training Dashboard implementation details
- Advanced analytics platform selection
- Multi-browser extension support (Firefox)
- Internationalization strategy

---

### Data Architecture

**ORM Selection: Prisma**

**Version:** Prisma 6.x (latest stable)

**Rationale:**

- Excellent TypeScript support with generated types
- Easy migration management
- Perfect for Express.js integration
- Simple transition from in-memory to PostgreSQL
- Auto-generated client with type safety
- Great developer experience with Prisma Studio

**Database Strategy:**

**Development:**

```typescript
// In-memory SQLite for fast local development
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**Production:**

```typescript
// PostgreSQL for production
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Multi-Tenant Data Isolation:**

- Schema-based isolation: Each project/customer gets dedicated schema
- OR Row-Level Security (RLS) with tenant_id column
- Decision: **Row-Level Security** for simpler management and better performance

**Data Model Structure:**

```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  tenantId  String   @map("tenant_id")
  products  Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
}

model Product {
  id        String   @id @default(cuid())
  name      String
  projectId String   @map("project_id")
  project   Project  @relation(fields: [projectId], references: [id])
  scripts   Script[]
}

model Script {
  id          String   @id @default(cuid())
  name        String
  type        String   // 'walkthrough' | 'modal'
  productId   String   @map("product_id")
  product     Product  @relation(fields: [productId], references: [id])
  steps       Json     // Flexible JSON for step data
  config      Json     // Display config: timing, segments
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Caching Strategy:**

- SDK: ETag-based caching on client side (localStorage)
- API: Redis for session storage and frequently accessed data (optional, post-MVP)

---

### Authentication & Security

**Authentication Method: JWT + Passport.js**

**Rationale:**

- Self-hosted solution (no external dependencies)
- Standard JWT tokens for stateless authentication
- Passport.js ecosystem with multiple strategies
- Full control over authentication flow
- Cost-effective for MVP

**Implementation:**

```typescript
// JWT token structure
{
  userId: string;
  email: string;
  tenantId: string;
  role: 'admin' | 'editor' | 'viewer';
  exp: number;
}
```

**Authorization Patterns:**

- Role-Based Access Control (RBAC)
- Middleware for route protection
- Tenant isolation enforced at API level

**API Security:**

- Helmet.js for security headers
- CORS configured for specific origins
- Rate limiting with express-rate-limit
- Input validation with express-validator
- SQL injection protection via Prisma parameterized queries

**SDK → API Communication:**

- Public API key per project (embedded in SDK initialization)
- Anonymous tracking by default
- Optional user identification via `sdk.identify(userId)`

**Chrome Extension Security:**

- Content Security Policy bypass only in preview mode
- Origin validation for postMessage communication
- Manifest V3 declarativeNetRequest for header modification

---

### API & Communication Patterns

**API Design: RESTful API**

**Rationale:**

- Simple and well-understood
- Perfect for CRUD operations
- Easy to document and test
- Compatible with all clients (Angular, SDK, Extension)

**API Structure:**

```
/api/v1/
  /auth
    POST /login
    POST /register
    POST /refresh
  /projects
    GET    /projects
    POST   /projects
    GET    /projects/:id
    PATCH  /projects/:id
    DELETE /projects/:id
  /products
    GET    /products
    POST   /products
    GET    /products/:id
  /scripts
    GET    /scripts
    POST   /scripts
    GET    /scripts/:id
    PATCH  /scripts/:id
    DELETE /scripts/:id
    POST   /scripts/:id/publish
  /sdk
    GET    /sdk/:projectId/config
    GET    /sdk/:projectId/scripts
    POST   /sdk/:projectId/events (analytics)
  /ai
    POST   /ai/generate-script (recording → AI → script)
```

**API Documentation:**

- Swagger/OpenAPI 3.0
- Auto-generated from Express routes
- Interactive documentation UI

**Error Handling Standards:**

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [...]
  }
}
```

**Rate Limiting:**

- Express-rate-limit middleware
- Different limits for authenticated vs public endpoints
- SDK endpoint: Higher limits for legitimate usage

**SDK Communication:**

- SDK loads scripts via GET /sdk/:projectId/scripts
- ETag header for caching (304 Not Modified)
- Events sent asynchronously via POST /sdk/:projectId/events

---

### Frontend Architecture (Angular Back Office)

**State Management: Angular Signals (v20+)**

**Rationale:**

- Built-in to Angular 20+
- Reactive and performant
- Simpler than RxJS for most use cases
- Great for component state

**Component Architecture:**

- Standalone components (Angular 20+ default)
- Smart/Container components for data fetching
- Dumb/Presentational components for UI
- Lazy loading for feature modules

**Routing Strategy:**

```typescript
/dashboard
/projects
  /:projectId
    /products
      /:productId
        /scripts
          /:scriptId/edit
/preview/:scriptId (iframe mode)
```

**Performance Optimization:**

- Lazy loading routes
  **Styling:**

- **SCSS** for styling with component-scoped styles
- **Angular Material** for UI component library
- Design system with consistent theming

- Tailwind CSS for utility-first styling
- OR Angular Material for pre-built components
- Decision: **Tailwind CSS** for flexibility and smaller bundle

**iframe Preview System:**

```typescript
// Back Office component communicates with iframe
window.postMessage(
  {
    type: 'LOAD_SCRIPT',
    payload: { scriptId, steps, config },
  },
  targetOrigin,
);

// Extension bridges communication
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'INJECT_SDK') {
    injectSDK(msg.payload);
  }
});
```

---

### Infrastructure & Deployment

**Hosting Strategy:**

**Back Office (Angular):**

- **Primary:** Vercel (zero-config, CDN, previews)
- **Alternative:** Netlify, Cloudflare Pages
- Static build deployment (no SSR)
- Environment variables for API endpoints

**API (Express.js):**

- **Primary:** Railway (easy Node.js deployment, PostgreSQL included)
- **Alternative:** Render, Fly.io, AWS ECS
- Docker container deployment
- Environment variables for secrets

**SDK:**

- **CDN:** Cloudflare CDN or jsDelivr
- Versioned releases (semver)
- Distribution:

```html
<script src="https://cdn.nextstep.io/sdk@1.0.0/nextstep.min.js"></script>
<script>
  NextStep.init({
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY',
  });
</script>
```

**Chrome Extension:**

- Published to Chrome Web Store (optional)
- Developer mode installation for beta users
- Auto-updates via Chrome Web Store

**Database:**

- **Development:** SQLite (in-memory or file-based)
- **Production:** Managed PostgreSQL (Railway, Supabase, Neon)

**CI/CD Pipeline:**

```yaml
# Using GitHub Actions or similar
- Build all projects (nx affected)
- Run tests (unit + e2e)
- Build SDK (minify + optimize)
- Deploy API to Railway
- Deploy Back Office to Vercel
- Publish SDK to CDN
```

**Monitoring & Logging:**

- **API Monitoring:** Sentry for error tracking
- **Logs:** Structured logging with Winston or Pino
- **Analytics:** Plausible or self-hosted analytics for usage tracking
- **Uptime:** UptimeRobot or similar

**Scaling Strategy:**

- Horizontal scaling for API (stateless)
- PostgreSQL connection pooling (PgBouncer)
- CDN for SDK delivery (global distribution)
- Caching layer (Redis) for future optimization

---

### AI Integration Architecture

**AI Provider: OpenAI GPT-4 or Anthropic Claude**

**Use Case:** Auto-generate training scripts from user interaction recordings

**Architecture:**

```
User records interactions in Back Office (iframe)
  ↓
Recording data (DOM events, clicks, inputs)
  ↓
POST /api/v1/ai/generate-script
  ↓
Express API formats prompt with context
  ↓
Call OpenAI/Claude API
  ↓
Parse structured response into Script format
  ↓
Return to Back Office for user editing
```

**Prompt Structure:**

```typescript
const prompt = `
Generate a training walkthrough script based on the following user interactions:

Recording:
${JSON.stringify(recordingData, null, 2)}

Generate a JSON script with steps containing:
- target: CSS selector
- title: Step title
- description: Step description
- action: Expected user action (click, input, etc.)

Output format: { steps: [...] }
`;
```

**AI Decision:**

- Start with OpenAI GPT-4 (well-documented, reliable)
- Environment variable to switch providers
- Fallback to manual script creation if API fails

---

### Decision Impact Analysis

**Implementation Sequence:**

1. **Foundation Setup** (Week 1)
   - Initialize Nx monorepo structure
   - Setup Angular 20+ Back Office
   - Setup Express.js API with TypeScript
   - Configure Prisma with SQLite for development

2. **SDK Core** (Week 1-2)
   - Build pure JavaScript SDK
   - Implement Shadow DOM rendering
   - Create Walkthrough and Modal components
   - ETag caching mechanism

3. **Chrome Extension** (Week 2)
   - Manifest V3 setup
   - CSP/X-Frame-Options bypass
   - SDK injection mechanism
   - postMessage bridge

4. **Back Office Core** (Week 2-3)
   - Authentication (JWT + Passport.js)
   - Project/Product/Script CRUD
   - iframe preview integration
   - Script editor UI

5. **AI Integration** (Week 3)
   - Recording capture in Back Office
   - AI prompt engineering
   - OpenAI/Claude integration
   - Script generation endpoint

6. **Production Readiness** (Week 4)
   - Migrate to PostgreSQL
   - Deploy to Railway + Vercel
   - SDK to CDN
   - Testing and QA

**Cross-Component Dependencies:**

- **SDK ↔ API:** SDK depends on API for script data and analytics endpoints
- **Extension ↔ Back Office:** Extension enables iframe preview in Back Office
- **Extension ↔ SDK:** Extension injects SDK into customer websites
- **Back Office ↔ AI:** Back Office calls AI API for script generation
- **All ↔ Database:** All components read/write through Prisma ORM

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Purpose:** Ensure all AI agents implementing features write compatible, consistent code that works together seamlessly without conflicts.

**Critical Conflict Points Identified:** 18 areas where AI agents could make different choices

---

### Naming Patterns

#### Database Naming Conventions

**Tables:**

- Use **snake_case** for table names
- Plural form: `users`, `projects`, `scripts`
- Junction tables: `user_projects`, `script_tags`

**Columns:**

- Use **camelCase** in Prisma schema (auto-maps to snake_case in DB)
- Foreign keys: `userId`, `projectId` (Prisma generates `user_id`, `project_id`)
- Timestamps: `createdAt`, `updatedAt`
- Boolean fields: prefix with `is`, `has`, `can`: `isPublished`, `hasAccess`

**Examples:**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
}
```

**Indexes:**

- Format: `idx_tablename_column`
- Example: `@@index([tenantId], name: "idx_projects_tenant_id")`

---

#### API Naming Conventions

**Endpoints:**

- Use **plural** resource names: `/users`, `/projects`, `/scripts`
- RESTful conventions:
  - GET `/users` - list all
  - GET `/users/:id` - get single
  - POST `/users` - create
  - PATCH `/users/:id` - partial update
  - PUT `/users/:id` - full update (rarely used)
  - DELETE `/users/:id` - delete

**Route Parameters:**

- Use colon notation: `:id`, `:projectId`, `:scriptId`
- camelCase: `:userId` not `:user_id`

**Query Parameters:**

- camelCase: `?sortBy=createdAt&filterBy=published`
- Arrays: `?tags=tag1&tags=tag2` or `?tags[]=tag1&tags[]=tag2`

**Headers:**

- Standard headers: `Authorization`, `Content-Type`, `ETag`, `If-None-Match`
- Custom headers: `X-Project-Id`, `X-Tenant-Id` (prefixed with `X-`)

**Examples:**

```typescript
GET /api/v1/projects
GET /api/v1/projects/:projectId
GET /api/v1/projects/:projectId/scripts
POST /api/v1/scripts/:scriptId/publish
GET /api/v1/users?role=admin&sortBy=createdAt
```

---

#### Code Naming Conventions

**Files:**

- **kebab-case** for all files: `user-card.ts`, `script-service.ts`, `auth-guard.ts`
- Component files: `user-card.component.ts`, `user-card.component.html`, `user-card.component.scss`
- Test files: `user-card.component.spec.ts` (co-located with source)
- Service files: `user.service.ts`, `auth.service.ts`
- Utility files: `date-utils.ts`, `validation-utils.ts`

**Variables & Functions:**

- **camelCase**: `userId`, `getUserData()`, `isPublished`
- Boolean variables: prefix with `is`, `has`, `can`, `should`: `isLoading`, `hasPermission`
- Constants: **UPPER_SNAKE_CASE**: `MAX_RETRY_COUNT`, `API_BASE_URL`

**Classes & Interfaces:**

- **PascalCase**: `UserCard`, `ScriptService`, `AuthGuard`
- Interfaces: prefix with `I` optional (prefer no prefix in TypeScript): `User`, `Script`, `Config`
- Types: `type UserId = string;`, `type ScriptType = 'walkthrough' | 'modal';`

**Components (Angular):**

- PascalCase class: `UserCardComponent`
- kebab-case selector: `<app-user-card>`
- kebab-case files: `user-card.component.ts`

**Examples:**

```typescript
// Good
const userId = '123';
const isPublished = true;
const MAX_RETRIES = 3;

function getUserById(userId: string): User {}
class UserService {}
interface User {}

// Avoid
const user_id = '123';
const published = true;
function get_user_by_id(user_id: string) {}
```

---

### Structure Patterns

#### Project Organization

**Monorepo Structure (Nx):**

```
apps/
  api/                     # Express.js API
    src/
      routes/             # API route handlers
      services/           # Business logic
      middleware/         # Express middleware
      utils/              # Utility functions
      config/             # Configuration files
  back-office/            # Angular app
    src/
      app/
        features/         # Feature modules
          projects/
          scripts/
          users/
        shared/           # Shared components/services
          components/
          services/
          pipes/
          directives/
        core/             # Core services (singleton)
          auth/
          api/

libs/
  sdk/                    # Pure JS SDK
    src/
      core/               # Core SDK logic
      components/         # Walkthrough, Modal
      utils/              # Helper functions
  chrome-extension/       # Chrome Extension
    src/
      background/         # Background service worker
      content/            # Content scripts
      popup/              # Extension popup UI
```

**Feature-Based Organization (Angular):**

- Group by feature, not by type
- Each feature is self-contained
- Shared code goes in `shared/` folder

**Examples:**

```
features/
  projects/
    components/
      project-list/
        project-list.component.ts
        project-list.component.html
        project-list.component.scss
        project-list.component.spec.ts
      project-card/
    services/
      project.service.ts
      project.service.spec.ts
    models/
      project.model.ts
```

---

#### File Structure Patterns

**Test Files:**

- **Co-located** with source files
- Same name with `.spec.ts` extension
- Example: `user.service.ts` → `user.service.spec.ts`

**Configuration Files:**

- Root level for workspace config: `nx.json`, `tsconfig.base.json`
- Project level: `apps/api/tsconfig.json`, `apps/back-office/project.json`
- Environment-specific: `.env`, `.env.development`, `.env.production`

**Static Assets:**

- Angular: `apps/back-office/src/assets/`
- SDK: `libs/sdk/src/assets/`
- Subdirectories: `images/`, `fonts/`, `icons/`

---

### Format Patterns

#### API Response Formats

**Success Response (Wrapped with metadata):**

```typescript
{
  success: true,
  data: {
    // Actual response data
  },
  metadata: {
    timestamp: "2026-01-11T12:00:00Z",
    requestId: "req_123abc"
  }
}
```

**List Response:**

```typescript
{
  success: true,
  data: [...],
  metadata: {
    total: 100,
    page: 1,
    pageSize: 20,
    timestamp: "2026-01-11T12:00:00Z"
  }
}
```

**Error Response (Simple):**

```typescript
{
  success: false,
  error: "Error message describing what went wrong"
}
```

**Validation Error (with details):**

```typescript
{
  success: false,
  error: "Validation failed",
  details: [
    { field: "email", message: "Invalid email format" },
    { field: "password", message: "Password too short" }
  ]
}
```

**Status Codes:**

- 200: Success (GET, PATCH, PUT)
- 201: Created (POST)
- 204: No Content (DELETE)
- 304: Not Modified (ETag cache hit)
- 400: Bad Request (validation error)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error

---

#### Data Exchange Formats

**JSON Field Naming:**

- **camelCase** for all JSON fields
- Example: `userId`, `firstName`, `createdAt`

**Date/Time Format:**

- Use **ISO 8601** strings: `"2026-01-11T12:00:00Z"`
- Always include timezone (Z for UTC)
- Parse on client: `new Date(isoString)`

**Boolean Representation:**

- Use **true/false** (not 1/0, "true"/"false")

**Null Handling:**

- Use `null` for missing/unknown values
- Use `undefined` for omitted fields (TypeScript)
- Never return `undefined` in JSON (serializes to omitted)

**Arrays vs Single Items:**

- Always return arrays for lists (even if empty: `[]`)
- Single items returned as objects

**Examples:**

```typescript
// Good
{
  userId: "123",
  email: "user@example.com",
  isActive: true,
  lastLogin: "2026-01-11T12:00:00Z",
  tags: [],
  metadata: null
}

// Avoid
{
  user_id: "123",
  is_active: "true",
  last_login: 1736596800,
  tags: null
}
```

---

### Communication Patterns

#### Event Naming Conventions

**SDK Events:**

- **snake_case** with namespace
- Format: `namespace.action`
- Examples:
  - `script.loaded`
  - `step.completed`
  - `step.skipped`
  - `walkthrough.started`
  - `modal.closed`

**postMessage Events (Extension ↔ Back Office):**

- **UPPER_SNAKE_CASE** for type
- Format: `SOURCE_ACTION`
- Examples:
  - `EXTENSION_READY`
  - `BACKOFFICE_LOAD_SCRIPT`
  - `IFRAME_SDK_INJECTED`
  - `SDK_EVENT_TRACKED`

**Event Payload Structure:**

```typescript
// SDK Events
{
  type: 'step.completed',
  payload: {
    scriptId: 'script_123',
    stepId: 'step_1',
    timestamp: '2026-01-11T12:00:00Z'
  }
}

// postMessage Events
{
  type: 'BACKOFFICE_LOAD_SCRIPT',
  payload: {
    scriptId: 'script_123',
    config: { ... }
  },
  origin: 'https://backoffice.nextstep.io'
}
```

---

#### State Management Patterns (Angular Signals)

**Signal Naming:**

- Suffix with `$` optional (prefer no suffix for signals)
- Example: `isLoading`, `currentUser`, `scripts`

**Signal Updates:**

- Use `.set()` for direct updates
- Use `.update()` for derived updates
- Never mutate signal values directly

**Examples:**

```typescript
// Define signals
isLoading = signal(false);
currentUser = signal<User | null>(null);
scripts = signal<Script[]>([]);

// Update signals
isLoading.set(true);
currentUser.set(user);
scripts.update((list) => [...list, newScript]);

// Computed signals
publishedScripts = computed(() => scripts().filter((s) => s.isPublished));
```

**Component State Organization:**

- Local state: signals in component
- Shared state: signals in service (singleton)
- Derive computed values from signals

---

### Process Patterns

#### Error Handling Patterns

**API Error Handling:**

```typescript
// Express middleware
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});
```

**Angular Error Handling:**

```typescript
// Service
getUserById(id: string): Observable<User> {
  return this.http.get<ApiResponse<User>>(`/api/users/${id}`).pipe(
    map(response => response.data),
    catchError(error => {
      console.error('Failed to fetch user:', error);
      return throwError(() => new Error('Failed to fetch user'));
    })
  );
}

// Component
loadUser() {
  this.isLoading.set(true);
  this.userService.getUserById(this.userId).subscribe({
    next: (user) => {
      this.currentUser.set(user);
      this.isLoading.set(false);
    },
    error: (error) => {
      this.errorMessage.set(error.message);
      this.isLoading.set(false);
    }
  });
}
```

**SDK Error Handling:**

```typescript
// Silent failures for non-critical operations
try {
  trackEvent('step.completed', payload);
} catch (error) {
  console.warn('Failed to track event:', error);
  // Don't break user experience
}

// User-visible errors for critical operations
try {
  await loadScript(scriptId);
} catch (error) {
  showErrorToast('Failed to load training script');
  throw error;
}
```

---

#### Loading State Patterns

**Component Loading States:**

```typescript
// Local loading state
isLoading = signal(false);
isSaving = signal(false);

// Named loading states for multiple operations
loadingStates = signal({
  users: false,
  projects: false,
  scripts: false,
});

// Update
loadingStates.update((states) => ({ ...states, users: true }));
```

**Global Loading States (Optional):**

- Use Angular HttpInterceptor for global loading indicator
- Exclude specific endpoints if needed

**Loading UI Patterns:**

```typescript
// In template
@if (isLoading()) {
  <app-spinner />
} @else {
  <app-content [data]="data()" />
}
```

---

### Enforcement Guidelines

#### All AI Agents MUST:

1. **Follow naming conventions** exactly as specified:
   - Database: snake_case tables, camelCase in Prisma
   - API: plural endpoints with camelCase params
   - Files: kebab-case
   - Variables: camelCase
   - Classes: PascalCase

2. **Use consistent response formats**:
   - Wrapped responses with `success` and `metadata`
   - Simple error messages
   - ISO 8601 dates
   - camelCase JSON fields

3. **Co-locate test files** with source files:
   - `user.service.ts` → `user.service.spec.ts`

4. **Follow API conventions**:
   - RESTful endpoints
   - Standard status codes
   - ETag for caching

5. **Maintain consistency** in:
   - Event naming (snake_case for SDK, UPPER_SNAKE_CASE for postMessage)
   - Error handling patterns
   - Loading state management

---

### Pattern Examples

#### Good Examples:

**File Structure:**

```
features/
  projects/
    services/
      project.service.ts
      project.service.spec.ts    ✓ Co-located test
    components/
      project-card/
        project-card.component.ts    ✓ kebab-case
        project-card.component.spec.ts
```

**API Endpoint:**

```typescript
// ✓ Correct
GET /api/v1/users/:userId
GET /api/v1/projects/:projectId/scripts

// Response
{
  success: true,
  data: { userId: "123", email: "user@example.com" },
  metadata: { timestamp: "2026-01-11T12:00:00Z" }
}
```

**Database Model:**

```prisma
// ✓ Correct
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String   @map("first_name")
  createdAt DateTime @default(now()) @map("created_at")
}
```

**Component Code:**

```typescript
// ✓ Correct
export class UserCardComponent {
  userId = input.required<string>();
  isLoading = signal(false);
  currentUser = signal<User | null>(null);

  loadUser() {
    this.isLoading.set(true);
    // ...
  }
}
```

---

#### Anti-Patterns (Avoid):

**❌ Wrong File Naming:**

```
UserCard.ts          // Should be: user-card.ts
user.service.test.ts // Should be: user.service.spec.ts
```

**❌ Wrong API Response:**

```typescript
// Don't return unwrapped data
{ id: 1, name: "John" }

// Don't use snake_case in JSON
{ user_id: "123", first_name: "John" }
```

**❌ Wrong Database Naming:**

```prisma
// Don't use PascalCase for tables
model Users { }  // Should be: User (Prisma generates 'users' table)

// Don't use snake_case in Prisma schema
model User {
  user_id String  // Should be: userId (maps to user_id automatically)
}
```

user.service.spec.ts // Should be co-located with user.service.ts

```

---

## Project Structure & Architectural Boundaries

### Requirements Mapping to Components

**MVP Features → Implementation Components:**

1. **Walkthrough System**
   - Component: `libs/sdk/src/components/walkthrough/`
   - Features: Overlay, spotlight, step progression, skip functionality

2. **Modal Training**
   - Component: `libs/sdk/src/components/modal/`
   - Features: Static content display, multi-step, text+image

3. **Chrome Extension**
   - Component: `libs/chrome-extension/`
   - Features: SDK injection, CSP bypass, iframe bridge

4. **Back Office Management**
   - Component: `apps/back-office/src/app/features/`
   - Modules:
     - **Projects** → Projects management (CRUD)
     - **Products** → Products management (CRUD)
     - **Scripts** → Script editor, step management
     - **Preview** → iframe preview with extension integration
     - **AI Generation** → Recording → AI → Script generation

5. **API Server**
   - Component: `apps/api/src/`
   - Modules:
     - **Auth** → JWT authentication
     - **Projects/Products/Scripts** → CRUD operations
     - **SDK** → Script delivery, analytics
     - **AI** → Script generation from recordings

---

### Complete Project Directory Structure

```

nstep/ # Nx Monorepo Root
├── README.md
├── package.json
├── nx.json
├── tsconfig.base.json
├── jest.config.ts
├── jest.preset.js
├── .gitignore
├── .env
├── .env.example
├── .github/
│ └── workflows/
│ ├── ci.yml
│ └── deploy.yml
│
├── docs/
│ ├── planning-artifacts/
│ │ └── architecture.md # This document
│ └── implementation-artifacts/
│
├── apps/
│ │
│ ├── api/ # Express.js API Server
│ │ ├── Dockerfile
│ │ ├── project.json
│ │ ├── tsconfig.json
│ │ ├── tsconfig.app.json
│ │ ├── tsconfig.spec.json
│ │ ├── jest.config.ts
│ │ ├── src/
│ │ │ ├── main.ts # App entry point
│ │ │ ├── app.ts # Express app setup
│ │ │ │
│ │ │ ├── routes/ # API route handlers
│ │ │ │ ├── index.ts
│ │ │ │ ├── auth.routes.ts
│ │ │ │ ├── auth.routes.spec.ts
│ │ │ │ ├── projects.routes.ts
│ │ │ │ ├── projects.routes.spec.ts
│ │ │ │ ├── products.routes.ts
│ │ │ │ ├── products.routes.spec.ts
│ │ │ │ ├── scripts.routes.ts
│ │ │ │ ├── scripts.routes.spec.ts
│ │ │ │ ├── sdk.routes.ts
│ │ │ │ ├── sdk.routes.spec.ts
│ │ │ │ ├── ai.routes.ts
│ │ │ │ └── ai.routes.spec.ts
│ │ │ │
│ │ │ ├── services/ # Business logic
│ │ │ │ ├── auth.service.ts
│ │ │ │ ├── auth.service.spec.ts
│ │ │ │ ├── project.service.ts
│ │ │ │ ├── project.service.spec.ts
│ │ │ │ ├── product.service.ts
│ │ │ │ ├── product.service.spec.ts
│ │ │ │ ├── script.service.ts
│ │ │ │ ├── script.service.spec.ts
│ │ │ │ ├── ai.service.ts
│ │ │ │ └── ai.service.spec.ts
│ │ │ │
│ │ │ ├── middleware/ # Express middleware
│ │ │ │ ├── auth.middleware.ts
│ │ │ │ ├── auth.middleware.spec.ts
│ │ │ │ ├── error.middleware.ts
│ │ │ │ ├── rate-limit.middleware.ts
│ │ │ │ └── tenant.middleware.ts
│ │ │ │
│ │ │ ├── utils/ # Utility functions
│ │ │ │ ├── jwt-utils.ts
│ │ │ │ ├── jwt-utils.spec.ts
│ │ │ │ ├── validation-utils.ts
│ │ │ │ ├── validation-utils.spec.ts
│ │ │ │ └── response-utils.ts
│ │ │ │
│ │ │ ├── config/ # Configuration
│ │ │ │ ├── database.config.ts
│ │ │ │ ├── app.config.ts
│ │ │ │ └── ai.config.ts
│ │ │ │
│ │ │ └── types/ # TypeScript types
│ │ │ ├── api.types.ts
│ │ │ └── auth.types.ts
│ │ │
│ │ └── prisma/ # Prisma ORM
│ │ ├── schema.prisma
│ │ ├── seed.ts
│ │ └── migrations/
│ │
│ ├── back-office/ # Angular Application
│ │ ├── project.json
│ │ ├── tsconfig.json
│ │ ├── tsconfig.app.json
│ │ ├── tsconfig.spec.json
│ │ ├── jest.config.ts
│ │ ├── src/
│ │ │ ├── index.html
│ │ │ ├── main.ts
│ │ │ ├── styles.scss # Global styles
│ │ │ │
│ │ │ ├── app/
│ │ │ │ ├── app.component.ts
│ │ │ │ ├── app.component.scss
│ │ │ │ ├── app.component.spec.ts
│ │ │ │ ├── app.config.ts # App configuration
│ │ │ │ ├── app.routes.ts # Route configuration
│ │ │ │ │
│ │ │ │ ├── features/ # Feature modules
│ │ │ │ │ │
│ │ │ │ │ ├── auth/
│ │ │ │ │ │ ├── login/
│ │ │ │ │ │ │ ├── login.component.ts
│ │ │ │ │ │ │ ├── login.component.scss
│ │ │ │ │ │ │ ├── login.component.html
│ │ │ │ │ │ │ └── login.component.spec.ts
│ │ │ │ │ │ └── register/
│ │ │ │ │ │ ├── register.component.ts
│ │ │ │ │ │ ├── register.component.scss
│ │ │ │ │ │ ├── register.component.html
│ │ │ │ │ │ └── register.component.spec.ts
│ │ │ │ │ │
│ │ │ │ │ ├── dashboard/
│ │ │ │ │ │ ├── dashboard.component.ts
│ │ │ │ │ │ ├── dashboard.component.scss
│ │ │ │ │ │ ├── dashboard.component.html
│ │ │ │ │ │ └── dashboard.component.spec.ts
│ │ │ │ │ │
│ │ │ │ │ ├── projects/
│ │ │ │ │ │ ├── components/
│ │ │ │ │ │ │ ├── project-list/
│ │ │ │ │ │ │ │ ├── project-list.component.ts
│ │ │ │ │ │ │ │ ├── project-list.component.scss
│ │ │ │ │ │ │ │ ├── project-list.component.html
│ │ │ │ │ │ │ │ └── project-list.component.spec.ts
│ │ │ │ │ │ │ ├── project-card/
│ │ │ │ │ │ │ │ ├── project-card.component.ts
│ │ │ │ │ │ │ │ ├── project-card.component.scss
│ │ │ │ │ │ │ │ ├── project-card.component.html
│ │ │ │ │ │ │ │ └── project-card.component.spec.ts
│ │ │ │ │ │ │ └── project-form/
│ │ │ │ │ │ │ ├── project-form.component.ts
│ │ │ │ │ │ │ ├── project-form.component.scss
│ │ │ │ │ │ │ ├── project-form.component.html
│ │ │ │ │ │ │ └── project-form.component.spec.ts
│ │ │ │ │ │ ├── services/
│ │ │ │ │ │ │ ├── project.service.ts
│ │ │ │ │ │ │ └── project.service.spec.ts
│ │ │ │ │ │ └── models/
│ │ │ │ │ │ └── project.model.ts
│ │ │ │ │ │
│ │ │ │ │ ├── products/
│ │ │ │ │ │ ├── components/
│ │ │ │ │ │ │ ├── product-list/
│ │ │ │ │ │ │ ├── product-card/
│ │ │ │ │ │ │ └── product-form/
│ │ │ │ │ │ ├── services/
│ │ │ │ │ │ │ ├── product.service.ts
│ │ │ │ │ │ │ └── product.service.spec.ts
│ │ │ │ │ │ └── models/
│ │ │ │ │ │ └── product.model.ts
│ │ │ │ │ │
│ │ │ │ │ ├── scripts/
│ │ │ │ │ │ ├── components/
│ │ │ │ │ │ │ ├── script-list/
│ │ │ │ │ │ │ ├── script-card/
│ │ │ │ │ │ │ ├── script-editor/
│ │ │ │ │ │ │ │ ├── script-editor.component.ts
│ │ │ │ │ │ │ │ ├── script-editor.component.scss
│ │ │ │ │ │ │ │ ├── script-editor.component.html
│ │ │ │ │ │ │ │ └── script-editor.component.spec.ts
│ │ │ │ │ │ │ ├── step-editor/
│ │ │ │ │ │ │ │ ├── step-editor.component.ts
│ │ │ │ │ │ │ │ ├── step-editor.component.scss
│ │ │ │ │ │ │ │ ├── step-editor.component.html
│ │ │ │ │ │ │ │ └── step-editor.component.spec.ts
│ │ │ │ │ │ │ └── script-preview/
│ │ │ │ │ │ │ ├── script-preview.component.ts
│ │ │ │ │ │ │ ├── script-preview.component.scss
│ │ │ │ │ │ │ ├── script-preview.component.html
│ │ │ │ │ │ │ └── script-preview.component.spec.ts
│ │ │ │ │ │ ├── services/
│ │ │ │ │ │ │ ├── script.service.ts
│ │ │ │ │ │ │ ├── script.service.spec.ts
│ │ │ │ │ │ │ ├── ai-generation.service.ts
│ │ │ │ │ │ │ └── ai-generation.service.spec.ts
│ │ │ │ │ │ └── models/
│ │ │ │ │ │ ├── script.model.ts
│ │ │ │ │ │ └── step.model.ts
│ │ │ │ │ │
│ │ │ │ │ └── preview/
│ │ │ │ │ └── components/
│ │ │ │ │ └── iframe-preview/
│ │ │ │ │ ├── iframe-preview.component.ts
│ │ │ │ │ ├── iframe-preview.component.scss
│ │ │ │ │ ├── iframe-preview.component.html
│ │ │ │ │ └── iframe-preview.component.spec.ts
│ │ │ │ │
│ │ │ │ ├── shared/ # Shared components
│ │ │ │ │ ├── components/
│ │ │ │ │ │ ├── button/
│ │ │ │ │ │ ├── card/
│ │ │ │ │ │ ├── modal/
│ │ │ │ │ │ ├── spinner/
│ │ │ │ │ │ └── toast/
│ │ │ │ │ ├── services/
│ │ │ │ │ │ ├── toast.service.ts
│ │ │ │ │ │ └── toast.service.spec.ts
│ │ │ │ │ ├── pipes/
│ │ │ │ │ │ ├── date-format.pipe.ts
│ │ │ │ │ │ └── date-format.pipe.spec.ts
│ │ │ │ │ └── directives/
│ │ │ │ │ ├── auto-focus.directive.ts
│ │ │ │ │ └── auto-focus.directive.spec.ts
│ │ │ │ │
│ │ │ │ └── core/ # Core services (singleton)
│ │ │ │ ├── auth/
│ │ │ │ │ ├── auth.service.ts
│ │ │ │ │ ├── auth.service.spec.ts
│ │ │ │ │ ├── auth.guard.ts
│ │ │ │ │ └── auth.guard.spec.ts
│ │ │ │ ├── api/
│ │ │ │ │ ├── api.service.ts
│ │ │ │ │ ├── api.service.spec.ts
│ │ │ │ │ └── api.interceptor.ts
│ │ │ │ └── models/
│ │ │ │ └── api-response.model.ts
│ │ │ │
│ │ │ └── assets/
│ │ │ ├── images/
│ │ │ ├── icons/
│ │ │ └── fonts/
│ │ │
│ │ └── public/ # Static public assets
│ │
│ └── back-office-e2e/ # E2E Tests
│ ├── project.json
│ ├── playwright.config.ts
│ ├── tsconfig.json
│ └── src/
│ ├── example.spec.ts
│ └── fixtures/
│
├── libs/
│ │
│ ├── sdk/ # Pure JavaScript SDK
│ │ ├── package.json
│ │ ├── project.json
│ │ ├── rollup.config.js
│ │ ├── tsconfig.json
│ │ ├── tsconfig.lib.json
│ │ ├── tsconfig.spec.json
│ │ ├── jest.config.ts
│ │ ├── README.md
│ │ ├── src/
│ │ │ ├── index.ts # Main SDK export
│ │ │ │
│ │ │ ├── core/ # Core SDK logic
│ │ │ │ ├── nextstep.ts
│ │ │ │ ├── nextstep.spec.ts
│ │ │ │ ├── config.ts
│ │ │ │ ├── config.spec.ts
│ │ │ │ ├── api-client.ts
│ │ │ │ ├── api-client.spec.ts
│ │ │ │ ├── cache-manager.ts
│ │ │ │ ├── cache-manager.spec.ts
│ │ │ │ ├── event-tracker.ts
│ │ │ │ └── event-tracker.spec.ts
│ │ │ │
│ │ │ ├── components/ # UI Components
│ │ │ │ ├── walkthrough/
│ │ │ │ │ ├── walkthrough.ts
│ │ │ │ │ ├── walkthrough.spec.ts
│ │ │ │ │ └── walkthrough.css
│ │ │ │ └── modal/
│ │ │ │ ├── modal.ts
│ │ │ │ ├── modal.spec.ts
│ │ │ │ └── modal.css
│ │ │ │
│ │ │ ├── utils/ # Helper functions
│ │ │ │ ├── dom-utils.ts
│ │ │ │ ├── dom-utils.spec.ts
│ │ │ │ ├── storage-utils.ts
│ │ │ │ ├── storage-utils.spec.ts
│ │ │ │ ├── event-utils.ts
│ │ │ │ └── event-utils.spec.ts
│ │ │ │
│ │ │ └── types/ # TypeScript types
│ │ │ └── sdk.types.ts
│ │ │
│ │ └── dist/ # Build output (gitignored)
│ │
│ └── chrome-extension/ # Chrome Extension
│ ├── package.json
│ ├── project.json
│ ├── tsconfig.json
│ ├── tsconfig.lib.json
│ ├── tsconfig.spec.json
│ ├── jest.config.ts
│ ├── README.md
│ ├── src/
│ │ ├── manifest.json # Extension manifest
│ │ │
│ │ ├── background/ # Background service worker
│ │ │ ├── service-worker.ts
│ │ │ ├── service-worker.spec.ts
│ │ │ └── rules.json # declarativeNetRequest rules
│ │ │
│ │ ├── content/ # Content scripts
│ │ │ ├── content-script.ts
│ │ │ ├── content-script.spec.ts
│ │ │ ├── sdk-injector.ts
│ │ │ └── sdk-injector.spec.ts
│ │ │
│ │ ├── popup/ # Extension popup
│ │ │ ├── popup.html
│ │ │ ├── popup.ts
│ │ │ ├── popup.spec.ts
│ │ │ └── popup.css
│ │ │
│ │ └── shared/ # Shared utilities
│ │ ├── message-types.ts
│ │ ├── constants.ts
│ │ └── utils.ts
│ │
│ └── dist/ # Build output (gitignored)
│
└── node_modules/ # Dependencies (gitignored)

```

---

### Integration Boundaries

#### API Boundaries

**External API Endpoints (Public):**
- `/api/v1/sdk/:projectId/config` - SDK configuration (public, API key auth)
- `/api/v1/sdk/:projectId/scripts` - Script delivery (public, API key auth)
- `/api/v1/sdk/:projectId/events` - Analytics tracking (public, API key auth)

**Internal API Endpoints (Authenticated):**
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/projects/*` - Project CRUD (JWT auth, tenant isolation)
- `/api/v1/products/*` - Product CRUD (JWT auth, tenant isolation)
- `/api/v1/scripts/*` - Script CRUD (JWT auth, tenant isolation)
- `/api/v1/ai/*` - AI script generation (JWT auth)

**Authentication Boundaries:**
- JWT tokens for Back Office users
- API keys for SDK integration
- Tenant isolation via middleware

---

#### Component Communication Boundaries

**Back Office ↔ API:**
- Protocol: HTTP REST API
- Authentication: JWT in Authorization header
- Data format: JSON with wrapped responses

**SDK ↔ API:**
- Protocol: HTTP REST API
- Authentication: API key in header or query param
- Data format: JSON with ETag caching
- Communication: One-way (SDK → API for analytics)

**Extension ↔ Back Office:**
- Protocol: postMessage API
- Security: Origin validation
- Data format: Typed message objects
- Communication: Bidirectional

**Extension ↔ SDK:**
- Protocol: Direct script injection
- Security: CSP bypass via extension
- Communication: Extension injects SDK into page

**Back Office ↔ iframe (via Extension):**
- Protocol: postMessage through extension bridge
- Security: Extension validates origins
- Use case: Preview mode only

---

#### Data Boundaries

**Database Access:**
- All database access through Prisma ORM
- Row-Level Security (RLS) for multi-tenancy
- Services layer handles business logic
- Routes layer handles HTTP concerns

**Data Flow:**
```

Angular Component
↓ Signal/Observable
Angular Service
↓ HTTP
Express Route Handler
↓
Express Service Layer
↓
Prisma ORM
↓
PostgreSQL Database

```

**Caching Boundaries:**
- **Client-side (SDK):** localStorage + ETag for scripts
- **Server-side (API):** Optional Redis for sessions (post-MVP)
- **CDN:** SDK distribution caching

---

### Architecture Summary

**Total Project Components:** 5
1. Back Office (Angular) - 1 app
2. API (Express) - 1 app
3. SDK (Pure JS) - 1 library
4. Chrome Extension - 1 library
5. E2E Tests - 1 app

**Key Integration Points:** 4
1. Back Office → API (REST)
2. SDK → API (REST + ETag)
3. Extension ↔ Back Office (postMessage)
4. Extension → SDK (injection)

**Security Layers:** 3
1. JWT authentication for Back Office
2. API key authentication for SDK
3. Origin validation for postMessage

**Data Isolation:** 2 levels
1. Tenant isolation (tenantId in all queries)
2. API key scope (per project)ts/
  user.service.spec.ts  // Should be co-located with user.service.ts
```

---
