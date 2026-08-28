/**
 * OBW Pools Client-Side Security & Navigation Utilities
 * Sanitização de URLs externas, prevenção contra esquemas maliciosos (javascript:, data:) e XSS.
 */

const ALLOWED_PROTOCOLS = ['https:', 'http:', 'tel:', 'mailto:'];

/**
 * Valida e sanitiza uma URL para abertura segura com window.open.
 * Impede injeção de esquemas como javascript: ou data:
 */
export function sanitizeUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      console.warn(`[Segurança] Esquema de URL rejeitado: ${parsed.protocol}`);
      return null;
    }
    return parsed.href;
  } catch {
    // Se for um link relativo seguro
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return null;
  }
}

/**
 * Constrói e sanitiza uma URL para a API do WhatsApp.
 * Valida que o telefone contenha apenas dígitos e o texto seja seguro.
 */
export function sanitizeWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(text || '');

  if (cleanPhone.length >= 10) {
    // Se já tiver código de país ou DDD
    const fullPhone = cleanPhone.startsWith('1') || cleanPhone.startsWith('55')
      ? cleanPhone
      : `1${cleanPhone}`; // Padrão EUA (Texas DFW)
    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodedText}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Constrói e sanitiza uma URL do Google Maps / Waze para navegação GPS.
 */
export function sanitizeMapsUrl(address: string, lat?: number, lng?: number): string {
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const encodedAddress = encodeURIComponent(address || '');
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

/**
 * Abre uma URL em nova aba de forma segura, com rel="noopener noreferrer".
 */
export function safeOpenUrl(rawUrl: string, target: string = '_blank'): boolean {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) {
    console.error('[Segurança] Tentativa de navegação para URL não confiável bloqueada.');
    return false;
  }

  const newWindow = window.open(safe, target, 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
    return true;
  }
  return false;
}
