import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Smooth scroll driven by GSAP's ticker, so Lenis and ScrollTrigger share one clock
 * and scrubbed animations never lag a frame behind the scroll position.
 */
export function createLenis() {
  const lenis = new Lenis({ autoRaf: false, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000); // ticker time is in seconds
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy() {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP default
      lenis.destroy();
    },
  };
}
