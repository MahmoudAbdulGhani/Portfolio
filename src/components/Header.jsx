import { useState, useEffect } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Keep these as your main scrolling nav links
  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Technologies", href: "#technologies" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

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

    // Track all standard links + the explicit hireme anchor
    [...navLinks, { href: "#hireme" }].forEach((link) => {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    });

    const heroEl = document.querySelector("#hero");
    if (heroEl) observer.observe(heroEl);

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-bg-dark/80 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* MHA LOGO */}
        <a href="#hero" className="flex items-center gap-3 group select-none">
          <div className="relative flex items-center justify-center">
            <span className="font-mono text-accent-blue font-bold text-lg transition-transform duration-300 group-hover:-translate-x-1">{"["}</span>
            <span className="font-display font-extrabold text-xl tracking-wider text-white px-1 bg-gradient-to-r from-white via-text-primary to-accent-blue bg-clip-text">
              MHA
            </span>
            <span className="font-mono text-accent-purple font-bold text-lg transition-transform duration-300 group-hover:translate-x-1">{"]"}</span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_#38bdf8]" />
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          <span className="hidden sm:block font-mono text-[10px] tracking-widest text-text-secondary uppercase">
            Core // System
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 relative group py-2 ${
                activeSection === link.href.replace("#", "")
                  ? "text-accent-blue"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-accent-blue transition-all duration-300 ${
                activeSection === link.href.replace("#", "") ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </a>
          ))}
          {/* CHANGED: Points directly to #hireme section now */}
          <a
            href="#hireme"
            className="px-5 py-2.5 rounded-xl border border-accent-blue/30 bg-accent-blue/10 text-accent-blue text-sm font-semibold hover:bg-accent-blue hover:text-bg-dark transition-all duration-300 shadow-[0_0_15px_rgba(56,189,248,0.1)] hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-text-primary focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between relative">
            <span className={`h-[2px] w-full bg-white rounded transition-all duration-300 origin-left ${isOpen ? "rotate-45 translate-x-1" : ""}`} />
            <span className={`h-[2px] w-full bg-white rounded transition-opacity duration-200 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-full bg-white rounded transition-all duration-300 origin-left ${isOpen ? "-rotate-45 translate-x-1" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`absolute top-20 left-0 w-full bg-card-dark/95 backdrop-blur-lg border-b border-white/5 transition-all duration-300 ease-in-out md:hidden ${
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
          {/* CHANGED: Points directly to #hireme section on mobile */}
          <a
            href="#hireme"
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-3 mt-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-bg-dark font-bold text-sm tracking-wide shadow-lg"
          >
            Hire Me
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;