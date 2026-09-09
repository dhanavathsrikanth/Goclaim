import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const secret = process.env.CLAIM_SECRET;
  if (!secret) throw new Error("CLAIM_SECRET is not configured");
  return secret;
}

function b64urlEncode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function b64urlDecode(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

// Deterministic per-email token: the token IS the session (bookmarkable link).
// Format: <base64url(email)>.<hex hmac>
export function createClaimToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const sig = createHmac("sha256", getSecret())
    .update(normalized, "utf8")
    .digest("hex");
  return `${b64urlEncode(normalized)}.${sig}`;
}

// Returns the email if the token is valid, otherwise null.
export function verifyClaimToken(token: string): string | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  let email: string;
  try {
    email = b64urlDecode(encoded).trim().toLowerCase();
  } catch {
    return null;
  }
  if (!email || !/^[0-9a-f]{64}$/.test(sig)) return null;
  const expected = createHmac("sha256", getSecret())
    .update(email, "utf8")
    .digest("hex");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? email : null;
}