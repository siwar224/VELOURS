import { Nav } from "@/components/Nav";
import { ScrollStage } from "@/components/ScrollStage";
import { Notes } from "@/components/Notes";
import { Story } from "@/components/Story";
import { Collection } from "@/components/Collection";
import { Boutique } from "@/components/Boutique";
import { GrainOverlay } from "@/components/GrainOverlay";
import { stage } from "@/content/site";

export default function Home() {
  return (
    <>
      {/* Keyboard users can jump past the long pinned animation. */}
      <a
        href="#notes"
        className="btn sr-only !bg-prune focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80]"
      >
        {stage.skipLink}
      </a>
      <Nav />
      <main>
        <ScrollStage />
        <Notes />
        <Story />
        <Collection />
      </main>
      <Boutique />
      <GrainOverlay />
    </>
  );
}
