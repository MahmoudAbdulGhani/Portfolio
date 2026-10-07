export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

// Parse month-only CMS dates without local-timezone date shifts.
export function formatMonth(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(value);
  if (!match) return value;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(Number(match[1]), month - 1, 1)));
}
