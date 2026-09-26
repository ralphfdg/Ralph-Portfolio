import { About } from "@/components/about";
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
          twice, and this page already runs a shader in the hero, one band in
          About and a dot grid in the contact section. `relative` is
          load-bearing: the wash is absolutely positioned, and the sections
          above and below it are too, so this wrapper is what keeps the wash
          from stretching to the page.

          The wash stops here on purpose. About has its own animated band, and
          stacking a static gradient under a moving one in the same section is
          two effects competing rather than one composing. */}
      <div className="relative">
        <div aria-hidden className="section-wash" />
        <Projects />
        <Skills />
      </div>
      <About />
      <Contact />
    </>
  );
}
