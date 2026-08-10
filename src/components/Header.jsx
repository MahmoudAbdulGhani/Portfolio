import { useState, useEffect } from "react";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Technologies", href: "#technologies" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Intersection Observer to highlight active navigation markers dynamically
  useEffect(() => {
    const handleObserver = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "-40% 0px -50% 0px", // Triggers near view center
    });

    [...navLinks, { href: "#hireme" }].forEach((link) => {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    });

    const heroEl = document.querySelector("#hero");
    if (heroEl) observer.observe(heroEl);

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-bg-dark/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-3 group select-none">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-accent-gold/35 bg-accent-gold/10 text-sm font-extrabold text-accent-gold">
            MHA
          </div>
          <div className="hidden sm:block">
            <span className="block font-display text-sm font-bold text-white">Mahmoud Hussein Abdul Ghani</span>
            <span className="text-xs text-text-secondary">Junior Full-Stack Software Engineer</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                activeSection === link.href.replace("#", "")
                  ? "bg-white/10 text-white"
                  : "text-text-secondary hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#hireme"
            className="rounded-md bg-accent-gold px-4 py-2 text-sm font-extrabold text-bg-dark hover:bg-white transition-colors"
          >
            Hire Me
          </a>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-text-primary focus:outline-none p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors"
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between relative">
            <span className={`h-[2px] w-full bg-white rounded transition-all duration-300 origin-left ${isOpen ? "rotate-45 translate-x-1" : ""}`} />
            <span className={`h-[2px] w-full bg-white rounded transition-opacity duration-200 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-full bg-white rounded transition-all duration-300 origin-left ${isOpen ? "-rotate-45 translate-x-1" : ""}`} />
          </div>
        </button>
      </div>

      <div className={`absolute top-20 left-0 w-full bg-card-dark/95 backdrop-blur-lg border-b border-white/10 transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
      }`}>
        <div className="flex flex-col p-6 gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-lg py-2 transition-colors border-b border-white/[0.02] ${
                activeSection === link.href.replace("#", "") ? "text-accent-blue font-semibold" : "text-text-secondary hover:text-white"
              }`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#hireme"
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-3 mt-2 rounded-lg bg-accent-gold text-bg-dark font-extrabold text-sm tracking-wide"
          >
            Hire Me
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
