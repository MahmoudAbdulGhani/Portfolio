const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api";

export { API_BASE };

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...init,
  });

  if (res.status === 401 && path.startsWith("/admin") && path !== "/admin/auth/login") {
    window.dispatchEvent(new Event("admin:unauthorized"));
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.message || body?.error) detail = body.message ?? body.error;
    } catch {
      /* keep statusText */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
