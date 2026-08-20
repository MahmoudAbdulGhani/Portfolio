import { Link } from "react-router-dom";
import { FiGithub, FiInstagram, FiLinkedin, FiMessageCircle } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useProfile, useSiteSection } from "../lib/hooks";
import { Logo } from "./Logo";

const socialIcons: Record<string, IconType> = {
  github: FiGithub,
  linkedin: FiLinkedin,
  instagram: FiInstagram,
  whatsapp: FiMessageCircle,
};

export function Footer() {
  const { data: profile } = useProfile();
  const { data: section } = useSiteSection("footer");
  const year = new Date().getFullYear();
  const socials = profile?.socials.filter((social) => social.showInFooter !== false) ?? [];
  const technologyText = typeof section?.content.technologyText === "string" ? section.content.technologyText : "";
  const copyrightSuffix = typeof section?.content.copyrightSuffix === "string" ? section.content.copyrightSuffix : "";

  return (
    <footer className="border-t border-line bg-bg-soft">
      <div className="container-x py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {section?.description}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/projects", label: "Projects" },
              { to: "/contact", label: "Contact" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-semibold text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {socials.map((s) => {
              const Icon = socialIcons[s.label.toLowerCase()] ?? FiGithub;
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="btn-icon border border-line bg-surface text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row">
          <p>© {year} {profile?.name}. {copyrightSuffix}</p>
          <p className="font-mono">
            {technologyText}
          </p>
        </div>
      </div>
    </footer>
  );
}
