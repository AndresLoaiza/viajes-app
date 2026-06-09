import { useEffect, useState } from 'react';
import type { Highlight } from '../types/city';

interface Props {
  title: string;
  highlights: Highlight[];
  accentColor: string;
  onClose: () => void;
}

function HighlightCard({ h, accentColor }: { h: Highlight; accentColor: string }) {
  const [broken, setBroken] = useState(false);
  const showImg = h.image && !broken;

  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col">
      <div
        className="h-36 w-full overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}40)` }}
      >
        {showImg ? (
          <img
            src={h.image}
            alt={h.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="text-3xl opacity-60">🖼️</span>
        )}
      </div>
      <div className="p-3 flex-1">
        <h4 className="font-display font-bold text-gray-800 text-sm leading-tight">{h.name}</h4>
        {h.author && (
          <p className="text-xs font-semibold mt-0.5" style={{ color: accentColor }}>{h.author}</p>
        )}
        {h.note && <p className="text-gray-500 text-xs leading-snug mt-1">{h.note}</p>}
      </div>
    </div>
  );
}

export default function HighlightsModal({ title, highlights, accentColor, onClose }: Props) {
  // Cerrar con Escape + bloquear scroll del fondo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-3xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Destacados</p>
            <h3 className="font-display font-bold text-white text-lg leading-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xl cursor-pointer flex-shrink-0"
            aria-label="Cerrar"
          >×</button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {highlights.map((h, i) => (
              <HighlightCard key={i} h={h} accentColor={accentColor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
