/**
 * The public address used inside links we put in emails and invites.
 * Set NEXT_PUBLIC_SITE_URL so a link created while developing on localhost still points at the real site.
 * Without it, the address of the page you're on is used.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://tachlis.vercel.app";
}
