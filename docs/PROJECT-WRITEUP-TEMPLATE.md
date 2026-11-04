# RHSP Project Writeup Template & Guidelines

This document provides the canonical schema, authoring rules, asset standards, and frontmatter template for writing and publishing project case studies in Round Hole Square Peg (RHSP).

---

## 1. Editorial & Tone of Voice Rules

1. **Concrete & Engineering-Led**: Describe the mechanics of the solution, the technical boundaries, and the operational friction. Zero corporate fluff or marketing jargon.
2. **Strictly Forbidden Words**:
   Never use any variation of the following words anywhere in titles, taglines, descriptions, stories, or points:
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
   - **Taglines**: $\le$ 7 words. Snappy wordplay bridging challenge and adapter.
   - **Headlines**: $\le$ 8 words. Direct, active voice.
   - **Story paragraphs**: $\le$ 45 words. Punchy context and rationale.
   - **Bullet points**: $\le$ 14 words per bullet. Actionable, specific facts.
6. **Placeholder Rendering Rule**:
   Any string starting with `"[PLACEHOLDER]"` or left empty is automatically filtered out by the template engine and will **never** be rendered on the website.
7. **Always 6 Approach Chapters**:
   Every project page renders all 6 standardized stages matching the RHSP Approach Journey:
   - `01`: Understand the business (`#1E4B8F`)
   - `02`: Identify latent revenue (`#163666`)
   - `03`: Design adaptive systems (`#B86B10`)
   - `04`: Pilot with on-ground teams (`#F7941D`)
   - `05`: Refine and deploy (`#F25F22`)
   - `06`: Enable and monitor (`#EE4B2B`)
   If detailed data for a stage is not yet compiled, the page renders the stage header, wordplay tagline, and a compact "Details coming soon" card with a media placeholder. Never drop a stage.

---

## 2. Copy-and-Paste Frontmatter Skeleton

Create a new file under `src/content/products/<slug>.md` and copy the skeleton below:

```yaml
---
title: "Project Name – Primary Capability"
shortTitle: "ProjectName"
code: "07 / SYSTEM"
order: 7
pillar: "Gen-AI" # "Engineer" | "Gen-AI" | "Build" | "Intelligence"
badge: "High-code (MERN)"
badges:
  - "Gen-AI"
  - "High-code (MERN)"
seoDescription: "Search engine summary (120-155 characters) describing the solution."
oneLiner: "A single sentence describing the business problem and the technical adapter."
outcomeHeadline: "The single biggest verified operational shift"
status: "Deployed" # "Deployed" | "Accelerator"
client: "a multi-brand retail chain"
timeline: "4 weeks to showroom pilot"
outcomes:
  - value: "100%"
    label: "Catalogue grounding"
  - value: "Zero"
    label: "Pricing hallucination"
  - value: "<1.2s"
    label: "Query latency"
hero:
  type: "image"
  src: "/media/projects/<slug>/hero.webp"
  alt: "Representative interface overview"
  frame: "browser"
phases:
  problem:
    tagline: "Where walk-ins wait." # <= 7 words
    headline: "Walk-in delays and fragmented product data"
    story: "In a busy multi-brand appliance showroom, customers wait for an available salesperson while specs sit scattered across Excel sheets."
    points:
      - "Customers exit when salespeople are busy"
      - "Staff cannot recall specs across thousands of models"
    process:
      - "Customer enters showroom"
      - "Waits for free sales rep"
      - "Consults disconnected paper binders"
    friction:
      - title: "Queue Abandonment"
        detail: "Walk-ins delay or exit during peak showroom hours."
  value:
    tagline: "Every walk-in, captured." # <= 7 words
    headline: "Zero wait times and verified catalogue grounding"
    story: "Transforms static spreadsheets into an interactive on-floor advisor, capturing every consultation opportunity."
    points:
      - "Immediate engagement for every walk-in customer"
      - "Verified pricing drawn directly from live store inventory"
    metrics:
      - label: "Showroom floor coverage"
        before: "Headcount bound"
        after: "Instant per walk-in"
        note: "Tablet kiosk at showroom entry"
    levers:
      - "Walk-in queue elimination"
      - "Automated spreadsheet ingestion"
  architecture:
    tagline: "Grounded, never guessing." # <= 7 words
    headline: "High-code MERN and private vector retrieval"
    story: "Full-stack engineering combining React tablet interface, Node.js ingestion backend, vector indexing, and speech recognition."
    points:
      - "React tablet interface with live audio waveform display"
      - "Private vector search with database pricing lock"
    layers:
      - name: "Channels"
        items:
          - name: "In-store Tablet"
            role: "Touch and conversational speech input"
      - name: "Intelligence"
        items:
          - name: "Vector Engine"
            role: "Semantic search and boundary grounding"
    pattern: "Catalogue-Grounded Retrieval with Human Review Loop"
    ai:
      - "Multilingual STT / TTS"
      - "Semantic catalogue embedding search"
    security: "Private boundary architecture; customer voice audio is never retained."
  pilot:
    tagline: "Proven on the showroom floor." # <= 7 words
    headline: "Showroom deployment for a retail store"
    story: "Piloted on tablet devices on the retail showroom floor, assisting live shoppers with home appliance discovery."
    points:
      - "Field validation in active multi-brand appliance retail store"
    scope:
      who: "Showroom customers and floor sales assistants"
      where: "Multi-brand retail showroom"
      duration: "4-week on-floor pilot"
    feedback:
      - heard: "Customers naturally switch languages mid-sentence"
        changed: "Added fluid Hinglish code-switching recognition"
  rollout:
    tagline: "From pilot to production." # <= 7 words
    headline: "Hardened kiosk mode and automated ingestion"
    story: "Kiosk hardening with auto-reset between sessions and background catalogue synchronisation."
    points:
      - "Kiosk isolation preventing OS escapes"
    hardening:
      - "Kiosk sandbox preventing tablet OS access"
      - "Session auto-reset upon customer departure"
    steps:
      - "Initial Excel catalogue ingestion and schema validation"
      - "Store sales staff walkthrough and assisted handoff training"
    scale:
      - value: "1000s"
        label: "Catalogue SKU capacity"
  impact:
    tagline: "Always on. Always improving." # <= 7 words
    headline: "Every walk-in gets an expert salesperson instantly"
    story: "Showroom customers receive immediate guidance in their chosen language, with selected items pre-loaded for cashier checkout."
    points:
      - "Zero wait times for walk-in shoppers"
      - "Zero price hallucination with live database lock"
    enablement:
      - "Sales staff orientation on assisted tablet handoffs"
    governance:
      - "Strict database grounding preventing generated pricing"
    monitoring:
      - "Daily voice interaction session counts"
    outcome: "Every walk-in gets an expert salesperson instantly, with prices locked from the live database."
```
