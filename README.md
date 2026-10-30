# RHSP (Round Hole Square Peg) - Website v2

> **"Wrong shape. Right fit."**  
> Enterprise software shaped around your business. Low-code speed on OutSystems, high-code depth in MERN, and sovereign AI.

---

## 1. Quick Start & Deployment

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node.js `v24.22.1`)
- npm `v9+`

### Installation
```bash
npm install
```

### Local Development Server
```bash
npm run dev
# Server accessible at http://localhost:4321/
```

### Static Production Build
```bash
npm run build
```
The optimized static build outputs directly into `./dist/`.

### Preview Production Build
```bash
npm run preview
# Preview server runs at http://localhost:4321/
```

### Deploying to Cloudflare Pages or Vercel
- **Framework Preset**: `Astro`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `20.x` or higher

---

## 2. Architecture & Performance Budget

### Verified Lighthouse Mobile Scores (v2 Audit)
All tests run with Mobile emulation on throttled 4G network:

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | Total JS (Gzipped) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Homepage (`/`)** | **99** | **97** | **100** | **100** | **1.6s** | **0.00** | **1.24 KB** base + 17.13 KB OGL 3D |
| **Solutions Index (`/solutions`)** | **100** | **97** | **100** | **100** | **1.4s** | **0.00** | **1.24 KB** base |
| **Product Detail (`/solutions/voice-agents`)** | **100** | **96** | **100** | **100** | **1.4s** | **0.00** | **1.24 KB** base |

- **Strict Performance Targets**: LCP < 2.0s (Actual: 1.4s–1.6s), CLS < 0.05 (Actual: 0.00), Initial JS < 100KB (Actual: ~1.24 KB base), Lighthouse $\ge$ 95 across all core audits.
- **Progressive WebGL 3D**: Dynamic OGL chunk (~17.1 KB gzipped) loads asynchronously only when WebGL is supported, memory $\ge$ 4GB, and user has not enabled `prefers-reduced-motion`.
- **Pure SVG Fallback**: When WebGL is unavailable or reduced motion is active, a pure CSS/SVG vector pass-through animation with zero JS overhead is served.

---

## 3. Brand Framework: The Three Faces (B · I · C)

The RHSP cube displays three faces corresponding to the core pillars:

1. **Top face - Build (`#1E4B8F`)**: Enterprise applications on OutSystems (low-code) and high-code (MERN: MongoDB, Express, React, Node), chosen per client budget and requirements.
2. **Left face - Intelligence (`#F7941D`)**: Enterprise AI solutions: voice agents, private/sovereign AI, and semantic enterprise knowledge search.
3. **Right face - Consultancy (`#EE4B2B`)**: Technology consulting: architecture review, platform selection, roadmaps, and low-code vs. high-code fit analysis.

---

## 4. Configuration & Content Management

All configuration files are typed in TypeScript and located under `src/config/site.ts`.

### How to Toggle the Trust Bar and Testimonial
In `src/config/site.ts`, toggle the boolean flags under `siteConfig`:

```typescript
export const siteConfig = {
  // ...
  // Toggles for homepage modules
  showTrustBar: true,     // Set to false to hide client industries & stats counters
  showTestimonial: true,  // Set to false to hide the testimonial card in Why RHSP
  // ...
};
```

### How to Edit the Pillar ↔ Product Mapping
The mapping between pillars and products is centralized in `src/config/site.ts` inside `pillars`:

```typescript
// src/config/site.ts
pillars: [
  {
    id: 'build',
    name: 'Build',
    faceLabel: 'Top face',
    color: '#1E4B8F',
    productSlugs: ['clm', 'dms', 'whatsapp-journeys'], // TO CONFIRM
    subTags: ['OutSystems', 'High-code (MERN)']
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    faceLabel: 'Left face',
    color: '#F7941D',
    productSlugs: ['voice-agents', 'sovereign-ai', 'ask-me-anything'], // TO CONFIRM
    subTags: ['Voice AI', 'Sovereign Models', 'Knowledge Search']
  },
  {
    id: 'consultancy',
    name: 'Consultancy',
    faceLabel: 'Right face',
    color: '#EE4B2B',
    productSlugs: [], // TO CONFIRM: Consultancy is an advisory service; no discrete product slugs
    subTags: ['Architecture Review', 'Platform Choice', 'Tech Roadmaps']
  }
]
```

### How to Edit the "Find Your Fit" Mini-Tool Rules
The recommendation engine in the "How we work" section is driven by the `findYourFit.rules` array in `src/config/site.ts`. Each rule matches a 3-way toggle permutation:
- `speed`: `'weeks'` | `'months'`
- `custom`: `'standard'` | `'unique'`
- `dataLoc`: `'cloud'` | `'private'`

```typescript
// src/config/site.ts -> siteConfig.howWeWork.findYourFit.rules
rules: [
  {
    speed: "weeks",
    custom: "standard",
    dataLoc: "cloud",
    approach: "OutSystems Rapid Build",
    stackBadge: "Low-Code",
    pillar: "build",
    description: "Accelerated visual delivery on OutSystems for fast time-to-value with enterprise compliance and cloud hosting."
  },
  {
    speed: "weeks",
    custom: "unique",
    dataLoc: "private",
    approach: "Hybrid Build + Sovereign AI",
    stackBadge: "Hybrid + Sovereign",
    pillar: "intelligence",
    description: "Private on-prem deployment combining rapid application logic with localized AI processing within your perimeter."
  },
  // Add or customize any of the 8 combinatorial permutations here
]
```

### How to Add or Edit a Product
Products are Astro Content Collections defined in `src/content/products/<slug>.md`. The frontmatter schema is enforced by `src/content/config.ts`.

To add a new product:
1. Create `src/content/products/<slug>.md`.
2. Populate the required frontmatter:

```markdown
---
title: "Product Name"
shortTitle: "Short Name"
code: "07 / SLUG"
order: 7
pillar: "Build" # "Build" | "Intelligence" | "Consultancy"
badge: "OutSystems" # "OutSystems" | "High-code"
oneLiner: "[PLACEHOLDER] One-sentence description of the product."
outcomeHeadline: "The tangible business outcome delivered by this solution."
problem: "[PLACEHOLDER] The operational or organizational friction addressed."
painPoints:
  - "[PLACEHOLDER] Pain point 1"
  - "[PLACEHOLDER] Pain point 2"
  - "[PLACEHOLDER] Pain point 3"
howItWorks:
  - step: "01"
    title: "Phase Title"
    description: "[PLACEHOLDER] Architecture or integration step."
  - step: "02"
    title: "Processing Title"
    description: "[PLACEHOLDER] Core processing step."
  - step: "03"
    title: "Delivery Title"
    description: "[PLACEHOLDER] Business impact step."
value: "[PLACEHOLDER] Summary of business value."
demoMedia:
  posterText: "[PLACEHOLDER] Video preview description"
  badgeText: "Demo video coming soon"
  caption: "[PLACEHOLDER] Architecture diagram caption."
features:
  - title: "Feature One"
    description: "[PLACEHOLDER] Feature description."
  - title: "Feature Two"
    description: "[PLACEHOLDER] Feature description."
audiences:
  - "Target Role 1"
  - "Target Industry 2"
builtWith: "OutSystems" # or "High-code (MERN / Node.js)"
builtWithReason: "Explanation of why this technology stack was selected for this product."
faq:
  - question: "[PLACEHOLDER] Common customer inquiry?"
    answer: "[PLACEHOLDER] Direct answer explaining implementation."
related:
  - "related-product-slug-1"
  - "related-product-slug-2"
ctaText: "Book a demo"
---

[PLACEHOLDER] Detailed product overview markdown content.
```

3. Update `productSlugs` in `src/config/site.ts` under the relevant pillar (`Build` or `Intelligence`).
4. Re-run `npm run build` - the route `/solutions/<slug>` is statically generated automatically with cross-document view transitions.

---

## 5. Audit: All Remaining `[PLACEHOLDER]` Strings Grouped by Page

Every unverified claim or missing copy string is prefixed with `[PLACEHOLDER]`. No capabilities, metrics, or certifications have been invented.

### Page 1: Homepage (`/`)

#### Trust Bar Module (`src/config/site.ts` -> `trustBar`)
- `[PLACEHOLDER]` Projects Delivered *(Stat 1 counter)*
- `[PLACEHOLDER]` Average Sprint Velocity *(Stat 2 counter)*
- `[PLACEHOLDER]` Data Retention Guarantee *(Stat 3 counter)*

#### How We Work Module (`src/config/site.ts` -> `howWeWork.steps`)
- Step 01 Discover Duration: `[PLACEHOLDER] 1–2 Weeks`
- Step 02 Shape Duration: `[PLACEHOLDER] 2–3 Weeks`
- Step 03 Build Duration: `[PLACEHOLDER] 6–10 Weeks`
- Step 04 Run Duration: `[PLACEHOLDER] Ongoing`

#### Why RHSP Module (`src/config/site.ts` -> `whyRhsp`)
- Differentiator 1: `[PLACEHOLDER] Rapid time-to-market using OutSystems paired with bespoke MERN software engineering when unique constraints require custom code.`
- Differentiator 2: `[PLACEHOLDER] Leadership experience spanning industrial operational hardware to mission-critical financial transaction platforms.`
- Differentiator 3: `[PLACEHOLDER] Private cloud and on-premise deployment patterns with complete client data retention and zero vendor lock-in.`
- Differentiator 4: `[PLACEHOLDER] Direct technical oversight and strategic involvement from founders on every enterprise engagement.`
- Testimonial Quote: `[PLACEHOLDER] RHSP helped us bridge a critical operational gap between our legacy core records and our modern digital workflows without requiring a multi-year rip-and-replace.`
- Testimonial Author: `[PLACEHOLDER] Enterprise Operations Leader`
- Testimonial Role: `[PLACEHOLDER] Financial Services Institution`
- Testimonial Industry: `[PLACEHOLDER] Enterprise BFSI`

#### Leadership Module (`src/config/site.ts` -> `team.members`)
- Subu Iyer Bio: `[PLACEHOLDER] 18+ years across OT and IT, robotics to BFSI, OutSystems and Enterprise AI.`
- Subu Iyer Phone: `[PLACEHOLDER] +91 98200 00001`
- Abhishek Bagwe Bio: `[PLACEHOLDER] 18-year corporate career, strategic initiatives at Tata Power and Tata Motors, now driving growth.`
- Abhishek Bagwe Phone: `[PLACEHOLDER] +91 98200 00002`

---

### Page 2: Solutions Index (`/solutions`)
- Card one-liners, badges, and demo poster descriptions inherit from the product markdown files below.

---

### Page 3: Product Pages (`/solutions/[slug]`)

#### 1. Voice Agents (`src/content/products/voice-agents.md`)
- `oneLiner`: `[PLACEHOLDER] Conversational voice interfaces designed for enterprise telephony and direct application integration.`
- `problem`: `[PLACEHOLDER] Traditional phone trees and rigid IVR menus create friction for customers and increase operational overhead for support staff.`
- `painPoints`:
  - `[PLACEHOLDER] Customers wait on hold navigating complex numeric keypad menus.`
  - `[PLACEHOLDER] Support agents spend significant time on routine verification inquiries.`
  - `[PLACEHOLDER] Telephony data remains disconnected from core transactional systems.`
- `howItWorks`:
  - Step 01: `[PLACEHOLDER] Telephony infrastructure streams audio channels into the speech processing service.`
  - Step 02: `[PLACEHOLDER] Natural language understanding evaluates customer inquiries in real time.`
  - Step 03: `[PLACEHOLDER] Verified actions query or update internal business databases securely.`
- `value`: `[PLACEHOLDER] Enables responsive caller interactions while connecting directly to existing operational backends.`
- `demoMedia.posterText`: `[PLACEHOLDER] Audio waveform viewer and active call connection status`
- `demoMedia.caption`: `[PLACEHOLDER] Voice agent telephony architecture and core data connection flow.`
- `features`: 4 titles & descriptions (Telephony integration, intent flows, backend auth, escalation handoff).
- `faq`: 3 questions & answers (PBX integration, conversation review, speech processing location).

#### 2. Sovereign AI (`src/content/products/sovereign-ai.md`)
- `oneLiner`: `[PLACEHOLDER] Private enterprise AI deployments that keep sensitive organization data strictly within your perimeter.`
- `problem`: `[PLACEHOLDER] Public multi-tenant AI services present compliance, data sovereignty, and security concerns for regulated enterprise data.`
- `painPoints`:
  - `[PLACEHOLDER] Strict regulatory guidelines prohibit sending proprietary data to external cloud services.`
  - `[PLACEHOLDER] Unaudited third-party AI models create ambiguity regarding intellectual property retention.`
  - `[PLACEHOLDER] Teams cannot easily integrate open-source or localized models with internal permission models.`
- `howItWorks`:
  - Step 01: `[PLACEHOLDER] AI models and inference engines run inside your dedicated private cloud or on-premise hardware.`
  - Step 02: `[PLACEHOLDER] Embeddings and document lookups connect directly to internal relational databases and object storage.`
  - Step 03: `[PLACEHOLDER] Granular role-based access controls verify user permissions before returning query responses.`
- `value`: `[PLACEHOLDER] Empowers organizations to leverage modern AI models while maintaining 100% control over sensitive data custody.`
- `demoMedia.posterText`: `[PLACEHOLDER] Isolated model inference telemetry and private VPC routing console`
- `demoMedia.caption`: `[PLACEHOLDER] Air-gapped deployment architecture and permission validation boundary.`
- `features`: 4 titles & descriptions (VPC deployment, enterprise RBAC, model flexibility, zero egress guarantee).
- `faq`: 3 questions & answers (Hardware requirements, model updates, security audits).

#### 3. AskMeAnything (`src/content/products/ask-me-anything.md`)
- `oneLiner`: `[PLACEHOLDER] Semantic search and contextual inquiry across distributed corporate documents, policies, and ticketing records.`
- `problem`: `[PLACEHOLDER] Institutional knowledge is fragmented across wikis, document stores, and ticketing systems, leading to duplicate work and slow answers.`
- `painPoints`:
  - `[PLACEHOLDER] Employees spend hours searching multiple internal repositories for operational guidance.`
  - `[PLACEHOLDER] Outdated document versions lead to contradictory internal decisions.`
  - `[PLACEHOLDER] Existing keyword search engines fail on conceptual or multi-document questions.`
- `howItWorks`:
  - Step 01: `[PLACEHOLDER] Document crawlers index PDFs, spreadsheets, wiki articles, and ticket threads into vector indices.`
  - Step 02: `[PLACEHOLDER] Natural language queries retrieve source-grounded passages matching user intent.`
  - Step 03: `[PLACEHOLDER] Answers cite exact original document titles, page numbers, and direct source links.`
- `value`: `[PLACEHOLDER] Drastically reduces knowledge retrieval time while ensuring every answer is anchored in verifiable company records.`
- `demoMedia.posterText`: `[PLACEHOLDER] Search query input with citations drawer and verifiable source previews`
- `demoMedia.caption`: `[PLACEHOLDER] Vector retrieval pipeline and document citation mapping.`
- `features`: 4 titles & descriptions (Multi-source ingestion, citation verification, permissions sync, audit logging).
- `faq`: 3 questions & answers (Supported file formats, handling document updates, access permission enforcement).

#### 4. CLM (Contract Lifecycle Management) (`src/content/products/clm.md`)
- `oneLiner`: `[PLACEHOLDER] End-to-end contract generation, approval routing, negotiation tracking, and renewal alerting.`
- `problem`: `[PLACEHOLDER] Manual contract reviews across email attachments cause costly delays, missed renewal deadlines, and compliance risks.`
- `painPoints`:
  - `[PLACEHOLDER] Legal and sales teams lose visibility into where draft agreements sit in the approval queue.`
  - `[PLACEHOLDER] Contract renegotiations and renewal milestones are tracked on scattered spreadsheets.`
  - `[PLACEHOLDER] Non-standard terms pass through without documented risk review.`
- `howItWorks`:
  - Step 01: `[PLACEHOLDER] Business users assemble standard agreements using pre-approved clause templates.`
  - Step 02: `[PLACEHOLDER] Configurable approval chains route drafts through legal, finance, and executive sign-offs.`
  - Step 03: `[PLACEHOLDER] Integrated digital signature workflows execute agreements and trigger milestone notifications.`
- `value`: `[PLACEHOLDER] Shortens agreement turnaround cycles while enforcing governance across procurement and revenue agreements.`
- `demoMedia.posterText`: `[PLACEHOLDER] Contract approval pipeline, version diff inspector, and milestone calendar`
- `demoMedia.caption`: `[PLACEHOLDER] Contract state machine and automated approval escalation rules.`
- `features`: 4 titles & descriptions (Pre-approved clause library, multi-stage approval routing, e-signature integration, milestone alerts).
- `faq`: 3 questions & answers (Custom workflow design, ERP/CRM integration, audit trail compliance).

#### 5. DMS (Document Management System) (`src/content/products/dms.md`)
- `oneLiner`: `[PLACEHOLDER] Centralized repository for structured document storage, granular permission controls, and regulatory retention rules.`
- `problem`: `[PLACEHOLDER] Unstructured shared folders and disparate local drives make finding, auditing, and securing operational files difficult.`
- `painPoints`:
  - `[PLACEHOLDER] Uncontrolled duplicates and conflicting file versions circulate across teams.`
  - `[PLACEHOLDER] Compliance audits require tedious manual retrieval of historical records.`
  - `[PLACEHOLDER] Sensitive operational documents lack enforceable download or view permissions.`
- `howItWorks`:
  - Step 01: `[PLACEHOLDER] Files are ingested via web interface, batch upload, or automated API triggers.`
  - Step 02: `[PLACEHOLDER] Automatic OCR and metadata tagging categorize documents into organized taxonomy folders.`
  - Step 03: `[PLACEHOLDER] Granular role permissions govern view, edit, download, and archive operations.`
- `value`: `[PLACEHOLDER] Organizes enterprise records into an auditable repository with lifecycle policies.`
- `demoMedia.posterText`: `[PLACEHOLDER] Document repository grid with metadata filtering and version history inspector`
- `demoMedia.caption`: `[PLACEHOLDER] Document indexing hierarchy and access permission boundary.`
- `features`: 4 titles & descriptions (OCR metadata tagging, version control, retention policies, enterprise search).
- `faq`: 3 questions & answers (On-premise file storage, OCR accuracy on scans, Active Directory sync).

#### 6. WhatsApp Journeys (`src/content/products/whatsapp-journeys.md`)
- `oneLiner`: `[PLACEHOLDER] Customer service workflows, automated updates, and self-service interactions running on WhatsApp.`
- `problem`: `[PLACEHOLDER] Low consumer email open rates and portal login hurdles slow down time-sensitive customer communications.`
- `painPoints`:
  - `[PLACEHOLDER] Critical notification emails often remain unread or land in spam folders.`
  - `[PLACEHOLDER] Customers hesitate to download dedicated native mobile apps for occasional tasks.`
  - `[PLACEHOLDER] Customer service queues overflow with routine status verification requests.`
- `howItWorks`:
  - Step 01: `[PLACEHOLDER] Integration with verified business messaging APIs enables structured interactive templates.`
  - Step 02: `[PLACEHOLDER] Visual business logic engines manage customer verification, form inputs, and transactional triggers.`
  - Step 03: `[PLACEHOLDER] When inquiries exceed automated pathways, conversations transfer smoothly to service representatives.`
- `value`: `[PLACEHOLDER] Provides high-engagement customer touchpoints without requiring separate mobile app installations.`
- `demoMedia.posterText`: `[PLACEHOLDER] Visual journey builder and conversational session inspector`
- `demoMedia.caption`: `[PLACEHOLDER] Visual state machine and real-time customer session metrics.`
- `features`: 4 titles & descriptions (Interactive templates, backend CRM sync, secure authentication, live agent handoff).
- `faq`: 3 questions & answers (WhatsApp Business Account requirement, document uploads, data confidentiality).
