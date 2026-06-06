import type { CityConfig, SelectionsMap } from '../types/city';

interface Props {
  config: CityConfig;
  selections: SelectionsMap;
  onSubmit: () => void;
  submitting: boolean;
}

export default function StickyBar({ config, selections, onSubmit, submitting }: Props) {
  const count = config.places.filter((p) => selections[p.id]?.selected).length;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3"
      style={{
        background: 'linear-gradient(to top, rgba(255,253,245,1) 60%, rgba(255,253,245,0))',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onSubmit}
          disabled={count === 0 || submitting}
          className="w-full py-4 px-6 rounded-2xl font-display font-bold text-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
          style={{
            backgroundColor: count > 0 ? '#009C3B' : '#ccc',
            color: 'white',
            boxShadow: count > 0 ? '0 8px 24px rgba(0,156,59,0.35)' : 'none',
          }}
        >
          {submitting ? (
            <>
              <span className="animate-spin">⏳</span> Enviando...
            </>
          ) : (
            <>
              <span
                className="px-2 py-0.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              >
                {count}
              </span>
              {count === 0
                ? 'Selecciona al menos un lugar'
                : `Enviar lista a ${config.senderName} 🚀`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
