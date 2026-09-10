import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

// Cloudflare git builds install dependencies at the workspace root, so `next`
// and other packages are hoisted to the repo-root node_modules — outside the
// app-directory root Turbopack auto-detects. Point Turbopack at the workspace
// root (the app dir is always the cwd during build) so hoisted workspace deps
// resolve instead of failing with "Could not find the Next.js package".
const workspaceRoot = path.resolve(process.cwd(), "..");

const nextConfig: NextConfig = {
  // Must match turbopack.root: with tracing rooted at the workspace, Next
  // emits its standalone output under `.next/standalone/<app-dir>/…`, and
  // OpenNext derives its packagePath from outputFileTracingRoot to match.
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
