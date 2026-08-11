export interface AdminSession {
  token: string;
  admin: { id: string; email: string; name: string };
}

const KEY = "portfolio-admin-session";

export function getSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function saveSession(session: AdminSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function signOut(): void {
  localStorage.removeItem(KEY);
}
