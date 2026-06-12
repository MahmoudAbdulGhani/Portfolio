const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card-dark/20 border-t border-white/5 py-10 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-text-secondary">
        
        {/* Left Side */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="text-text-primary font-bold tracking-tight font-sans text-sm">Mahmoud Hussein Abdul Ghani</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="text-text-secondary/60">© {currentYear} // All Systems Maintained.</span>
        </div>

        {/* Right Side */}
        <div className="flex flex-wrap justify-center items-center gap-6">
          <a 
            href="tel:+96176364340" 
            className="hover:text-accent-blue transition-colors flex items-center gap-2 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue/40 group-hover:bg-accent-blue transition-colors" />
            <span>TEL // +961 76 364 340</span>
          </a>
          
          <a 
            href="https://github.com/MahmoudAbdulGhani" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            GITHUB
          </a>

          <a 
            href="https://linkedin.com/in/MahmoudAbdulGhani" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-accent-purple transition-colors flex items-center gap-1"
          >
            LINKEDIN
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;