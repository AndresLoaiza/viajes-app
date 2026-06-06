import { useState } from 'react';
import type { Place, TravelDate, PlaceSelection } from '../types/city';

interface Props {
  place: Place;
  dates: TravelDate[];
  selection: PlaceSelection;
  categoryColor: string;
  onChange: (updated: PlaceSelection) => void;
}

export default function PlaceCard({ place, dates, selection, categoryColor, onChange }: Props) {
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const [notesOpen, setNotesOpen] = useState(false);

  // Only images that haven't errored
  const liveImages = place.images.filter((_, i) => !broken[i]);
  const hasImages = liveImages.length > 0;
  const current = Math.min(idx, Math.max(0, place.images.length - 1));

  const toggle = () => onChange({ ...selection, selected: !selection.selected });

  const toggleDate = (dateId: string) => {
    const ex = selection.preferredDates;
    onChange({
      ...selection,
      preferredDates: ex.includes(dateId) ? ex.filter((d) => d !== dateId) : [...ex, dateId],
    });
  };

  const go = (e: React.MouseEvent, dir: number) => {
    e.stopPropagation();
    setIdx((i) => {
      const n = place.images.length;
      let next = (i + dir + n) % n;
      // skip broken
      let guard = 0;
      while (broken[next] && guard < n) { next = (next + dir + n) % n; guard++; }
      return next;
    });
  };

  const fallbackStyle = {
    background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}55)`,
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md transition-all duration-200 cursor-pointer hover:shadow-lg"
      style={{
        backgroundColor: 'white',
        outline: selection.selected ? `3px solid ${categoryColor}` : '3px solid transparent',
        transform: selection.selected ? 'scale(1.01)' : 'none',
      }}
    >
      {/* Image / carousel */}
      <div
        className="relative h-44 overflow-hidden group"
        onClick={toggle}
        style={!hasImages ? fallbackStyle : undefined}
      >
        {hasImages ? (
          <>
            {place.images.map((src, i) =>
              broken[i] ? null : (
                <img
                  key={i}
                  src={src}
                  alt={`${place.name} ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: i === current ? 1 : 0 }}
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                  loading="lazy"
                />
              )
            )}

            {/* Arrows (only if >1 live image) */}
            {liveImages.length > 1 && (
              <>
                <button
                  onClick={(e) => go(e, -1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                  aria-label="Anterior"
                >‹</button>
                <button
                  onClick={(e) => go(e, 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                  aria-label="Siguiente"
                >›</button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {place.images.map((_, i) =>
                    broken[i] ? null : (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{
                          backgroundColor: 'white',
                          opacity: i === current ? 1 : 0.5,
                          transform: i === current ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-3">
            <span className="text-4xl">📸</span>
            {place.mapsUrl && (
              <a
                href={place.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: categoryColor, color: 'white' }}
              >
                Ver fotos en Google Maps →
              </a>
            )}
          </div>
        )}

        {/* Selected badge */}
        {selection.selected && (
          <div
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10"
            style={{ backgroundColor: categoryColor }}
          >✓</div>
        )}
      </div>

      {/* Body */}
      <div className="p-4" onClick={toggle}>
        <h3 className="font-display font-bold text-gray-800 text-base leading-tight mb-1">
          {place.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{place.description}</p>

        {place.tip && (
          <p className="mt-2 text-xs font-medium px-2 py-1 rounded-lg inline-block"
            style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}>
            💡 {place.tip}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-3">
          {place.bookingUrl && (
            <a href={place.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs underline font-medium" style={{ color: categoryColor }}
              onClick={(e) => e.stopPropagation()}>
              🔗 Reservar
            </a>
          )}
          {place.mapsUrl && hasImages && (
            <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs underline font-medium text-gray-400"
              onClick={(e) => e.stopPropagation()}>
              📍 Ver en Maps
            </a>
          )}
        </div>
      </div>

      {/* Date picker + notes — shown only when selected */}
      {selection.selected && (
        <div className="px-4 pb-4 border-t pt-3" style={{ borderColor: `${categoryColor}30` }}
          onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            ¿Qué día te gustaría?
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {dates.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDate(d.id)}
                className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-150 cursor-pointer"
                style={
                  selection.preferredDates.includes(d.id)
                    ? { backgroundColor: categoryColor, color: 'white' }
                    : { backgroundColor: `${categoryColor}15`, color: categoryColor }
                }
              >
                {d.shortLabel}{d.note && <span className="ml-1 opacity-70">*</span>}
              </button>
            ))}
          </div>

          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className="text-xs font-medium flex items-center gap-1 mb-2 cursor-pointer"
            style={{ color: categoryColor }}
          >
            {notesOpen ? '▼' : '▶'} {selection.notes ? 'Ver nota' : 'Agregar nota'}
          </button>

          {notesOpen && (
            <textarea
              placeholder="Añade una nota (horario preferido, preguntas...)"
              value={selection.notes}
              onChange={(e) => onChange({ ...selection, notes: e.target.value })}
              rows={2}
              className="w-full text-sm p-2 rounded-lg border resize-none outline-none transition-colors"
              style={{ borderColor: `${categoryColor}40`, fontFamily: 'var(--font-body)' }}
              onFocus={(e) => (e.target.style.borderColor = categoryColor)}
              onBlur={(e) => (e.target.style.borderColor = `${categoryColor}40`)}
            />
          )}
        </div>
      )}
    </div>
  );
}
