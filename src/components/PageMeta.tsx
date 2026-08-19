import { useEffect } from "react";

interface PageMetaProps { title: string; description?: string; image?: string | null; canonicalPath?: string; noIndex?: boolean }

export function PageMeta({ title, description, image, canonicalPath, noIndex = false }: PageMetaProps) {
  useEffect(() => {
    const shouldNoIndex = noIndex || /^\/(?:admin(?:\/|$)|login\/?$)/.test(window.location.pathname);
    const fullTitle = `${title} — Mahmoud Abdul Ghani`;
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
    setMeta('meta[name="robots"]', "name", "robots", shouldNoIndex ? "noindex, nofollow" : "index, follow");
    const url = absolute(canonicalPath ?? window.location.pathname);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    if (image) { const src = absolute(image); setMeta('meta[property="og:image"]', "property", "og:image", src); setMeta('meta[name="twitter:image"]', "name", "twitter:image", src); }
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
  }, [title, description, image, canonicalPath, noIndex]);
  return null;
}
