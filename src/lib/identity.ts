import type { TravelerId } from '../types/trip';

const KEY = 'nuestros-viajes:identity';

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Compara contra VITE_ACCESS_CODE_HASH; el código se normaliza (trim + minúsculas). */
export async function checkAccessCode(code: string): Promise<boolean> {
  return (await sha256Hex(code.trim().toLowerCase())) === import.meta.env.VITE_ACCESS_CODE_HASH;
}

export function getStoredIdentity(): TravelerId | null {
  const v = localStorage.getItem(KEY);
  return v === 'andres' || v === 'melisa' ? v : null;
}

export function storeIdentity(id: TravelerId): void {
  localStorage.setItem(KEY, id);
}
