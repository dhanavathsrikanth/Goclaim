import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: no ISR in use, so no R2/KV incremental-cache override.
// Add one later if ISR/PPR is adopted.
export default defineCloudflareConfig({});
