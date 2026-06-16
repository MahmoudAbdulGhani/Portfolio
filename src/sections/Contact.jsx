const contactLinks = [
  {
    label: "Phone",
    value: "+961 76 364 340",
    helper: "Call directly",
    href: "tel:+96176364340",
    tone: "text-accent-blue",
  },
  {
    label: "WhatsApp",
    value: "Open Messenger",
    helper: "Start a quick message",
    href: "https://wa.me/96176364340?text=Hello%20Mahmoud%2C%20I%20saw%20your%20portfolio.",
    tone: "text-accent-green",
  },
  {
    label: "Email",
    value: "Mahmoud.Abdulghani@outlook.com",
    helper: "Send a role or project note",
    href: "mailto:Mahmoud.Abdulghani@outlook.com",
    tone: "text-accent-purple",
  },
  {
    label: "GitHub",
    value: "github.com/MahmoudAbdulGhani",
    helper: "Review source code",
    href: "https://github.com/MahmoudAbdulGhani",
    tone: "text-white",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/MahmoudAbdulGhani",
    helper: "Connect professionally",
    href: "https://linkedin.com/in/MahmoudAbdulGhani",
    tone: "text-accent-blue",
  },
  {
    label: "Instagram",
    value: "@mahmoud_abdulghani2",
    helper: "View personal profile",
    href: "https://www.instagram.com/mahmoud_abdulghani2?igsh=bHlpMnk0ZTIwMGV6",
    tone: "text-accent-gold",
  },
];

const Contact = () => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden section-panel">
      <div className="max-w-6xl mx-auto px-6 space-y-10 relative z-10">
        <div className="space-y-3 text-center">
          <div className="section-label mx-auto">Contact Mahmoud</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Start a real conversation</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Reach out for junior software engineering roles, full-stack projects, internships, or collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex h-36 flex-col justify-between rounded-lg border border-white/10 bg-card-dark/75 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent-gold/35 hover:bg-white/[0.035]"
            >
              <div>
                <div className={`mb-2 text-xs font-extrabold uppercase tracking-wider ${item.tone}`}>
                  {item.label}
                </div>
                <div className="break-words text-base font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                  {item.value}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>{item.helper}</span>
                <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
