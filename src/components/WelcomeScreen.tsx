import type { CityConfig } from '../types/city';

interface Props {
  config: CityConfig;
  onStart: () => void;
}

export default function WelcomeScreen({ config, onStart }: Props) {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#002776' }}
    >
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${config.coverImage})`, opacity: 0.3 }}
      />

      {/* Decorative circles */}
      <div
        className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-20"
        style={{ backgroundColor: '#FFDF00' }}
      />
      <div
        className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-20"
        style={{ backgroundColor: '#009C3B' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <div className="text-7xl mb-4 animate-bounce">{config.flag}</div>

        <h1
          className="font-display text-5xl font-bold text-white mb-3 leading-tight"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          {config.welcomeTitle}
        </h1>

        <p className="text-white/90 text-lg mb-2 font-medium">
          {config.welcomeSubtitle}
        </p>

        <p className="text-white/60 text-sm mb-10">
          De: <span className="text-white/80 font-semibold">{config.senderName}</span> con mucho amor ✈️
        </p>

        {/* Dates preview */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {config.dates.map((d) => (
            <span
              key={d.id}
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ backgroundColor: '#FFDF00', color: '#002776' }}
            >
              {d.shortLabel}
              {d.note && <span className="ml-1 opacity-70">({d.note})</span>}
            </span>
          ))}
        </div>

        <button
          onClick={onStart}
          className="font-display font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-xl cursor-pointer"
          style={{
            backgroundColor: '#009C3B',
            color: 'white',
            boxShadow: '0 8px 24px rgba(0,156,59,0.4)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#007A2E')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#009C3B')}
        >
          ¡Vamos a planear! 🗺️
        </button>

        <p className="text-white/40 text-xs mt-6">
          {config.places.length} lugares • {config.categories.length} categorías
        </p>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="#FFFDF5"
          />
        </svg>
      </div>
    </div>
  );
}
