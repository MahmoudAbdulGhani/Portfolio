export const DEFAULT_PROJECT_ACCENT = "#5966A0";

const legacyAccents: Record<string, string> = {
  "gradient-blue": "#5966A0",
  "gradient-violet": "#765D99",
  "gradient-teal": "#26879B",
  "gradient-amber": "#A8693F",
  "gradient-rose": "#825C91",
  "gradient-green": "#347F7B",
};

const hexColor = /^#[0-9a-f]{6}$/i;

export function isProjectAccent(value: string | null | undefined): value is string {
  return typeof value === "string" && hexColor.test(value.trim());
}

/**
 * Maps values saved by earlier versions of the portfolio to their closest
 * single-color equivalent. This is read-only compatibility; new saves are
 * validated as six-digit hex colors.
 */
export function normalizeProjectAccent(value: string | null | undefined): string {
  if (isProjectAccent(value)) return value.trim().toUpperCase();
  return legacyAccents[value ?? ""] ?? DEFAULT_PROJECT_ACCENT;
}
