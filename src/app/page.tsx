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
      {/* The glows are clipped to this wrapper and masked at both ends, so the
          colour fades in under the hero's aurora and back out before the
          contact section instead of ending on a hard horizontal seam. The
          sections above and below are position-relative, so they stay above
          this layer on the paint order. */}
      <div className="relative">
        <div aria-hidden className="work-glows">
          <span className="work-glow work-glow--a" />
          <span className="work-glow work-glow--b" />
          <span className="work-glow work-glow--c" />
        </div>
        <Projects />
        <Skills />
      </div>
      <Contact />
    </>
  );
}
