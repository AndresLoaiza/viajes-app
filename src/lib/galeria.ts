import type { Photo } from '../types/trip';

/** Epoch ms → 'YYYY-MM-DD' en hora local (fecha aproximada de la foto). */
export function dateFromMs(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface PhotoGroup {
  date: string | null; // null = sin fecha
  photos: Photo[];
}

/**
 * Agrupa por taken_on, días más recientes primero; "sin fecha" al final.
 * Dentro del día, orden de subida (created_at) ascendente.
 */
export function groupByDate(photos: Photo[]): PhotoGroup[] {
  const byDate = new Map<string, Photo[]>();
  for (const p of photos) {
    const key = p.taken_on ?? '';
    byDate.set(key, [...(byDate.get(key) ?? []), p]);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return b.localeCompare(a);
    })
    .map(([date, group]) => ({
      date: date || null,
      photos: [...group].sort((x, y) => x.created_at.localeCompare(y.created_at)),
    }));
}

/**
 * Comprime/redimensiona una imagen en el browser antes de subirla:
 * lado mayor ≤ maxDim, JPEG q0.82. Fotos de celular (5-10 MB) → ~200-400 KB.
 */
export async function compressImage(file: File, maxDim = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82));
  if (!blob) throw new Error('No se pudo comprimir la imagen');
  return blob;
}
