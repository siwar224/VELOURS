# CLAUDE.md — ÉCLOSE, cinematic scroll website (luxury perfume)

Read this whole file before writing any code. Then reply with a short plan (max 15 lines) and any questions, and WAIT for my "go" before scaffolding anything.

## 1. What we are building

A **frontend-only, single-page, cinematic scrollytelling website** for a fictional luxury perfume house, **ÉCLOSE** (French for "bloomed"). No backend, no auth, no database, no real checkout.

The page is driven by **one pinned `<canvas>` that plays an image sequence (192 WebP frames) scrubbed by scroll**, with real HTML text animating over it. As the user scrolls, a faceted rose-glass perfume bottle "blooms": flowers appear inside the bottle, burst out, orbit it, spiral into a rose-gold mist, and the bottle returns, clean and glinting.

Goal: a **portfolio-grade, recruiter-impressing piece**: smooth, premium, fast, accessible. Same technique as my coffee site (pinned canvas + GSAP + Lenis), new brand, new look. Do not copy the coffee look.

Brand: **ÉCLOSE**, tagline "Eau de Parfum" / "Blooming in every note". Keep ALL brand text in `src/content/site.ts` so renaming is a one-line change. Copy is in English, brand and product names are French.

## 2. Stack (decided, do not swap without asking)

- Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS
- GSAP + ScrollTrigger (+ SplitText for headlines; it is free now)
- Lenis for smooth scroll, wired to GSAP's ticker
- Canvas 2D image-sequence renderer (NOT `<video>` currentTime scrubbing, NOT Three.js)
- Fonts via `next/font/google`: **Bodoni Moda** (headings, high-contrast luxury serif), **Jost** (body and small tracked labels)
- Deploy target: Vercel
- Ask before adding any other dependency.

## 3. Assets (already made, do NOT generate or replace them)

- Frames: `public/frames/desktop/f_0001.webp` … `f_0192.webp`
  (192 frames, 1920×1080, WebP q75, about 14 MB total, 24 fps source = 8 s, contiguous numbering, **no audio**)
- The zip I give you contains a `desktop/` folder. Unzip it into `public/frames/` so the path above is correct.
- Do not edit, re-encode or rename the frames. Do not add stock photos. Do not put text in images: **all text is real HTML**. The bottle is intentionally blank, the ÉCLOSE wordmark is HTML (Bodoni Moda, uppercase, wide letter-spacing).
- Do not hard-code 192. Write `scripts/gen-manifest.mjs` that counts files in `public/frames/desktop` and writes `src/data/frames.json` (`{ "count": N, "pattern": "/frames/desktop/f_{n}.webp", "pad": 4 }`). Run it in `predev` and `prebuild`.

### What the frames show (verify by looking at frames 1, 24, 36, 60, 96, 120, 156, 176, 192 yourself before building the timeline)
Fixed, locked camera, front view. A faceted rose-pink glass perfume bottle with a gold cap stands on a glossy wine-coloured round pedestal against a deep wine background.
- **Bottle position:** horizontally centred (about 50% of width), about 15% of the frame width wide, vertically from about 27% (top of cap) to 72% (base); the pedestal reaches about 88%. **The sides (left and right ~35%) are free in the calm phases.**
- **Beats (frame numbers are approximate, confirm visually):**
  - 1–22: calm bottle, a pink light streak sweeps across the glass
  - 22–36: flowers appear inside the glass, then burst out
  - 36–96: peak. Roses, peonies, violet petals, pink peppercorns and gold sparkles float in a wide orbit around the bottle, covering both sides
  - 96–108: the petals spiral into a gold sparkle trail
  - 108–150: a soft rose-gold mist wraps the bottle and the pedestal
  - 150–170: mist clears
  - 170–192: clean bottle with a glint of light (last frame has a lens flare)
- The bottle stays sharp and stable throughout. Do not try to "correct" small facet shifts.

## 4. Design system

Palette (CSS variables, mirrored in the Tailwind theme):
- `--prune: #2E0A21` (main dark background, sampled from the frames)
- `--bordeaux: #632042` (lighter dark sections, glow)
- `--rose: #D46479` (accent, the liquid colour: buttons, hovers, thin lines)
- `--champagne: #E2C07C` (gold details, the cap colour: small labels, icons, borders)
- `--creme: #F6ECE6` (light text on dark, light sections)
- `--nuit: #1A0513` (footer, deepest dark)

Look: dark, sensual, luxurious, quiet. Huge Bodoni Moda headlines (uppercase or title case, tight), small uppercase Jost labels with wide tracking in champagne, hairline champagne rules, generous negative space. Cream text on the dark frames (contrast ≥ 4.5:1; use a local soft radial `--prune` gradient behind any text block that overlaps the flower orbit). Subtle film grain + vignette overlay (CSS, `pointer-events:none`, cheap). Buttons: pill or sharp rectangle with a 1px champagne border, fill with rose on hover. Never pure white or pure black.

## 5. Page structure

1. **Nav** (fixed): ÉCLOSE wordmark centred or left, links (Notes, Story, Collection, Boutique), small "Discover" CTA. Transparent over the stage, becomes a blurred prune bar after the stage.
2. **ScrollStage** (pinned, the main event): canvas full-viewport, HTML text layers over it, scroll distance about 400–450vh with `scrub: 0.5`. Text blocks alternate sides (left, right, left, right) in columns no wider than about 28% of the viewport, so the bottle stays clear:
   - Beat 1 (frames 1–22): label "EAU DE PARFUM", H1 "ÉCLOSE" (or the headline from `site.ts`), one-line subtext, "Scroll to bloom ↓". Fades out as the flowers appear.
   - Beat 2 (22–60): label "THE BLOOM", headline about "Bloom in every note". Slides in as the flowers burst.
   - Beat 3 (60–100): label "THE HEART", a short line about rose, peony and violet.
   - Beat 4 (108–150): label "THE TRAIL", a line about pink pepper and the mist.
   - Beat 5 (150–192): label "THE FINISH", headline about "Leave a trace", CTA "Discover the collection".
   - End of sequence: a slow push-in on the bottle (scale 1.0 → 1.12, `transformOrigin: "50% 55%"`), then unpin.
3. **Notes section** (Bordeaux): the olfactory pyramid, 3 columns: Top (pink pepper, bergamot), Heart (rose, peony, violet), Base (musk, amber, vanilla). Thin champagne rules, small labels. Imagery: CSS crops of the frames (for example `object-position` crops of f_0060 and f_0080 as flower details), no new photos.
4. **Story section** (cream background, Prune text, 2 columns, short copy). A clip-path or sliding-panel wipe from dark to cream.
5. **Collection section** (Prune): 3 fragrance cards, placeholder products: "Rose Éclose", "Pivoine Nuit", "Violette Brume", each with a short descriptor, size, price (placeholder, for example €120 / 50 ml) and a non-functional "Discover" button. **Imagery trick:** use the same crop of frame f_0001 (the bottle) with different CSS filters (`hue-rotate`, `saturate`) and different gradient backgrounds to suggest 3 variants. Do not create new images. Mark clearly in code comments that these are placeholders.
6. **Boutique / footer** (Nuit): address, hours, newsletter input (non-functional, front-end validation only), small print, all placeholder.

All copy lives in `src/content/site.ts`. Placeholder copy is fine, no lorem ipsum. Brand voice: short, sensory, confident, a little poetic. Do not invent claims about real brands.

## 6. Rendering rules for the canvas (important)

- Component `CanvasSequence.tsx` owns the canvas and the frame loading. `ScrollStage.tsx` owns the GSAP timeline.
- Draw with a **cover fit using a focal point** (`focalX = 0.5`, `focalY = 0.5`). On narrow/portrait screens the bottle must stay visible and centred; crop the sides first.
- Size the canvas to viewport × `min(devicePixelRatio, 2)`; redraw on resize.
- Only call `drawImage` when the rounded frame index changes.
- Preload in priority order: first 30 frames immediately, then the rest in the background (`requestIdleCallback` with `setTimeout` fallback). Use `HTMLImageElement.decode()` or `createImageBitmap`. Minimal preloader (a thin champagne progress line) until about 30% is loaded, then reveal. If the user scrolls ahead of what is loaded, draw the nearest loaded frame.
- The frame index is a plain object tweened by GSAP with `ease: "none"`. Text and background animations sit on the **same scrubbed timeline**, positioned by frame labels (for example label `bloom` at frame 22), so everything stays in sync both directions. Define the beat frames as constants in one place.
- React 18 Strict Mode safe: use `gsap.context()` and `ctx.revert()` in cleanup. Call `ScrollTrigger.refresh()` after fonts and first frames load.
- Lenis: `lenis.on("scroll", ScrollTrigger.update)`; `gsap.ticker.add((t) => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`.
- `prefers-reduced-motion`: no pin, no scrub; show frame `f_0176` (clean bottle, no flowers) as a static hero and normal stacked sections.

## 7. Mobile (frames for portrait are NOT ready)

Only the landscape set exists. For now: focal-point cover crop keeps the bottle visible (the flower orbit will be partly cropped, that is accepted), text sits in the bottom third over a stronger prune gradient, scroll distance shorter (about 300vh). Build the code so a second set `public/frames/mobile/` can be added later through the manifest (`matchMedia("(max-width: 768px) and (orientation: portrait)")`), but do not create it now.

## 8. Quality bar / definition of done

- No console errors or warnings; TypeScript strict passes; ESLint clean.
- 60 fps scrubbing on a mid-range laptop; no layout shift; no horizontal scroll.
- Lighthouse (desktop): Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Frames do not count toward LCP: use a lightweight first-frame poster (`f_0001.webp` as a CSS background / `<img priority>`) for LCP.
- Semantic HTML (one `<h1>`, `<nav>`, `<main>`, `<section>` with headings), keyboard-focusable controls, visible focus states (champagne outline), `aria-hidden` on the canvas with an offscreen text description of the animation.
- `next.config.ts` headers: `Cache-Control: public, max-age=31536000, immutable` for `/frames/*`.
- Metadata: title, description, Open Graph image (use `f_0176.webp`), theme colour `#2E0A21`, favicon (a simple champagne "É" on prune, SVG).
- Verify yourself with Playwright: screenshots at scroll 0%, 15%, 30%, 50%, 70%, 85%, 100% at 1440×900 and 390×844; check that text never covers the bottle, stays readable over the flowers (gradient if needed), and that the canvas shows the right frame at each point.

## 9. Folder structure

```
public/frames/desktop/f_0001.webp … f_0192.webp
scripts/gen-manifest.mjs
src/app/layout.tsx, page.tsx, globals.css
src/components/Nav.tsx, ScrollStage.tsx, CanvasSequence.tsx, Preloader.tsx,
               Notes.tsx, Story.tsx, Collection.tsx, Boutique.tsx, GrainOverlay.tsx
src/content/site.ts
src/data/frames.json            (generated)
src/lib/lenis.ts, gsap.ts, beats.ts
```

## 10. Working rules for you (Claude Code)

1. First reply: a short plan and any questions. Wait for "go".
2. Build in this order and stop for my review after each block: (a) scaffold + manifest + static layout with no animation, (b) CanvasSequence scrubbing correctly, (c) text/background choreography on the timeline, (d) Notes, Story, Collection, Boutique sections and the colour wipes, (e) preloader, reduced motion, mobile fallback, (f) polish, a11y, Lighthouse, deploy notes.
3. Commit after each block with a clear message. Do not push unless I ask.
4. If something in this brief is wrong or conflicts with what you see in the frames, tell me instead of guessing.
5. Keep code simple and commented where the scroll maths is non-obvious. No over-engineering, no unused abstractions.
6. It is a frontend project: no backend, no real data, no payment. Do not add pages or features beyond this brief.

## 11. Later phases (do NOT start, only when I ask)

Mobile portrait frame set, performance pass, product detail pages with a mock cart, tests and CI, FR/EN switch, a case-study write-up for the portfolio.
