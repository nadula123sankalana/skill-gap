/**
 * Minimal HS256 JWT sign/verify built on Web Crypto.
 *
 * Web Crypto (`globalThis.crypto.subtle`) exists in both the Edge runtime that
 * runs middleware.ts and the Node runtime that runs server actions, so the exact
 * same code verifies the token in both places. Nothing here reads a URL or an
 * environment variable other than the signing secret, which is why the token is
 * valid on every hostname the app is served from.
 */

/**
 * One fixed cookie name for every environment.
 *
 * Deliberately NOT prefixed conditionally (`__Secure-` in production only): a
 * name that changes with the environment is exactly what let the writer and the
 * reader disagree, which silently broke every protected navigation. It lives
 * here, beside the verifier, so middleware can import it without pulling in the
 * MongoDB driver.
 */
export const SESSION_COOKIE = "sg_session";

const encoder = new TextEncoder();

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  /** "Keep me signed in" — only affects how long the token stays valid. */
  remember: boolean;
  iat: number;
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Constant-time comparison — avoids leaking signature bytes through timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string,
  maxAgeSeconds: number
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const header = base64UrlEncode(
    encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  );
  const claims = base64UrlEncode(encoder.encode(JSON.stringify(body)));
  const data = `${header}.${claims}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(data)
  );

  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Returns the payload, or null for any malformed, mis-signed, or expired token. */
export async function verifyJwt(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, claims, signature] = parts;

    const expected = base64UrlEncode(
      new Uint8Array(
        await crypto.subtle.sign(
          "HMAC",
          await hmacKey(secret),
          encoder.encode(`${header}.${claims}`)
        )
      )
    );
    if (!timingSafeEqual(signature, expected)) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(claims))
    ) as JwtPayload;

    if (typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "STUDENT" && payload.role !== "ADMIN") return null;
    if (!payload.sub) return null;

    return payload;
  } catch {
    return null;
  }
}
