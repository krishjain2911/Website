# RHSP Media Assets Specification & Standards

This document establishes the asset conventions, storage paths, resolution standards, and brand guidelines for all visual media across Round Hole Square Peg (RHSP).

---

## 1. Asset Directory Structure

Project assets are organized strictly by project slug:

```
public/
  media/
    projects/
      <slug>/
        hero.webp          # Canonical 16:10 primary poster (1600x1000)
        hero-800.webp      # Responsive variant for mobile/cards (800x500)
        friction.webp      # Stage 01: Operational bottleneck / friction map
        value-chart.webp   # Stage 02: Latent revenue / measured KPI trajectory
        architecture.svg   # Stage 03: Modular adapter topology diagram
        pilot.webp         # Stage 04: On-ground field trial observation
        rollout.webp       # Stage 05: Hardened deployment / cluster topology
        impact.webp        # Stage 06: Production telemetry & monitoring dashboard
```

---

## 2. Canonical Image Formats & Resolutions

| Asset Type | Canonical Path | Dimensions | Aspect Ratio | Max File Size | Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Hero Desktop** | `public/media/projects/<slug>/hero.webp` | 1600 × 1000 px | 16:10 | 180 KB | WebP |
| **Project Hero Mobile** | `public/media/projects/<slug>/hero-800.webp` | 800 × 500 px | 16:10 | 80 KB | WebP |
| **Architecture Diagram** | `public/media/projects/<slug>/architecture.svg` | Scalable vector | Scalable | 50 KB | SVG |
| **Interactive Hotspot Media** | `public/media/projects/<slug>/friction.webp` | 1200 × 750 px | 16:10 | 120 KB | WebP |
| **Mobile Phone Mockup** | `public/media/projects/<slug>/phone-screen.webp`| 750 × 1334 px | 9:16 | 100 KB | WebP |

---

## 3. Brand Design Language for Generated Assets

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

## 4. Media Frame Configurations

The project presentation engine supports three device frame wrappers:
- `frame: "browser"`: Wraps the asset in a sleek macOS/desktop dark/light browser window frame with titlebar dots.
- `frame: "phone"`: Wraps the asset in a modern mobile smartphone chassis.
- `frame: "none"`: Renders edge-to-edge with rounded card corners and subtle shadow.
