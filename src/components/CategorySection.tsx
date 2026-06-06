import type { Category, Place, TravelDate, PlaceSelection } from '../types/city';
import PlaceCard from './PlaceCard';

interface Props {
  category: Category;
  places: Place[];
  dates: TravelDate[];
  selections: Record<string, PlaceSelection>;
  onSelectionChange: (placeId: string, updated: PlaceSelection) => void;
}

export default function CategorySection({
  category,
  places,
  dates,
  selections,
  onSelectionChange,
}: Props) {
  const selectedCount = places.filter((p) => selections[p.id]?.selected).length;

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.emoji}
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800">
            {category.name}
          </h2>
          <p className="text-sm" style={{ color: category.color }}>
            {selectedCount > 0
              ? `${selectedCount} de ${places.length} seleccionados`
              : `${places.length} lugares`}
          </p>
        </div>
        {selectedCount > 0 && (
          <div
            className="ml-auto px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: category.color }}
          >
            {selectedCount}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            dates={dates}
            selection={selections[place.id] || {
              placeId: place.id,
              selected: false,
              preferredDates: [],
              notes: '',
            }}
            categoryColor={category.color}
            onChange={(updated) => onSelectionChange(place.id, updated)}
          />
        ))}
      </div>
    </section>
  );
}
