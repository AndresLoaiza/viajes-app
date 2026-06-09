import type { CityConfig } from '../types/city';

interface Props {
  cities: CityConfig[];
  onPick: (cityId: string) => void;
}

export default function CityPicker({ cities, onPick }: Props) {
  const traveler = cities[0]?.travelerName ?? '';
  const sender = cities[0]?.senderName ?? '';

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: '#002776' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-20"
        style={{ backgroundColor: '#FFDF00' }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-20"
        style={{ backgroundColor: '#009C3B' }} />

      <div className="relative z-10 w-full max-w-3xl text-center">
        <p className="text-5xl mb-3">🇧🇷</p>
        <h1
          className="font-display text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          ¡Hola {traveler}! 🌴
        </h1>
        <p className="text-white/85 text-lg mb-1 font-medium">
          ¿Qué ciudad quieres planear primero?
        </p>
        <p className="text-white/55 text-sm mb-10">
          De: <span className="text-white/80 font-semibold">{sender}</span> con mucho amor ✈️
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => onPick(city.id)}
              className="group relative rounded-3xl overflow-hidden shadow-2xl text-left transition-transform duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer h-56"
            >
              <img
                src={city.heroImage ?? city.coverImage}
                alt={city.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,39,118,0.85), rgba(0,39,118,0.15) 60%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white leading-tight">
                    {city.name}
                  </h2>
                  <p className="text-white/70 text-xs mt-0.5">
                    {city.places.length} lugares · {city.categories.length} categorías
                  </p>
                </div>
                <span
                  className="font-display font-bold text-sm px-4 py-2 rounded-xl shadow-lg flex-shrink-0"
                  style={{ backgroundColor: '#009C3B', color: 'white' }}
                >
                  Escoger →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
