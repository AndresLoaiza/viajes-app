export interface TravelDate {
  id: string;
  label: string;
  shortLabel: string;
  note?: string;
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
