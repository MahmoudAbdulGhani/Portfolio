import { useEffect } from "react";
import { useProfile, useSiteSection } from "../lib/hooks";

interface PageMetaProps { title: string; description?: string; image?: string | null; canonicalPath?: string; noIndex?: boolean }

export function PageMeta({ title, description, image, canonicalPath, noIndex = false }: PageMetaProps) {
  const { data: profile } = useProfile();
  const { data: seo } = useSiteSection("seo");
  const titleTemplate = typeof seo?.content.titleTemplate === "string" ? seo.content.titleTemplate : "%s";
  const siteName = typeof seo?.content.siteName === "string" ? seo.content.siteName : profile?.name ?? "";
  const keywordText = Array.isArray(seo?.content.keywords) ? seo.content.keywords.filter((item): item is string => typeof item === "string").join(", ") : "";
  useEffect(() => {
    const shouldNoIndex = noIndex || /^\/(?:admin(?:\/|$)|login\/?$)/.test(window.location.pathname);
    const fullTitle = profile?.name && title.includes(profile.name) ? title : titleTemplate.includes("%s") ? titleTemplate.replace("%s", title) : `${title} ${profile?.name ?? ""}`.trim();
    const absolute = (value: string) => new URL(value, window.location.origin).toString();
    const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
      let node = document.querySelector<HTMLMetaElement>(selector);
      if (!node) { node = document.createElement("meta"); node.setAttribute(attribute, key); document.head.appendChild(node); }
      node.content = content;
    };
    document.title = fullTitle;
    if (description) { setMeta('meta[name="description"]', "name", "description", description); setMeta('meta[property="og:description"]', "property", "og:description", description); setMeta('meta[name="twitter:description"]', "name", "twitter:description", description); }
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", siteName);
    if (keywordText) setMeta('meta[name="keywords"]', "name", "keywords", keywordText);
    setMeta('meta[name="robots"]', "name", "robots", shouldNoIndex ? "noindex, nofollow" : "index, follow");
    const url = absolute(canonicalPath ?? window.location.pathname);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    if (image) { const src = absolute(image); setMeta('meta[property="og:image"]', "property", "og:image", src); setMeta('meta[name="twitter:image"]', "name", "twitter:image", src); }
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
    if (profile) {
      let structured = document.querySelector<HTMLScriptElement>('script[data-portfolio-schema]');
      if (!structured) { structured = document.createElement("script"); structured.type = "application/ld+json"; structured.dataset.portfolioSchema = "true"; document.head.appendChild(structured); }
      structured.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: profile.name, jobTitle: profile.title, email: `mailto:${profile.email}`, address: profile.location, url: profile.portfolioUrl || url, sameAs: profile.socials.filter((social) => social.published !== false).map((social) => social.url), knowsAbout: profile.focusAreas });
    }
  }, [title, description, image, canonicalPath, noIndex, profile, titleTemplate, siteName, keywordText]);
  return null;
}
