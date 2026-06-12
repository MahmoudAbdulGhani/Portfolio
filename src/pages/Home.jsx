import Hero from "../sections/Hero";
import About from "../sections/About";
import Technologies from "../sections/Technologies";
import Skills from "../sections/Skills";
import Projects from "../sections/Projects";
import HireMe from "../sections/HireMe";
import Contact from "../sections/Contact";

const Home = () => {
  return (
    <main>
      <Hero />
      <About />
      <Technologies />
      <Skills />
      <Projects />
      <HireMe />
      <Contact />
    </main>
  );
};

export default Home;