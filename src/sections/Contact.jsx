const Contact = () => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-bg-dark border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/5 border border-accent-purple/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-accent-purple uppercase">COMMS_ROUTING // INBOUND</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Establish Connection</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Ready to discuss junior engineering roles, full-stack projects, or scalable cloud development pipelines.
          </p>
        </div>

        {/* Communications Grid Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
          
          {/* DIRECT PHONE CARD */}
          <a
            href="tel:+96176364340"
            className="p-6 rounded-xl bg-card-dark border border-white/5 hover:border-accent-blue/30 group transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-36"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25V16.5a2.25 2.25 0 00-2.25-2.25h-1.35c-.48 0-.963.243-1.183.68l-1.194 2.388c-2.433-.617-4.57-2.754-5.187-5.187l2.387-1.194c.44-.22.68-.703.68-1.183V5.25A2.25 2.25 0 0014.25 3h-2.25A2.25 2.25 0 009 5.25v2.303a24.17 24.17 0 01-2.4 2.122 24.186 24.186 0 01-2.122 2.4H2.25z" />
              </svg>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-accent-blue tracking-widest mb-1">
                SECURE_TEL // DIRECT
              </div>
              <div className="text-text-primary font-semibold text-base tracking-wide group-hover:text-accent-blue transition-colors">
                +961 76 364 340
              </div>
            </div>
            <div className="text-text-secondary/60 text-[11px] mt-2 flex items-center gap-1">
              <span>Initiate voice routing channel</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </a>

          {/* EMAIL CARD */}
          <a
            href="mailto:Mahmoud.Abdulghani@outlook.com"
            className="p-6 rounded-xl bg-card-dark border border-white/5 hover:border-accent-purple/30 group transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-36"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-accent-purple tracking-widest mb-1">
                SMTP_MAIL // PRIMARY
              </div>
              <div className="text-text-primary font-semibold text-sm group-hover:text-accent-purple transition-colors break-all">
                Mahmoud.Abdulghani@outlook.com
              </div>
            </div>
            <div className="text-text-secondary/60 text-[11px] mt-2 flex items-center gap-1">
              <span>Launch default mail client</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </a>

          {/* GITHUB SOURCE REPOSITORY CARD */}
          <a
            href="https://github.com/MahmoudAbdulGhani"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl bg-card-dark border border-white/5 hover:border-white/20 group transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-36"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-text-secondary tracking-widest mb-1">
                REPOSITORY // PUBLIC_REPOS
              </div>
              <div className="text-text-primary font-semibold text-base group-hover:text-white transition-colors">
                github.com/MahmoudAbdulGhani
              </div>
            </div>
            <div className="text-text-secondary/60 text-[11px] mt-2 flex items-center gap-1">
              <span>Review full source logs</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </a>

          {/* LINKEDIN PROFILE CARD */}
          <a
            href="https://linkedin.com/in/MahmoudAbdulGhani"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl bg-card-dark border border-white/5 hover:border-accent-blue/30 group transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-36"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="font-mono text-4xl font-bold text-white select-none">in</span>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-accent-blue tracking-widest mb-1">
                NETWORKING // LINKEDIN
              </div>
              <div className="text-text-primary font-semibold text-base group-hover:text-accent-blue transition-colors">
                linkedin.com/in/MahmoudAbdulGhani
              </div>
            </div>
            <div className="text-text-secondary/60 text-[11px] mt-2 flex items-center gap-1">
              <span>Connect for job outreach</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
};

export default Contact;