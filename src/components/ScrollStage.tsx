"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type Lenis from "lenis";
import { stage } from "@/content/site";
import framesJson from "@/data/frames.json";
import { CUES, FADE, FRAMES, PUSH_IN, REVEAL_AT, SCROLL_VH, STATIC_FRAME, frameTime } from "@/lib/beats";
import { gsap, MOTION_QUERY, ScrollTrigger, SplitText } from "@/lib/gsap";
import { createLenis } from "@/lib/lenis";
import { CanvasSequence, type CanvasSequenceHandle, type FrameSet } from "./CanvasSequence";
import { frameSrc } from "./FrameCrop";
import { Preloader } from "./Preloader";

// The manifest may later carry a portrait set (public/frames/mobile) next to the desktop one.
const manifest = framesJson as FrameSet & { mobile?: FrameSet };
const desktopSet: FrameSet = { count: manifest.count, pattern: manifest.pattern, pad: manifest.pad };
const MOBILE_PORTRAIT = "(max-width: 768px) and (orientation: portrait)";
const LOAD_TIMEOUT_MS = 8000; // never keep scroll locked longer than this, even on a bad network

type Side = "left" | "right";

/*
 * Text layers over the stage.
 * Motion: absolutely positioned over the pinned canvas. Desktop: a column of at most ~28% of the
 * viewport on one side, so the bottle (centre ~15% of the frame) stays clear. Mobile: bottom third.
 * Reduced motion: beats 2–5 become normal stacked blocks under a static hero.
 * (Class strings are written out in full so Tailwind can see them.)
 */
const INTRO_POSITION =
  "absolute inset-x-6 bottom-[5svh] md:inset-x-auto md:top-1/2 md:bottom-auto md:left-[6vw] md:w-[min(28vw,26rem)] md:-translate-y-1/2 md:items-start md:text-left";
const BEAT_POSITION =
  "relative motion-safe:absolute motion-safe:inset-x-6 motion-safe:bottom-[5svh] motion-safe:opacity-0 motion-safe:md:inset-x-auto motion-safe:md:top-1/2 motion-safe:md:bottom-auto motion-safe:md:w-[min(28vw,26rem)] motion-safe:md:-translate-y-1/2 motion-reduce:md:items-start motion-reduce:md:text-left";
const SIDE: Record<Side, string> = {
  left: "motion-safe:md:left-[6vw] motion-safe:md:items-start motion-safe:md:text-left",
  right: "motion-safe:md:right-[6vw] motion-safe:md:items-end motion-safe:md:text-right",
};

function Beat({ id, className, children }: { id: string; className: string; children: ReactNode }) {
  return (
    <div data-beat={id} className={`pointer-events-auto isolate flex flex-col items-center text-center ${className}`}>
      {/* Soft local prune gradient for contrast over the flower orbit (kept behind the text by `isolate`). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-16 -inset-y-14 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(46_10_33/0.78)_0%,rgb(46_10_33/0.45)_45%,transparent_72%)]"
      />
      {children}
    </div>
  );
}

function BeatHeading({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <>
      <p className="label">{label}</p>
      <h2 className="mt-5 font-display text-4xl leading-[1.02] text-creme md:text-5xl lg:text-6xl">{title}</h2>
      <span className="rule mt-6 w-12" aria-hidden="true" />
      <p className="mt-6 max-w-[22rem] text-base leading-relaxed text-creme/85 md:text-lg">{text}</p>
    </>
  );
}

type StageTimelineOptions = {
  root: HTMLElement;
  viewport: HTMLElement;
  media: HTMLElement;
  setFrame: (frame: number) => void;
  count: number;
  mobile: boolean;
};

/**
 * The single scrubbed timeline of the stage. Its unit is the frame: 1 unit of duration = 1 frame
 * of footage, so every text cue is positioned by frame number and stays in sync with the canvas
 * in both scroll directions. ScrollTrigger maps the whole timeline onto the pinned scroll distance.
 */
function buildStageTimeline({ root, viewport, media, setFrame, count, mobile }: StageTimelineOptions) {
  const last = count - 1;
  const at = (frame: number) => frameTime(frame, count);
  const state = { frame: 0 };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: viewport,
      start: "top top",
      end: () => `+=${window.innerHeight * (mobile ? SCROLL_VH.mobile : SCROLL_VH.desktop)}`,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 1, // measure the pin first: every section below depends on its spacing
    },
  });

  (Object.keys(FRAMES) as (keyof typeof FRAMES)[]).forEach((name) => tl.addLabel(name, at(FRAMES[name])));

  // Frame index: a plain object tweened linearly; the canvas only redraws on a new integer.
  tl.to(state, { frame: last, duration: last, onUpdate: () => setFrame(state.frame) }, 0);

  // Background: darken the sides while the petals orbit, so the text columns stay readable.
  tl.fromTo("[data-stage-shade]", { opacity: 0 }, { opacity: 1, duration: FADE * 2 }, at(CUES.shade.in));
  tl.to("[data-stage-shade]", { opacity: 0.4, duration: FADE * 3 }, at(CUES.shade.out));

  // Text layers.
  tl.to("[data-beat='intro']", { opacity: 0, y: -32, duration: FADE, ease: "power1.in" }, at(CUES.intro.out));

  (["bloom", "heart", "trail", "finish"] as const).forEach((id) => {
    const cue: { in: number; out?: number } = CUES[id];
    const beat = `[data-beat='${id}']`;
    const title = root.querySelector(`${beat} h2`);
    const words = title ? SplitText.create(title, { type: "words", mask: "words" }).words : [];

    tl.fromTo(beat, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: FADE, ease: "power2.out" }, at(cue.in));
    if (words.length) {
      tl.from(words, { yPercent: 110, duration: FADE, stagger: 0.6, ease: "power3.out" }, at(cue.in));
    }
    if (cue.out !== undefined) {
      tl.to(beat, { opacity: 0, y: -32, duration: FADE, ease: "power1.in" }, at(cue.out));
    }
  });

  // The finish CTA must not be focusable while invisible: autoAlpha toggles visibility too.
  tl.fromTo("[data-beat='finish'] a", { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE }, at(CUES.finish.in));

  // Closing push-in on the bottle after the last frame, then the stage unpins.
  // Origin 50% 55% ≈ the middle of the bottle in the frame.
  tl.to(media, { scale: 1.12, transformOrigin: "50% 55%", duration: PUSH_IN, ease: "power1.inOut" }, last);

  return tl;
}

/** One-off entrance of the intro text, played when the first frames are ready. */
function buildIntroReveal() {
  const title = SplitText.create("[data-intro-title]", { type: "chars", mask: "chars" });
  return gsap
    .timeline({ paused: true })
    .from(title.chars, { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.07 })
    .from("[data-intro-fade]", { opacity: 0, y: 16, duration: 1, ease: "power2.out", stagger: 0.12 }, 0.35);
}

export function ScrollStage() {
  const { intro, bloom, heart, trail, finish } = stage;
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<CanvasSequenceHandle>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const readyRef = useRef(false);

  const [motionOk, setMotionOk] = useState(false);
  const [frameSet, setFrameSet] = useState<FrameSet>(desktopSet);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const count = frameSet.count;

  // Media preferences: animation on/off, and which frame set to stream.
  useEffect(() => {
    const motion = window.matchMedia(MOTION_QUERY);
    const portrait = window.matchMedia(MOBILE_PORTRAIT);
    const update = () => {
      setMotionOk(motion.matches);
      setFrameSet(portrait.matches && manifest.mobile ? manifest.mobile : desktopSet);
    };
    update();
    motion.addEventListener("change", update);
    portrait.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      portrait.removeEventListener("change", update);
    };
  }, []);

  const markReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    setReady(true);
  }, []);

  const onProgress = useCallback(
    (loaded: number, total: number) => {
      if (readyRef.current) return;
      const share = loaded / Math.max(1, Math.ceil(total * REVEAL_AT));
      setProgress(share);
      if (share >= 1) markReady();
    },
    [markReady],
  );

  // Safety net: unlock even if frames are slow or failing.
  useEffect(() => {
    if (!motionOk) return;
    const id = window.setTimeout(markReady, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [motionOk, markReady]);

  // Reveal: unlock scroll, play the intro, re-measure everything now that frames are drawn.
  useEffect(() => {
    if (!ready) return;
    lenisRef.current?.start();
    introRef.current?.play();
    ScrollTrigger.refresh();
  }, [ready]);

  useEffect(() => {
    // gsap.matchMedia is a gsap.context per media condition: everything created inside
    // (tweens, ScrollTriggers, pins, SplitText) is reverted on cleanup, which keeps Strict Mode safe.
    const mm = gsap.matchMedia(rootRef);
    let cancelled = false;

    // SplitText measures glyphs, so wait for the web fonts before building anything.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      mm.add({ motion: MOTION_QUERY, mobile: "(max-width: 768px)" }, (context) => {
        const { motion, mobile } = context.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return; // reduced motion: no Lenis, no pin, no scrub, static stacked layout

        const { lenis, destroy } = createLenis();
        lenisRef.current = lenis;

        introRef.current = buildIntroReveal();
        if (readyRef.current) introRef.current.play();
        else lenis.stop(); // hold scroll until the first frames are decoded

        buildStageTimeline({
          root: rootRef.current!,
          viewport: viewportRef.current!,
          media: mediaRef.current!,
          setFrame: (frame) => canvasRef.current?.setFrame(frame),
          count,
          mobile,
        });
        ScrollTrigger.refresh();

        return () => {
          destroy();
          lenisRef.current = null;
          introRef.current = null;
        };
      });
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, [count]);

  return (
    <section id="top" ref={rootRef} aria-labelledby="stage-title" className="relative">
      {motionOk && <Preloader progress={progress} done={ready} />}

      <div ref={viewportRef} className="relative overflow-hidden bg-prune motion-safe:h-svh">
        {/* Hero: always exactly one viewport tall. */}
        <div className="relative h-svh">
          <div ref={mediaRef} className="absolute inset-0">
            {/* LCP poster (first frame), swapped for the clean-bottle frame under reduced motion.
                Same cover fit and centre focal point as the canvas, so the hand-over is invisible. */}
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={frameSrc(STATIC_FRAME)} />
              <img
                src={frameSrc(1)}
                alt=""
                width={1920}
                height={1080}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </picture>
            {motionOk && (
              <CanvasSequence
                ref={canvasRef}
                set={frameSet}
                onProgress={onProgress}
                className="absolute inset-0 h-full w-full"
              />
            )}
          </div>
          <p className="sr-only">{stage.srDescription}</p>

          {/* Side shade, faded in on the timeline while the flowers orbit (desktop text columns). */}
          <div
            data-stage-shade
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden opacity-0 md:block bg-[linear-gradient(90deg,rgb(46_10_33/0.72)_0%,rgb(46_10_33/0.25)_30%,transparent_40%,transparent_60%,rgb(46_10_33/0.25)_70%,rgb(46_10_33/0.72)_100%)]"
          />

          {/* Stronger prune gradient at the bottom on mobile, where the text sits. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-prune via-prune/70 to-transparent md:hidden"
          />

          <Beat id="intro" className={INTRO_POSITION}>
            <p data-intro-fade className="label">
              {intro.label}
            </p>
            <h1
              id="stage-title"
              data-intro-title
              className="mt-3 font-display text-5xl leading-none tracking-[0.12em] text-creme md:mt-5 md:text-7xl lg:text-8xl"
            >
              {intro.title}
            </h1>
            <span data-intro-fade className="rule mt-7 hidden w-12 md:block" aria-hidden="true" />
            <p
              data-intro-fade
              className="mt-4 max-w-[22rem] text-base leading-relaxed text-creme/85 md:mt-6 md:text-lg"
            >
              {intro.text}
            </p>
            <p data-intro-fade className="label mt-6 !text-creme/70 motion-reduce:hidden md:mt-10">
              {intro.hint} <span aria-hidden="true">↓</span>
            </p>
          </Beat>
        </div>

        {/* Beats 2–5: overlays while pinned, stacked blocks under reduced motion. */}
        <div className="motion-safe:pointer-events-none motion-safe:absolute motion-safe:inset-0 motion-reduce:grid motion-reduce:gap-24 motion-reduce:px-6 motion-reduce:py-28 motion-reduce:md:grid-cols-2 motion-reduce:md:gap-x-[8vw] motion-reduce:md:px-[6vw] motion-reduce:md:py-40">
          <Beat id="bloom" className={`${BEAT_POSITION} ${SIDE.right}`}>
            <BeatHeading {...bloom} />
          </Beat>
          <Beat id="heart" className={`${BEAT_POSITION} ${SIDE.left}`}>
            <BeatHeading {...heart} />
          </Beat>
          <Beat id="trail" className={`${BEAT_POSITION} ${SIDE.right}`}>
            <BeatHeading {...trail} />
          </Beat>
          <Beat id="finish" className={`${BEAT_POSITION} ${SIDE.left}`}>
            <BeatHeading {...finish} />
            <a href={finish.cta.href} className="btn mt-9">
              {finish.cta.label}
            </a>
          </Beat>
        </div>
      </div>
    </section>
  );
}
