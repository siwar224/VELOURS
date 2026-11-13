"use client";

import { useEffect, useRef } from "react";
import { collection, type ProductVariant } from "@/content/site";
import { gsap, MOTION_QUERY } from "@/lib/gsap";
import { FrameCrop } from "./FrameCrop";

/*
 * PLACEHOLDER PRODUCTS.
 * All three cards reuse one crop of frame f_0001 (the bottle). Each "variant" is only a CSS
 * filter on that crop plus its own gradient backdrop; no new imagery exists for these products.
 */
const variants: Record<ProductVariant, { filter: string; backdrop: string }> = {
  rose: {
    filter: "none",
    backdrop: "radial-gradient(ellipse at 50% 40%, #7a2a52 0%, #3d0f2c 55%, #1a0513 100%)",
  },
  pivoine: {
    filter: "hue-rotate(-22deg) saturate(1.35) brightness(0.82)",
    backdrop: "radial-gradient(ellipse at 50% 40%, #6b1f2e 0%, #33091a 55%, #1a0513 100%)",
  },
  violette: {
    filter: "hue-rotate(-58deg) saturate(0.85) brightness(0.95)",
    backdrop: "radial-gradient(ellipse at 50% 40%, #4c2a6b 0%, #26113a 55%, #1a0513 100%)",
  },
};

export function Collection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add(MOTION_QUERY, () => {
      // Cream-to-dark: the prune panel slides up over the end of the Story section.
      gsap.from(ref.current, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 40%", scrub: true },
      });
      gsap.from("[data-rule]", {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 1.4,
        ease: "power3.inOut",
        scrollTrigger: { trigger: "[data-rule]", start: "top 85%" },
      });
      gsap.from("[data-reveal]", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: "[data-reveal-group]", start: "top 80%" },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="collection"
      ref={ref}
      aria-labelledby="collection-title"
      className="relative z-10 bg-prune px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">{collection.label}</p>
            <h2 id="collection-title" className="mt-6 font-display text-5xl leading-[1.02] text-creme md:text-7xl">
              {collection.title}
            </h2>
          </div>
        </header>
        <span data-rule className="rule mt-14" aria-hidden="true" />

        <ul data-reveal-group className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {collection.products.map((product) => {
            const v = variants[product.variant];
            return (
              <li key={product.name} data-reveal className="flex flex-col border border-champagne/25">
                <div style={{ background: v.backdrop }}>
                  <FrameCrop
                    frame={1}
                    focusX={50}
                    focusY={52}
                    zoom={2.1}
                    alt={`${product.name} bottle`}
                    className="aspect-[4/5] w-full mix-blend-screen"
                    imageStyle={{ filter: v.filter }}
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-3xl text-creme">{product.name}</h3>
                  <p className="mt-3 leading-relaxed text-creme/75">{product.descriptor}</p>
                  <div className="mt-8 flex items-baseline justify-between border-t border-champagne/25 pt-5">
                    <p className="label">{product.size}</p>
                    <p className="font-display text-2xl text-creme">{product.price}</p>
                  </div>
                  {/* Non-functional: there is no shop behind this placeholder. */}
                  <button type="button" className="btn mt-7 self-start">
                    {collection.cta}
                    <span className="sr-only"> {product.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
