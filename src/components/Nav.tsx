"use client";

import { useEffect, useState } from "react";
import { brand, nav } from "@/content/site";
import { ScrollTrigger } from "@/lib/gsap";

// Transparent over the stage; a blurred prune bar once the stage has scrolled past.
export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#top",
      start: "bottom top+=80", // the stage's bottom edge reaches the bar
      end: "max",
      refreshPriority: -1, // measured after the stage's own triggers
      onToggle: (self) => setSolid(self.isActive),
    });
    return () => trigger.kill();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid ? "border-champagne/15 bg-prune/80 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-6 px-6 md:px-10"
      >
        <a
          href="#top"
          className="font-display text-lg tracking-[var(--tracking-wordmark)] text-creme md:text-xl"
          aria-label={`${brand.name}, back to top`}
        >
          {brand.name}
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="label !text-creme/80 transition-colors duration-300 hover:!text-champagne"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href={nav.cta.href} className="btn !px-5 !py-2.5">
          {nav.cta.label}
        </a>
      </nav>
    </header>
  );
}
