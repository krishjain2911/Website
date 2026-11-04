# RHSP Project Writeup Template & Asset Guidelines

This document provides the canonical schema, authoring rules, asset standards, and frontmatter template for writing and publishing project case studies in Round Hole Square Peg (RHSP).

---

## 1. Editorial & Tone of Voice Rules

1. **Concrete & Engineering-Led**: Describe the mechanics of the solution, the technical boundaries, and the operational friction. Zero corporate fluff or marketing jargon.
2. **Strictly Forbidden Words**:
   Never use any variation of the following words anywhere in titles, descriptions, stories, or points:
   - `fit`
   - `shape` / `shaped`
   - `wrong`
   - `force` / `forced`
   - `tailored`
   - `perfect` / `perfection`
3. **No Empty Superlatives**:
   Avoid words like "seamless", "effortless", "revolutionary", "game-changing", "cutting-edge", or "best-in-class". Let quantifiable telemetry and operational outcomes speak for themselves.
4. **Anonymised Client Naming**:
   Client names must remain strictly anonymised using their operational category and industry context.
   - *Good*: "a national luxury jewellery retailer", "a tier-1 infrastructure lender", "an omnichannel retail chain".
   - *Bad*: "Acme Corp", "Client X", or inventing fictitious brand names.
5. **Length Constraints**:
   - **Headlines**: $\le$ 8 words. Direct, active voice.
   - **Story paragraphs**: $\le$ 45 words. Punchy context and rationale.
   - **Bullet points**: $\le$ 14 words per bullet. Actionable, specific facts.
6. **Placeholder Rendering Rule**:
   Any string starting with `"[PLACEHOLDER]"` or left empty is automatically filtered out by the template engine and will **never** be rendered on the website. If a whole phase lacks data, its section and corresponding navigation stop on the journey rail will be skipped cleanly.

---

## 2. Media & Asset Guidelines

All assets for a project case study live in:
`public/media/projects/<slug>/`

### Canonical File Naming
Store media using these standard names:
- `hero.webp` — Primary hero mock/visual (16:10 aspect ratio)
- `friction.svg` or `friction.webp` — Friction map or workflow bottleneck visual
- `value-chart.svg` or `value-chart.webp` — KPI shift / trajectory infographic
- `architecture.svg` — System topology / adapter layer diagram (vector preferred)
- `pilot-photo.webp` or `pilot-screencast.mp4` — Field trial observation or prototype recording
- `rollout-timeline.svg` or `rollout.webp` — Progressive deployment schedule visual
- `impact-dashboard.webp` — Final production telemetry dashboard

### Formats & Aspect Ratios
- **Vector Diagrams**: Clean SVG (`stroke-width="1.5"` or `2`, no external fonts).
- **Screenshots / Stills**: WebP format, optimized $\le$ 150KB.
- **Short Screen Recordings**: WebM or MP4 (H.264), muted, loopable, $\le$ 2MB.
- **Aspect Ratios**:
  - Desktop / standard slot: `16/10` (default)
  - Mobile phone mock: `9/16` (`frame: "phone"`)
  - Browser mock: `16/10` (`frame: "browser"`)
  - Square diagram / badge: `1/1` (`frame: "none"`)

---

## 3. Required vs Optional Fields Checklist

| Field / Section | Requirement | Description |
| :--- | :--- | :--- |
| `title` | **Required** | Full project title (e.g., "Autonomous In-Store Assistant") |
| `shortTitle` | **Required** | Short name for navigation breadcrumbs (e.g., "Sonakshi") |
| `order` | **Required** | Numerical sorting sequence across solution catalog |
| `pillar` | **Required** | One of: `"Products"`, `"Engineering"`, `"Gen-AI"` |
| `badge` | **Required** | Primary architectural stack tag (e.g., "VISION + AGENTIC") |
| `status` | Optional | `"Deployed"` or `"Accelerator"` |
| `client` | Optional | Anonymised client identifier (e.g., "National Luxury Jeweller") |
| `timeline` | Optional | Timeline string (e.g., "6 weeks to production") |
| `oneLiner` | **Required** | One crisp summary sentence ($\le$ 25 words) |
| `outcomes` | Optional | Up to 3 high-level metrics `{ value: "...", label: "..." }` |
| `hero` | Optional | Hero media object `{ type, src, alt, caption, frame }` |
| `phases.problem` | Optional | Phase 01: process steps, friction cards, headline, story, media |
| `phases.value` | Optional | Phase 02: before/after metrics, value levers, drivers |
| `phases.architecture` | Optional | Phase 03: modular layers, core pattern, security, AI chips |
| `phases.pilot` | Optional | Phase 04: trial scope, "we heard $\to$ we engineered" cards |
| `phases.rollout` | Optional | Phase 05: production hardening list, rollout steps, scale stats |
| `phases.impact` | Optional | Phase 06: outcome statement, governance/enablement/monitoring, quote |

---

## 4. Copy-and-Paste Frontmatter Skeleton

Create a new file under `src/content/products/<slug>.md` and copy the skeleton below:

```yaml
---
title: "Project Name Headline"
shortTitle: "ShortName"
order: 1
pillar: "Gen-AI" # "Products" | "Engineering" | "Gen-AI"
badge: "AGENTIC WORKFLOWS"
status: "Deployed" # "Deployed" | "Accelerator"
client: "a tier-1 financial enterprise"
timeline: "8 weeks to enterprise launch"
outcomeHeadline: "Headline summarizing the verified ROI or operational achievement"
oneLiner: "A concise summary of the deployed system and how it bridges legacy constraints."
ctaText: "Let's talk"

# Up to 3 summary metrics shown in the hero strip
outcomes:
  - value: "94%"
    label: "Automation rate"
  - value: "4.2x"
    label: "Throughput acceleration"
  - value: "0"
    label: "Data residency breaches"

# Hero Media item
hero:
  type: "image" # "image" | "video" | "gif" | "embed"
  src: "/media/projects/<slug>/hero.webp"
  alt: "Interface blueprint and production architecture overview"
  caption: "Production telemetry and operational agent console"
  frame: "browser" # "browser" | "phone" | "none"

# -------------------------------------------------------------
# 6-PHASE APPROACH JOURNEY
# -------------------------------------------------------------
phases:
  # PHASE 01: THE PROBLEM
  problem:
    headline: "The Operational Bottleneck" # <= 8 words
    story: "Context on why existing infrastructure failed to meet customer demand." # <= 45 words
    process:
      - "Manual ticket intake via distributed branches"
      - "Ad-hoc validation across siloed core mainframes"
      - "Human triage taking up to 48 hours per item"
    friction:
      - title: "Siloed Record Fragmentation"
        detail: "Disparate legacy databases prevent unified customer context retrieval."
      - title: "Manual Verification Overhead"
        detail: "Operational teams spend 70% of intake time re-keying identical records."
    points:
      - "Legacy backends lack modern API endpoints for real-time validation"
      - "Manual validation led to high error rates and customer churn"
    media:
      - type: "image"
        src: "/media/projects/<slug>/friction.svg"
        alt: "Operational friction workflow"
        caption: "Legacy intake bottlenecks vs operational load"
        frame: "none"

  # PHASE 02: LATENT REVENUE & VALUE
  value:
    headline: "Quantified Value Realisation" # <= 8 words
    story: "Unlocking trapped operational capacity and accelerating contract velocity." # <= 45 words
    metrics:
      - label: "Validation Turnaround"
        before: "48 hours"
        after: "12 minutes"
        note: "End-to-end automated pipeline"
      - label: "Processing Cost / Unit"
        before: "$14.50"
        after: "$1.20"
        note: "91% operational savings"
    levers:
      - "Direct database adapter eliminating repetitive manual entry"
      - "Real-time anomaly screening against compliance registries"
      - "Automated document OCR and structured metadata extraction"
    points:
      - "Reclaimed 12,000 annual human hours for high-touch customer consultations"
      - "Zero penalty fees incurred during post-launch regulatory reviews"

  # PHASE 03: SYSTEM ARCHITECTURE
  architecture:
    headline: "Production Topology & Adapter Design" # <= 8 words
    story: "Zero-data-retention adapter layer connecting legacy ERPs to agent pipelines." # <= 45 words
    pattern: "Event-Driven Microservices + Sandboxed LLM Agents"
    security: "SOC2 Type II compliant, zero data retention at LLM layer, AES-256 at rest"
    layers:
      - name: "Channel & Ingestion"
        items:
          - name: "API Gateway"
            role: "Rate-limited JWT authentication"
          - name: "Webhook Ingestion"
            role: "Real-time event subscriber"
      - name: "Agentic Intelligence"
        items:
          - name: "Orchestration Engine"
            role: "Multi-agent task decomposition"
          - name: "Schema Validator"
            role: "Deterministic JSON validation"
      - name: "Legacy Adapters"
        items:
          - name: "ERP Connector"
            role: "Bi-directional transactional queue"
    ai:
      - "Deterministic schema enforcement preventing hallucinations"
      - "Retrieval-augmented grounding over proprietary policy manuals"
      - "Self-correcting query retries on schema mismatches"
    points:
      - "Sub-second adapter latency across internal service boundaries"
      - "Local model execution support for sensitive compliance workloads"
    media:
      - type: "image"
        src: "/media/projects/<slug>/architecture.svg"
        alt: "System architecture and data flow diagram"
        caption: "Component topology and boundary isolation"
        frame: "none"

  # PHASE 04: THE PILOT TRIAL
  pilot:
    headline: "Controlled Field Sandbox Verification" # <= 8 words
    story: "Staged deployment with senior operators before full departmental release." # <= 45 words
    scope:
      who: "15 senior loan underwriters"
      where: "Regional flagship branch"
      duration: "3-week sprint"
    feedback:
      - heard: "Field operators required rapid manual overrides during exception triage."
        changed: "Engineered single-click human-in-the-loop review drawer directly in UI."
      - heard: "Default confidence scores were too ambiguous for edge case policies."
        changed: "Added clear citation references linking directly to clause text."
    points:
      - "Zero system outages during live production trading hours"
      - "100% adoption rate among initial pilot cohort by week 2"

  # PHASE 05: ENTERPRISE ROLLOUT
  rollout:
    headline: "Hardened Global Deployment" # <= 8 words
    story: "Multi-region scaling with strict monitoring and circuit breaker controls." # <= 45 words
    scale:
      - value: "10,000+"
        label: "Daily active transactions"
      - value: "99.98%"
        label: "Production uptime"
    hardening:
      - "Automated Chaos Monkey resiliency testing in pre-prod"
      - "Circuit breakers on all external third-party API dependencies"
      - "Granular Prometheus and Grafana alerts on P99 latency"
      - "Role-based access controls with hardware token enforcement"
    steps:
      - "Day 01: Pilot cohort expanded to 20% regional traffic"
      - "Day 14: Automated canary validation across secondary branches"
      - "Day 30: Full departmental cutover and legacy decommission"
    points:
      - "Continuous integration pipeline with automated regression checks"
      - "Seamless failover between primary and secondary cloud clusters"

  # PHASE 06: LONG-TERM IMPACT
  impact:
    headline: "Enduring Operational Capability" # <= 8 words
    story: "Autonomous execution with permanent internal governance and metrics tracking." # <= 45 words
    outcome: "Transformed a brittle 48-hour manual review pipeline into an autonomous, 12-minute enterprise workflow handling millions in weekly transactions."
    enablement:
      - "Complete technical handover and internal engineering documentation"
      - "Operator training playbooks for custom agent prompt tuning"
    governance:
      - "Monthly automated audit logs submitted to compliance leadership"
      - "Granular policy change control requiring dual-signature approvals"
    monitoring:
      - "Continuous evaluation framework tracking LLM accuracy drift"
      - "Automated incident escalation with 15-minute SLA paging"
    quote:
      text: "The RHSP team engineered an adapter that unlocked our core systems without requiring an expensive multi-year rewrite."
      role: "Chief Operating Officer, Commercial Banking Group"
    points:
      - "Full operational autonomy transferred to internal team within 60 days"
      - "Sustained 99%+ processing accuracy over 6 consecutive months"

# -------------------------------------------------------------
# SUPPLEMENTARY / LEGACY COMPATIBILITY FIELDS
# -------------------------------------------------------------
faq:
  - question: "How does the adapter handle legacy database schemas?"
    answer: "The adapter encapsulates schema translation behind strongly typed interfaces, ensuring downstream agents only consume validated, clean data contracts."
  - question: "Can this solution be hosted on-premises or within a private VPC?"
    answer: "Yes. All adapter components and model inferences can deploy within sovereign cloud boundaries or air-gapped VPCs."

related:
  - "clm"
  - "dms"
---

Optional long-form markdown body here.
```
