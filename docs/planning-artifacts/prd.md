# Product Requirements Document - Next-Step

**Author:** Ido  
**Date:** 2026-01-11  
**Version:** 1.0  
**Status:** Draft

---

## Executive Summary

**Next-Step** is a dynamic onboarding and training injection system that enables businesses to overlay interactive educational content onto existing websites without requiring code changes to production systems. The platform consists of a Back Office for content management, a lightweight JavaScript SDK for content delivery, and a Chrome Extension for development and preview.

**Key Value Proposition:**

- Zero-impact deployment: No production code changes needed
- AI-powered content generation from user recordings
- Multi-tenant SaaS architecture
- Developer-friendly preview mode via Chrome Extension

---

## Product Overview

### Vision

Empower businesses to create seamless onboarding and training experiences that guide users through complex web applications, reducing support costs and improving user adoption rates.

### Mission

Provide a platform that makes creating and deploying interactive training content as simple as recording a walkthrough, with AI assistance to transform recordings into polished, production-ready training scripts.

### Target Audience

**Primary Users:**

1. **Product Managers** - Create and manage training content
2. **Customer Success Teams** - Deploy onboarding flows for users
3. **Support Teams** - Reduce support tickets with self-service training
4. **SaaS Companies** - Improve user activation and reduce churn

**Secondary Users:**

1. **Developers** - Integrate SDK into websites
2. **End Users** - Consume training content

---

## Goals & Objectives

### Business Goals

1. **User Acquisition**
   - Target: 100 beta customers in first 6 months
   - Focus: Mid-sized B2B SaaS companies

2. **User Engagement**
   - Target: 80% of scripts created using AI generation
   - Target: Average 5 scripts per customer

3. **Product-Market Fit**
   - Target: 40% of users active weekly
   - Target: Net Promoter Score (NPS) > 50

### Product Goals

1. **MVP Launch** (3 months)
   - Walkthrough and Modal components
   - Chrome Extension for preview
   - AI-powered script generation
   - Basic analytics

2. **Post-MVP** (6+ months)
   - Training Dashboard with progress tracking
   - Advanced segmentation
   - A/B testing for scripts
   - Multi-language support

---

## User Personas

### Persona 1: Sarah - Product Manager

**Background:**

- 5 years experience in SaaS product management
- Manages a team of 3 product designers
- Responsible for user onboarding metrics

**Goals:**

- Reduce time-to-value for new users
- Decrease support ticket volume
- Improve feature adoption rates

**Pain Points:**

- Requires engineering resources to update onboarding flows
- Long deployment cycles for simple content changes
- Difficulty measuring onboarding effectiveness

**How Next-Step Helps:**

- Create and update training content without engineering
- Deploy changes instantly via SDK
- Track user progress through training flows

---

### Persona 2: Mike - Customer Success Manager

**Background:**

- 3 years in customer success
- Manages 50+ enterprise accounts
- Responsible for user adoption and renewals

**Goals:**

- Improve user activation rates
- Reduce churn from poor onboarding
- Scale training without manual webinars

**Pain Points:**

- Manual onboarding webinars don't scale
- Users forget training after webinars
- Can't personalize training for different user segments

**How Next-Step Helps:**

- Self-service training available 24/7
- Contextual guidance when users need it
- Segment-based content delivery

---

## User Stories & Functional Requirements

### Epic 1: Project & Script Management

**User Story 1.1:** As a Product Manager, I want to create projects to organize my training content by product or feature area.

**Acceptance Criteria:**

- ✅ User can create a new project with a name and description
- ✅ User can view a list of all projects
- ✅ User can edit project details
- ✅ User can delete projects (with confirmation)
- ✅ Projects are isolated by tenant (multi-tenant)

**Priority:** P0 (Critical)

---

**User Story 1.2:** As a Product Manager, I want to create products within projects to further organize my content.

**Acceptance Criteria:**

- ✅ User can create products under a project
- ✅ User can view products within a project
- ✅ User can edit product details
- ✅ User can delete products
- ✅ Products inherit project permissions

**Priority:** P0 (Critical)

---

**User Story 1.3:** As a Product Manager, I want to create training scripts (walkthroughs or modals) for my products.

**Acceptance Criteria:**

- ✅ User can create a new script with type (walkthrough/modal)
- ✅ User can add/edit/remove steps within a script
- ✅ User can reorder steps via drag-and-drop
- ✅ User can preview scripts in iframe mode
- ✅ User can publish/unpublish scripts
- ✅ Scripts have versioning (future)

**Priority:** P0 (Critical)

---

### Epic 2: Walkthrough Component

**User Story 2.1:** As an end user, I want to see an interactive walkthrough that highlights specific elements on the page and guides me step-by-step.

**Acceptance Criteria:**

- ✅ Page darkens/dims when walkthrough starts
- ✅ Target element is highlighted with spotlight effect
- ✅ Step content displays near target element
- ✅ Navigation buttons: Next, Back, Skip
- ✅ Progress indicator shows current step (e.g., "2 of 5")
- ✅ Walkthrough closes when completed or skipped
- ✅ Walkthrough tracks user progress

**Priority:** P0 (Critical)

**Technical Notes:**

- Shadow DOM for CSS isolation
- CSS selector-based element targeting
- Smooth animations for spotlight transitions

---

**User Story 2.2:** As an end user, I want the walkthrough to automatically progress when I perform the expected action.

**Acceptance Criteria:**

- ✅ Walkthrough detects click events on target elements
- ✅ Walkthrough detects input/form submissions
- ✅ Walkthrough progresses to next step automatically
- ✅ Manual "Next" button still available
- ✅ Configurable: auto-progress on/off per step

**Priority:** P1 (High)

---

### Epic 3: Modal Component

**User Story 3.1:** As an end user, I want to see a modal with training content when I enter a page for the first time.

**Acceptance Criteria:**

- ✅ Modal displays on page load (configurable)
- ✅ Modal shows list of steps with titles
- ✅ Each step has text description and optional image
- ✅ Navigation: Previous, Next, Close buttons
- ✅ Progress indicator shows current step
- ✅ "Don't show again" option
- ✅ Modal respects user's choice to skip

**Priority:** P0 (Critical)

**Technical Notes:**

- Shadow DOM for CSS isolation
- Responsive design for mobile/desktop
- Accessible (keyboard navigation, ARIA labels)

---

### Epic 4: Chrome Extension (Developer Tool)

**User Story 4.1:** As a developer, I want to install a Chrome Extension that allows me to preview scripts on customer websites without deploying to production.

**Acceptance Criteria:**

- ✅ Extension available for Chrome/Edge
- ✅ Extension injects SDK into any website
- ✅ Extension bypasses CSP/X-Frame-Options for preview
- ✅ Extension communicates with Back Office via postMessage
- ✅ Extension enables iframe loading in Back Office
- ✅ Extension icon shows active/inactive state

**Priority:** P0 (Critical)

**Technical Notes:**

- Manifest V3 compliance
- declarativeNetRequest for header modification
- Content script for SDK injection
- Background service worker for coordination

---

**User Story 4.2:** As a Product Manager, I want to preview my scripts in an iframe within the Back Office using the Chrome Extension.

**Acceptance Criteria:**

- ✅ Back Office loads customer website in iframe
- ✅ Extension injects SDK into iframe
- ✅ Scripts load and display correctly in iframe
- ✅ User can test walkthrough/modal interactions
- ✅ Changes to scripts reflect immediately in preview
- ✅ Error messages display if extension not installed

**Priority:** P0 (Critical)

---

### Epic 5: AI-Powered Script Generation

**User Story 5.1:** As a Product Manager, I want to record my interactions on a website and have AI automatically generate a training script.

**Acceptance Criteria:**

- ✅ Recording mode captures user clicks, inputs, navigation
- ✅ Recording captures DOM selectors for each interaction
- ✅ Recording captures screenshots for each step
- ✅ AI generates script with steps, titles, descriptions
- ✅ Generated script is editable before publishing
- ✅ User can accept/reject AI suggestions
- ✅ AI respects brand voice and tone (future)

**Priority:** P0 (Critical)

**Technical Notes:**

- Integration with OpenAI GPT-4 or Anthropic Claude
- Prompt engineering for high-quality output
- Structured JSON output format
- Fallback to manual creation if AI fails

---

### Epic 6: SDK Integration

**User Story 6.1:** As a developer, I want to integrate the Next-Step SDK into my website with minimal effort.

**Acceptance Criteria:**

- ✅ SDK available via CDN (versioned)
- ✅ SDK initialization with project ID and API key
- ✅ SDK loads scripts automatically on page load
- ✅ SDK respects user segments (passed via init)
- ✅ SDK tracks analytics events anonymously
- ✅ SDK provides hooks for custom analytics
- ✅ SDK bundle size < 50KB gzipped

**Priority:** P0 (Critical)

**Implementation Example:**

```html
<script src="https://cdn.nextstep.io/sdk@1.0.0/nextstep.min.js"></script>
<script>
  NextStep.init({
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY',
    segments: ['premium', 'new-user'],
    userId: 'user123', // optional
  });
</script>
```

---

**User Story 6.2:** As a developer, I want to update user segments dynamically during navigation.

**Acceptance Criteria:**

- ✅ SDK provides `updateSegments()` method
- ✅ Scripts reload based on new segments
- ✅ Segment changes tracked in analytics
- ✅ Segments persist across page reloads

**Priority:** P1 (High)

---

### Epic 7: Analytics & Tracking

**User Story 7.1:** As a Product Manager, I want to track how users interact with my training scripts.

**Acceptance Criteria:**

- ✅ Track script views (how many users saw the script)
- ✅ Track step completions (which steps users completed)
- ✅ Track skips (how many users skipped the script)
- ✅ Track completion rate (% of users who finished)
- ✅ Track average time per step
- ✅ Data is anonymous by default
- ✅ Optional user identification via `sdk.identify()`

**Priority:** P1 (High)

---

**User Story 7.2:** As a Product Manager, I want to integrate Next-Step analytics with my existing analytics platform (Google Analytics, Mixpanel, etc.).

**Acceptance Criteria:**

- ✅ SDK provides event hooks for custom integrations
- ✅ Events fire with structured data
- ✅ Documentation includes integration examples
- ✅ Events include: script.loaded, step.completed, script.skipped, etc.

**Priority:** P1 (High)

**Implementation Example:**

```javascript
NextStep.on('event', (data) => {
  // Send to Google Analytics
  gtag('event', data.type, {
    scriptId: data.payload.scriptId,
    stepId: data.payload.stepId,
  });
});
```

---

### Epic 8: Multi-Tenant Architecture

**User Story 8.1:** As a SaaS provider, I want to ensure customers' data is completely isolated.

**Acceptance Criteria:**

- ✅ Row-level security enforces tenant isolation
- ✅ API key scoped to specific project
- ✅ Back Office users can only access their tenant's data
- ✅ Database queries always include tenant filter
- ✅ No data leakage between tenants (security tested)

**Priority:** P0 (Critical)

---

## Non-Functional Requirements

### Performance

**NFR-1: SDK Performance**

- **Requirement:** SDK must not impact host website performance
- **Metric:** < 100ms initialization time
- **Metric:** < 50KB gzipped bundle size
- **Priority:** P0

**NFR-2: API Response Time**

- **Requirement:** API endpoints respond within acceptable limits
- **Metric:** < 200ms for script delivery (p95)
- **Metric:** < 500ms for CRUD operations (p95)
- **Priority:** P0

**NFR-3: Caching**

- **Requirement:** SDK utilizes ETag caching to minimize bandwidth
- **Metric:** 304 Not Modified for unchanged scripts
- **Metric:** < 10KB payload for cached responses
- **Priority:** P0

---

### Security

**NFR-4: Authentication**

- **Requirement:** Secure authentication for Back Office users
- **Implementation:** JWT tokens with 24-hour expiration
- **Implementation:** Refresh token mechanism
- **Priority:** P0

**NFR-5: API Key Security**

- **Requirement:** API keys for SDK integration
- **Implementation:** API keys scoped to project
- **Implementation:** Rate limiting per API key
- **Priority:** P0

**NFR-6: Data Privacy**

- **Requirement:** GDPR compliance for analytics
- **Implementation:** Anonymous tracking by default
- **Implementation:** Optional user identification
- **Implementation:** Data retention policies
- **Priority:** P0

**NFR-7: CSP/CORS**

- **Requirement:** Extension-based CSP bypass only for preview mode
- **Implementation:** Production SDK respects CSP
- **Implementation:** Origin validation for postMessage
- **Priority:** P0

---

### Scalability

**NFR-8: Horizontal Scaling**

- **Requirement:** API can scale horizontally
- **Implementation:** Stateless API design
- **Implementation:** PostgreSQL connection pooling
- **Priority:** P1

**NFR-9: CDN Distribution**

- **Requirement:** SDK delivered via global CDN
- **Implementation:** Cloudflare CDN or jsDelivr
- **Implementation:** Version pinning for stability
- **Priority:** P1

---

### Reliability

**NFR-10: Uptime**

- **Requirement:** 99.9% uptime SLA
- **Metric:** < 43 minutes downtime per month
- **Priority:** P1

**NFR-11: Error Handling**

- **Requirement:** SDK gracefully handles errors without breaking host site
- **Implementation:** Try-catch around all SDK operations
- **Implementation:** Silent failures for non-critical operations
- **Priority:** P0

---

### Usability

**NFR-12: Browser Compatibility**

- **Requirement:** SDK works on modern browsers
- **Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Priority:** P0

**NFR-13: Mobile Responsiveness**

- **Requirement:** Walkthrough and Modal components work on mobile
- **Implementation:** Responsive CSS
- **Implementation:** Touch event support
- **Priority:** P1

**NFR-14: Accessibility**

- **Requirement:** Components meet WCAG 2.1 Level AA
- **Implementation:** Keyboard navigation
- **Implementation:** ARIA labels
- **Implementation:** Screen reader support
- **Priority:** P1

---

## Technical Architecture Summary

### System Components

1. **Back Office (Angular 20+)**
   - Multi-tenant project/product/script management
   - iframe preview with Chrome Extension integration
   - AI-powered script generation UI
   - User authentication and authorization

2. **API Server (Express.js 5.x)**
   - RESTful API for CRUD operations
   - JWT authentication
   - Prisma ORM + PostgreSQL
   - OpenAI/Claude integration for AI generation
   - SDK script delivery with ETag caching

3. **SDK (Pure JavaScript)**
   - < 50KB gzipped
   - Shadow DOM for UI isolation
   - Walkthrough and Modal components
   - ETag-based caching
   - Anonymous analytics tracking
   - Custom analytics hooks

4. **Chrome Extension (Manifest V3)**
   - SDK injection for preview mode
   - CSP/X-Frame-Options bypass (dev only)
   - postMessage bridge for Back Office ↔ iframe
   - Development tool (not required for production)

5. **Database (PostgreSQL)**
   - Multi-tenant with Row-Level Security
   - Prisma ORM for type-safe queries
   - In-memory SQLite for development

### Integration Points

- **Back Office → API:** REST API with JWT auth
- **SDK → API:** REST API with API key auth + ETag caching
- **Extension ↔ Back Office:** postMessage with origin validation
- **Extension → SDK:** Direct injection into target website

---

## Success Metrics (KPIs)

### Product Metrics

1. **Adoption Metrics**
   - Number of active projects
   - Number of scripts created per customer
   - % of scripts created via AI vs manual

2. **Engagement Metrics**
   - Script view rate
   - Script completion rate
   - Average steps per script
   - Skip rate

3. **Technical Metrics**
   - SDK load time (target: < 100ms)
   - API response time (target: < 200ms p95)
   - SDK bundle size (target: < 50KB)
   - Uptime (target: 99.9%)

4. **Business Metrics**
   - Monthly Recurring Revenue (MRR)
   - Customer Acquisition Cost (CAC)
   - Customer Lifetime Value (LTV)
   - Churn rate

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)

**Week 1: Foundation**

- ✅ Nx monorepo setup
- ✅ Angular 20+ Back Office scaffolding
- ✅ Express.js API scaffolding
- ✅ Prisma setup with SQLite (dev)
- ✅ Authentication (JWT + Passport.js)

**Week 2: SDK Core**

- ✅ Pure JS SDK foundation
- ✅ Shadow DOM implementation
- ✅ Walkthrough component
- ✅ Modal component
- ✅ ETag caching

**Week 3: Chrome Extension & Back Office**

- ✅ Manifest V3 setup
- ✅ CSP/X-Frame-Options bypass
- ✅ SDK injection mechanism
- ✅ Back Office: Project/Product/Script CRUD
- ✅ iframe preview integration

**Week 4: AI Integration & Polish**

- ✅ Recording capture in Back Office
- ✅ OpenAI/Claude integration
- ✅ Script generation from recordings
- ✅ Analytics tracking (basic)
- ✅ Testing and bug fixes

### Phase 2: Beta Launch (Weeks 5-8)

**Week 5-6: Production Ready**

- ✅ Migrate to PostgreSQL
- ✅ Deploy to Railway + Vercel
- ✅ SDK to CDN (Cloudflare)
- ✅ Chrome Extension to Web Store
- ✅ Documentation site

**Week 7-8: Beta Testing**

- ✅ Onboard 10 beta customers
- ✅ Gather feedback
- ✅ Bug fixes and improvements
- ✅ Analytics dashboard v1

### Phase 3: Post-MVP (Months 3-6)

- Training Dashboard with progress tracking
- Advanced segmentation rules
- A/B testing for scripts
- Multi-language support
- API webhooks
- Advanced analytics

---

## Risks & Mitigations

### Risk 1: Browser Security Restrictions

**Risk:** Browsers may block SDK injection or restrict postMessage communication

**Mitigation:**

- Use Shadow DOM for isolation
- Follow CSP best practices
- Chrome Extension only for preview mode
- Production SDK respects all security policies

**Probability:** Medium  
**Impact:** High

---

### Risk 2: AI Generation Quality

**Risk:** AI-generated scripts may be low quality or inaccurate

**Mitigation:**

- Prompt engineering for better output
- Manual editing always available
- Fallback to manual script creation
- Iterative improvement based on feedback

**Probability:** Medium  
**Impact:** Medium

---

### Risk 3: SDK Performance Impact

**Risk:** SDK may slow down host websites

**Mitigation:**

- Strict bundle size limits (< 50KB)
- Lazy loading of components
- ETag caching to minimize requests
- Performance monitoring

**Probability:** Low  
**Impact:** High

---

### Risk 4: Multi-Tenant Security

**Risk:** Data leakage between tenants

**Mitigation:**

- Row-level security in database
- Tenant isolation enforced at API level
- Security testing and audits
- API key scoping per project

**Probability:** Low  
**Impact:** Critical

---

## Appendix

### Glossary

- **Project:** Top-level organizational unit for training content
- **Product:** Sub-unit within a project (e.g., feature area)
- **Script:** Individual training flow (walkthrough or modal)
- **Step:** Individual instruction within a script
- **Segment:** User attribute for targeting (e.g., "premium", "new-user")
- **Walkthrough:** Interactive step-by-step guidance overlaid on website
- **Modal:** Static training content displayed in a modal dialog
- **Shadow DOM:** Web standard for CSS and DOM isolation
- **ETag:** HTTP caching mechanism for bandwidth optimization

### Related Documents

- [Architecture Decision Document](./architecture.md)
- API Documentation (to be created)
- SDK Integration Guide (to be created)
- Chrome Extension User Guide (to be created)

---

**Document Version History:**

| Version | Date       | Author | Changes              |
| ------- | ---------- | ------ | -------------------- |
| 1.0     | 2026-01-11 | Ido    | Initial PRD creation |
