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

/** Scroll distance of the pinned stage, in viewport heights. */
export const SCROLL_VH = { desktop: 4.25, mobile: 3 } as const;

/** Extra timeline length (in frame units) for the closing push-in after the last frame. */
export const PUSH_IN = 28;

/** Converts a 1-based frame number to a timeline position (0-based index), clamped to the set. */
export function frameTime(frame: number, count: number) {
  return Math.min(Math.max(frame - 1, 0), count - 1);
}
