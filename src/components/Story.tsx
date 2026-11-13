"use client";

import { useEffect, useRef } from "react";
import { story } from "@/content/site";
import { gsap, MOTION_QUERY } from "@/lib/gsap";

export function Story() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add(MOTION_QUERY, () => {
      // Dark-to-cream wipe: the cream panel is unclipped from its top edge down as it scrolls in,
      // so the dark page background gives way to cream.
      gsap.fromTo(
        ref.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 90%", end: "top 15%", scrub: true },
        },
      );
      gsap.from("[data-reveal]", {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 45%" },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="story"
      ref={ref}
      aria-labelledby="story-title"
      className="bg-creme px-6 py-28 text-prune md:px-10 md:py-40"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-2 md:gap-24">
        <div data-reveal>
          <p className="label !text-bordeaux">{story.label}</p>
          <h2 id="story-title" className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
            {story.title}
          </h2>
        </div>
        <div data-reveal className="md:pt-14">
          {story.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mb-6 text-lg leading-relaxed text-prune/85 md:text-xl">
              {p}
            </p>
          ))}
          <span className="mt-10 block h-px w-16 bg-bordeaux/50" aria-hidden="true" />
          <p className="mt-6 font-display text-xl italic text-bordeaux">{story.signature}</p>
        </div>
      </div>
    </section>
  );
}
