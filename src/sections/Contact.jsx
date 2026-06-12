const Contact = () => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-bg-dark border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-8 relative z-10">
        
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto pt-4">
          
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

          {/* INSTANT WHATSAPP CARD */}
          <a
            href="https://wa.me/96176364340?text=System%20Initialize%20//%20Inquiry%20regarding%20Software%20Engineering%20Services"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl bg-card-dark border border-white/5 hover:border-emerald-500/30 group transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-36"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9m-9 3.75h9m-9-7.5h3m-3 11.25H18a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0018 3H6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 21h1.5m10.5-18v18" />
              </svg>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-emerald-400 tracking-widest mb-1">
                LIVE_CHAT // WHATSAPP
              </div>
              <div className="text-text-primary font-semibold text-base tracking-wide group-hover:text-emerald-400 transition-colors">
                Open Messenger Engine
              </div>
            </div>
            <div className="text-text-secondary/60 text-[11px] mt-2 flex items-center gap-1">
              <span>Launch instant secure thread</span>
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

          {/* INSTAGRAM SOCIAL CARD */}
          <a
            href="https://www.instagram.com/mahmoud_abdulghani2?igsh=bHlpMnk0ZTIwMGV6"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl bg-card-dark border border-white/5 hover:border-amber-500/30 group transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-36"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-amber-500 tracking-widest mb-1">
                SOCIAL // INSTAGRAM
              </div>
              <div className="text-text-primary font-semibold text-base group-hover:text-amber-500 transition-colors">
                @mahmoud_abdulghani2
              </div>
            </div>
            <div className="text-text-secondary/60 text-[11px] mt-2 flex items-center gap-1">
              <span>View social infrastructure</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
};

export default Contact;