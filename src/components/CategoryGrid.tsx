import type { CityConfig, SelectionsMap } from '../types/city';

interface Props {
  config: CityConfig;
  selections: SelectionsMap;
  onPick: (categoryId: string) => void;
}

export default function CategoryGrid({ config, selections, onPick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {config.categories.map((cat) => {
        const places = config.places.filter((p) => p.category === cat.id);
        if (!places.length) return null;
        const total = places.length;
        const selected = places.filter((p) => selections[p.id]?.selected).length;
        const pct = total ? Math.round((selected / total) * 100) : 0;

        return (
          <button
            key={cat.id}
            onClick={() => onPick(cat.id)}
            className="text-left rounded-2xl p-4 bg-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-4"
            style={{ outline: selected > 0 ? `2px solid ${cat.color}` : '2px solid transparent' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: `${cat.color}20` }}
            >
              {cat.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-gray-800 text-base leading-tight">
                {cat.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: cat.color }}>
                {selected > 0 ? `${selected} de ${total} elegidos` : `${total} lugares`}
              </p>
              {/* Barra de progreso */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>

            {selected > 0 ? (
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: cat.color }}
              >
                {selected}
              </span>
            ) : (
              <span className="flex-shrink-0 text-gray-300 text-2xl">›</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
