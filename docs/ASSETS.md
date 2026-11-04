# RHSP Media Assets Specification & Standards

This document establishes the asset conventions, storage paths, resolution standards, format budgets, and generation tooling for all visual media across Round Hole Square Peg (RHSP).

---

## 1. Asset Directory Structure

Project assets are organized strictly by project slug under `public/media/projects/<slug>/`:

```
public/
  media/
    projects/
      <slug>/
        hero.webp          # Canonical 16:10 primary poster (1600x1000)
        hero-800.webp      # Responsive variant for mobile/cards (800x500)
        problem-flow.webp  # Stage 01: Problem flow / bottleneck schematic
        value-chart.webp   # Stage 02: Latent revenue / measured KPI trajectory
        architecture.svg   # Stage 03: Modular adapter topology diagram
        pilot-results.webp # Stage 04: Field trial telemetry & pilot verification
        rollout-map.webp   # Stage 05: Hardened deployment / cluster topology
        impact-kpi.webp    # Stage 06: Production telemetry & monitoring dashboard
```

---

## 2. Canonical Formats, Resolution & Size Budgets

RHSP enforces strict format and size limits to maintain optimal Core Web Vitals and ultra-fast page transitions:

| Asset Type | Canonical Filename | Dimensions | Aspect Ratio | Max File Size | Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Hero Desktop** | `hero.webp` | 1600 × 1000 px | 16:10 | 180 KB | WebP |
| **Project Hero Mobile** | `hero-800.webp` | 800 × 500 px | 16:10 | 80 KB | WebP |
| **Problem Flow** | `problem-flow.webp` | 1200 × 750 px | 16:10 | 120 KB | WebP |
| **Value Trajectory** | `value-chart.webp` | 1200 × 750 px | 16:10 | 100 KB | WebP |
| **Architecture Diagram** | `architecture.svg` | Scalable vector | Scalable | 50 KB | SVG |
| **Pilot Results** | `pilot-results.webp` | 1200 × 750 px | 16:10 | 120 KB | WebP |
| **Rollout Topology** | `rollout-map.webp` | 1200 × 750 px | 16:10 | 120 KB | WebP |
| **Impact Dashboard** | `impact-kpi.webp` | 1200 × 750 px | 16:10 | 120 KB | WebP |
| **Motion Capture** | `*.mp4` | 1280 × 720 px | 16:9 | 2.5 MB | MP4 (H.264, muted, loop) |

### Strict Media Policies:
- **Zero Raw PNGs**: Never ship uncompressed, multi-megabyte PNG files in production bundles. WebP/AVIF compression must always be applied.
- **Max Budget**: Maximum 200 KB per raster asset; maximum 50 KB per SVG asset.
- **Vectors First**: Diagrams, architecture schematics, flows, and graphs should be authoritatively authored in SVG.

---

## 3. Automated Poster Generation

Canonical posters for all 6 active project solutions are generated deterministically using the built-in generator script:

```bash
# Generate 1600x1000 and 800x500 WebP posters for all projects
npm run generate:posters
```

The generation script (`scripts/generate-project-posters.mjs`):
1. Creates `public/media/projects/<slug>/` if it does not exist.
2. Synthesizes a high-contrast dark branded canvas (`#0B132B` $\to$ `#020617`).
3. Embeds the iconic RHSP geometric watermark:
   - Outer round socket (`#1E4B8F` telemetry ring with coordinate markers).
   - Square peg isometric cube (`#F7941D` $\to$ `#EE4B2B`).
   - Adapter bridge paths.
4. Renders project-specific architectural diagrams (waveforms, contract graphs, OCR trees, chat hubs, air-gap enclaves).
5. Compiles both 1600×1000 (`hero.webp`) and 800×500 (`hero-800.webp`) variants with `sharp`, achieving crisp fidelity under 50 KB.
6. Automatically applies the mandatory `"Representative interface"` caption.

---

## 4. Brand Design Language for Generated Assets

When generating synthetic on-brand poster visuals or diagrams:
1. **Background**: Dark slate `#0B132B` to `#020617` radial/linear gradient with subtle isometric grid patterns (opacity $\le 0.08$).
2. **Key Geometric Motifs**:
   - Round hole (deep slate socket with glowing boundary ring: `#1E4B8F` or `#F7941D`).
   - Square peg (isometric cube rotated $30^\circ$, styled with brand amber/copper `#F7941D` $\to$ `#EE4B2B`).
   - Adapter bridge (curved connector pathways with dashed data pulses).
3. **Typography**: Clean sans-serif (`Inter`, `system-ui`), high-contrast hierarchy, uppercase stage badges.
4. **Caption Standard**: All synthetic or representative mockup visuals must carry the caption:
   `"Representative interface"` or `"Representative system architecture"`. Never claim a client's proprietary UI without anonymised authorization.

---

## 5. Media Frame Configurations

The project presentation engine (`MediaSlot.astro`) supports three device frame wrappers:
- `frame: "browser"`: Wraps the asset in a sleek macOS/desktop dark/light browser window frame with titlebar dots and URL lock indicator.
- `frame: "phone"`: Wraps the asset in a modern mobile smartphone chassis with speaker notch.
- `frame: "none"`: Renders edge-to-edge with rounded card corners and subtle shadow.

`MediaSlot.astro` automatically injects `srcset` attributes pointing to `hero-800.webp` and `hero.webp` for responsive viewport rendering without layout shift.
