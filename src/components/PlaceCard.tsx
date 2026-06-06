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
  const [imgError, setImgError] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const toggle = () =>
    onChange({ ...selection, selected: !selection.selected });

  const toggleDate = (dateId: string) => {
    const existing = selection.preferredDates;
    const updated = existing.includes(dateId)
      ? existing.filter((d) => d !== dateId)
      : [...existing, dateId];
    onChange({ ...selection, preferredDates: updated });
  };

  const fallbackStyle = {
    background: `linear-gradient(135deg, ${categoryColor}33, ${categoryColor}66)`,
  };

  return (
    <div
      className={`
        rounded-2xl overflow-hidden shadow-md transition-all duration-200 cursor-pointer
        ${selection.selected
          ? 'ring-2 shadow-lg scale-[1.01]'
          : 'hover:shadow-lg hover:scale-[1.01]'
        }
      `}
      style={{
        backgroundColor: 'white',
        ...(selection.selected ? { ringColor: categoryColor } : {}),
        outline: selection.selected ? `3px solid ${categoryColor}` : '3px solid transparent',
      }}
    >
      {/* Image */}
      <div
        className="relative h-44 overflow-hidden"
        onClick={toggle}
        style={imgError ? fallbackStyle : undefined}
      >
        {!imgError ? (
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={fallbackStyle}>
            🏙️
          </div>
        )}

        {/* Selected badge */}
        {selection.selected && (
          <div
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
            style={{ backgroundColor: categoryColor }}
          >
            ✓
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Body */}
      <div className="p-4" onClick={toggle}>
        <h3 className="font-display font-bold text-gray-800 text-base leading-tight mb-1">
          {place.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {place.description}
        </p>
        {place.tip && (
          <p className="mt-2 text-xs font-medium px-2 py-1 rounded-lg inline-block"
            style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}>
            💡 {place.tip}
          </p>
        )}
        {place.bookingUrl && (
          <a
            href={place.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs underline font-medium"
            style={{ color: categoryColor }}
            onClick={(e) => e.stopPropagation()}
          >
            🔗 Reservar entradas
          </a>
        )}
      </div>

      {/* Date picker + notes — shown only when selected */}
      {selection.selected && (
        <div
          className="px-4 pb-4 border-t pt-3"
          style={{ borderColor: `${categoryColor}30` }}
          onClick={(e) => e.stopPropagation()}
        >
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
                {d.shortLabel}
                {d.note && <span className="ml-1 opacity-70">*</span>}
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
              style={{
                borderColor: `${categoryColor}40`,
                fontFamily: 'var(--font-body)',
              }}
              onFocus={(e) => (e.target.style.borderColor = categoryColor)}
              onBlur={(e) => (e.target.style.borderColor = `${categoryColor}40`)}
            />
          )}
        </div>
      )}
    </div>
  );
}
