const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-bg-dark py-10 text-sm">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-text-secondary">
        <div className="text-center md:text-left">
          <span className="block font-display font-bold text-text-primary">Mahmoud Hussein Abdul Ghani</span>
          <span className="text-xs">© {currentYear} Portfolio built around Mahmoud's engineering work.</span>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <a href="tel:+96176364340" className="rounded-lg border border-white/10 px-3 py-2 hover:border-accent-blue/40 hover:text-accent-blue transition-colors">
            +961 76 364 340
          </a>

          <a
            href="https://github.com/MahmoudAbdulGhani"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-3 py-2 hover:border-white/25 hover:text-white transition-colors"
          >
            GitHub
          </a>

          <a
            href="https://linkedin.com/in/MahmoudAbdulGhani"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-3 py-2 hover:border-accent-blue/40 hover:text-accent-blue transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
