import { story } from "@/content/site";

// The dark-to-cream clip-path wipe is added in block (d).
export function Story() {
  return (
    <section id="story" aria-labelledby="story-title" className="bg-creme px-6 py-28 text-prune md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-2 md:gap-24">
        <div>
          <p className="label !text-bordeaux">{story.label}</p>
          <h2 id="story-title" className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
            {story.title}
          </h2>
        </div>
        <div className="md:pt-14">
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
