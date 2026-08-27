export const TURNSTILE_DUMMY_SITE_KEY = '1x00000000000000000000AA';

export function isPortalPath(pathname: string): boolean {
  return pathname === '/portal' || pathname.startsWith('/portal/');
}

export function canSubmitLead(opts: {
  honeypot: string;
  turnstileToken: string | null;
}): boolean {
  if (opts.honeypot.trim() !== '') return false;
  return Boolean(opts.turnstileToken);
}

export function getTurnstileSiteKey(envKey: string | undefined, _isDev: boolean): string {
  const trimmed = (envKey || '').trim();
  if (trimmed) return trimmed;
  return TURNSTILE_DUMMY_SITE_KEY;
}
