import type { CityConfig, SelectionsMap } from '../types/city';

interface Props {
  config: CityConfig;
  selections: SelectionsMap;
}

export default function SuccessScreen({ config, selections }: Props) {
  const selected = config.places.filter((p) => selections[p.id]?.selected);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#FFFDF5' }}
    >
      {/* Celebration illustration */}
      {config.successImage ? (
        <img
          src={config.successImage}
          alt=""
          className="w-56 max-w-full mb-2 drop-shadow-md"
        />
      ) : (
        <>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg"
            style={{ backgroundColor: '#009C3B' }}
          >
            ✓
          </div>
          <div className="text-5xl mb-4">🎉</div>
        </>
      )}

      <h1 className="font-display font-bold text-3xl text-gray-800 mb-3">
        ¡Lista enviada!
      </h1>

      <p className="text-gray-600 text-lg mb-8 max-w-md">
        {config.senderName} ya recibió tus elecciones. ¡Prepárate para un viaje increíble a {config.name}!
      </p>

      {/* Summary */}
      {selected.length > 0 && (
        <div
          className="rounded-2xl p-6 max-w-md w-full text-left shadow-sm mb-8"
          style={{ backgroundColor: 'white', border: '1px solid #E8D5A3' }}
        >
          <p className="font-semibold text-gray-700 mb-3">
            Elegiste {selected.length} lugar{selected.length !== 1 ? 'es' : ''}:
          </p>
          <div className="space-y-2">
            {selected.map((place) => {
              const sel = selections[place.id];
              const cat = config.categories.find((c) => c.id === place.category);
              const dateLabels = sel?.preferredDates
                .map((id) => config.dates.find((d) => d.id === id)?.shortLabel)
                .filter(Boolean)
                .join(', ');
              return (
                <div key={place.id} className="flex items-start gap-2">
                  <span>{cat?.emoji}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-700">{place.name}</span>
                    {dateLabels && (
                      <span className="text-xs text-gray-400 ml-2">({dateLabels})</span>
                    )}
                    {sel?.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">"{sel.notes}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {config.dates.map((d) => (
          <span
            key={d.id}
            className="text-sm px-3 py-1 rounded-full font-semibold"
            style={{ backgroundColor: '#FFDF0033', color: '#7A6800', border: '1px solid #FFDF0088' }}
          >
            {d.label}
          </span>
        ))}
      </div>

      <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
        {config.welcomeBadge && (
          <img
            src={config.welcomeBadge}
            alt=""
            className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        )}
        ¡Hasta {config.name}! 🌴
      </p>
    </div>
  );
}
