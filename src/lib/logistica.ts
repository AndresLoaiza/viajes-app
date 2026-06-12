// Helpers del módulo Logística.

/** Fecha 'YYYY-MM-DD' de un timestamptz guardado como UTC ficticio. */
export const tsDate = (ts: string): string => ts.slice(0, 10);

/** Hora 'HH:MM' de un timestamptz guardado como UTC ficticio. */
export const tsTime = (ts: string): string => ts.slice(11, 16);

/** La nota marca pago/compra pendiente ("Sin pagar" / "Sin comprar"). */
export const isUnpaid = (note: string | null): boolean =>
  /sin pagar|sin comprar/i.test(note ?? '');

/** '2026-06-24' → '24 jun' (hora local, sin off-by-one UTC). */
export function formatShortEs(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '');
}

/** Link de búsqueda en Google Maps para una dirección. */
export const mapsUrl = (address: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Parte una nota en texto y URLs (para linkificar al render). */
export function splitUrls(text: string): Array<{ type: 'text' | 'url'; value: string }> {
  const parts: Array<{ type: 'text' | 'url'; value: string }> = [];
  const re = /https?:\/\/[^\s·]+/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) });
    parts.push({ type: 'url', value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
  return parts;
}
