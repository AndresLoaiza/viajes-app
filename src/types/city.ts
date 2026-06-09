export interface TravelDate {
  id: string;
  label: string;
  shortLabel: string;
  note?: string;
}

// Obra/elemento representativo de un museo o lugar cultural
export interface Highlight {
  name: string;       // nombre de la obra o elemento
  author?: string;    // artista / autor / arquitecto (si aplica)
  note?: string;      // por qué es representativo / qué es
  image?: string;     // foto (Wikimedia). Si falta, la card va en modo texto
}

export interface Place {
  id: string;
  name: string;
  description: string;
  images: string[];
  mapsUrl?: string;
  category: string;
  tip?: string;
  bookingUrl?: string;
  highlights?: Highlight[];   // obras/elementos destacados (botón → modal)
  highlightsLabel?: string;   // texto del botón (ej "Ver obras", "Lo más representativo")
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface CityTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgPattern?: string;
}

export interface CityConfig {
  id: string;
  name: string;
  country: string;
  flag: string;
  coverImage: string;
  heroImage?: string;
  successImage?: string;
  welcomeBadge?: string;
  mascot?: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  travelerName: string;
  senderName: string;
  dates: TravelDate[];
  categories: Category[];
  places: Place[];
  theme: CityTheme;
}

export interface PlaceSelection {
  placeId: string;
  selected: boolean;
  preferredDates: string[];
  notes: string;
}

export type SelectionsMap = Record<string, PlaceSelection>;
