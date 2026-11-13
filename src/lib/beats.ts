// Story beats of the frame sequence, as 1-based frame numbers of the current desktop footage
// (checked by eye on frames 1, 24, 36, 60, 80, 96, 120, 156, 176, 192).
// The frame COUNT comes from src/data/frames.json; only these narrative points are fixed here.
export const FRAMES = {
  calm: 1, // calm bottle, pink light streak
  bloom: 22, // flowers appear inside the glass, then burst out
  peak: 36, // wide orbit of petals around the bottle
  spiral: 96, // petals spiral into a gold sparkle trail
  mist: 108, // rose-gold mist wraps bottle and pedestal
  clear: 150, // mist spreads and clears (still visible around 156–176)
  glint: 170, // clean bottle, glint of light
} as const;

/**
 * Text blocks scroll with the page over the sticky canvas. Each value is the frame shown at the
 * moment that block crosses its resting line (viewport centre on desktop, lower third on mobile).
 */
export const TEXT_AT = {
  bloom: 42, // flowers have burst out
  heart: 78, // peak of the orbit: rose, peony, violet
  trail: 128, // mist around the bottle
  finish: 178, // clean bottle, glint
} as const;

/** Side darkening behind the text columns while the petals orbit (frames). */
export const SHADE = { in: FRAMES.peak - 8, out: FRAMES.clear } as const;

/** Clean bottle, no flowers: the static hero for prefers-reduced-motion. */
export const STATIC_FRAME = 176;

/** Share of the sequence that must be decoded before the stage is revealed and scroll unlocks. */
export const REVEAL_AT = 0.3;

/** Extra timeline length (in frame units) for the closing push-in after the last frame. */
export const PUSH_IN = 28;

/** Converts a 1-based frame number to a timeline position (0-based index), clamped to the set. */
export function frameTime(frame: number, count: number) {
  return Math.min(Math.max(frame - 1, 0), count - 1);
}

/** Scroll progress (0–1) through the stage at which `frame` is on screen. */
export function frameProgress(frame: number, count: number) {
  return frameTime(frame, count) / (count - 1 + PUSH_IN);
}
