import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { Reveal } from "@/components/reveal";
import { Skills } from "@/components/skills";

export default function Home() {
  return (
    <>
      <Reveal />
      <Hero />
      {/* Work and Skills share one static wash between them rather than each
          carrying its own animated blobs. It is the same decoration appearing
          twice, and this page already runs a shader in the hero and two canvases
          in the contact section. `relative` is load-bearing: the wash is
          absolutely positioned, and the sections above and below it are too, so
          this wrapper is what keeps the wash from stretching to the page. */}
      <div className="relative">
        <div aria-hidden className="section-wash" />
        <Projects />
        <Skills />
      </div>
      <Contact />
    </>
  );
}
