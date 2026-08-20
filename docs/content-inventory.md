# CMS content migration inventory

Migration version: `cms-content-v1`.

| Existing source | Content | Database target | CMS | Public/CV consumer |
|---|---|---|---|---|
| `shared/portfolio-data.ts` | Profile identity, experience, socials, projects, skills, technologies, education, certifications | Existing normalized models | Existing content pages, expanded Settings | Public sections, assistant, CV/PDF |
| `src/sections/Hero.tsx` | Heading, intro, focus badges, availability, profile reference, CTA | `SiteSection(hero)`, expanded `Profile` | Site Content, Settings | Hero; profile fields also CV |
| `src/sections/About.tsx` | About paragraphs, statistics, workflow cards | `SiteSection(about).content` | Site Content | About |
| `src/sections/ContactSection.tsx` | Availability, response/remote text, success copy, Job Match promo, WhatsApp message | `SiteSection(contact)`, expanded `Profile`/`SocialLink` | Site Content, Settings social editor | Contact; selected socials also CV |
| `src/components/Footer.tsx` | Description and technology line | `SiteSection(footer)` | Site Content | Footer |
| `src/components/Logo.tsx` | Name/title | Existing `Profile.shortName/name/title` | Settings | Logo, footer, navbar |
| `src/components/ProjectCard.tsx` | Three slug-specific impact lines | `Project.impactSummary` | Project editor | Project cards; optional CV description remains separate |
| Section components | Public eyebrows/headings/descriptions/CTAs | `SiteSection` records | Site Content | Respective public section |
| `src/pages/Projects.tsx`, `Contact.tsx`, `Cv.tsx` | Page copy and SEO | `SiteSection` and `SiteSection(seo)` | Site Content | Pages and metadata |
| `src/components/PageMeta.tsx` | Hardcoded title suffix | `SiteSection(seo).content.titleTemplate` | Site Content | Document/OG/Twitter metadata |
| `src/lib/hooks.ts`, `src/data/portfolio.ts` | Production fallback fixtures | Removed from query path; retained only as migration source | n/a | None in production |
| `server/src/lib/cv.js` | Default summary and application-specific experience bullets | `Profile.professionalSummary`, CV configuration, CV fields | Settings/CV Manager | CV preview and PDF |

Basic interface and validation strings remain application-owned because they describe behavior rather than portfolio content.
