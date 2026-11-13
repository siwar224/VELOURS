"use client";

import { stage } from "@/content/site";

type PreloaderProps = {
  /** 0–1, relative to the reveal threshold (not to the whole sequence). */
  progress: number;
  done: boolean;
};

// A thin champagne line along the top edge. The poster frame stays visible underneath (it is the LCP).
// Always mounted (never conditionally inserted next to the GSAP-pinned stage); hidden under reduced motion.
export function Preloader({ progress, done }: PreloaderProps) {
  const percent = Math.round(Math.min(1, progress) * 100);
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] transition-opacity duration-700 motion-reduce:hidden ${done ? "opacity-0" : "opacity-100"}`}
      aria-hidden={done}
    >
      <div
        role="progressbar"
        aria-label={stage.loading}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-px w-full bg-champagne/15"
      >
        <div
          className="h-full w-full origin-left bg-champagne transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
    </div>
  );
}
