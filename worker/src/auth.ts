import type { Env, ClerkJWTClaims } from "./types";

/**
 * Verify Clerk JWT token.
 * Clerk issues JWTs signed with RS256. We verify using Clerk's JWKS endpoint.
 */
export async function verifyClerkToken(
  token: string,
  env: Env
): Promise<ClerkJWTClaims | null> {
  try {
    // Decode the JWT header to get the kid
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const headerJson = atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"));
    const header = JSON.parse(headerJson);
    const kid = header.kid;

    if (!kid) return null;

    // Fetch Clerk's JWKS
    // Clerk JWKS URL based on the publishable key frontend domain
    const jwksUrl = `https://${getClerkDomain(env.CLERK_PUBLISHABLE_KEY)}/.well-known/jwks.json`;
    const jwksResponse = await fetch(jwksUrl);
    const jwks = (await jwksResponse.json()) as { keys: JsonWebKey[] };

    // Find the matching key
    const jwk = jwks.keys.find((key: any) => key.kid === kid);
    if (!jwk) return null;

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify the signature
    const signatureBytes = base64UrlDecode(parts[2]);
    const dataBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const isValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureBytes,
      dataBytes
    );

    if (!isValid) return null;

    // Decode and validate the payload
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as ClerkJWTClaims;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract Clerk domain from publishable key.
 * Clerk publishable keys are formatted as pk_test_<base64domain> or pk_live_<base64domain>
 */
function getClerkDomain(publishableKey: string): string {
  const parts = publishableKey.split("_");
  if (parts.length < 3) return "";
  // The domain is base64 encoded in the last part
  const encoded = parts.slice(2).join("_");
  try {
    const decoded = atob(encoded);
    // Remove trailing $ if present
    return decoded.replace(/\$$/, "");
  } catch {
    return "";
  }
}

function base64UrlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Extract user ID from request, returns null if unauthorized.
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const claims = await verifyClerkToken(token, env);

  return claims?.sub || null;
}
