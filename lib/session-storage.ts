/**
 * Client-only session state (sessionStorage).
 *
 * Real authentication uses httpOnly NextAuth cookies (middleware-safe).
 * sessionStorage holds non-secret client state that clears when the tab closes
 * and is useful for UX + high-security tab isolation.
 */
export const SESSION_KEYS = {
  /** Marks an active browser-tab session (not a JWT). */
  authToken: "authToken",
  /** JSON snapshot: id, email, role, remembered */
  authSession: "authSession",
  lastEmail: "lastEmail",
  returnTo: "returnTo",
} as const;

export type ClientAuthSession = {
  id: string;
  email: string | null | undefined;
  role: string;
  remembered: boolean;
  signedInAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function setAuthSessionState(session: ClientAuthSession): void {
  if (!canUseStorage()) return;
  try {
    // Public session marker — clears when the tab/window is closed.
    sessionStorage.setItem(SESSION_KEYS.authToken, session.id);
    sessionStorage.setItem(SESSION_KEYS.authSession, JSON.stringify(session));
    if (session.email) {
      sessionStorage.setItem(SESSION_KEYS.lastEmail, session.email);
    }
  } catch {
    // Private mode / blocked storage — auth still works via cookies.
  }
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return sessionStorage.getItem(SESSION_KEYS.authToken);
  } catch {
    return null;
  }
}

export function getAuthSessionState(): ClientAuthSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.authSession);
    if (!raw) return null;
    return JSON.parse(raw) as ClientAuthSession;
  } catch {
    return null;
  }
}

export function getLastEmail(): string {
  if (!canUseStorage()) return "";
  try {
    return sessionStorage.getItem(SESSION_KEYS.lastEmail) ?? "";
  } catch {
    return "";
  }
}

export function setReturnTo(path: string): void {
  if (!canUseStorage()) return;
  try {
    if (path.startsWith("/") && !path.startsWith("//")) {
      sessionStorage.setItem(SESSION_KEYS.returnTo, path);
    }
  } catch {
    /* ignore */
  }
}

export function consumeReturnTo(fallback = "/dashboard"): string {
  if (!canUseStorage()) return fallback;
  try {
    const path = sessionStorage.getItem(SESSION_KEYS.returnTo);
    sessionStorage.removeItem(SESSION_KEYS.returnTo);
    if (path?.startsWith("/") && !path.startsWith("//")) return path;
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Clear all client session markers (call on sign-out). */
export function clearAuthSessionState(): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(SESSION_KEYS.authToken);
    sessionStorage.removeItem(SESSION_KEYS.authSession);
    // Keep lastEmail for faster re-login UX.
    sessionStorage.removeItem(SESSION_KEYS.returnTo);
  } catch {
    /* ignore */
  }
}
