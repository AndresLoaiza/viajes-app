// Fechas ISO 'YYYY-MM-DD' interpretadas en hora local (no UTC) para evitar off-by-one.
function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = parseLocal(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatDayEs(iso: string): string {
  const s = parseLocal(iso).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  // Solo la primera letra en mayúscula ("Jueves, 25 de junio")
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isToday(iso: string, now: Date = new Date()): boolean {
  return daysUntil(iso, now) === 0;
}
