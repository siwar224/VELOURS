import { notes } from "@/content/site";
import { FrameCrop } from "./FrameCrop";

// Detail crops of existing frames: focus points are in % of the 1920×1080 frame.
const crops = [
  { frame: 80, focusX: 67, focusY: 56, zoom: 3.2, alt: "A cluster of pink peppercorns in mid-air" }, // Top
  { frame: 60, focusX: 29, focusY: 23, zoom: 3, alt: "A deep red rose in full bloom" }, // Heart
  { frame: 80, focusX: 81, focusY: 49, zoom: 3, alt: "A warm trail of gold sparkles" }, // Base
] as const;

export function Notes() {
  return (
    <section id="notes" aria-labelledby="notes-title" className="bg-bordeaux px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <header className="mx-auto max-w-2xl text-center">
          <p className="label">{notes.label}</p>
          <h2 id="notes-title" className="mt-6 font-display text-5xl leading-[1.02] text-creme md:text-7xl">
            {notes.title}
          </h2>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-creme/80">{notes.intro}</p>
        </header>

        <ol className="mt-20 grid gap-14 md:mt-28 md:grid-cols-3 md:gap-0">
          {notes.tiers.map((tier, i) => (
            <li
              key={tier.label}
              className="md:border-l md:border-champagne/35 md:px-10 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
            >
              <FrameCrop {...crops[i]} className="aspect-[4/5] w-full" />
              <span className="rule mt-10" aria-hidden="true" />
              <div className="mt-6 flex items-baseline justify-between gap-4">
                <p className="label">{tier.label}</p>
                <p className="label !text-creme/50" aria-hidden="true">
                  0{i + 1}
                </p>
              </div>
              <h3 className="mt-5 font-display text-3xl text-creme md:text-4xl">{tier.title}</h3>
              <p className="mt-4 font-display text-xl italic text-champagne">{tier.notes.join(" · ")}</p>
              <p className="mt-5 leading-relaxed text-creme/80">{tier.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
