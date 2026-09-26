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
      <Projects />
      <Skills />
      <Contact />
    </>
  );
}
