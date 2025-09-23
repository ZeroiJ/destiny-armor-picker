import { cookies } from "next/headers";

export type BungieSession = {
  accessToken?: string;
  refreshToken?: string;
  membershipId?: string;
  bungieNetUser?: any;
  expiresAt?: number; // epoch ms
  membershipType?: number; // DestinyMembershipType
  oauthState?: string; // CSRF protection state parameter
};

// Lightweight cookie-backed session (no iron-session)
const COOKIE_NAME = process.env.DESTINY_SESSION_COOKIE_NAME || "destiny_session";
const isProd = process.env.NODE_ENV === "production";

function parseSession(raw: string | undefined): BungieSession {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function getSession() {
  // use cookies() and normalize to a mutable interface to support get/set/delete across runtimes
  type MutableCookies = {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: any) => void;
    delete: (name: string) => void;
  };
  const jar = cookies() as unknown as MutableCookies;
  const current = parseSession(jar.get(COOKIE_NAME)?.value);

  // Provide a mutable object that mimics iron-session API: save() and destroy()
  const session: BungieSession & { save: () => Promise<void>; destroy: () => void } = {
    ...current,
    async save() {
      // derive maxAge from token expiry when available, fallback to 30 days
      const maxAge = (() => {
        if (typeof session.expiresAt === "number") {
          const seconds = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
          if (seconds > 0) return seconds;
        }
        return 60 * 60 * 24 * 30; // 30 days
      })();

      jar.set(COOKIE_NAME, JSON.stringify({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        membershipId: session.membershipId,
        bungieNetUser: session.bungieNetUser,
        expiresAt: session.expiresAt,
        membershipType: session.membershipType,
        oauthState: session.oauthState,
      }), {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge,
      });
    },
    destroy() {
      jar.delete(COOKIE_NAME);
    },
  };

  return session;
}