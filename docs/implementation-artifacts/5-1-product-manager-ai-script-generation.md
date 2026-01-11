# Story 5.1: AI-Powered Script Generation - Recording & AI Integration

Status: ready-for-dev

## Story

As a **Product Manager**,
I want to **record my interactions on a website and have AI automatically generate a training script**,
so that **I can create training content quickly without manually writing each step**.

## Acceptance Criteria

1. ✅ Recording mode captures user clicks, inputs, navigation
2. ✅ Recording captures DOM selectors for each interaction
3. ✅ Recording captures screenshots for each step
4. ✅ AI generates script with steps, titles, descriptions
5. ✅ Generated script is editable before publishing
6. ✅ User can accept/reject AI suggestions
7. ✅ AI respects brand voice and tone (future)

**Priority:** P0 (Critical)

## Business Context

**Game-changing feature** that dramatically reduces content creation time. Product Managers can demonstrate a workflow once, and AI generates a complete training script with contextual descriptions and guidance.

**Key Business Value:**

- 10x faster script creation
- Lowers barrier to entry for non-technical users
- Differentiator from competitors

**Dependencies:**

- Story 1.3 complete (script creation)
- Story 4.1 complete (extension for recording)
- AI service access (OpenAI or Anthropic)

## Tasks / Subtasks

### Recording System

- [ ] **Task 1:** Recording mode in extension (AC: #1, #2, #3)
  - [ ] 1.1: Add recording toggle to extension
    - Start/stop recording button
    - Visual indicator (red dot on icon)
    - Recording session state management
  - [ ] 1.2: Event capture
    - Capture click events with target element
    - Capture input events with value (sanitized)
    - Capture navigation events (URL changes)
    - Capture scroll positions
  - [ ] 1.3: DOM selector generation
    - Generate unique CSS selector for each element
    - Use ID, class, data attributes
    - Fallback to nth-child if needed
    - Validate selector uniqueness
  - [ ] 1.4: Screenshot capture
    - Capture screenshot on each interaction
    - Crop to show relevant area
    - Compress images (WebP format)
    - Store temporarily in extension storage

- [ ] **Task 2:** Recording data structure (AC: #1, #2, #3)
  - [ ] 2.1: Define recording format
    - Session metadata (URL, timestamp, duration)
    - Interaction array (type, selector, screenshot, timestamp)
    - Context data (page title, element text content)
  - [ ] 2.2: Local storage/export
    - Store recording in extension storage
    - Export as JSON for API upload
    - Handle large recordings (chunking)

### AI Integration (Backend)

- [ ] **Task 3:** Recording upload API (AC: #4)
  - [ ] 3.1: POST /api/scripts/generate-from-recording
    - Accept recording JSON
    - Validate format
    - Store temporarily (S3 or local)
    - Return job ID for async processing
  - [ ] 3.2: GET /api/scripts/generation-status/:jobId
    - Check generation progress
    - Return generated script when complete

- [ ] **Task 4:** AI script generation (AC: #4, #7)
  - [ ] 4.1: Prompt engineering
    - Convert recording to structured prompt
    - Include screenshots as context
    - Request step titles and descriptions
    - Specify output format (JSON)
  - [ ] 4.2: OpenAI/Anthropic integration
    - Call GPT-4 Vision or Claude with images
    - Parse AI response (JSON)
    - Handle API errors and retries
  - [ ] 4.3: Post-processing
    - Validate generated data
    - Apply brand voice (future: use org preferences)
    - Create script + steps in database

### Back Office UI

- [ ] **Task 5:** Recording workflow UI (AC: #5, #6)
  - [ ] 5.1: Recording initiation
    - "Generate from Recording" button in script list
    - Instructions modal (install extension, navigate to site, click record)
    - Link to extension with recording enabled
  - [ ] 5.2: Upload and processing
    - Upload recording file from extension
    - Show progress indicator
    - Poll for generation status
  - [ ] 5.3: Review and edit generated script
    - Display AI-generated script in editor
    - Show generated steps with titles/descriptions
    - Allow editing before accepting
    - Accept/Reject buttons per step
    - "Accept All" / "Regenerate" buttons

### Testing

- [ ] **Task 6:** End-to-end tests
  - [ ] 6.1: Test recording capture
    - Test on sample workflows
    - Verify selectors are unique and stable
    - Verify screenshots captured correctly
  - [ ] 6.2: Test AI generation
    - Test with various recording lengths
    - Verify output format
    - Test with different AI providers
  - [ ] 6.3: Test review workflow
    - Test editing generated scripts
    - Test accept/reject functionality

## Dev Notes

### Architecture Patterns & Constraints

**From Architecture Document:**

1. **AI Integration** [Source: architecture.md#AI Integration]
   - OpenAI GPT-4 Vision or Anthropic Claude 3.5 Sonnet
   - Async job processing (recordings can be large)
   - Cost management (token limits, caching)

2. **Recording Storage** [Source: architecture.md#Storage]
   - Temporary storage for recordings (S3 or local filesystem)
   - Cleanup after processing (retention policy)
   - Large file handling (multipart upload)

3. **Extension Permissions** [Source: architecture.md#Chrome Extension]
   - Additional permissions: tabs, webNavigation
   - Screenshot capture API

### Project Structure Notes

**Extension Updates:**

```
libs/chrome-extension/
├── recording/
│   ├── recorder.js              # Event capture logic
│   ├── selector-generator.js   # CSS selector generation
│   └── screenshot-capture.js   # Screenshot API wrapper
└── popup/
    └── recording-controls.html  # Recording UI
```

**Backend Updates:**

```
apps/api/src/
├── routes/
│   └── ai-generation.ts         # Recording upload + generation
├── services/
│   ├── aiService.ts             # OpenAI/Claude integration
│   └── recordingProcessor.ts   # Parse recording, generate prompt
└── jobs/
    └── scriptGeneration.ts      # Async job processor
```

### Critical Implementation Details

1. **CSS Selector Generation:**

```javascript
function generateSelector(element) {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }

  // Try unique class combination
  if (element.className) {
    const classes = Array.from(element.classList).join('.');
    const selector = `.${classes}`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  // Try data attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      const selector = `[${attr.name}="${attr.value}"]`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }
  }

  // Fallback: build path with nth-child
  const path = [];
  let current = element;
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const index = Array.from(current.parentNode.children).indexOf(current) + 1;
    path.unshift(`${tag}:nth-child(${index})`);
    current = current.parentNode;
  }

  return path.join(' > ');
}
```

2. **AI Prompt Template:**

```typescript
const SCRIPT_GENERATION_PROMPT = `
You are an expert technical writer creating training content.

I will provide a recording of user interactions on a website, including:
- Screenshots at each step
- Element selectors clicked/interacted with
- Input values entered
- Navigation flow

Generate a training script with the following structure:
- Overall script title (concise, action-oriented)
- For each interaction, generate:
  - Step title (5-7 words, imperative mood: "Click the Login button")
  - Step description (1-2 sentences explaining why and what happens)
  - Keep existing element selector
  
Output as JSON matching this schema:
{
  "title": "string",
  "steps": [{
    "title": "string",
    "description": "string",
    "element_selector": "string"
  }]
}

Recording data:
${JSON.stringify(recording, null, 2)}
`;
```

3. **OpenAI Integration:**

```typescript
async function generateScriptFromRecording(recording: Recording) {
  const messages = [
    {
      role: 'system',
      content: 'You are an expert technical writer creating training content.',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: SCRIPT_GENERATION_PROMPT },
        ...recording.screenshots.map((img) => ({
          type: 'image_url',
          image_url: { url: img.dataUrl },
        })),
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const generated = JSON.parse(response.choices[0].message.content);

  // Create script in database
  return await createScript({
    name: generated.title,
    type: 'walkthrough',
    steps: generated.steps,
  });
}
```

### Testing Standards

**Integration Tests:**

- Test recording on various workflows
- Test AI generation with sample recordings
- Test error handling (API failures)
- Minimum 70% coverage

### References

- [Source: docs/planning-artifacts/prd.md#Epic 5] - User Story 5.1
- [Source: docs/planning-artifacts/architecture.md#AI Integration] - AI service selection

### Important Gotchas

⚠️ **CRITICAL:**

- AI costs can be high with many screenshots
- Rate limiting on AI APIs
- Large recordings may timeout

⚠️ **Common Mistakes:**

- Generated selectors not stable across page reloads
- Screenshots too large (compress!)
- Not sanitizing sensitive data (passwords in inputs)

⚠️ **UX:**

- Show estimated time for generation
- Allow editing generated content before accepting
- Clear error messages if AI generation fails

## Dev Agent Record

_To be filled by Dev agent_

---

**Status:** ready-for-dev  
**Created:** 2026-01-11  
**Completes:** Epic 5 - AI-Powered Script Generation
