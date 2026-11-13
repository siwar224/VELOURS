import { Nav } from "@/components/Nav";
import { ScrollStage } from "@/components/ScrollStage";
import { Notes } from "@/components/Notes";
import { Story } from "@/components/Story";
import { Collection } from "@/components/Collection";
import { Boutique } from "@/components/Boutique";
import { GrainOverlay } from "@/components/GrainOverlay";

export default function Home() {
  return (
    <>
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
