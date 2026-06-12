import { useState, useCallback, useMemo } from 'react';

import type { CityConfig, SelectionsMap } from '../types/city';
import { cities, defaultCityId } from '../data/cities';

import CityPicker from '../components/CityPicker';
import WelcomeScreen from '../components/WelcomeScreen';
import CategoryGrid from '../components/CategoryGrid';
import SwipeDeck from '../components/SwipeDeck';
import SuccessScreen from '../components/SuccessScreen';
import StickyBar from '../components/StickyBar';

// Token fine-grained con permiso solo "Gists" (read/write). Inyectado en build
// vía VITE_GIST_TOKEN. Crea un Gist secreto por cada envío en la cuenta del owner.
const GIST_TOKEN = import.meta.env.VITE_GIST_TOKEN as string | undefined;

// Flujo: selector ciudad → welcome → categorías → deck (swipe) → success.
type Screen = 'picker' | 'welcome' | 'categories' | 'deck' | 'success';

function buildInitialSelections(config: CityConfig): SelectionsMap {
  const map: SelectionsMap = {};
  config.places.forEach((p) => {
    map[p.id] = { placeId: p.id, selected: false, preferredDates: [], notes: '' };
  });
  return map;
}

function buildEmailBody(config: CityConfig, selections: SelectionsMap): string {
  const selected = config.places.filter((p) => selections[p.id]?.selected);
  if (!selected.length) return 'Sin selecciones.';

  const lines: string[] = [`Hola ${config.senderName}! Aquí están mis elecciones para ${config.name}:\n`];

  config.categories.forEach((cat) => {
    const catPlaces = selected.filter((p) => p.category === cat.id);
    if (!catPlaces.length) return;
    lines.push(`\n${cat.emoji} ${cat.name.toUpperCase()}`);
    catPlaces.forEach((place) => {
      const sel = selections[place.id];
      const dateLabels = sel?.preferredDates
        .map((id) => config.dates.find((d) => d.id === id)?.label)
        .filter(Boolean)
        .join(', ');
      lines.push(`• ${place.name}${dateLabels ? ` — ${dateLabels}` : ''}`);
      if (sel?.notes) lines.push(`  Nota: "${sel.notes}"`);
    });
  });

  lines.push(`\nTotal: ${selected.length} lugares seleccionados`);
  lines.push(`\n— ${config.travelerName}`);
  return lines.join('\n');
}

export default function SelectionApp() {
  const multiCity = cities.length > 1;
  const [cityId, setCityId] = useState<string>(defaultCityId);
  // Arrancamos directo en la ciudad por defecto (São Paulo). El selector queda
  // accesible vía el botón "‹ / Cambiar ciudad" para alternar con Río.
  const [screen, setScreen] = useState<Screen>('welcome');

  const config = useMemo(
    () => cities.find((c) => c.id === cityId) ?? cities[0],
    [cityId],
  );

  // Selecciones independientes por ciudad
  const [selectionsByCity, setSelectionsByCity] = useState<Record<string, SelectionsMap>>(() => {
    const init: Record<string, SelectionsMap> = {};
    cities.forEach((c) => { init[c.id] = buildInitialSelections(c); });
    return init;
  });
  const selections = selectionsByCity[cityId];

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handlePickCity = (id: string) => {
    setCityId(id);
    setError('');
    setScreen('welcome');
  };

  const handlePickCategory = (catId: string) => {
    setActiveCategory(catId);
    setScreen('deck');
  };

  const handleDecide = useCallback((placeId: string, selected: boolean) => {
    setSelectionsByCity((prev) => ({
      ...prev,
      [cityId]: {
        ...prev[cityId],
        [placeId]: { ...prev[cityId][placeId], selected },
      },
    }));
  }, [cityId]);

  const activeCategoryConfig = config.categories.find((c) => c.id === activeCategory);
  const activeCategoryPlaces = config.places.filter((p) => p.category === activeCategory);

  const selectedCount = config.places.filter((p) => selections[p.id]?.selected).length;

  const handleSubmit = async () => {
    if (selectedCount === 0) return;
    setSubmitting(true);
    setError('');

    const selected = config.places.filter((p) => selections[p.id]?.selected);

    const submittedAt = new Date().toISOString();
    const payload = {
      subject: `🗺️ Lista de viaje de ${config.travelerName} — ${config.name}`,
      traveler: config.travelerName,
      city: config.name,
      total_selected: selected.length,
      submitted_at: submittedAt,
      message: buildEmailBody(config, selections),
      selections: selected.map((place) => {
        const sel = selections[place.id];
        const cat = config.categories.find((c) => c.id === place.category);
        return {
          place: place.name,
          category: cat?.name,
          preferred_dates: sel?.preferredDates
            .map((id) => config.dates.find((d) => d.id === id)?.label)
            .filter(Boolean)
            .join(', ') || 'Sin preferencia',
          notes: sel?.notes || '',
        };
      }),
    };

    if (!GIST_TOKEN) {
      setError('Falta configurar el destino (VITE_GIST_TOKEN). Avisa a Andrés.');
      setSubmitting(false);
      return;
    }

    // Nombre de archivo legible y único por envío (sin ':' — Gist no lo permite)
    const stamp = submittedAt.slice(0, 16).replace(/[:T]/g, '-');
    const fileName = `${config.travelerName}-${config.id}-${stamp}.json`;

    const gistBody = {
      description: payload.subject,
      public: false,
      files: {
        [fileName]: { content: JSON.stringify(payload, null, 2) },
        'resumen.md': { content: payload.message },
      },
    };

    try {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GIST_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify(gistBody),
      });

      if (res.ok) {
        setScreen('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { message?: string }).message || 'Error al enviar. Intenta de nuevo.');
      }
    } catch {
      setError('Sin conexión. Verifica internet e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (screen === 'picker') {
    return <CityPicker cities={cities} onPick={handlePickCity} />;
  }

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        config={config}
        onStart={() => setScreen('categories')}
        onBack={multiCity ? () => setScreen('picker') : undefined}
      />
    );
  }

  if (screen === 'deck' && activeCategoryConfig) {
    return (
      <SwipeDeck
        category={activeCategoryConfig}
        places={activeCategoryPlaces}
        selections={selections}
        onDecide={handleDecide}
        onClose={() => setScreen('categories')}
      />
    );
  }

  if (screen === 'success') {
    return <SuccessScreen config={config} selections={selections} />;
  }

  return (
    <div style={{ backgroundColor: '#FFFDF5', minHeight: '100vh', position: 'relative' }}>
      {/* Subtle tropical pattern background */}
      {config.theme.bgPattern && (
        <div
          aria-hidden
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${config.theme.bgPattern})`,
            backgroundSize: '320px',
            backgroundRepeat: 'repeat',
            opacity: 0.06,
            zIndex: 0,
          }}
        />
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: '#002776' }}
      >
        {multiCity && (
          <button
            onClick={() => setScreen('picker')}
            className="text-white/80 hover:text-white text-lg flex-shrink-0 cursor-pointer"
            aria-label="Cambiar ciudad"
            title="Cambiar ciudad"
          >‹</button>
        )}
        {config.welcomeBadge ? (
          <img
            src={config.welcomeBadge}
            alt=""
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/60 flex-shrink-0"
          />
        ) : (
          <span className="text-2xl">{config.flag}</span>
        )}
        <div className="flex-1">
          <h1 className="font-display font-bold text-white text-base leading-tight">
            {config.name}
          </h1>
          <p className="text-white/60 text-xs">
            {selectedCount > 0 ? `${selectedCount} seleccionados` : 'Toca las cards para seleccionar'}
          </p>
        </div>
        {config.dates.length > 0 && (
          <div className="flex gap-1">
            {config.dates.map((d) => (
              <span
                key={d.id}
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ backgroundColor: '#FFDF00', color: '#002776' }}
              >
                {d.shortLabel}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-28">
        {/* Greeting */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-display font-bold text-gray-800 flex items-center justify-center gap-2">
            ¡Hola, {config.travelerName}!
            {config.welcomeBadge ? (
              <img
                src={config.welcomeBadge}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              config.flag
            )}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Elige una categoría y desliza los lugares que te gustan
          </p>
        </div>

        {/* Categorías → cada una abre el deck de swipe */}
        <CategoryGrid
          config={config}
          selections={selections}
          onPick={handlePickCategory}
        />

        {error && (
          <div className="mt-4 p-4 rounded-xl text-sm font-medium text-center"
            style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}
      </main>

      {/* Osito acompañante mientras escoge */}
      {config.mascot && (
        <img
          src={config.mascot}
          alt=""
          aria-hidden
          className="bear-peek fixed bottom-24 right-1 sm:right-3 z-30 w-16 sm:w-20 pointer-events-none drop-shadow-lg select-none"
        />
      )}

      <StickyBar
        config={config}
        selections={selections}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
