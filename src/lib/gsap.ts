// Single place where GSAP plugins are registered. Import gsap from here, never from "gsap" directly.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Mobile URL bars resize the viewport while scrolling; do not refresh (and jump) on that.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Animations only run when this matches; otherwise the page is a static, stacked layout. */
export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText };
