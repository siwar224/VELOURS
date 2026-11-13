"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { stage } from "@/content/site";
import framesJson from "@/data/frames.json";
import { FRAMES, SCROLL_VH, frameTime } from "@/lib/beats";
import { gsap, MOTION_QUERY } from "@/lib/gsap";
import { createLenis } from "@/lib/lenis";
import { CanvasSequence, type CanvasSequenceHandle, type FrameSet } from "./CanvasSequence";
import { frameSrc } from "./FrameCrop";

const desktopSet: FrameSet = framesJson;

type Side = "left" | "right";

/**
 * One text layer over the stage. Desktop: a column of at most ~28% of the viewport on one side,
 * so the bottle (centre ~15% of the frame) stays clear. Mobile: the bottom third.
 * A soft local prune gradient sits behind the text for contrast over the flowers.
 */
function Beat({ id, side, hidden, children }: { id: string; side: Side; hidden?: boolean; children: ReactNode }) {
  const position =
    side === "left"
      ? "md:left-[6vw] md:right-auto md:items-start md:text-left"
      : "md:right-[6vw] md:left-auto md:items-end md:text-right";
  return (
    <div
      data-beat={id}
      className={`absolute inset-x-6 bottom-[5svh] flex flex-col items-center text-center md:inset-x-auto md:top-1/2 md:bottom-auto md:w-[min(28vw,26rem)] md:-translate-y-1/2 ${position} ${hidden ? "opacity-0" : ""}`}
    >
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

export function ScrollStage() {
  const { intro, bloom, heart, trail, finish } = stage;
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<CanvasSequenceHandle>(null);
  const frameSet = desktopSet;
  const count = frameSet.count;

  useEffect(() => {
    // gsap.matchMedia is a gsap.context per media condition: everything created inside
    // (tweens, ScrollTriggers, pins) is reverted on cleanup, which keeps Strict Mode safe.
    const mm = gsap.matchMedia(rootRef);

    mm.add({ motion: MOTION_QUERY, mobile: "(max-width: 768px)" }, (context) => {
      const { motion, mobile } = context.conditions as { motion: boolean; mobile: boolean };
      if (!motion) return;

      const { destroy } = createLenis();

      // The timeline is measured in frames: 1 unit of duration = 1 frame of footage.
      // ScrollTrigger maps the whole timeline onto the pinned scroll distance.
      const last = count - 1;
      const at = (frame: number) => frameTime(frame, count);
      const state = { frame: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: viewportRef.current,
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
      tl.to(state, { frame: last, duration: last, onUpdate: () => canvasRef.current?.setFrame(state.frame) }, 0);

      return () => destroy();
    });

    return () => mm.revert();
  }, [count]);

  return (
    <section id="top" ref={rootRef} aria-labelledby="stage-title" className="relative">
      <div ref={viewportRef} className="relative h-svh overflow-hidden bg-prune">
        <div ref={mediaRef} className="absolute inset-0">
          {/* LCP poster: first frame, cover-fit around the centre like the canvas. */}
          <Image
            src={frameSrc(1)}
            alt=""
            aria-hidden="true"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          <CanvasSequence ref={canvasRef} set={frameSet} className="absolute inset-0 h-full w-full" />
        </div>
        <p className="sr-only">{stage.srDescription}</p>

        {/* Stronger prune gradient at the bottom on mobile, where the text sits. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-prune via-prune/70 to-transparent md:hidden"
        />

        <Beat id="intro" side="left">
          <p className="label">{intro.label}</p>
          <h1
            id="stage-title"
            className="mt-3 font-display text-5xl leading-none tracking-[0.12em] text-creme md:mt-5 md:text-7xl lg:text-8xl"
          >
            {intro.title}
          </h1>
          <span className="rule mt-7 hidden w-12 md:block" aria-hidden="true" />
          <p className="mt-4 max-w-[22rem] text-base leading-relaxed text-creme/85 md:mt-6 md:text-lg">{intro.text}</p>
          <p className="label mt-6 !text-creme/70 md:mt-10">
            {intro.hint} <span aria-hidden="true">↓</span>
          </p>
        </Beat>

        <Beat id="bloom" side="right" hidden>
          <BeatHeading {...bloom} />
        </Beat>
        <Beat id="heart" side="left" hidden>
          <BeatHeading {...heart} />
        </Beat>
        <Beat id="trail" side="right" hidden>
          <BeatHeading {...trail} />
        </Beat>
        <Beat id="finish" side="left" hidden>
          <BeatHeading {...finish} />
          <a href={finish.cta.href} className="btn mt-9">
            {finish.cta.label}
          </a>
        </Beat>
      </div>
    </section>
  );
}
