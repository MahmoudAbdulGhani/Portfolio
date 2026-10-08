export function resumeLink(value) {
  if (typeof value !== "string") return "/api/cv.pdf";
  const href = value.trim();
  try {
    if (/[{}]/.test(decodeURIComponent(href))) return "/api/cv.pdf";
    if (href.startsWith("/") && !href.startsWith("//")) return href;
    const url = new URL(href);
    if (["https:", "http:"].includes(url.protocol)) return href;
  } catch {
    /* Use the existing CV endpoint for invalid CMS links. */
  }
  return "/api/cv.pdf";
}
