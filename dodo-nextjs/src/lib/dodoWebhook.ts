import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_MS = 5 * 60 * 1000;

function keyBytes(secret: string): Buffer {
  const stripped = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  try {
    const decoded = Buffer.from(stripped, "base64");
    // Only accept the base64 decoding if it round-trips (else it's just text).
    if (decoded.length > 0 && decoded.toString("base64").replace(/=+$/, "") === stripped.replace(/=+$/, "")) {
      return decoded;
    }
  } catch {
    // fall through to raw bytes
  }
  return Buffer.from(secret, "utf8");
}

export type DodoVerifyResult = { ok: true } | { ok: false; reason: string };

// Verifies a Dodo Payments webhook following the Standard Webhooks spec:
// signed content = `${webhook-id}.${webhook-timestamp}.${rawBody}`.
export function verifyDodoWebhook(
  rawBody: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string,
  nowMs = Date.now()
): DodoVerifyResult {
  if (!headers.id || !headers.timestamp || !headers.signature) {
    return { ok: false, reason: "missing webhook headers" };
  }
  const ts = Number(headers.timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "bad timestamp" };
  }
  if (Math.abs(nowMs - ts * 1000) > TOLERANCE_MS) {
    return { ok: false, reason: "stale timestamp" };
  }

  const key = keyBytes(secret);
  const expected = createHmac("sha256", key)
    .update(`${headers.id}.${headers.timestamp}.${rawBody}`, "utf8")
    .digest();

  const candidates = headers.signature.split(" ");
  for (const c of candidates) {
    const b64 = c.startsWith("v1,") ? c.slice(3) : c;
    if (!b64) continue;
    let sig: Buffer;
    try {
      sig = Buffer.from(b64, "base64");
    } catch {
      continue;
    }
    if (sig.length !== expected.length) continue;
    if (timingSafeEqual(sig, expected)) return { ok: true };
  }
  return { ok: false, reason: "signature mismatch" };
}

// Placeholder keys (empty / "your_*") mean live mode isn't configured —
// callers should skip enforcement in that case (dev + simulated webhooks)
// but MUST enforce once a real secret is set.
export function isLiveWebhookSecret(secret: string | undefined): boolean {
  return Boolean(secret && !secret.startsWith("your_"));
}
