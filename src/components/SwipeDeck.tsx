import { useRef, useState } from 'react';
import type { Category, Place, SelectionsMap } from '../types/city';
import HighlightsModal from './HighlightsModal';

interface Props {
  category: Category;
  places: Place[];
  selections: SelectionsMap;
  onDecide: (placeId: string, selected: boolean) => void;
  onClose: () => void;
}

const THRESHOLD = 110;

export default function SwipeDeck({ category, places, selections, onDecide, onClose }: Props) {
  const [pos, setPos] = useState(0);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0); // 1 like, -1 skip
  const [imgBroken, setImgBroken] = useState<Record<string, boolean>>({});
  const [showObras, setShowObras] = useState(false);

  const startX = useRef(0);
  const dragging = useRef(false);

  const current = places[pos];
  const done = pos >= places.length;
  const selectedCount = places.filter((p) => selections[p.id]?.selected).length;

  const decide = (like: boolean) => {
    if (!current || leaving) return;
    setLeaving(like ? 1 : -1);
    onDecide(current.id, like);
    // animar salida y avanzar
    window.setTimeout(() => {
      setLeaving(0);
      setDx(0);
      setPos((p) => p + 1);
    }, 260);
  };

  const undo = () => {
    if (pos === 0 || leaving) return;
    setDx(0);
    setPos((p) => p - 1);
  };

  // Pointer drag (solo card superior)
  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving || done) return;
    dragging.current = true;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDx(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dx > THRESHOLD) decide(true);
    else if (dx < -THRESHOLD) decide(false);
    else setDx(0);
  };

  const topTransform = leaving
    ? `translateX(${leaving * 600}px) rotate(${leaving * 18}deg)`
    : `translateX(${dx}px) rotate(${dx * 0.04}deg)`;
  const likeOpacity = Math.min(1, Math.max(0, dx / THRESHOLD));
  const nopeOpacity = Math.min(1, Math.max(0, -dx / THRESHOLD));

  const imgOf = (p: Place) => (imgBroken[p.id] ? null : p.images[0]);

  return (
    <div className="relative min-h-screen flex flex-col" style={{ backgroundColor: '#FFFDF5' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: category.color }}
      >
        <button
          onClick={onClose}
          className="text-white/90 hover:text-white text-lg cursor-pointer flex-shrink-0"
          aria-label="Volver a categorías"
        >‹</button>
        <div className="text-2xl">{category.emoji}</div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-white text-base leading-tight truncate">
            {category.name}
          </h1>
          <p className="text-white/70 text-xs">
            {done ? `${selectedCount} elegidos` : `${pos + 1} de ${places.length}`}
          </p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
        >
          ♥ {selectedCount}
        </span>
      </header>

      {/* Deck */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6">
        {done ? (
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">{selectedCount > 0 ? '💜' : '🤔'}</div>
            <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">
              {selectedCount > 0
                ? `Elegiste ${selectedCount} de ${places.length}`
                : 'No elegiste ninguno aquí'}
            </h2>
            <p className="text-gray-500 mb-8">en {category.name}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-display font-bold text-white shadow-lg cursor-pointer"
                style={{ backgroundColor: category.color }}
              >
                Volver a categorías →
              </button>
              <button
                onClick={() => { setPos(0); setDx(0); }}
                className="w-full py-3 rounded-2xl font-semibold cursor-pointer"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                ↺ Repasar de nuevo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stack */}
            <div className="relative w-full max-w-sm" style={{ height: '60vh', maxHeight: 520 }}>
              {/* Card detrás: solo visible al arrastrar o al salir */}
              {(!!dx || !!leaving) && places[pos + 1] && (
                <div
                  className="absolute inset-0 rounded-3xl bg-white shadow-md overflow-hidden"
                  style={{ transform: 'scale(0.95) translateY(12px)', opacity: 0.7 }}
                >
                  <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${category.color}22, ${category.color}55)` }}>
                    {imgOf(places[pos + 1]) && (
                      <img src={imgOf(places[pos + 1])!} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                </div>
              )}

              {/* Card superior */}
              {current && (
                <div
                  key={pos}
                  className="absolute inset-0 rounded-3xl bg-white shadow-xl overflow-hidden select-none touch-none"
                  style={{
                    transform: topTransform,
                    transition: leaving || !dragging.current
                      ? 'transform 0.26s ease-out'
                      : 'none',
                    cursor: 'grab',
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  {/* Imagen */}
                  <div
                    className="relative h-[62%] w-full"
                    style={{ background: `linear-gradient(135deg, ${category.color}22, ${category.color}55)` }}
                  >
                    {imgOf(current) ? (
                      <img
                        src={imgOf(current)!}
                        alt={current.name}
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                        onError={() => setImgBroken((b) => ({ ...b, [current.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📸</div>
                    )}

                    {/* Sellos LIKE / NOPE */}
                    <div
                      className="absolute top-5 left-5 px-3 py-1 rounded-lg border-4 font-display font-extrabold text-2xl rotate-[-15deg]"
                      style={{ borderColor: '#22c55e', color: '#22c55e', opacity: likeOpacity, backgroundColor: 'rgba(255,255,255,0.7)' }}
                    >¡SÍ! ♥</div>
                    <div
                      className="absolute top-5 right-5 px-3 py-1 rounded-lg border-4 font-display font-extrabold text-2xl rotate-[15deg]"
                      style={{ borderColor: '#ef4444', color: '#ef4444', opacity: nopeOpacity, backgroundColor: 'rgba(255,255,255,0.7)' }}
                    >PASO</div>

                    {selections[current.id]?.selected && leaving === 0 && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow" style={{ backgroundColor: category.color }}>
                        ✓ ya elegido
                      </span>
                    )}
                  </div>

                  {/* Texto */}
                  <div className="p-4 h-[38%] overflow-y-auto">
                    <h3 className="font-display font-bold text-gray-800 text-lg leading-tight">{current.name}</h3>
                    <p className="text-gray-500 text-sm leading-snug mt-1">{current.description}</p>
                    {current.tip && (
                      <p className="mt-2 text-xs font-medium px-2 py-1 rounded-lg inline-block"
                        style={{ backgroundColor: `${category.color}18`, color: category.color }}>
                        💡 {current.tip}
                      </p>
                    )}
                    {current.highlights?.length && (
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setShowObras(true); }}
                        className="mt-3 text-sm font-semibold underline cursor-pointer"
                        style={{ color: category.color }}
                      >
                        🎨 {current.highlightsLabel ?? 'Ver obras destacadas'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => decide(false)}
                className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl cursor-pointer active:scale-90 transition-transform"
                style={{ color: '#ef4444' }}
                aria-label="Pasar"
              >✕</button>
              <button
                onClick={undo}
                disabled={pos === 0}
                className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-xl cursor-pointer active:scale-90 transition-transform disabled:opacity-30"
                style={{ color: '#f59e0b' }}
                aria-label="Deshacer"
              >↺</button>
              <button
                onClick={() => decide(true)}
                className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl text-white cursor-pointer active:scale-90 transition-transform"
                style={{ backgroundColor: category.color }}
                aria-label="Me gusta"
              >♥</button>
            </div>
            <p className="text-gray-400 text-xs mt-4">Desliza la carta o usa los botones</p>
          </>
        )}
      </div>

      {showObras && current?.highlights && (
        <HighlightsModal
          title={current.name}
          highlights={current.highlights}
          accentColor={category.color}
          onClose={() => setShowObras(false)}
        />
      )}
    </div>
  );
}
