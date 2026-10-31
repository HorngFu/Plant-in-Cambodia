/**
 * Keystatic runs in local mode until Phase 5. Local mode writes to the file system,
 * which doesn't exist on Cloudflare Workers, so the admin is only served in development.
 */
export function isKeystaticEnabled() {
  return process.env.NODE_ENV === "development";
}
