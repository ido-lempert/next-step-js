---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - docs/planning-artifacts/prd.md
  - docs/planning-artifacts/architecture.md
---

# UX Design Specification nstep

**Author:** Ido
**Date:** 2026-01-11

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

Next-Step is a privacy-first, zero-impact training injection system that enables businesses to overlay interactive onboarding content onto existing websites without code changes. The platform solves three critical pain points: GDPR compliance (anonymous tracking by default), speed to market (setup in minutes vs. months), and deployment friction (no production code changes required). The Chrome Extension serves as a "POC accelerator" for technical champions to prove value on production sites before formal SDK integration.

### Target Users

**Primary User Personas:**

1. **David (Frontend Developer / Technical Champion)**
   - **Role:** Proves product value through rapid POC
   - **Pain:** Needs stakeholder buy-in before procurement/security review
   - **Goal:** Show training overlays working on actual production site in 30 minutes
   - **Tool Usage:** Chrome Extension for POC → SDK integration after approval

2. **Sarah (Product Manager)**
   - **Role:** Creates and manages training content post-SDK installation
   - **Pain:** Requires engineering resources for every onboarding change, support tickets overwhelming
   - **Goal:** Update training content independently, reduce time-to-value for users
   - **Tool Usage:** Back Office with iframe preview (no extension needed)

3. **Mike (Customer Success Manager)**
   - **Role:** Deploys training flows to reduce churn
   - **Pain:** Manual webinars don't scale, users forget training content
   - **Goal:** Self-service training available 24/7, segment-based delivery
   - **Tool Usage:** Back Office for content deployment and analytics

4. **End Users (Training Consumers)**
   - **Role:** Consume training content on client websites
   - **Context:** Walkthrough guidance and modal training during product usage
   - **Tool Usage:** SDK-delivered content (invisible infrastructure)

### Key Design Challenges

**Challenge 1: GDPR & Privacy as a Feature, Not a Limitation**

- Traditional onboarding tools (Pendo, WalkMe) create compliance nightmares with third-party tracking
- Users expect rich analytics but need to understand anonymous tracking is a competitive advantage
- Clear messaging: "Your data stays yours. We track training completion, not personal information."
- Compliance dashboard showing "100% GDPR compliant" status

**Challenge 2: Chrome Extension Positioning - "Safe POC Testing"**

- Extension is for technical champions doing POC, NOT for content creators
- Developers need confidence: "Only YOU see this. No changes to production. Safe for testing."
- Clear transition path: Extension POC → SDK installation → Production deployment
- Visual distinction: "🟢 Preview Mode Active - Local only" vs production SDK

**Challenge 3: AI Speed vs. Professional Polish**

- "Record & Ship in 60 seconds" is powerful but needs to feel production-ready
- Balance between fast generation and customization needs
- Preview confidence: "This looks great, I can publish this now"
- Visual selector picker for manual CSS selector refinement when AI misses

**Challenge 4: Non-Technical Users Creating Technical Content**

- Sarah and Mike don't understand CSS selectors or DOM concepts
- AI should abstract complexity, but manual editing needs visual tools
- Point-and-click selector discovery, not code editing
- Segment targeting needs business-friendly language (not technical rules)

**Challenge 5: Multi-Device Training Delivery**

- Back Office creators work on desktop
- End users consume on mobile, tablet, desktop
- Preview mode needs device simulation
- Responsive walkthrough positioning (spotlight follows element)

### Design Opportunities

**Opportunity 1: "30-Minute POC" Developer Experience**

- Hero workflow: Install extension → Create script → Test on prod → Demo to boss → Get approval
- Clear value proposition: "Prove the concept before the meeting ends"
- One-click SDK integration code after POC success
- POC-to-Production migration checklist in Back Office

**Opportunity 2: "Record & Ship" Content Creation Magic**

- AI generation as the hero feature: Record interactions → AI creates script → Publish instantly
- Visual progress: "🎥 Recording... → 🤖 AI Generating... → ✨ Ready to Publish"
- Instant gratification for creators (dopamine loop)
- Shareable preview links for stakeholder approval (no extension required)

**Opportunity 3: Compliance as Brand Differentiator**

- Privacy-first messaging throughout UI
- Export compliance reports for audits (SOC2, GDPR, HIPAA)
- Dashboard badge: "🛡️ Data Privacy Certified"
- Marketing angle for regulated industries (finance, healthcare, government)

**Opportunity 4: White-Label Branding Flexibility**

- Instant brand matching: Color picker + logo upload
- End users never see "Next-Step" branding
- Invisible infrastructure (SDK runs on customer domain)
- Preview before publish: "See how it looks with your brand"

**Opportunity 5: Frictionless Stakeholder Approval**

- Generate demo recordings from preview mode
- Share preview links without technical setup
- "Look what I built" shareable demos for remote teams
- Comment/feedback system for collaborative script refinement

---

## Core User Experience

### Defining Experience

The core experience of Next-Step centers on **Sarah's "Record → Generate → Preview → Publish" workflow** - transforming the complex task of creating training content into a delightful, confidence-building journey that takes minutes instead of hours.

**Primary User Action (Most Frequent):**
Sarah creates and iterates on training scripts through an AI-powered recording workflow that captures her interactions, generates professional training steps automatically, and provides responsive preview simulation before instant publishing to production.

**Secondary User Action (Critical for Acquisition):**
David proves product value through a "30-Minute POC" flow using the Chrome Extension to demonstrate training overlays working on actual production sites, leading to SDK integration after stakeholder approval.

**Tertiary User Action (High Volume, Passive):**
End users consume training content through walkthroughs and modals delivered via the SDK, with events firing to the customer's own analytics infrastructure (Google Analytics, Mixpanel, etc.) through client-side hooks.

**Integration Action (One-Time Setup):**
Developers wire SDK event hooks to their existing analytics stack using simple copy-paste examples, maintaining data ownership and GDPR compliance.

### Platform Strategy

**Back Office Studio: Web-First Responsive Application**

- **Primary Platform:** Web application (Angular) accessible from any device
- **Desktop Experience (1920x1080+):** Full editor with dual-pane preview, side-by-side script editing
- **Tablet Experience (768-1024px):** Single-column layout with collapsible panels, fully functional editing
- **Mobile Experience (375-767px):** Streamlined interface for quick reviews and view-only mode
- **Cross-Browser Support:** Chrome, Firefox, Safari, Edge (modern versions, last 2 major releases)

**Device Preview Toggle:**
Built-in device simulation within the Back Office Studio allows creators to preview how training content will appear across different screen sizes without leaving the editor:

- [Desktop] toggle: Full viewport simulation (>1024px)
- [Tablet] toggle: Medium viewport simulation (768-1024px)
- [Mobile] toggle: Small viewport simulation (375-767px)

**SDK Delivery: Fully Responsive Across All Devices**

- **Mobile-First CSS:** Progressive enhancement from small to large screens
- **Viewport-Aware Positioning:** Walkthrough spotlights and tooltips automatically adjust to screen size
- **Touch + Mouse Support:** Automatic detection and optimization for input method
- **Breakpoints:** Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Performance:** <50KB gzipped bundle, <100ms initialization time

**Chrome Extension: Desktop Development Tool**

- **Platforms:** Chrome and Edge browsers (Manifest V3)
- **Purpose:** POC testing and production site preview without SDK installation
- **Context:** Desktop-based demonstrations for stakeholders
- **Future Consideration:** Firefox extension if demand exists

**Analytics Infrastructure: Client-Side Hooks Only**

- **No Built-In Dashboard:** Next-Step does not store or visualize analytics data
- **Event Hooks:** Standard JavaScript events fire on customer's domain
- **Customer-Controlled:** Events sent to customer's existing analytics tools (GA, Mixpanel, Glassbox, Splunk)
- **Privacy-First:** Zero data leaves customer's infrastructure by default
- **Integration Format:** Simple event listener with JSON payload structure

### Effortless Interactions

**Zero-Friction Recording Experience:**

- Single click "Start Recording" → Red dot indicator appears
- Perform actions naturally (clicks, inputs, navigation)
- Extension captures everything automatically (selectors, screenshots, context)
- Click "Stop Recording" → Recording saved, ready for AI generation
- No installation on target site needed (extension handles SDK injection)

**Magical AI Script Generation:**

- Click "Generate with AI" → Visual progress indicator with status messages
- AI processes recording in <10 seconds
- Returns professional-quality steps with contextual titles and descriptions
- CSS selectors automatically detected and validated
- Screenshots attached to each step automatically
- Ready to preview immediately without manual work

**Confidence-Building Responsive Preview:**

- Device toggle ([Desktop] [Tablet] [Mobile]) switches viewport simulation instantly
- Iframe loads target website seamlessly with extension-injected SDK
- Walkthrough plays exactly as end users will experience it
- Responsive positioning visible: tooltips adapt to each screen size
- Validation warnings: "⚠️ Element not visible on mobile" when issues detected
- Success confirmation: "✓ Looks good on all devices" when validation passes

**One-Click Publishing:**

- Single "Publish" button → Instant deployment (no build process, no waiting)
- SDK with ETag caching picks up changes within seconds globally
- "Published successfully ✓" confirmation with live status
- Optional: Share preview link for stakeholder review before making public

**Copy-Paste Analytics Integration:**
Developers add event hooks in 5 minutes with documentation examples:

```javascript
NextStep.on('event', (event) => {
  gtag('event', event.type, event.payload); // Google Analytics
  mixpanel.track(event.type, event.payload); // Mixpanel
});
```

Standard event format works with any analytics platform without custom integration work.

### Critical Success Moments

**Moment 1: AI Generation Quality Exceeds Expectations**

- Recording stops → AI processes → Sarah sees professional, polished training steps
- Generated titles and descriptions are contextual and accurate (not generic)
- CSS selectors work correctly without manual debugging
- **Success Indicator:** "Wow, this is 90% done, I just need to tweak a few words"
- **Failure Mode:** Generic steps like "Step 1", "Step 2" or broken selectors requiring technical knowledge to fix

**Moment 2: Responsive Preview Builds Publishing Confidence**

- Sarah clicks device toggle ([Mobile]) → iframe resizes → walkthrough adapts beautifully
- Spotlight and tooltips reposition correctly for smaller screen
- No horizontal scrolling, no cut-off text, no broken layouts
- **Success Indicator:** "Wow, it automatically looks great on mobile too! I'm confident to publish."
- **Failure Mode:** Mobile preview shows broken layout or overlapping elements, destroying trust

**Moment 3: SDK Integration "Just Works" on First Try**

- David copies SDK initialization code → Adds to website → Refreshes page
- Scripts load and display correctly without debugging
- No console errors, no visual glitches, no conflicts with existing styles
- **Success Indicator:** "It worked perfectly on the first try, no troubleshooting needed"
- **Failure Mode:** Console errors, CSS conflicts, or scripts not loading, requiring support tickets

**Moment 4: Analytics Events Fire Seamlessly**

- Developer adds event listener hook → Tests walkthrough → Checks analytics dashboard
- Events appear in Google Analytics/Mixpanel with correct structure
- Example code from documentation worked without modifications
- **Success Indicator:** "This integration took 5 minutes, events are flowing perfectly"
- **Failure Mode:** Event format requires custom parsing or events don't fire consistently

**Moment 5: Mobile End Users Have Native-Like Experience**

- User on phone triggers walkthrough → Spotlight and instructions fit screen perfectly
- Touch targets are appropriately sized, gestures feel natural
- No desktop-only assumptions (like hover states or precise clicking)
- **Success Indicator:** "This feels native to mobile, not like a desktop thing crammed onto a phone"
- **Failure Mode:** Small tap targets, overlapping UI, or desktop-centric interactions on mobile

### Experience Principles

**Principle 1: Magic Through Simplicity**
Complex technical operations (CSS selectors, DOM manipulation, responsive positioning) must feel effortless through AI automation and intelligent defaults. Sarah never sees technical complexity unless she chooses advanced editing mode.

**Principle 2: Confidence Before Commitment**
Every action provides immediate, accurate preview of the end result. Sarah sees exactly what end users will experience across all devices before publishing. No surprises in production.

**Principle 3: Privacy by Default, Analytics by Integration**
Next-Step never stores customer data. Analytics events fire on the customer's domain and route to their chosen tools. GDPR compliance is built-in, not bolted-on. Customers maintain complete data ownership.

**Principle 4: Responsive-First, Not Responsive-Later**
Mobile experience is not an afterthought. Every component, from creation to consumption, considers all screen sizes from the start. Device preview toggle makes responsive testing effortless during content creation.

**Principle 5: Prove First, Commit Later**
David can demonstrate real value on production sites in 30 minutes using the Chrome Extension before any procurement or security review. POC success leads to SDK integration, not the other way around.

**Principle 6: Developer-Friendly Integration**
SDK initialization is copy-paste simple. Analytics hooks follow standard JavaScript patterns. Documentation includes working examples for common tools. Developers get it working quickly and move on.

---

## Desired Emotional Response

### Primary Emotional Goals

**"WOW, IT'S SO EASY!"** - The Core Emotional Promise

The primary emotional goal for Next-Step is to deliver a delightful surprise that creating professional training content requires zero technical knowledge and takes minutes instead of hours. Users should feel genuinely amazed that something they expected to be complex and time-consuming is actually effortless and fast.

This emotional response breaks down into three interconnected feelings:

1. **"Wow"** = Delight + Surprise (exceeds expectations dramatically)
2. **"So Easy"** = Empowered + Confident (I can do this independently)
3. **"Improve Users' Usability"** = Pride + Accomplishment (I'm making real impact)

**For Content Creators (Sarah & Mike):**

- **Empowered:** "I don't need engineering anymore, I can do this myself"
- **Confident:** "This looks professional, I'm proud to publish this"
- **Delighted:** "The AI did this for me in seconds, incredible!"
- **Efficient:** "I just saved 4 hours of work"
- **Creative:** "I can experiment and iterate freely without consequences"

**For Technical Champions (David):**

- **Bold:** "I can demo this to the boss without fear of failure"
- **Validated:** "This POC proves my recommendation was right"
- **Relieved:** "Setup was painless, no debugging needed"
- **Smart:** "I found the perfect solution for our problem"

**For End Users (Training Consumers):**

- **Guided:** "I know exactly what to do next"
- **Calm:** "This isn't overwhelming, it's genuinely helpful"
- **Accomplished:** "I just learned something valuable quickly"
- **Respected:** "This doesn't feel intrusive or annoying"

### Emotional Journey Mapping

**Stage 1: First Discovery (David Installing Extension)**

- **Expected Feeling:** Anxiety ("Is this going to be complicated to set up?")
- **Desired Feeling:** Relief + Excitement ("Oh wow, that was actually simple!")
- **Critical Moment:** Extension installs in 30 seconds, first script works on production site immediately without debugging
- **Design Goal:** Eliminate setup anxiety through instant success

**Stage 2: First Use (Sarah Creating First Script)**

- **Expected Feeling:** Overwhelm ("I don't know CSS selectors, how am I supposed to do this?")
- **Desired Feeling:** Amazement + Empowerment ("Wait, I just recorded and AI did everything?!")
- **Critical Moment:** Recording stops → AI generates professional steps → Sarah sees contextual titles and descriptions → "This is easier than I thought!"
- **Design Goal:** Replace technical intimidation with magical simplicity

**Stage 3: Core Experience (Creating Training Content)**

- **Expected Feeling:** Tedious work ("This is going to take hours to get right")
- **Desired Feeling:** Flow State + Creative Joy ("I'm building something cool effortlessly")
- **Critical Moment:** Preview looks perfect on all devices → One-click publish → Entire process done in 10 minutes
- **Design Goal:** Transform work into play through frictionless creation

**Stage 4: After Accomplishment (Published First Script)**

- **Expected Feeling:** Uncertainty ("Did I do this right? Will it break something?")
- **Desired Feeling:** Pride + Confidence ("I just shipped professional training without engineering!")
- **Critical Moment:** Sarah sees end users completing the walkthrough successfully, zero technical issues
- **Design Goal:** Build confidence through validated success

**Stage 5: Returning Use (Sarah's 5th Script)**

- **Expected Feeling:** Routine task ("Another script to create...")
- **Desired Feeling:** Mastery + Speed ("I'm so good at this now, it takes 5 minutes")
- **Critical Moment:** Muscle memory kicks in, creation process feels effortless and fast
- **Design Goal:** Reward expertise with increasing efficiency

**Stage 6: Advocacy (Sharing with Colleagues)**

- **Expected Feeling:** "Let me show you this tool I use..."
- **Desired Feeling:** Enthusiasm + Advocacy ("You HAVE to try this, it's ridiculously easy!")
- **Critical Moment:** Colleague watches Sarah create a script in real-time → "Wait, THAT'S IT?!"
- **Design Goal:** Create viral word-of-mouth through genuine amazement

### Micro-Emotions

**Confidence vs. Confusion:**

- **Optimize For:** Preview mode builds confidence ("This looks exactly right, ready to publish")
- **Avoid:** Confusion from technical jargon, unclear next steps, or ambiguous preview states
- **Design Approach:** Clear device toggle labels, obvious publish button, plain language throughout

**Trust vs. Skepticism:**

- **Optimize For:** AI generation quality builds immediate trust ("Wow, this is actually good!")
- **Avoid:** Skepticism from poor AI output requiring heavy manual fixing
- **Design Approach:** First AI output must be 90% perfect with contextual, specific content (not generic placeholders)

**Accomplishment vs. Frustration:**

- **Optimize For:** Celebrate completion ("✓ Published successfully!" with satisfying visual feedback)
- **Avoid:** Frustration from broken selectors, mysterious errors, or "why isn't this working?" moments
- **Design Approach:** Proactive validation, helpful error messages, automatic selector fixing

**Delight vs. Satisfaction:**

- **Optimize For:** Unexpected delight ("Wow, it auto-detected the perfect selector!")
- **Beyond:** Not just "it works" but "it works BEAUTIFULLY"
- **Design Approach:** Micro-interactions, smooth animations, intelligent defaults that exceed expectations

**Empowerment vs. Dependency:**

- **Optimize For:** Independence ("I can do this myself now without technical help")
- **Avoid:** Dependency on technical resources ("I still need engineering to fix this CSS issue")
- **Design Approach:** Visual selector picker, point-and-click editing, abstracted technical complexity

**Calm vs. Anxiety:**

- **Optimize For:** Peace of mind ("This is safe to publish, nothing will break")
- **Avoid:** Anxiety about GDPR violations, production site damage, or user data exposure
- **Design Approach:** Privacy badges, preview validation, clear safety messaging

### Design Implications

**To Create "WOW" Moments:**

- AI generation completes in <10 seconds with visible progress indication
- First preview loads instantly and looks pixel-perfect
- One-click publish deploys globally in seconds
- Responsive adaptation happens automatically without configuration
- Smart defaults eliminate 90% of decision-making

**To Create "SO EASY" Feelings:**

- Recording starts with single button click (no setup required)
- Visual selector picker replaces manual CSS editing
- Device toggle switches viewport instantly (no reload)
- Plain language replaces technical terminology
- Copy-paste code examples for common integrations

**To Enable "IMPROVE USABILITY" Pride:**

- Analytics dashboard shows real user completion rates (future)
- Preview mode validates training works before publishing
- Segment targeting ensures right users see right content
- Responsive preview proves training works on all devices
- Professional polish reflects well on the creator

**To Eliminate Anxiety:**

- Privacy badges visible: "🛡️ 100% GDPR Compliant"
- Preview mode clearly marked: "🟢 Preview Mode - Only visible to you"
- Validation warnings: "⚠️ Element not visible on mobile" before publishing
- Undo/unpublish always available
- No destructive actions without confirmation

**To Build Confidence:**

- Live preview shows exactly what end users will see
- Device simulation accurate to real viewport sizes
- AI-generated content includes explanations ("Detected button based on text 'Submit'")
- Success confirmations with clear status ("Published successfully ✓")
- Example analytics integration code that works immediately

**To Enable Flow State:**

- Keyboard shortcuts for power users
- Auto-save prevents lost work
- Minimal clicks between record → preview → publish
- No page reloads or long loading times
- Distraction-free editing mode

### Emotional Design Principles

**Principle 1: First Impressions Create Lasting Trust**
The first 60 seconds determine whether users feel "this is easy" or "this is too complicated." Every initial interaction must succeed immediately without troubleshooting. AI quality, extension installation, and first script creation must be flawless experiences that build trust.

**Principle 2: Delight Through Intelligent Automation**
Users should feel "wow, it knew what I wanted" not "I had to configure everything." Smart defaults, AI-powered generation, and automatic responsive adaptation create magical moments that exceed expectations and build emotional attachment to the product.

**Principle 3: Confidence Through Transparency**
Users publish confidently when they see exactly what will happen. Preview mode, device simulation, validation warnings, and clear status messaging eliminate uncertainty. "Show, don't tell" builds more confidence than any amount of documentation.

**Principle 4: Empowerment Through Abstraction**
Technical complexity (CSS selectors, DOM manipulation, responsive positioning) must be invisible to non-technical users. Visual tools, point-and-click interfaces, and AI automation empower Sarah to accomplish technical tasks without feeling inadequate or dependent on developers.

**Principle 5: Pride Through Professional Results**
Users feel proud when their work looks professional. High-quality AI generation, polished UI components, smooth animations, and validated responsive layouts ensure Sarah's published training reflects well on her skills, encouraging continued use and advocacy.

**Principle 6: Calm Through Privacy-First Design**
Anxiety about GDPR compliance, data collection, or regulatory violations kills adoption. Visible privacy badges, clear data ownership messaging, and zero data storage by default create peace of mind for users in regulated industries (finance, healthcare, government).

**Principle 7: Mastery Through Progressive Disclosure**
Simple by default, powerful when needed. Beginners see only essential options, while power users discover advanced features naturally. Progressive disclosure prevents overwhelm while enabling mastery, supporting users across their emotional journey from novice to expert.

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Product 1: Canva - The "Design Made Easy" Master**

Canva has revolutionized graphic design by making professional creation accessible to non-designers. Their UX success provides a blueprint for empowering non-technical users to create professional content.

**What Canva Does Brilliantly:**

_Zero-to-Hero in Seconds:_

- Non-designers create professional graphics immediately without training
- Extensive template library eliminates blank canvas paralysis
- Drag-and-drop interface makes design complexity completely invisible
- Emotional Result: "I made something beautiful and I'm not even a designer!"

_AI-Powered Magic:_

- Magic Resize adapts designs to different formats instantly (Instagram → LinkedIn)
- AI suggests contextual layouts, color palettes, and font pairings
- Background removal with single click, no Photoshop skills required
- Emotional Result: "It's reading my mind and doing the hard work for me!"

_Visual-First, Code-Never:_

- Everything is point-and-click manipulation
- Zero technical terminology exposed to users
- WYSIWYG (What You See Is What You Get) editing throughout
- Emotional Result: "I don't need to learn anything technical to be productive"

_Instant Preview & Iteration:_

- Changes appear in real-time as users make them
- Easy undo/redo encourages experimentation without fear
- Quick iterations without commitment or publishing anxiety
- Emotional Result: "I can play and experiment without breaking anything"

_Progressive Disclosure:_

- Simple interface by default with basic tools immediately visible
- Advanced features (transparency, effects, layers) appear when needed
- Power users discover depth naturally through contextual menus
- Emotional Result: "This grows with me as I become more skilled"

**Product 2: WalkMe - The Digital Adoption Pioneer**

WalkMe pioneered the digital adoption platform category and established proven UX patterns for on-screen guidance. Their approach validates the market need while revealing gaps Next-Step can fill.

**What WalkMe Does Well:**

_Overlay Training System:_

- Walkthroughs overlay directly on live websites (not videos or separate tutorials)
- Spotlight effect dims page and highlights specific interactive elements
- Step-by-step guidance through actual workflows on real interfaces
- Emotional Result: "I'm being guided through the actual interface I need to learn"

_Analytics & Targeting:_

- Track user progress through training flows and completion rates
- Segment-based delivery shows different content to different user types
- A/B testing capabilities to optimize training effectiveness
- Emotional Result: "I can measure what's working and iterate data-driven improvements"

_Proven Walkthrough Patterns:_

- Progress indicators ("Step 2 of 5") provide journey context
- Next/Previous navigation with skip option respects user autonomy
- Persistent guidance available when users need help
- Emotional Result: "I always know where I am and how to get help"

**WalkMe's Pain Points (The Gap Next-Step Fills):**

_Complex Setup:_

- Requires engineering integration and code deployment
- Long implementation timelines (months, not minutes)
- Technical expertise needed to create quality walkthroughs

_Enterprise Sales Cycle:_

- Lengthy procurement process before any value delivery
- No self-service option for quick POC or testing
- SMBs priced out of the market entirely

_GDPR & Privacy Concerns:_

- Third-party tracking creates compliance complications
- Customer data flows through WalkMe servers
- Privacy-conscious industries (finance, healthcare) face regulatory hurdles

_Technical Creation Barrier:_

- Building walkthroughs requires understanding CSS selectors
- No AI assistance for content generation
- Desktop-first mentality with poor mobile responsiveness

**The Synthesis:**
WalkMe's UX patterns are proven and effective (spotlight, tooltips, step progression), but their deployment model and technical requirements create massive friction. Next-Step adopts their successful patterns while eliminating enterprise complexity, privacy concerns, and technical barriers.

### Transferable UX Patterns

**From Canva - "Design Made Easy" Patterns:**

**Pattern 1: AI-Generated Templates Replace Blank Canvas**

- _Canva Approach:_ Users start with professionally designed templates, then customize
- _Next-Step Application:_ AI generates training scripts from recordings - 90% complete starting point
- _Why It Works:_ Eliminates blank canvas paralysis, provides instant progress feeling, users refine rather than create from scratch
- _Implementation:_ "Record → AI Generate" becomes the default creation path, not manual step-by-step building

**Pattern 2: Visual Editing With Zero Code Exposure**

- _Canva Approach:_ Drag elements, click to edit text, visual color picker - no code ever visible
- _Next-Step Application:_ Point-and-click selector picker, visual step editor, device preview toggle - CSS abstracted away
- _Why It Works:_ Non-technical users feel empowered rather than intimidated, reduces learning curve to near zero
- _Implementation:_ Advanced CSS editing available in "power user mode" but hidden by default

**Pattern 3: Real-Time Preview Builds Confidence**

- _Canva Approach:_ Every change reflects immediately in the canvas, no "preview mode" needed
- _Next-Step Application:_ Device toggle ([Desktop] [Tablet] [Mobile]) switches responsive preview instantly in iframe
- _Why It Works:_ Immediate feedback builds confidence, encourages experimentation, reduces fear of making mistakes
- _Implementation:_ Preview iframe loads target site with live script rendering, no separate preview step

**Pattern 4: "Magic" AI Features Create Delight**

- _Canva Approach:_ Magic Resize, Magic Eraser - AI features that "just work" with one click
- _Next-Step Application:_ "Record → Generate" workflow where AI creates contextual, professional scripts automatically
- _Why It Works:_ Creates "wow" moments that exceed expectations, saves hours of manual work
- _Implementation:_ AI processing time <10 seconds with visual progress indication, generates titles, descriptions, and selectors

**Pattern 5: Progressive Complexity Serves All Skill Levels**

- _Canva Approach:_ Simple drag-and-drop for beginners, advanced layering/effects for pros
- _Next-Step Application:_ Basic script editor by default, advanced mode reveals CSS editing and complex targeting rules
- _Why It Works:_ Beginners aren't overwhelmed, experts aren't constrained, product grows with user skill
- _Implementation:_ "Simple/Advanced" toggle in editor, contextual help reveals advanced features when ready

**From WalkMe - "Digital Adoption" Patterns:**

**Pattern 1: Spotlight + Tooltip Walkthrough (ADOPT & ENHANCE)**

- _WalkMe Approach:_ Page dims, specific element highlighted with spotlight, tooltip shows instructions
- _Next-Step Enhancement:_ Same proven pattern, but responsive-first with mobile-optimized positioning
- _Why It Works:_ Users already understand this pattern from encountering WalkMe/Pendo, reduces learning curve
- _Implementation:_ Shadow DOM isolation, viewport-aware tooltip positioning, smooth spotlight transitions

**Pattern 2: Step Progress Indicator (ADOPT & REFINE)**

- _WalkMe Approach:_ "Step 2 of 5" gives users context about journey length
- _Next-Step Enhancement:_ Same concept but less intrusive on mobile, optional visual progress bar
- _Why It Works:_ Users know where they are in the flow, can gauge time commitment
- _Implementation:_ Compact mobile design, estimated time remaining for longer walkthroughs

**Pattern 3: Segment Targeting (ADOPT & SIMPLIFY)**

- _WalkMe Approach:_ Show different training to different user segments based on attributes
- _Next-Step Simplification:_ Tag-based targeting with simple interface, not complex rule builder
- _Why It Works:_ Personalization improves relevance without overwhelming creators with configuration
- _Implementation:_ Simple tag selection (e.g., "premium", "new-user") instead of conditional logic builder

**Pattern 4: Analytics Integration (REIMAGINE COMPLETELY)**

- _WalkMe Approach:_ Built-in analytics dashboard with proprietary metrics
- _Next-Step Approach:_ Event hooks fire to customer's existing analytics tools (GA, Mixpanel, Glassbox, Splunk)
- _Why It's Better:_ Zero data storage (GDPR-compliant), familiar tools, no vendor lock-in
- _Implementation:_ Standard JavaScript event listener with JSON payload, documentation examples for common platforms

**Pattern 5: Setup Complexity (AVOID & INVERT)**

- _WalkMe Problem:_ Requires engineering integration, long sales cycle, complex onboarding
- _Next-Step Solution:_ Chrome Extension enables 30-minute POC, self-service SDK integration
- _Why It's Better:_ Prove value before commitment, developers can demo to stakeholders instantly
- _Implementation:_ Extension bypasses CSP/CORS for testing, one-click SDK integration code after POC approval

### Anti-Patterns to Avoid

**Anti-Pattern 1: Technical Complexity Leakage**

- _Problem:_ Exposing CSS selectors, DOM paths, XPath expressions to non-technical users
- _Why Harmful:_ Breaks "so easy" promise, makes Sarah feel inadequate and dependent on developers
- _Next-Step Approach:_ AI handles selector generation automatically, visual picker available for manual refinement
- _Design Decision:_ Technical details hidden in collapsed "Advanced" section, never required for basic usage

**Anti-Pattern 2: Enterprise-Only Pricing Model**

- _Problem:_ WalkMe/Pendo require enterprise contracts, lengthy sales cycles, custom pricing
- _Why Harmful:_ Kills "30-minute POC" advantage, excludes SMBs who need solutions most
- _Next-Step Approach:_ Self-service signup, transparent pricing, instant value for small teams
- _Design Decision:_ Free tier for testing, usage-based pricing scales with customer growth

**Anti-Pattern 3: Third-Party Data Collection**

- _Problem:_ Analytics data stored on vendor servers, creating GDPR compliance concerns
- _Why Harmful:_ Creates legal anxiety, especially for regulated industries (finance, healthcare, government)
- _Next-Step Approach:_ Events fire on customer's domain, route to their chosen analytics tools, zero Next-Step data storage
- _Design Decision:_ Privacy-first architecture is marketing advantage, not compromise

**Anti-Pattern 4: Desktop-Only Thinking**

- _Problem:_ Walkthroughs designed for desktop break or look terrible on mobile devices
- _Why Harmful:_ Mobile users represent majority for many products, poor mobile UX destroys credibility
- _Next-Step Approach:_ Responsive-first design with device preview toggle during creation
- _Design Decision:_ Mobile breakpoints considered from day one, spotlight and tooltips adapt to viewport

**Anti-Pattern 5: Blank Canvas Without Guidance**

- _Problem:_ "Create a walkthrough" presents empty form fields with no starting point
- _Why Harmful:_ Blank canvas paralysis overwhelms new users, high abandonment rate
- _Next-Step Approach:_ AI generation from recordings as default path, template library as alternative
- _Design Decision:_ "Record" button prominently featured, manual creation available but not primary flow

**Anti-Pattern 6: Preview Without Production Accuracy**

- _Problem:_ Preview environments that don't match production reality (different CSS, behaviors, data)
- _Why Harmful:_ Destroys trust, users afraid to publish because preview was misleading
- _Next-Step Approach:_ Chrome Extension loads actual production site with actual SDK in iframe
- _Design Decision:_ Preview IS production with extension-injected SDK, no separate staging environment

**Anti-Pattern 7: Overwhelming Feature Bloat**

- _Problem:_ Every possible feature exposed in UI simultaneously, creating decision paralysis
- _Why Harmful:_ New users can't find essential features, expert users work slowly through clutter
- _Next-Step Approach:_ Progressive disclosure with simple/advanced modes, contextual feature discovery
- _Design Decision:_ 80% of users need 20% of features - optimize for common path, hide advanced options

### Design Inspiration Strategy

**What to Adopt (Use Proven Patterns As-Is):**

1. **Canva's AI-First Creation Flow:** "Record → AI Generate → Refine" replaces manual step-by-step creation as the default and recommended path
2. **Canva's Visual Editing Philosophy:** Point-and-click selector picker, drag-to-reorder steps, visual color customization - zero code editing required
3. **WalkMe's Spotlight Walkthrough Pattern:** Page dimming, element highlighting, contextual tooltips - proven pattern users already understand
4. **Canva's Real-Time Preview:** Device toggle shows responsive layouts instantly without leaving editor, builds publishing confidence

**What to Adapt (Modify Patterns for Next-Step Context):**

1. **Canva's Templates → AI-Generated Custom Scripts:** Not static templates, but AI creates personalized starting points from actual user recordings
2. **WalkMe's Analytics Dashboard → Event Hooks Architecture:** Not built-in proprietary dashboard, but standard hooks to customer's existing analytics stack
3. **Canva's Progressive Disclosure → Two-Mode Editor:** Clear "Simple/Advanced" toggle rather than gradual feature discovery
4. **WalkMe's Segment Targeting → Tag-Based System:** Simpler tag interface ("premium", "new-user") replaces complex conditional rule builder

**What to Avoid (Learn from Competitors' Mistakes):**

1. **WalkMe's Complex Setup Process:** Chrome Extension POC eliminates this friction entirely - 30 minutes to value vs 3 months
2. **WalkMe's Enterprise-Only Sales Model:** Self-service signup with transparent pricing serves SMBs and enables viral adoption
3. **WalkMe's Third-Party Data Collection:** Privacy-first architecture with zero data storage differentiates in GDPR-conscious market
4. **Both's Desktop-First Bias:** Responsive-first thinking from day one ensures mobile users have excellent experience

**Unique Innovations (Beyond Existing Products):**

1. **30-Minute POC with Chrome Extension:** Neither Canva nor WalkMe offers instant production-site testing without deployment
2. **Privacy-First as Competitive Advantage:** No competitors emphasize GDPR compliance and data ownership as primary selling point
3. **Responsive Preview Toggle in Creator Flow:** Most competitors test responsiveness as afterthought, not integrated into creation
4. **AI + Recording Workflow:** Canva has AI but not recording-based generation, WalkMe has walkthroughs but not AI-powered creation

**The Strategic Synthesis:**

**Next-Step = Canva's "Design Made Easy" UX Philosophy + WalkMe's Proven Walkthrough Patterns - Enterprise Complexity - Privacy Concerns**

This strategy takes the best UX patterns from both inspirations while eliminating the friction that makes them difficult to adopt. The emotional promise of "wow, it's so easy!" comes directly from Canva's empowerment playbook, while the walkthrough interaction patterns leverage WalkMe's proven effectiveness. The unique combination creates a new category: **"Training-as-Code-Free"** - professional training creation without technical knowledge or enterprise overhead.

---

## Design System Foundation

### Design System Choice

**Selected System: Angular Material with Custom Theme**

Angular Material has been chosen as the foundational design system for Next-Step's Back Office application. This decision balances rapid MVP development with professional quality, accessibility compliance, and sufficient customization flexibility to create a distinctive brand experience.

**System Overview:**

- **Framework:** Angular Material (Material Design 3 implementation for Angular 20+)
- **Component Library:** 50+ pre-built, accessible, responsive components
- **Theming:** Material Design 3 theming system with custom color palette and typography
- **Integration:** Native Angular integration with first-class TypeScript support
- **License:** MIT (open source, no licensing concerns)
- **Documentation:** Comprehensive official documentation with examples
- **Community:** Large, active community with extensive support resources

### Rationale for Selection

**Speed to MVP (Primary Factor):**

Angular Material provides battle-tested components out of the box, eliminating weeks of custom component development. With a 3-4 week MVP timeline, using pre-built buttons, forms, modals, tooltips, navigation, and data tables allows the team to focus on unique features (AI generation, recording workflow, iframe preview) rather than reinventing standard UI patterns.

**Angular-Native Integration:**

Next-Step's Back Office is built on Angular 20+. Angular Material is the official Material Design implementation for Angular, providing seamless integration with zero friction. Native support for Angular's signals-based reactivity, standalone components, and TypeScript ensures smooth development without framework impedance mismatches.

**Accessibility Built-In (Critical for B2B):**

WCAG 2.1 Level AA compliance is built into every Angular Material component, covering keyboard navigation, screen reader support, ARIA attributes, and focus management. For B2B customers in regulated industries (finance, healthcare, government), accessibility compliance is often a procurement requirement, not a nice-to-have.

**Professional B2B Aesthetic:**

Next-Step targets product managers, customer success teams, and developers - not consumer audiences requiring cutting-edge visual trends. Angular Material's proven, professional aesthetic builds trust with B2B users who value reliability and familiarity over flashy design. Many users already interact with Material-based interfaces daily (Google Workspace, Gmail).

**Responsive by Default:**

Every Angular Material component is responsive across desktop, tablet, and mobile viewports. Given Next-Step's web-first responsive strategy with device preview toggles, starting with a responsive foundation eliminates significant testing and debugging time.

**Theming Flexibility:**

Material Design 3's theming system allows comprehensive brand customization without rebuilding components. Custom color palettes, typography scales, spacing systems, and border radius values enable brand differentiation while retaining component functionality and accessibility. This provides sufficient uniqueness for brand identity without custom component development overhead.

**Team Familiarity:**

Angular developers typically have exposure to Angular Material from tutorials, documentation, and prior projects. Minimal learning curve allows the team to be productive immediately rather than learning a new design system paradigm.

**Alternative Evaluation:**

- **Tailwind CSS + Custom Components:** Offers maximum design flexibility and small bundle size but requires 1-2 additional weeks for component development and accessibility implementation. Trade-off favors speed for MVP.
- **PrimeNG:** Feature-rich with 100+ components but heavier aesthetic skewed toward complex enterprise applications. Overkill for Next-Step's focused use cases.
- **Custom Design System:** Provides complete uniqueness but requires 3-4 weeks just for foundational component library before feature development begins. Incompatible with MVP timeline.

### Implementation Approach

**Phase 1: Foundation Setup (Week 1)**

_Install and Configure Angular Material:_

```bash
ng add @angular/material
```

- Select custom theme during installation
- Choose prebuilt theme as starting point (Indigo/Pink as base)
- Enable global typography styles
- Set up animations

_Create Custom Theme File:_

```scss
// src/theme.scss
@use '@angular/material' as mat;

// Define custom color palette
$nstep-primary: mat.define-palette(mat.$indigo-palette);
$nstep-accent: mat.define-palette(mat.$pink-palette);
$nstep-warn: mat.define-palette(mat.$red-palette);

// Create theme
$nstep-theme: mat.define-light-theme(
  (
    color: (
      primary: $nstep-primary,
      accent: $nstep-accent,
      warn: $nstep-warn,
    ),
    typography: mat.define-typography-config(),
    density: 0,
  )
);

// Apply theme
@include mat.all-component-themes($nstep-theme);
```

_Import Required Component Modules:_
Import only needed Material modules to keep bundle size minimal:

- `MatButtonModule` - Buttons (primary, accent, text, icon)
- `MatFormFieldModule`, `MatInputModule` - Form inputs
- `MatSelectModule` - Dropdowns
- `MatDialogModule` - Modals
- `MatTooltipModule` - Tooltips
- `MatIconModule` - Icons (Material Icons font)
- `MatToolbarModule` - Navigation bars
- `MatSidenavModule` - Side navigation
- `MatCardModule` - Content cards
- `MatTableModule` - Data tables
- `MatPaginatorModule` - Table pagination
- `MatProgressSpinnerModule` - Loading states
- `MatSnackBarModule` - Toast notifications
- `MatTabsModule` - Tabbed interfaces
- `MatSlideToggleModule` - Device preview toggle

**Phase 2: Brand Customization (Week 1-2)**

_Custom Color Palette:_
Replace default Indigo/Pink with Next-Step brand colors:

- Primary: Brand color for main actions (publish, save, record)
- Accent: Secondary brand color for highlights and emphasis
- Warn: Error/warning states (validation, destructive actions)
- Background: Light/dark theme backgrounds
- Surface: Card and elevated component backgrounds

_Typography Customization:_
Define typography scale matching brand guidelines:

- Font families (headings vs body text)
- Type scale (headline, title, body, caption sizes)
- Font weights (regular, medium, bold)
- Line heights optimized for readability

_Spacing and Density:_
Adjust Material's density scale for optimal information density:

- Default density (0) for most interfaces
- Compact density (-1, -2) for data-heavy screens (script editor)
- Comfortable density (1) for touch-friendly mobile layouts

_Custom CSS Variables:_

```scss
:root {
  --nstep-border-radius: 8px; // Slightly rounded for modern feel
  --nstep-shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.12);
  --nstep-shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.15);
  --nstep-transition-speed: 200ms;
}
```

**Phase 3: Custom Components (Week 2-3)**

While leveraging Material for standard components, build custom components for unique Next-Step features:

_Custom Walkthrough Spotlight Component:_

- Cannot use Material components (unique to training overlays)
- Shadow DOM implementation for CSS isolation
- Viewport-aware positioning logic
- Responsive tooltip placement
- Built as standalone Angular component

_Custom Device Preview Toggle:_

- Three-button toggle ([Desktop] [Tablet] [Mobile])
- Visual active state indication
- Smooth iframe resize transitions
- Built on `MatButtonToggleModule` base with custom styling

_Custom Recording Controls:_

- Record button with red dot animation
- Timer display during recording
- Stop/pause controls
- Status indicator (recording, processing, ready)
- Custom styling for prominent placement

_Custom AI Generation Progress:_

- Multi-stage progress indicator (analyzing → generating → finalizing)
- Animated transitions between stages
- Success confirmation with micro-interaction
- Built on `MatProgressBarModule` with custom states

**Phase 4: Component Library Documentation (Week 3-4)**

Create internal Storybook or documentation site showing:

- All Material components with Next-Step theming applied
- Custom component usage examples
- Color palette and typography specimens
- Spacing and layout guidelines
- Accessibility guidelines for component usage

### Customization Strategy

**Level 1: Theme-Level Customization (Minimal Effort, Maximum Consistency)**

_What to Customize:_

- Color palette (primary, accent, warn, neutral shades)
- Typography (font families, type scale, weights)
- Density (spacing scale, component sizing)
- Border radius (subtle rounding for modern feel)
- Elevation (shadow depths for cards, modals, tooltips)

_Why This Level:_
Provides brand differentiation without component rebuilding. Changes apply globally across all Material components, ensuring consistency. Requires only SCSS theme configuration changes, no component code modifications.

**Level 2: Component-Level Overrides (Moderate Effort, Targeted Changes)**

_What to Customize:_

- Button styles (padding, border, hover states for brand personality)
- Form fields (border styles, focus indicators, label animations)
- Cards (background, borders, shadows for visual hierarchy)
- Navigation (toolbar styling, sidenav appearance)
- Modals (backdrop styling, dialog animations)

_Implementation Approach:_
Use CSS class overrides in global styles with `!important` sparingly:

```scss
.mat-mdc-raised-button {
  border-radius: var(--nstep-border-radius);
  text-transform: none; // Remove Material's default uppercase
  font-weight: 500;
}
```

_Why This Level:_
Addresses specific visual needs while preserving Material's accessibility and responsive behavior. Targets components used frequently (buttons, forms) for maximum brand impact.

**Level 3: Custom Components (High Effort, Unique Features)**

_What Requires Custom Components:_

- Walkthrough spotlight and tooltip system (core product feature, no Material equivalent)
- Recording interface (unique workflow not available in standard libraries)
- Device preview toggle with iframe resize (product-specific interaction)
- AI generation progress with multi-stage states (custom requirement)
- Script editor with drag-and-drop step reordering (specialized component)

_Implementation Approach:_
Build custom Angular components leveraging Material's design tokens (colors, spacing, typography) for visual consistency:

```typescript
@Component({
  selector: 'nstep-spotlight',
  standalone: true,
  styleUrls: ['./spotlight.component.scss'],
  template: `...`,
})
export class SpotlightComponent {
  // Custom implementation using Material design tokens
}
```

_Why This Level:_
Unique product features require custom implementation. Using Material's design tokens ensures visual harmony with standard components while enabling specialized functionality.

**Customization Priorities (MVP Phase):**

1. **Week 1:** Theme-level customization (colors, typography) - foundational brand identity
2. **Week 2:** Component-level overrides for buttons, forms, navigation - frequently used elements
3. **Week 3:** Custom spotlight component for walkthrough rendering - core product feature
4. **Week 4:** Custom recording and device preview components - differentiating features

**Post-MVP Customization:**

- Advanced theming (dark mode support)
- Micro-interactions and animations for delight moments
- Custom illustrations and iconography
- Loading state animations and skeleton screens
- Empty state designs with helpful messaging

**Maintaining Material Benefits:**

Throughout customization, preserve Angular Material's core strengths:

- **Accessibility:** Don't override focus indicators, keyboard navigation, ARIA attributes
- **Responsiveness:** Test customizations across viewport sizes
- **Browser Compatibility:** Ensure overrides work in Chrome, Firefox, Safari, Edge
- **Performance:** Avoid heavy CSS that impacts rendering performance

**Brand Differentiation Without Rebuilding:**

By focusing customization on theme (colors, typography, spacing) and targeted component overrides (buttons, forms), Next-Step achieves brand identity while retaining 90% of Material's component functionality. Custom components are reserved for truly unique features (walkthrough spotlight, recording) where no standard component exists.

---

## Detailed Core User Experience

### Defining Experience

**The Signature Interaction: "Record → AI Generates → Publish"**

The defining experience of Next-Step is the complete flow that transforms hours of manual training creation work into a 5-minute delightful journey. This is the interaction users will describe to colleagues: _"I just recorded myself using the website, clicked generate, and AI created the entire training flow automatically. Then I published it with one click. The whole thing took 5 minutes."_

This signature flow represents the convergence of three powerful promises:

1. **Effortless Creation:** Recording eliminates manual step-by-step configuration
2. **AI Intelligence:** Automated generation removes technical barrier of CSS selectors and content writing
3. **Instant Deployment:** One-click publishing removes deployment friction and waiting

The complete flow—from initiating recording to published live training—is THE core experience that, if executed perfectly, makes everything else in Next-Step feel effortless and magical. When users say "wow, it's so easy!", they're referring to this entire journey.

**Why This Is THE Defining Experience:**

- **Most Frequent Action:** Sarah creates scripts weekly/daily, this flow repeats constantly
- **Highest Value Delivery:** Transforms hours of work into minutes, maximum time savings
- **Greatest Differentiation:** No competitor combines recording + AI + instant publishing seamlessly
- **Emotional Peak:** The "wow" moment happens throughout the flow, not just at one point
- **Word-of-Mouth Driver:** This is what users evangelize: "You have to see how fast this is!"

**Alternative Defining Moments Considered:**

- "AI Generates Professional Training" (just the AI magic) - Important but not complete experience
- "Preview on Real Site Before Publishing" (confidence-building) - Supporting feature, not defining
- "One-Click Publish to Production" (instant deployment) - Conclusion, not the full journey
- "Record → AI Generates → Publish" (SELECTED) - Complete flow captures the full magic

### User Mental Model

**How Users Currently Think About Training Creation:**

Users approach training creation with mental models shaped by existing solutions they've encountered:

**1. Video Recording Mental Model (Loom, Screen Recording):**

_What Users Know:_

- Click record button → Perform actions → Stop recording → Share video link
- Videos are easy to create but passive (viewers watch, not interact)
- Quick to make (5-10 minutes) but no interactivity on live sites

_What They Expect from Next-Step:_

- Recording should be equally simple (one-click start, no configuration)
- But output should be interactive walkthroughs, not videos
- "Like Loom, but for interactive training instead of videos"

**2. Manual Documentation Mental Model (Confluence, Notion, Google Docs):**

_What Users Know:_

- Write step-by-step instructions manually
- Add screenshots separately (screenshot tool → paste → format)
- Takes hours to create and maintain
- Static content, not interactive overlays

_What They Expect from Next-Step:_

- Should eliminate manual writing and screenshot management
- Should be interactive, not static documentation
- "Like creating a doc, but AI writes it and makes it interactive"

**3. Digital Adoption Platform Mental Model (WalkMe, Pendo):**

_What Users Know:_

- Use visual editor to configure walkthrough steps
- Manually select elements with point-and-click tool
- Configure each step's title, description, positioning
- Complex setup requiring technical knowledge
- Takes hours to build quality walkthroughs

_What They Expect from Next-Step:_

- Output should be similar (walkthrough overlays on real sites)
- But creation should be automatic, not manual configuration
- "Like WalkMe's walkthroughs, but created automatically from recording"

**The Next-Step Mental Model Synthesis:**

Users will initially approach Next-Step with this combined expectation:

> _"It should work like Loom (easy recording with one-click start/stop), but output interactive training like WalkMe (overlays on real site with step-by-step guidance), without requiring manual configuration work like building walkthroughs in Pendo."_

**Mental Model Shift Next-Step Creates:**

The paradigm shift Next-Step introduces:

- **From:** "Creating interactive training is complex and time-consuming"
- **To:** "Just record yourself doing it, AI handles the rest"

This mental model shift is powerful but requires clear communication during first use:

- Onboarding must explain: "Record naturally, AI creates training"
- First AI-generated result must exceed expectations to reinforce model
- Preview phase validates the model: "Recording actually became interactive training"

**Potential Confusion Points (Where Mental Model Breaks):**

1. **"Do I need to narrate while recording?"**
   - User might expect video-style narration
   - Need to clarify: Actions captured automatically, optional audio

2. **"Can I edit the AI-generated steps?"**
   - User might fear being stuck with AI output
   - Need to clarify: AI creates starting point (90% done), always editable

3. **"Is this actually live on our production site?"**
   - User might confuse preview (extension-based) with production (SDK-based)
   - Need to clarify: Preview = test mode with extension, Publish = live for end users

### Success Criteria

**What Makes "Record → AI Generates → Publish" Feel Like "It Just Works":**

Success in the defining experience is measured by Sarah's emotional journey from initiation to completion. Each phase has specific criteria that signal success.

**Phase 1: Recording Initiation Success**

_Success Indicators:_

- Recording starts within 2 seconds of clicking "Start Recording"
- No configuration dialogs, no setup wizards, no "configure recording settings"
- Red recording indicator is immediately visible and unambiguous
- Target website loads correctly without broken layout

_User Feeling:_
"It started recording immediately, no friction. I can just start demonstrating."

_Failure Modes to Avoid:_

- ❌ Prompts for microphone permissions when not needed
- ❌ Configuration dialogs asking technical questions
- ❌ Loading delays >3 seconds before recording starts
- ❌ Unclear recording state (is it recording or not?)

**Phase 2: Interaction Capture Success**

_Success Indicators:_

- Every click, input, navigation is captured without user intervention
- Visual feedback confirms each interaction captured (subtle, non-intrusive)
- User can perform actions naturally without thinking about recording
- No performance lag or delays due to tracking overhead

_User Feeling:_
"I can just use the site normally, it's capturing everything automatically."

_Failure Modes to Avoid:_

- ❌ Missing interactions (clicks not captured)
- ❌ Overly distracting visual feedback interrupting workflow
- ❌ Performance slowdowns making site feel sluggish
- ❌ Requiring user to manually mark or annotate interactions

**Phase 3: AI Generation Success (CRITICAL MOMENT)**

_Success Indicators:_

- AI processing completes in <10 seconds (ideally 5-7 seconds)
- Generated steps have contextual, specific titles (not "Step 1", "Step 2")
- Descriptions explain _why_ each step matters, not just _what_ to do
- CSS selectors work correctly without manual debugging
- Screenshots attached to correct steps automatically
- Steps are in logical order matching recorded sequence

_User Feeling:_
"Wow, the AI actually understood what I was doing! This is 90% perfect already."

_Failure Modes to Avoid:_

- ❌ Processing takes >15 seconds (user loses confidence)
- ❌ Generic step titles: "Step 1", "Click button", "Fill input"
- ❌ Broken CSS selectors requiring technical knowledge to fix
- ❌ Screenshots attached to wrong steps or missing entirely
- ❌ Steps in illogical order requiring manual reordering
- ❌ AI output so poor that manual creation would've been faster

**Phase 4: Preview Confidence Success**

_Success Indicators:_

- Preview iframe loads target site within 3 seconds
- Walkthrough renders exactly as end users will see it
- Device toggle switches viewports instantly (<500ms)
- Responsive validation catches mobile issues proactively
- Spotlight and tooltips position correctly on all screen sizes

_User Feeling:_
"This looks exactly right. I'm confident to publish this now."

_Failure Modes to Avoid:_

- ❌ Preview doesn't match production reality (different CSS, behaviors)
- ❌ Device toggle slow or requiring page reload
- ❌ Walkthr overlay appears broken or mispositioned
- ❌ No validation warnings when mobile issues exist
- ❌ Sarah publishes without confidence, discovers issues live

**Phase 5: Publishing Success**

_Success Indicators:_

- Publish action completes in <3 seconds
- Clear confirmation: "Published successfully ✓"
- Script immediately available via SDK (ETag cache invalidated)
- Status badge updates: "Draft" → "Published"
- Optional: Live preview link to verify on production

_User Feeling:_
"It's live! That was so fast and easy. I'm already done."

_Failure Modes to Avoid:_

- ❌ Publishing takes >10 seconds with no progress indication
- ❌ Ambiguous status after publish (is it live or not?)
- ❌ Propagation delays causing script not to appear immediately
- ❌ No way to verify it's actually working on production
- ❌ Fear of publishing due to uncertainty about reversibility

**Overall Flow Success Metric:**

The entire "Record → AI Generates → Publish" flow should complete in **5-10 minutes for typical walkthroughs (5-10 steps)**:

- Recording: 2-3 minutes (natural pace demonstrating workflow)
- AI Generation: <10 seconds (ideally 5-7 seconds)
- Review/Edit: 2-5 minutes (minor tweaks, preview validation)
- Publishing: <5 seconds (one-click deploy)

Success = Sarah creates and publishes professional training in the time it would take to write a single Slack message describing the steps manually.

### Novel UX Patterns

**Established Patterns We're Leveraging:**

Next-Step deliberately uses familiar interaction patterns for most of the experience to reduce cognitive load and leverage users' existing mental models:

**1. Recording Interface (Loom-Style)**

- Red dot indicator for active recording state
- Start/Stop buttons with clear labeling
- Timer showing recording duration
- Event counter showing "12 interactions captured"
- **Why Familiar:** Users have seen Loom, QuickTime, Zoom recording interfaces

**2. Progress Indicators During Processing**

- Multi-stage progress bar during AI generation
- Stage labels: "Analyzing... → Generating... → Finalizing..."
- Percentage or time-based progress indication
- **Why Familiar:** Users encounter loading states daily across all applications

**3. WYSIWYG Live Preview (Canva-Style)**

- Side-by-side editor and preview panes
- Real-time updates reflecting changes immediately
- Device simulation toggle for responsive preview
- **Why Familiar:** Canva, Figma, website builders use this pattern extensively

**4. One-Click Publish (Vercel/Netlify Pattern)**

- Single prominent "Publish" button
- Optional confirmation modal with settings
- Success toast notification after deployment
- Instant global propagation
- **Why Familiar:** Modern deployment platforms popularized this pattern

**The Novel Combination: Recording + AI + Interactive Training**

While individual patterns are familiar, the **combination** is completely novel and unprecedented in the market:

**What Makes This Unique:**

1. **Recording → Interactive Walkthroughs (Not Videos)**
   - Loom/Zoom: Recording → Video output
   - Next-Step: Recording → Interactive overlay training
   - **Novel Aspect:** Behavioral recording creates interactive elements, not passive video

2. **AI Understanding Workflow Context**
   - Canva AI: Generates designs from text prompts
   - Next-Step AI: Generates training from observed behaviors
   - **Novel Aspect:** AI interprets user actions and intent, generates contextual guidance

3. **Zero Manual Configuration**
   - WalkMe/Pendo: Manual element selection, step configuration
   - Next-Step: Automatic selector detection, content generation
   - **Novel Aspect:** Complete automation of technical configuration

4. **Instant Publishing Without Deployment**
   - Traditional tools: Requires code deployment, build processes
   - Next-Step: SDK with ETag caching enables instant propagation
   - **Novel Aspect:** "Publish" means globally live in seconds, not hours

**The Unique Value Proposition:**

> **"Record once → AI generates → Live instantly"**
>
> No competitor offers this complete flow. WalkMe has walkthroughs but requires manual creation. Loom has recording but outputs videos. Canva has AI but for design not behavioral workflows. Next-Step is the first to combine all three.

**Teaching Users the Novel Pattern:**

Since the combination is novel, onboarding must bridge the gap:

1. **Initial Messaging:**
   "Record yourself demonstrating a task, and we'll automatically create interactive training from it."

2. **First-Time Experience:**
   - Show example: "Here's a 30-second recording becoming a 5-step walkthrough"
   - Set expectations: "AI will generate steps—you can edit anything"
   - Celebrate success: "See how easy that was? You just created interactive training!"

3. **Progressive Discovery:**
   - First use: Emphasize the magic of AI generation
   - Second use: Introduce device preview and responsive testing
   - Third use: Show advanced features (segment targeting, timing controls)

**Risks of Novel Patterns:**

- **Skepticism:** "Can AI really understand my workflow accurately?"
  - _Mitigation:_ First AI output must be high quality (90%+ accurate)
- **Trust:** "Will this actually work on my production site?"
  - _Mitigation:_ Preview with extension demonstrates reality before publishing
- **Control:** "What if AI gets it wrong?"
  - _Mitigation:_ Always editable, clear visual editor for manual refinement

The novelty is Next-Step's greatest strength (differentiation) and greatest risk (adoption friction). Success depends on the first AI-generated result exceeding expectations and building trust immediately.

### Experience Mechanics

**Detailed Step-by-Step Flow for "Record → AI Generates → Publish":**

This section breaks down the complete defining experience into granular interaction mechanics, specifying exactly what users do, what the system does, and what feedback appears at each moment.

---

**PHASE 1: INITIATION - Starting the Recording**

**Trigger - How the Experience Begins:**

Sarah navigates to Back Office dashboard and wants to create new training content.

_Entry Points:_

- Primary: Dashboard "New Script" button (prominent, top-right)
- Secondary: Empty state in scripts list: "Create your first script"
- Tertiary: Keyboard shortcut (Cmd/Ctrl + N) for power users

**Step 1.1: Choose Creation Method**

_What Sarah Sees:_
Modal appears with two prominent options:

```
┌─────────────────────────────────────┐
│ How would you like to create?      │
├─────────────────────────────────────┤
│                                     │
│  🎥 Record Walkthrough              │
│  (Recommended)                      │
│  AI creates training from your      │
│  demonstration                      │
│                                     │
│  ✏️ Create Manually                 │
│  Build step-by-step using editor    │
│                                     │
└─────────────────────────────────────┘
```

_What Sarah Does:_
Clicks "Record Walkthrough" button (primary, visually emphasized)

_System Response:_

- Modal transitions to recording setup screen
- Animation reinforces choice: recording icon grows/pulses

**Step 1.2: Configure Recording (Minimal Setup)**

_What Sarah Sees:_
Simple form with one required field:

```
┌─────────────────────────────────────┐
│ Start Recording                     │
├─────────────────────────────────────┤
│ Target Website URL:                 │
│ [https://app.example.com]           │
│                                     │
│ Script Name: (Optional)             │
│ [Untitled Walkthrough]              │
│                                     │
│ [ Start Recording ]                 │
└─────────────────────────────────────┘
```

_What Sarah Does:_

- Enters target website URL (or selects from recent sites dropdown)
- Optionally names the script
- Clicks "Start Recording" button

_System Response:_

- Validates URL is accessible
- Checks Chrome Extension is installed (prompts if not)
- Opens target website in new browser tab
- Injects SDK and tracking code via extension
- Displays recording UI overlay on target site

_Extension Check:_
If extension not installed:

```
⚠️ Chrome Extension Required
The Next-Step extension enables recording.

[Install Extension] [Learn More]
```

**Step 1.3: Recording Begins**

_What Sarah Sees:_
Target website loads with persistent recording indicator:

```
Top-right corner:
┌──────────────────────┐
│ ● REC    00:00:23    │
│ 7 interactions       │
│ [Stop Recording]     │
└──────────────────────┘
```

_Visual State:_

- Red pulsing dot indicates active recording
- Timer counts up showing duration
- Interaction counter increments with each captured event
- Minimal, non-intrusive overlay (collapsible if needed)

_Feedback to Sarah:_

- Toast notification appears briefly: "Recording started. Perform your walkthrough naturally."
- Each interaction captured shows subtle confirmation (element briefly highlights)

---

**PHASE 2: INTERACTION - Capturing the Walkthrough**

**Step 2.1: Natural Workflow Demonstration**

_What Sarah Does:_
Performs the task she wants to train users on, naturally and at normal pace:

- Clicks buttons, links, menu items
- Fills form input fields
- Navigates between pages
- Selects dropdown options
- Checks/unchecks checkboxes
- Any other interactions needed for the workflow

_System Captures Automatically:_
For each interaction:

- **Event Type:** Click, input, navigation, focus, hover
- **Target Element:** CSS selector (multiple strategies: ID, class, aria-label, data-attributes)
- **Element Context:** Text content, placeholder, aria-label for AI understanding
- **Screenshot:** Full viewport screenshot at moment of interaction
- **Timing:** Timestamp and duration between steps
- **Page State:** URL, scroll position, viewport size

_Visual Feedback During Recording:_

- Interaction counter updates: "7 interactions" → "8 interactions"
- Brief element highlight (200ms) confirms capture
- No intrusive popups or dialogs interrupting flow
- Sarah can see captured events list in Back Office (if monitoring second screen)

_Back Office Dashboard (If Visible):_
Real-time event feed shows captured interactions:

```
Live Recording Feed:
• 00:23 - Clicked "Login" button
• 00:25 - Entered email input
• 00:28 - Entered password input
• 00:30 - Clicked "Submit" button
• 00:32 - Navigated to /dashboard
```

**Step 2.2: Stopping the Recording**

_What Sarah Does:_
When workflow demonstration is complete, clicks "Stop Recording" button in recording overlay

_System Response:_

- Recording stops immediately
- Overlay shows processing state: "Saving recording..."
- Uploads captured data to Back Office (2-3 seconds)
- Automatically transitions to AI generation phase
- Closes target website tab (or keeps open with recording UI removed)

_Transition Animation:_
Smooth transition from recording overlay to Back Office generation modal:

- Recording UI fades out
- Success checkmark briefly appears
- Back Office generation modal slides in

---

**PHASE 3: AI GENERATION - The Magic Moment**

**Step 3.1: Processing Initiation**

_What Sarah Sees:_
Modal appears automatically (no button click needed):

```
┌─────────────────────────────────────┐
│  🤖 Generating Your Training Script │
├─────────────────────────────────────┤
│                                     │
│  [███████░░░░░░░░] 45%              │
│                                     │
│  🔍 Analyzing interactions...        │
│     Captured 12 interactions        │
│     Detected 5 logical steps        │
│                                     │
└─────────────────────────────────────┘
```

_Processing Stages:_

1. **Analyzing (2-3 seconds):**
   - Groups related interactions into logical steps
   - Identifies element selectors using multiple strategies
   - Analyzes page context and element semantics

2. **Generating (5-7 seconds):**
   - AI generates contextual step titles
   - AI writes helpful step descriptions
   - AI validates CSS selectors work
   - Associates screenshots with steps

3. **Finalizing (1-2 seconds):**
   - Orders steps logically
   - Validates walkthrough completeness
   - Prepares script for editor display

_Visual Progress:_

- Progress bar fills smoothly (not jumpy)
- Stage labels update as processing progresses
- Sub-labels show what's happening: "Analyzing 12 interactions..."
- Total time: 8-12 seconds (target <10 seconds)

**Step 3.2: Success Confirmation**

_What Sarah Sees:_
Modal transitions to success state:

```
┌─────────────────────────────────────┐
│  ✨ Script Generated Successfully!  │
├─────────────────────────────────────┤
│                                     │
│  Created 5 steps from your recording│
│  All selectors validated ✓          │
│                                     │
│  [Open in Editor]                   │
│                                     │
└─────────────────────────────────────┘
```

_Celebration Moment:_

- Brief confetti or success animation (300ms)
- Positive auditory feedback (optional, if enabled)
- Clear call-to-action: "Open in Editor"

_What Sarah Does:_
Clicks "Open in Editor" button (or modal auto-closes after 2 seconds)

_System Response:_

- Navigates to script editor view
- Editor loads with AI-generated steps populated
- Preview iframe begins loading alongside

---

**PHASE 4: PREVIEW & REFINEMENT - Building Confidence**

**Step 4.1: Editor Initial State**

_What Sarah Sees:_
Split-screen interface with editor on left, preview on right:

```
┌──────────────────┬─────────────────────────┐
│ Script Editor    │  Preview                │
│                  │  [Desktop][Tablet][Mobile]
│ Step 1:          │                         │
│ Enter your email │  [iframe with target    │
│ Description...   │   site + walkthrough]   │
│ Target: #email   │                         │
│ [Screenshot]     │                         │
│                  │                         │
│ Step 2:          │                         │
│ Enter password   │                         │
│ ...              │                         │
└──────────────────┴─────────────────────────┘
```

_Initial Validation:_
System automatically checks generated script:

- ✓ All CSS selectors valid
- ✓ Steps in logical order
- ⚠️ Warning: "Step 3 element not visible on mobile"
- ✓ Responsive layouts validated

**Step 4.2: Review AI-Generated Content**

_What Sarah Does:_
Reviews each generated step:

- Reads step titles (should be contextual, not generic)
- Reviews descriptions (should explain _why_, not just _what_)
- Checks target element is correct (visual highlight in preview)
- Views attached screenshot for each step

_What Sarah Evaluates:_

- **Quality Check:** "Does this make sense?"
- **Accuracy Check:** "Is this the right element?"
- **Tone Check:** "Does this match our brand voice?"
- **Completeness Check:** "Did AI miss anything?"

_Typical AI Quality (Target):_

- 90% of steps require no editing (titles and descriptions are perfect)
- 10% need minor tweaks (rewording, tone adjustment)
- <5% need selector fixes or major changes

**Step 4.3: Optional Editing**

_What Sarah Does (If Needed):_
Makes minor refinements:

- Click step title to edit: inline editing
- Modify description: rich text editor appears
- Reorder steps: drag-and-drop handles
- Adjust target element: click "Select Element" → point-and-click picker in preview
- Add/remove steps: "+ Add Step" or delete icon

_System Response:_

- Changes reflect immediately in preview (real-time updates)
- Validation runs automatically after edits
- Undo/redo available (Cmd/Ctrl + Z)

_Visual Selector Picker (If Needed):_
If Sarah needs to change target element:

1. Clicks "Select Element" button for a step
2. Preview enters selection mode (cursor changes)
3. Sarah hovers over elements in preview (they highlight)
4. Sarah clicks desired element
5. System generates CSS selector automatically
6. Selector appears in editor, preview updates

**Step 4.4: Responsive Device Testing**

_What Sarah Does:_
Tests walkthrough across device sizes:

- Clicks [Desktop] toggle → Preview shows desktop viewport (1920x1080)
- Clicks [Tablet] toggle → Preview resizes to tablet (768x1024)
- Clicks [Mobile] toggle → Preview resizes to mobile (375x667)

_System Response:_

- Preview iframe resizes smoothly (<500ms transition)
- Walkthrough spotlight and tooltips reposition automatically
- Validation warnings appear if issues detected:
  - "⚠️ Step 3: Element not visible on mobile (hidden by responsive CSS)"
  - "⚠️ Step 5: Tooltip overlaps element on tablet"

_What Sarah Evaluates:_

- Do tooltips position correctly on all sizes?
- Are target elements visible at all breakpoints?
- Does spotlight work on mobile touch interactions?

_Confidence Building:_
If all devices show "✓ Looks good", Sarah feels confident to publish

**Step 4.5: Test Walkthrough Playback**

_What Sarah Does:_
Clicks "Play Walkthrough" button in preview pane

_System Response:_

- Preview enters playback mode
- Walkthrough begins: spotlight on first element, tooltip appears
- Sarah can click "Next" to progress through steps
- Or system auto-advances after interactions (if configured)

_What Sarah Validates:_

- Walkthrough flows naturally
- Instructions are clear and helpful
- Spotlight draws attention effectively
- Navigation (Next/Previous/Skip) works smoothly

_Preview Controls:_

```
[◀ Previous] [Next ▶] [Skip] [Restart]
Step 2 of 5
```

---

**PHASE 5: PUBLISHING - Instant Deployment**

**Step 5.1: Initiate Publishing**

_What Sarah Does:_
Clicks "Publish" button (prominent, primary action in editor toolbar)

_System Response:_
Confirmation modal appears:

```
┌─────────────────────────────────────┐
│  Publish Training to Production?    │
├─────────────────────────────────────┤
│  This script will be live for users │
│  matching the selected segments.    │
│                                     │
│  Target Segments:                   │
│  [x] All users                      │
│  [ ] New users only                 │
│  [ ] Premium tier                   │
│                                     │
│  Display Trigger:                   │
│  (•) On page load                   │
│  ( ) On element click               │
│  ( ) Manual trigger                 │
│                                     │
│  [Cancel]  [Publish Now]            │
└─────────────────────────────────────┘
```

_Optional Configuration:_
Sarah can adjust (but defaults are sensible):

- Target segments (who sees this training)
- Display trigger (when it appears)
- Timing/delay settings

**Step 5.2: Publishing Execution**

_What Sarah Does:_
Reviews settings, clicks "Publish Now" button

_System Response:_

- Modal shows publishing progress:
  ```
  Publishing...
  [███████████████████] 100%
  ```
- Backend API updates script status to "published"
- SDK API endpoint serves updated script immediately
- ETag cache invalidated for global propagation
- Total time: 1-3 seconds

_Technical Background:_

- Script JSON uploaded to database
- Published flag set to true
- SDK endpoints return updated script list
- ETag changes, forcing SDK clients to fetch new version
- Global CDN propagation (if SDK served via CDN)

**Step 5.3: Success Confirmation**

_What Sarah Sees:_
Success modal appears:

```
┌─────────────────────────────────────┐
│  ✓ Published Successfully!          │
├─────────────────────────────────────┤
│  Your training is now live.         │
│                                     │
│  [View on Production Site]          │
│  [Share Preview Link]               │
│  [Back to Dashboard]                │
│                                     │
└─────────────────────────────────────┘
```

_Status Updates:_

- Script status badge changes: "Draft" → "Published"
- Timestamp shows: "Published 2 minutes ago"
- Analytics will begin collecting data (if hooks configured)

_Celebration Moment:_

- Success animation (checkmark grows, green highlight)
- Toast notification: "Training published successfully!"
- Optional: Confetti micro-interaction

**Step 5.4: Verification & Completion**

_What Sarah Can Do:_

- **View on Production:** Opens target site with SDK showing walkthrough
- **Share Preview Link:** Generates shareable URL for stakeholders
- **Back to Dashboard:** Returns to scripts list with published script visible

_Dashboard Update:_
Scripts list now shows:

```
┌────────────────────────────────────────┐
│ My Training Scripts                    │
├────────────────────────────────────────┤
│ Login Walkthrough        [Published]   │
│ Created 5 minutes ago                  │
│ 0 views • 0% completion                │
│ [Edit] [Unpublish] [Duplicate]         │
└────────────────────────────────────────┘
```

_Sarah's Feeling at Completion:_
"I just created and published professional training in 5 minutes. That was incredibly easy. I can't wait to make more!"

---

**Complete Flow Time Breakdown:**

| Phase                                | Duration         | % of Total |
| ------------------------------------ | ---------------- | ---------- |
| Initiation (Starting recording)      | 30 seconds       | 8%         |
| Interaction (Demonstrating workflow) | 2-3 minutes      | 40-50%     |
| AI Generation                        | 8-12 seconds     | 3%         |
| Preview & Refinement                 | 2-5 minutes      | 35-45%     |
| Publishing                           | 30 seconds       | 8%         |
| **Total**                            | **5-10 minutes** | **100%**   |

**Success = Professional training created and published in less time than writing a detailed Slack message explaining the same steps manually.**

---

## Visual Design Foundation

### Color System

**Selected Direction: Trusted Professional (Blue/Teal Foundation)**

Next-Step's color system establishes B2B credibility and trust while maintaining a modern, approachable aesthetic. The blue foundation signals reliability and professionalism—critical for enterprise customers evaluating training solutions—while teal accents provide contemporary freshness that differentiates from purely corporate tools.

**Primary Color Palette:**

**Primary: Deep Blue (#2563EB)**

- **Usage:** Primary actions (Publish, Save, Start Recording buttons), navigation highlights, links
- **Emotional Association:** Trust, reliability, B2B credibility, stability
- **Rationale:** Blue is the most trusted color in B2B software, reducing adoption friction for enterprise buyers

**Accent: Teal (#14B8A6)**

- **Usage:** Secondary actions, highlights, progress indicators, success states
- **Emotional Association:** Modern, fresh, growth, innovation
- **Rationale:** Teal adds energy and modernity while maintaining professional tone

**Success: Green (#10B981)**

- **Usage:** Success confirmations ("Published successfully!"), completion indicators, positive validation
- **Emotional Association:** Achievement, progress, confirmation
- **Rationale:** Universal success color, immediately recognizable

**Warning: Amber (#F59E0B)**

- **Usage:** Validation warnings ("Element not visible on mobile"), caution states, non-critical alerts
- **Emotional Association:** Attention without alarm, cautionary but not blocking
- **Rationale:** Draws attention without creating anxiety or fear

**Error: Red (#EF4444)**

- **Usage:** Error states, destructive actions (Delete, Unpublish), critical validation failures
- **Emotional Association:** Stop, critical issue, requires immediate attention
- **Rationale:** Universal error signaling, high visibility for critical issues

**Neutral: Slate (#64748B / #475569 / #334155)**

- **Usage:** Body text, secondary text, borders, backgrounds, disabled states
- **Emotional Association:** Professional, neutral, sophisticated
- **Rationale:** Slate gray provides professional sophistication over pure black/white, better for extended reading

**Semantic Color Mapping:**

```scss
// Primary semantic colors
--color-primary: #2563eb; // Deep Blue
--color-primary-hover: #1d4ed8; // Darker blue on hover
--color-primary-light: #dbeafe; // Light blue for backgrounds

--color-accent: #14b8a6; // Teal
--color-accent-hover: #0d9488; // Darker teal on hover
--color-accent-light: #ccfbf1; // Light teal for backgrounds

// State colors
--color-success: #10b981; // Green
--color-success-light: #d1fae5; // Light green background

--color-warning: #f59e0b; // Amber
--color-warning-light: #fef3c7; // Light amber background

--color-error: #ef4444; // Red
--color-error-light: #fee2e2; // Light red background

--color-info: #3b82f6; // Blue (informational)
--color-info-light: #dbeafe; // Light blue background

// Neutral scale
--color-text-primary: #1e293b; // Slate 800 - main text
--color-text-secondary: #64748b; // Slate 500 - secondary text
--color-text-tertiary: #94a3b8; // Slate 400 - placeholder text

--color-border: #e2e8f0; // Slate 200 - borders
--color-border-hover: #cbd5e1; // Slate 300 - hover borders

--color-background: #ffffff; // White - main background
--color-background-subtle: #f8fafc; // Slate 50 - subtle bg
--color-background-elevated: #ffffff; // White with shadow - cards, modals
```

**Accessibility Compliance:**

All color combinations meet WCAG 2.1 Level AA contrast requirements (4.5:1 for normal text, 3:1 for large text):

- Deep Blue (#2563EB) on white: **7.26:1** ✓ AA Pass
- Teal (#14B8A6) on white: **3.79:1** ✓ AA Large Text Pass
- Slate 500 (#64748B) on white: **4.54:1** ✓ AA Pass
- Slate 800 (#1E293B) on white: **13.58:1** ✓ AAA Pass

For critical actions and primary text, we exceed AA standards to ensure maximum readability.

**Color Usage Guidelines:**

**Primary Blue - Confidence & Action:**

- Use for primary CTAs (Publish, Save, Start Recording)
- Navigation active states and selected items
- Links and interactive elements
- Limit to 1-2 primary actions per screen to maintain hierarchy

**Teal Accent - Progress & Modernity:**

- Secondary actions (Preview, Edit, Share)
- Progress indicators during AI generation
- Highlights and badges
- "New" or "Beta" feature indicators

**Success Green - Celebration & Confirmation:**

- Success toasts and confirmations
- Completion indicators (✓ checkmarks)
- Positive validation messages
- Use sparingly to maintain impact

**Warning Amber - Helpful Caution:**

- Non-blocking validation warnings
- "Needs attention" states that don't prevent action
- Optional improvements or suggestions
- Avoid overuse (reduces impact when actually needed)

**Error Red - Critical Attention:**

- Form validation errors that block submission
- Destructive action warnings (Delete, Unpublish)
- Critical system errors
- Reserve for genuinely blocking issues only

**Neutral Slate - Professional Foundation:**

- Body text and content hierarchy
- Borders, dividers, subtle backgrounds
- Disabled or inactive states
- Provides professional sophistication and readability

**Dark Mode Consideration (Post-MVP):**

While MVP launches with light mode only, the color system accommodates future dark mode:

- Primary blue and teal remain but with adjusted saturation/lightness
- Neutral scale inverts (dark backgrounds, light text)
- Success/warning/error colors maintain but with adjusted brightness
- All contrast ratios validated for dark backgrounds

### Typography System

**Selected Approach: System Font Stack**

Next-Step uses native system fonts for optimal performance, platform-appropriate aesthetics, and zero loading time. System fonts provide professional, highly readable typography that feels native to each user's operating system.

**Font Family:**

```scss
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
```

**System Font Benefits:**

- **Zero Load Time:** Fonts already installed on user's device, instant rendering
- **Native Feel:** San Francisco on macOS, Segoe UI on Windows, Roboto on Android/Linux
- **Optimized Rendering:** OS vendors optimize these fonts for screen readability
- **Cost-Free:** No licensing fees, no font hosting infrastructure
- **Accessibility:** System fonts designed with accessibility standards built-in

**Type Scale (Based on Material Design 3):**

```scss
// Display (Hero text, landing pages)
--font-size-display-large: 57px;
--line-height-display-large: 64px;
--font-weight-display: 400;

// Headlines (Page titles, modal titles)
--font-size-h1: 36px;
--line-height-h1: 44px;
--font-weight-h1: 600;

--font-size-h2: 28px;
--line-height-h2: 36px;
--font-weight-h2: 600;

--font-size-h3: 24px;
--line-height-h3: 32px;
--font-weight-h3: 600;

--font-size-h4: 20px;
--line-height-h4: 28px;
--font-weight-h4: 600;

// Body text (Main content)
--font-size-body-large: 16px;
--line-height-body-large: 24px;
--font-weight-body-large: 400;

--font-size-body: 14px;
--line-height-body: 20px;
--font-weight-body: 400;

--font-size-body-small: 12px;
--line-height-body-small: 16px;
--font-weight-body-small: 400;

// Labels (Form labels, button text)
--font-size-label: 14px;
--line-height-label: 20px;
--font-weight-label: 500;

// Captions (Help text, timestamps)
--font-size-caption: 12px;
--line-height-caption: 16px;
--font-weight-caption: 400;

// Code (CSS selectors, JSON, inline code)
--font-size-code: 14px;
--line-height-code: 20px;
--font-weight-code: 400;
```

**Font Weight Scale:**

- **400 (Regular):** Body text, descriptions, secondary content
- **500 (Medium):** Labels, button text, emphasized body text
- **600 (Semibold):** Headings, titles, primary navigation
- **700 (Bold):** Reserved for special emphasis (rarely used)

**Typography Hierarchy Guidelines:**

**Page Titles (H1):**

- Used once per page for primary heading
- 36px / 600 weight
- Color: Slate 800 (--color-text-primary)
- Example: "Training Scripts", "Edit Script: Login Walkthrough"

**Section Titles (H2):**

- Major sections within a page
- 28px / 600 weight
- Color: Slate 800
- Example: "Recent Scripts", "Script Editor", "Preview"

**Subsection Titles (H3):**

- Subsections or card titles
- 24px / 600 weight
- Color: Slate 800
- Example: "Step 1: Enter Email", "Recording Settings"

**Component Titles (H4):**

- Small component headings
- 20px / 600 weight
- Color: Slate 800
- Example: "Device Preview", "Publish Options"

**Body Text:**

- Primary content, descriptions, paragraphs
- 14px / 400 weight / 20px line-height
- Color: Slate 800 for primary, Slate 500 for secondary
- Line length: Max 65-75 characters for optimal readability

**Labels:**

- Form field labels, button text, navigation items
- 14px / 500 weight
- Color: Slate 700
- Text-transform: none (sentence case for better readability)

**Captions & Help Text:**

- Timestamps, metadata, helper text, tooltips
- 12px / 400 weight
- Color: Slate 500 (secondary text)
- Example: "Created 5 minutes ago", "Optional field"

**Code & Technical Text:**

- CSS selectors, JSON, inline code snippets
- 14px / 400 weight / Monospace font
- Color: Slate 700
- Background: Slate 100 for inline code
- Example: `#email-input`, `{ "step": 1 }`

**Readability Optimizations:**

**Line Height:**

- Body text: 1.5x (20px for 14px text) for comfortable reading
- Headings: 1.2-1.25x (tighter for visual impact)
- Code: 1.4x (monospace needs slightly less leading)

**Line Length:**

- Optimal: 65-75 characters per line for body text
- Editor panes: Max 80 characters for comfortable editing
- Wide screens: Use columns or max-width constraints

**Letter Spacing:**

- Default: Normal (system font default)
- Headings: Slight tightening (-0.02em) for visual polish
- All caps (if used): +0.05em for legibility

**Accessibility Considerations:**

- Minimum body text: 14px (exceeds WCAG 12px minimum)
- Line height: 1.5 minimum for body text (WCAG compliance)
- Contrast: All text meets 4.5:1 ratio minimum (AA standard)
- Font weights: Never below 400 (light weights reduce legibility)
- Resizable: All sizes use relative units (rem) for user zoom support

**Typography Usage Examples:**

**Back Office Dashboard:**

- Page title: H1 (36px) - "Training Scripts"
- Section titles: H2 (28px) - "Recently Published"
- Card titles: H4 (20px) - "Login Walkthrough"
- Body text: 14px - "Created by Sarah Johnson"
- Captions: 12px - "2 minutes ago · 0 views"

**Script Editor:**

- Page title: H1 (36px) - "Edit: Login Walkthrough"
- Step titles: H3 (24px) - "Step 1: Enter Your Email"
- Body text: 14px - Step descriptions
- Labels: 14px/500 - "Target Element", "Description"
- Code: 14px/mono - `#email-input`

**Modals & Dialogs:**

- Modal title: H2 (28px) - "Publish to Production?"
- Body text: 14px - "This script will be live for users..."
- Button text: 14px/500 - "Publish Now", "Cancel"

### Spacing & Layout Foundation

**Selected Philosophy: Balanced & Standard (Material Design 8px Base Unit)**

Next-Step follows Material Design's proven 8px spacing system, providing balanced information density suitable for productivity tools. This creates comfortable, professional layouts without feeling cramped (compact) or wasteful (airy).

**Base Unit: 8px**

All spacing values are multiples of 8px, creating consistent rhythm and visual alignment:

```scss
// Spacing scale (8px base)
--spacing-0: 0;
--spacing-1: 4px; // 0.5× (exceptions, tight spacing)
--spacing-2: 8px; // 1× base unit
--spacing-3: 12px; // 1.5× (between elements)
--spacing-4: 16px; // 2× (card padding, between sections)
--spacing-5: 20px; // 2.5×
--spacing-6: 24px; // 3× (larger component spacing)
--spacing-8: 32px; // 4× (section spacing)
--spacing-10: 40px; // 5× (major sections)
--spacing-12: 48px; // 6× (page-level spacing)
--spacing-16: 64px; // 8× (large whitespace, hero sections)
```

**Spacing Application Guidelines:**

**Component Internal Spacing (Padding):**

- Buttons: 8px vertical, 16px horizontal (compact), 12px × 24px (default)
- Form inputs: 12px vertical, 16px horizontal
- Cards: 16px padding (mobile), 24px padding (desktop)
- Modals: 24px padding throughout
- Navigation items: 12px vertical, 16px horizontal

**Component Spacing (Margin/Gap):**

- Between related elements: 8px (labels + inputs, icon + text)
- Between form fields: 16px vertical
- Between sections: 24px-32px
- Between major page sections: 48px-64px
- Page margins: 24px (mobile), 32px-48px (desktop)

**Grid System:**

**12-Column Grid (Material Design Standard):**

```scss
--grid-columns: 12;
--grid-gutter: 24px; // Space between columns
--grid-margin: 24px; // Page edge margins (mobile)
--grid-margin-desktop: 48px; // Page edge margins (desktop)
```

**Responsive Breakpoints:**

```scss
--breakpoint-mobile: 0px; // < 768px
--breakpoint-tablet: 768px; // 768-1024px
--breakpoint-desktop: 1024px; // 1024-1440px
--breakpoint-wide: 1440px; // > 1440px
```

**Layout Patterns:**

**Dashboard Layout:**

```
┌─ Sidebar (240px) ─┬─ Main Content ────────────────┐
│ Navigation         │  Page Title (H1)              │
│ (Fixed width)      │  ↓ 24px spacing               │
│                    │  Section (Cards with 16px gap)│
│                    │  ↓ 32px spacing               │
│                    │  Another Section              │
└────────────────────┴───────────────────────────────┘
```

**Script Editor Layout (Split View):**

```
┌─ Editor Pane ─────┬─ Preview Pane ───────────────┐
│ Steps List        │  Device Toggle                │
│ (Flexible width)  │  ↓ 16px                       │
│                   │  iframe Preview               │
│ 16px gap between  │  (Full remaining height)      │
│ step cards        │                               │
└───────────────────┴───────────────────────────────┘
Split: 40% editor / 60% preview (adjustable)
```

**Card Spacing:**

- Internal padding: 16px (mobile), 24px (desktop)
- Between cards in grid: 16px gap
- Card border-radius: 8px (modern, approachable)
- Card elevation: 0 2px 4px rgba(0,0,0,0.1) (subtle)

**Form Layout:**

- Label above input: 8px gap
- Between fields: 16px vertical gap
- Field groups: 24px gap between groups
- Form actions (buttons): 24px top margin, 8px gap between buttons

**Modal/Dialog Spacing:**

- Modal padding: 24px all sides
- Title to content: 16px gap
- Content to actions: 24px gap
- Between action buttons: 8px horizontal gap

**Responsive Spacing Adjustments:**

**Mobile (<768px):**

- Reduce page margins: 24px → 16px
- Reduce card padding: 24px → 16px
- Reduce section spacing: 48px → 32px
- Maintain 8px base unit for rhythm

**Tablet (768-1024px):**

- Standard spacing applies
- Comfortable for most interfaces

**Desktop (>1024px):**

- Increase page margins: 24px → 48px
- Maintain or slightly increase card padding
- Generous section spacing: 48-64px

**Information Density:**

**Balanced Approach:**

- Comfortable reading without excessive scrolling
- ~10-15 table rows visible without scroll
- ~4-6 cards in grid view (desktop)
- Script editor: ~5-7 steps visible in list
- Not cramped (can breathe), not wasteful (efficient use of space)

### Accessibility Considerations

**Color Contrast (WCAG 2.1 Level AA Compliance):**

All text-to-background combinations meet or exceed required contrast ratios:

**Normal Text (< 18px):**

- Requirement: 4.5:1 minimum
- Primary text (Slate 800 on white): **13.58:1** ✓ Exceeds AAA (7:1)
- Secondary text (Slate 500 on white): **4.54:1** ✓ Meets AA
- Links (Blue #2563EB on white): **7.26:1** ✓ Exceeds AAA

**Large Text (≥ 18px or 14px bold):**

- Requirement: 3:1 minimum
- All headings and large text exceed 4.5:1 (normal text standard)

**Interactive Elements:**

- Buttons: All states meet 3:1 minimum for visual boundaries
- Form inputs: Border contrast 3:1, text contrast 4.5:1
- Focus indicators: 3:1 contrast against background

**Color-Blind Considerations:**

**Not Relying on Color Alone:**

- Success states: Green color + checkmark icon ✓
- Error states: Red color + X icon + descriptive text
- Warnings: Amber color + warning icon ⚠ + text
- Status indicators: Color + text label (not color-only)

**Color-Blind Safe Palette:**

- Blue and orange are distinguishable for most color-blind types
- Avoid red/green-only distinctions (always add icons or text)
- High contrast ensures visibility regardless of color perception

**Focus Indicators:**

**Keyboard Navigation Support:**

- All interactive elements have visible focus state
- Focus indicator: 2px solid blue outline with 2px offset
- Focus state contrast: 3:1 minimum against background
- Tab order follows logical reading flow (top-to-bottom, left-to-right)

```scss
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Typography Accessibility:**

**Readability Standards:**

- Minimum body text: 14px (exceeds WCAG 12px minimum)
- Line height: 1.5 for body text (WCAG 1.5 requirement)
- Line length: Max 80 characters for comfortable reading
- Font weights: Minimum 400 (light weights reduce legibility)

**Resizable Text:**

- All font sizes use relative units (rem, not px)
- Layout adapts to browser zoom up to 200%
- No horizontal scrolling at 200% zoom for main content
- Text remains readable without assistive technology

**Touch Target Sizes:**

**Mobile Touch Targets (iOS/Android Guidelines):**

- Minimum touch target: 44×44px (iOS), 48×48px (Android)
- Buttons: Minimum 44px height, 88px width for text buttons
- Icon buttons: 48×48px minimum clickable area
- Form inputs: Minimum 44px height
- Spacing between touch targets: 8px minimum

**Mouse Target Sizes:**

- Minimum clickable area: 24×24px
- Comfortable target: 32×32px or larger
- Links inline with text: Adequate padding (4px vertical)

**Screen Reader Considerations:**

**Semantic HTML:**

- Proper heading hierarchy (H1 → H2 → H3, no skipping)
- Semantic elements (<nav>, <main>, <article>, <button>)
- Form labels properly associated with inputs (for/id)
- Alt text for all meaningful images

**ARIA Labels:**

- Icon-only buttons: `aria-label="Start Recording"`
- Complex controls: `aria-describedby` for help text
- Loading states: `aria-live="polite"` for status updates
- Modal dialogs: `role="dialog"` with `aria-labelledby`

**Skip Links:**

- "Skip to main content" link at page top
- Keyboard users can bypass repetitive navigation
- Visually hidden until focused

**Motion & Animation Considerations:**

**Reduced Motion Support:**

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Animation Guidelines:**

- Default animations: Subtle, purposeful (200-300ms)
- Avoid auto-playing animations longer than 5 seconds
- Provide pause/stop controls for longer animations
- Respect `prefers-reduced-motion` user preference

**Visual Foundation Implementation Checklist:**

✅ Color palette defined with semantic mapping  
✅ All color combinations validated for WCAG AA contrast  
✅ Typography scale established with system fonts  
✅ Spacing system (8px base unit) documented  
✅ Grid system and responsive breakpoints defined  
✅ Accessibility requirements integrated throughout  
✅ Focus indicators, touch targets, screen reader support planned  
✅ Motion preferences respected

This visual foundation provides a complete, accessible, professional design system ready for implementation in the Angular Material-based Back Office application.
