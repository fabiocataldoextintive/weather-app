import type { Root } from '../../models/root.interface';
import type { SearchLocation } from '../../models/search-location.interface';
import { cleanText } from '../../helpers/clean-text';

export const MIN_SEARCH_QUERY_LEN = 2;
export const RECENT_CITIES_PAGE_SIZE = 25;

export interface RecentCity {
  key: string;
  label: string;
  root: Root;
  updatedAt: number;
}

export interface FavoriteCity {
  cityLabel: string;
}

export type RecentCitiesMap = Record<string, RecentCity>;
export type FavoriteCitiesMap = Record<string, FavoriteCity>;

export type VisualizationMode = 'table' | 'detailed';

export interface WeatherState {
  searchText: string;
  suggestions: SearchLocation[];
  showSuggestions: boolean;
  searchValidationMessage: string | null;

  currentStatus: 'idle' | 'loading' | 'success' | 'error';
  currentWeather: Root | null;
  currentError: string | null;
  selectedKey: string | null;
  activeLocationLabel: string | null;

  recentCities: RecentCitiesMap;
  favoritesCities: FavoriteCitiesMap;
  visualizationMode: VisualizationMode;
}

export const initialWeatherState: WeatherState = {
  searchText: '',
  suggestions: [],
  showSuggestions: false,
  searchValidationMessage: null,

  currentStatus: 'idle',
  currentWeather: null,
  currentError: null,
  selectedKey: null,
  activeLocationLabel: null,

  recentCities: {},
  favoritesCities: {},
  visualizationMode: 'detailed',
};

/** Normalized key for favorites map (lowercase, no accents, safe chars). */
export function favoriteCityKey(cityLabel: string): string {
  return cleanText(cityLabel);
}

export function recentCitiesOrdered(map: RecentCitiesMap): RecentCity[] {
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
}
