"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from "react";

export type FrameSet = { count: number; pattern: string; pad: number };

export type CanvasSequenceHandle = {
  /** Show frame `index` (0-based, may be fractional; it is rounded). */
  setFrame: (index: number) => void;
};

type CanvasSequenceProps = {
  set: FrameSet;
  /** Point of the frame kept in view when the viewport crops it (0–1). */
  focalX?: number;
  focalY?: number;
  onProgress?: (loaded: number, total: number) => void;
  className?: string;
  ref?: Ref<CanvasSequenceHandle>;
};

const PRIORITY_FRAMES = 30; // loaded immediately, in parallel
const BATCH = 8; // background batch size for the rest

const frameUrl = (set: FrameSet, index: number) =>
  set.pattern.replace("{n}", String(index + 1).padStart(set.pad, "0"));

// requestIdleCallback with a setTimeout fallback (Safari has no requestIdleCallback).
const whenIdle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 500 });
  else setTimeout(cb, 16);
};

/** Owns the canvas and frame loading. The scroll timeline (ScrollStage) only calls `setFrame`. */
export function CanvasSequence({ set, focalX = 0.5, focalY = 0.5, onProgress, className, ref }: CanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const targetRef = useRef(0); // frame the timeline asked for
  const drawnRef = useRef(-1); // frame actually on the canvas (may be a stand-in)
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  // Draws the requested frame, or the nearest loaded one if the user scrolled ahead of the loader.
  // drawImage only runs when the frame to show actually changes.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const frames = framesRef.current;
    if (!canvas || !ctx || canvas.width === 0) return;

    const target = targetRef.current;
    let index = -1;
    for (let d = 0; d < frames.length; d++) {
      if (frames[target - d]) { index = target - d; break; } // prefer the earlier frame
      if (frames[target + d]) { index = target + d; break; }
    }
    if (index < 0 || index === drawnRef.current) return;

    const img = frames[index]!;
    const cw = canvas.width;
    const ch = canvas.height;
    // Cover fit: scale until both sides are filled, then place the focal point at the centre,
    // clamped so no empty edge shows. On portrait screens this crops the sides first.
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = Math.min(0, Math.max(cw - dw, cw / 2 - focalX * dw));
    const dy = Math.min(0, Math.max(ch - dh, ch / 2 - focalY * dh));
    ctx.drawImage(img, dx, dy, dw, dh);
    drawnRef.current = index;
  }, [focalX, focalY]);

  useImperativeHandle(
    ref,
    () => ({
      setFrame(index: number) {
        const next = Math.min(set.count - 1, Math.max(0, Math.round(index)));
        if (next === targetRef.current && next === drawnRef.current) return;
        targetRef.current = next;
        draw();
      },
    }),
    [draw, set.count],
  );

  // Canvas size = CSS size × devicePixelRatio (capped at 2). Redraw after every resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.imageSmoothingQuality = "high";
      drawnRef.current = -1;
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, [draw]);

  // Preload: the first frames at once, the rest in idle-time batches.
  useEffect(() => {
    let cancelled = false;
    const frames: (HTMLImageElement | null)[] = new Array(set.count).fill(null);
    framesRef.current = frames;
    drawnRef.current = -1;
    let loaded = 0;

    const load = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(set, index);
        img
          .decode()
          .then(() => {
            if (cancelled) return;
            frames[index] = img;
            loaded += 1;
            onProgressRef.current?.(loaded, set.count);
            draw(); // no-op unless this frame is closer to the target than what is shown
          })
          .catch(() => {
            /* a missing frame is skipped; the nearest loaded one is drawn instead */
          })
          .finally(resolve);
      });

    const run = async () => {
      const first = Math.min(PRIORITY_FRAMES, set.count);
      await Promise.all(Array.from({ length: first }, (_, i) => load(i)));
      for (let start = first; start < set.count && !cancelled; start += BATCH) {
        await new Promise<void>((resolve) => whenIdle(resolve));
        if (cancelled) return;
        const end = Math.min(start + BATCH, set.count);
        await Promise.all(Array.from({ length: end - start }, (_, i) => load(start + i)));
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [set, draw]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
