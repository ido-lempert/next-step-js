# Story 7.1: Analytics Event Tracking

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **track how users interact with training scripts (views, completions, skips)**,
so that **I can measure training effectiveness and identify areas for improvement**.

## Acceptance Criteria

1. ✅ Track script views (when training starts)
2. ✅ Track step completions (each step)
3. ✅ Track skips (user skips a step or script)
4. ✅ Track completion rate per script
5. ✅ Track average time per step
6. ✅ Dashboard shows analytics in Back Office
7. ✅ Anonymous tracking (no PII unless opted in)

**Priority:** P1 (High)

## Business Context

**Data-driven optimization** is key to improving training quality. Analytics show which scripts are effective and which need work.

**Key Business Value:**

- Identify low-performing scripts (low completion rates)
- Optimize script length based on time metrics
- Prove ROI to customers (engagement data)

**Dependencies:**

- Story 6.2 complete (SDK event system)
- Story 1.3 complete (scripts exist)

## Tasks / Subtasks

### Backend Analytics API

- [ ] **Task 1:** Event ingestion API (AC: #1, #2, #3, #7)
  - [ ] 1.1: POST /api/public/analytics/events
    - Accept event batch from SDK
    - Validate event schema
    - No auth required (public endpoint)
  - [ ] 1.2: Event schema
    - Event type (script_shown, step_viewed, step_completed, etc.)
    - Script ID, Step ID (optional)
    - Timestamp (client-side)
    - Session ID (anonymous identifier)
    - User ID (optional, if customer provides)
  - [ ] 1.3: Database storage
    - Table: `analytics_events`
    - Partition by date (for performance)
    - Index on (project_id, event_type, timestamp)

- [ ] **Task 2:** Event aggregation (AC: #4, #5)
  - [ ] 2.1: Completion rate calculation
    - Query: COUNT(script_completed) / COUNT(script_shown)
    - Group by script_id
    - Cache results (update hourly)
  - [ ] 2.2: Average time per step
    - Calculate: timestamp(step_completed) - timestamp(step_viewed)
    - Group by script_id, step_id
    - Handle outliers (cap at 10 minutes per step)
  - [ ] 2.3: Aggregation job
    - Run every hour (cron or background job)
    - Update `analytics_summary` table
    - Store: completion_rate, avg_time, total_views, total_completions

### Dashboard UI

- [ ] **Task 3:** Analytics page in Back Office (AC: #6)
  - [ ] 3.1: Overview dashboard
    - Card: Total scripts views (all scripts)
    - Card: Total completions
    - Card: Average completion rate
    - Chart: Views over time (last 30 days)
  - [ ] 3.2: Script-level analytics
    - Table: List of scripts with metrics
    - Columns: Script name, Views, Completions, Completion rate, Avg time
    - Sort by any column
    - Filter by date range
  - [ ] 3.3: Step-level drill-down
    - Click script → see step breakdown
    - Table: Step title, Completions, Avg time
    - Identify drop-off points (steps with high skip rate)

### SDK Integration

- [ ] **Task 4:** SDK event tracking (AC: #1, #2, #3, #7)
  - [ ] 4.1: Auto-track core events
    - Emit events from components
    - Use SDK EventEmitter (from Story 6.2)
  - [ ] 4.2: Session ID generation
    - Generate random UUID on first visit
    - Store in sessionStorage (ephemeral)
    - Include in all events
  - [ ] 4.3: Optional user ID
    - Allow customers to set: `NextStep.setUserId(userId)`
    - Include in events if set
    - Privacy warning in docs

### Testing

- [ ] **Task 5:** Analytics tests
  - [ ] 5.1: Test event ingestion
    - Test API accepts valid events
    - Test validation (reject malformed events)
  - [ ] 5.2: Test aggregation
    - Test completion rate calculation
    - Test time calculation
    - Test with edge cases (no completions, etc.)
  - [ ] 5.3: Test dashboard
    - Test data rendering
    - Test date range filter
    - Test sorting

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **Analytics Architecture** [Source: architecture.md#Analytics]
   - Anonymous by default (no user tracking)
   - Batched events (reduce API load)
   - Aggregated data (pre-compute metrics)

2. **Database** [Source: architecture.md#Database]
   - Partition analytics_events table by date
   - Archive old events (retention: 90 days)
   - Use indexes for fast queries

3. **Privacy** [Source: architecture.md#Privacy]
   - No PII stored unless customer opts in
   - Session ID rotates per browser session
   - GDPR-compliant (anonymization)

### Project Structure Notes

**Backend:**

```
apps/api/src/
├── routes/
│   └── analytics.ts             # Event ingestion + queries
├── jobs/
│   └── aggregateAnalytics.ts    # Hourly aggregation job
└── services/
    └── analyticsService.ts      # Business logic
```

**Frontend:**

```
apps/back-office/src/app/
├── pages/
│   └── analytics/
│       ├── analytics.component.ts       # Main page
│       ├── overview.component.ts        # Overview cards
│       ├── script-metrics.component.ts  # Script table
│       └── step-drill-down.component.ts # Step breakdown
└── services/
    └── analytics.service.ts             # API client
```

### Critical Implementation Details

1. **Database Schema:**

```sql
-- Raw events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
  session_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(255), -- Optional
  timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB, -- Additional event data
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Create partitions (monthly)
CREATE TABLE analytics_events_2026_01 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Indexes
CREATE INDEX idx_analytics_project_type_timestamp
  ON analytics_events (project_id, event_type, timestamp DESC);
CREATE INDEX idx_analytics_script
  ON analytics_events (script_id, timestamp DESC);

-- Aggregated summary (updated hourly)
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_views INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  completion_rate DECIMAL(5,2), -- Percentage
  avg_time_seconds INT, -- Average time per script
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (script_id, date)
);

CREATE INDEX idx_summary_project_date
  ON analytics_summary (project_id, date DESC);
```

2. **Event Ingestion API:**

```typescript
// apps/api/src/routes/analytics.ts
interface AnalyticsEvent {
  type: string;
  scriptId: string;
  stepId?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

router.post('/api/public/analytics/events', async (req, res) => {
  const { projectId, events } = req.body;

  // Validate
  if (!projectId || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Rate limiting: max 1000 events per project per minute
  const rateLimitKey = `analytics:${projectId}`;
  const count = await redis.incr(rateLimitKey);
  if (count === 1) {
    await redis.expire(rateLimitKey, 60);
  }
  if (count > 1000) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Insert events (batch)
  await prisma.analyticsEvent.createMany({
    data: events.map((e: AnalyticsEvent) => ({
      projectId,
      eventType: e.type,
      scriptId: e.scriptId,
      stepId: e.stepId,
      sessionId: e.sessionId,
      userId: e.userId,
      timestamp: new Date(e.timestamp),
      metadata: {},
    })),
  });

  res.json({ success: true });
});
```

3. **Aggregation Job:**

```typescript
// apps/api/src/jobs/aggregateAnalytics.ts
export async function aggregateAnalytics() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  // Get all scripts with events yesterday
  const scripts = await prisma.script.findMany({
    where: {
      analyticsEvents: {
        some: {
          timestamp: {
            gte: new Date(`${dateStr}T00:00:00Z`),
            lt: new Date(`${dateStr}T23:59:59Z`),
          },
        },
      },
    },
  });

  for (const script of scripts) {
    const views = await prisma.analyticsEvent.count({
      where: {
        scriptId: script.id,
        eventType: 'script_shown',
        timestamp: {
          gte: new Date(`${dateStr}T00:00:00Z`),
          lt: new Date(`${dateStr}T23:59:59Z`),
        },
      },
    });

    const completions = await prisma.analyticsEvent.count({
      where: {
        scriptId: script.id,
        eventType: 'script_completed',
        timestamp: {
          gte: new Date(`${dateStr}T00:00:00Z`),
          lt: new Date(`${dateStr}T23:59:59Z`),
        },
      },
    });

    const completionRate = views > 0 ? (completions / views) * 100 : 0;

    // Calculate average time
    const sessions = await prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where: {
        scriptId: script.id,
        eventType: { in: ['script_shown', 'script_completed'] },
        timestamp: {
          gte: new Date(`${dateStr}T00:00:00Z`),
          lt: new Date(`${dateStr}T23:59:59Z`),
        },
      },
      _min: { timestamp: true },
      _max: { timestamp: true },
    });

    const times = sessions.filter((s) => s._min.timestamp && s._max.timestamp).map((s) => (s._max.timestamp!.getTime() - s._min.timestamp!.getTime()) / 1000);

    const avgTime = times.length > 0 ? Math.floor(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    // Upsert summary
    await prisma.analyticsSummary.upsert({
      where: {
        scriptId_date: {
          scriptId: script.id,
          date: new Date(dateStr),
        },
      },
      create: {
        projectId: script.projectId,
        scriptId: script.id,
        date: new Date(dateStr),
        totalViews: views,
        totalCompletions: completions,
        completionRate,
        avgTimeSeconds: avgTime,
      },
      update: {
        totalViews: views,
        totalCompletions: completions,
        completionRate,
        avgTimeSeconds: avgTime,
        updatedAt: new Date(),
      },
    });
  }
}

// Schedule with cron
// 0 * * * * (every hour)
```

4. **Dashboard Component:**

```typescript
// apps/back-office/src/app/pages/analytics/script-metrics.component.ts
@Component({
  selector: 'app-script-metrics',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Script Performance</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="metrics" matSort>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Script</th>
            <td mat-cell *matCellDef="let row">{{ row.scriptName }}</td>
          </ng-container>

          <ng-container matColumnDef="views">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Views</th>
            <td mat-cell *matCellDef="let row">{{ row.totalViews }}</td>
          </ng-container>

          <ng-container matColumnDef="completions">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Completions</th>
            <td mat-cell *matCellDef="let row">{{ row.totalCompletions }}</td>
          </ng-container>

          <ng-container matColumnDef="rate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Completion Rate</th>
            <td mat-cell *matCellDef="let row">{{ row.completionRate | number: '1.0-0' }}%</td>
          </ng-container>

          <ng-container matColumnDef="avgTime">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Avg Time</th>
            <td mat-cell *matCellDef="let row">
              {{ formatTime(row.avgTimeSeconds) }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" (click)="viewDetails(row)"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
})
export class ScriptMetricsComponent implements OnInit {
  metrics = signal<ScriptMetric[]>([]);
  displayedColumns = ['name', 'views', 'completions', 'rate', 'avgTime'];

  constructor(private analyticsService: AnalyticsService) {}

  async ngOnInit() {
    const data = await this.analyticsService.getScriptMetrics();
    this.metrics.set(data);
  }

  formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  viewDetails(metric: ScriptMetric) {
    // Navigate to step-level drill-down
  }
}
```

5. **SDK Session ID:**

```typescript
// libs/sdk/src/core/SessionTracker.ts
export class SessionTracker {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private getOrCreateSessionId(): string {
    let id = sessionStorage.getItem('nextstep_session_id');
    if (!id) {
      id = this.generateUUID();
      sessionStorage.setItem('nextstep_session_id', id);
    }
    return id;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
```

### Testing Standards

**Unit Tests:**

- Test aggregation calculations (completion rate, avg time)
- Test session ID generation
- Minimum 75% coverage

**Integration Tests:**

- Test event ingestion end-to-end
- Test dashboard data loading
- Test date range filtering

### References

- [Source: docs/planning-artifacts/prd.md#Epic 7] - User Story 7.1
- [Source: docs/planning-artifacts/architecture.md#Analytics] - Analytics architecture

### Important Gotchas

⚠️ **CRITICAL:**

- Partition analytics_events table (performance at scale)
- Rate limiting on ingestion endpoint (prevent abuse)
- Anonymize data (GDPR compliance)

⚠️ **Common Mistakes:**

- Not handling outliers in time calculations (users leave tab open for hours)
- Not archiving old events (disk space)
- Not caching aggregated data (expensive queries)

⚠️ **UX:**

- Show "No data yet" state gracefully
- Provide date range filters
- Export data as CSV (for further analysis)

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 7 - Analytics & Tracking (Part 1 of 2)
