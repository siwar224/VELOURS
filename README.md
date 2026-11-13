# VELOURS — Eau de Parfum

A cinematic, scroll-driven single page for a fictional luxury perfume house. One pinned `<canvas>`
plays a 192-frame WebP sequence scrubbed by scroll while real HTML text is choreographed over it.

Frontend only: no backend, no real products, no checkout.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · GSAP + ScrollTrigger + SplitText · Lenis

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the build
npm run lint
npm run typecheck
```

`predev` and `prebuild` run `scripts/gen-manifest.mjs`, which counts `public/frames/desktop/f_*.webp`
and writes `src/data/frames.json`. Never hard-code the frame count.

## How the stage works

| File | Role |
| --- | --- |
| `src/components/CanvasSequence.tsx` | Canvas sized to viewport × DPR (max 2), focal-point cover fit, preload (30 frames first, the rest in idle batches), draws the nearest loaded frame, redraws only on a new frame index |
| `src/components/ScrollStage.tsx` | One GSAP timeline in frame units, pinned and scrubbed (`scrub: 0.5`); text, side shade and push-in are positioned by frame number |
| `src/lib/beats.ts` | All beat frames, text cues, scroll distance (425vh desktop, 300vh mobile) |
| `src/lib/lenis.ts` | Lenis on GSAP's ticker, `ScrollTrigger.update` on scroll |
| `src/content/site.ts` | Every piece of copy; rename the brand here |

Reduced motion: no Lenis, pin or scrub; a static hero (`f_0176`, clean bottle) and stacked sections.

Portrait frames (later): add `public/frames/mobile/f_0001.webp …`. The manifest picks the set up
automatically and the stage switches to it under `(max-width: 768px) and (orientation: portrait)`.

## Deploy (Vercel)

1. Push the repository to GitHub and import it in Vercel. The defaults are correct
   (framework Next.js, `npm run build`, output `.next`).
2. Optional: set `NEXT_PUBLIC_SITE_URL` to the final domain (for example `https://velours.example`).
   Without it, Open Graph URLs use Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`).
3. Frames are served with `Cache-Control: public, max-age=31536000, immutable` (see `next.config.ts`).
   If you ever replace frames, rename them or change the folder so browsers do not keep old copies.
4. The ~13 MB of frames are committed in `public/frames/desktop` and count toward the deployment size;
   that is well within Vercel's limits.

## Credits

All imagery is the project's own frame sequence. Products, prices, address and hours are placeholders.
