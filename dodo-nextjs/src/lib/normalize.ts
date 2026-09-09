export function extractXHandle(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1).trim().replace(/^\/+/, "");
    return /^[a-zA-Z0-9_]{1,15}$/.test(handle) ? handle : null;
  }

  let urlStr = trimmed;
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }

  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "x.com" || host === "twitter.com") {
      const cleanPath = parsed.pathname.replace(/^\/+@?/, "").replace(/\/+$/, "");
      const segments = cleanPath.split("/").filter(Boolean);
      if (segments.length === 1 && /^[a-zA-Z0-9_]{1,15}$/.test(segments[0])) {
        return segments[0];
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function isXHandle(input: string): boolean {
  return extractXHandle(input) !== null;
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();

  const handle = extractXHandle(trimmed);
  if (handle) {
    return `https://x.com/${handle.toLowerCase()}`;
  }

  let url = trimmed;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "twitter.com") {
      parsed.hostname = "x.com";
    }
    parsed.pathname = parsed.pathname.replace(/^\/+@?/, "/").replace(/\/+$/, "") || "/";
    return parsed.origin + parsed.pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function isValidUrlOrDomain(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("@")) {
    return isXHandle(trimmed);
  }

  let urlStr = trimmed;
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }

  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    if (!host || !host.includes(".") || host.startsWith(".") || host.endsWith(".")) {
      return false;
    }

    const parts = host.split(".");
    if (parts.length < 2) return false;

    for (const part of parts) {
      if (!part || part.length > 63) return false;
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(part)) return false;
    }

    const tld = parts[parts.length - 1];
    if (tld.length < 2 || /^\d+$/.test(tld)) return false;

    return true;
  } catch {
    return false;
  }
}

export function extractFaviconDomain(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (extractXHandle(trimmed)) {
    return "x.com";
  }

  let urlStr = trimmed;
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }

  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    if (host && host.includes(".")) {
      const parts = host.split(".");
      const tld = parts[parts.length - 1];
      if (tld && tld.length >= 2 && !/^\d+$/.test(tld)) {
        return host;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function extractDisplayUrl(normalizedUrl: string): string {
  const handle = extractXHandle(normalizedUrl);
  if (handle) {
    return `@${handle}`;
  }

  try {
    const parsed = new URL(normalizedUrl);
    return parsed.hostname + parsed.pathname.replace(/\/$/, "");
  } catch {
    return normalizedUrl;
  }
}

// URL-friendly slug derived from the normalized URL, e.g.
// "https://s1.example/" -> "s1-example", "https://x.com/handle" -> "x-com-handle".
// Not guaranteed unique on its own — callers append a suffix on collision.
export function slugify(normalizedUrl: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");
    return clean(`${host}${path}`) || "link";
  } catch {
    return clean(normalizedUrl) || "link";
  }
}
