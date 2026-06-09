import type { AppLocale } from '../../i18n/app-locale';
import { normalizeAppLocale } from '../../i18n/app-locale';
import { APP_LOCALE_STORAGE_KEY } from '../../i18n/app-locale';
import type { Root } from '../../models/root.interface';
import { cleanText } from '../../helpers/clean-text';
import type {
  FavoriteCitiesMap,
  FavoriteCity,
  RecentCitiesMap,
  RecentCity,
  VisualizationMode,
} from './weather.state';
import { favoriteCityKey } from './weather.state';

const LS_RECENT = 'recent-cities';
const LS_FAVORITES = 'favorite-cities';
const LS_VIZ = 'visualization-mode';
const LS_LOCALE = APP_LOCALE_STORAGE_KEY;

function locationQueryKey(root: Root): string {
  const { lat, lon } = root.location;
  return `${lat},${lon}`;
}

function isRecentCityShape(v: unknown): v is Pick<RecentCity, 'key' | 'label' | 'root'> & { updatedAt?: number } {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['key'] === 'string' &&
    typeof o['label'] === 'string' &&
    typeof o['root'] === 'object' &&
    o['root'] !== null
  );
}

export function serializeRecentCities(map: RecentCitiesMap): string {
  const recentCities: Record<string, { city: string; weather: Root; updatedAt?: number }> = {};
  for (const [k, row] of Object.entries(map)) {
    recentCities[k] = { city: row.label, weather: row.root, updatedAt: row.updatedAt };
  }
  return JSON.stringify({ recentCities });
}

function entryToRecentCity(outerKey: string, entry: unknown): RecentCity | null {
  if (!entry || typeof entry !== 'object') return null;
  if (isRecentCityShape(entry)) {
    return {
      key: entry['key'],
      label: entry['label'],
      root: entry['root'],
      updatedAt: typeof entry['updatedAt'] === 'number' ? entry['updatedAt'] : Date.now(),
    };
  }
  const city = (entry as { city?: unknown }).city;
  const weather = (entry as { weather?: unknown }).weather;
  const updatedAt = (entry as { updatedAt?: unknown }).updatedAt;
  if (typeof city !== 'string' || !weather || typeof weather !== 'object') return null;
  const root = weather as Root;
  const key = outerKey || locationQueryKey(root);
  return {
    key,
    label: typeof city === 'string' ? cleanText(city) : city,
    root,
    updatedAt: typeof updatedAt === 'number' ? updatedAt : Date.now(),
  };
}

export function parseRecentCities(raw: string | null): RecentCitiesMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const rc = (parsed as { recentCities?: unknown }).recentCities;
    if (!rc) return {};

    if (Array.isArray(rc)) {
      const map: RecentCitiesMap = {};
      let t = Date.now();
      for (const entry of rc) {
        const row = entryToRecentCity('', entry);
        if (!row) continue;
        map[row.key] = { ...row, updatedAt: t-- };
      }
      return map;
    }

    const map: RecentCitiesMap = {};
    for (const [k, entry] of Object.entries(rc as Record<string, unknown>)) {
      const row = entryToRecentCity(k, entry);
      if (row) map[row.key] = row;
    }
    return map;
  } catch {
    return {};
  }
}

export function serializeFavorites(map: FavoriteCitiesMap): string {
  return JSON.stringify({ favoritesCities: map });
}

export function parseFavorites(raw: string | null): FavoriteCitiesMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    if (Array.isArray(parsed)) {
      const map: FavoriteCitiesMap = {};
      for (const x of parsed) {
        if (typeof x !== 'string') continue;
        const k = favoriteCityKey(x);
        if (k) map[k] = { cityLabel: k };
      }
      return map;
    }

    const fav = (parsed as { favoritesCities?: unknown }).favoritesCities;
    if (!fav) return {};

    if (Array.isArray(fav)) {
      const map: FavoriteCitiesMap = {};
      for (const x of fav) {
        if (typeof x !== 'string') continue;
        const k = favoriteCityKey(x);
        if (k) map[k] = { cityLabel: k };
      }
      return map;
    }

    if (typeof fav !== 'object') return {};

    const map: FavoriteCitiesMap = {};
    for (const [, entry] of Object.entries(fav as Record<string, unknown>)) {
      if (entry && typeof entry === 'object' && 'cityLabel' in entry) {
        const cl = (entry as FavoriteCity).cityLabel;
        if (typeof cl === 'string' && cl.trim()) {
          const k = favoriteCityKey(cl);
          map[k] = { cityLabel: k };
        }
      } else if (typeof entry === 'string' && entry.trim()) {
        const k = favoriteCityKey(entry);
        map[k] = { cityLabel: k };
      }
    }
    return map;
  } catch {
    return {};
  }
}

function normalizeVisualizationMode(value: string | null): VisualizationMode {
  if (value === 'table') return 'table';
  if (value === 'detail') return 'detailed';
  return 'detailed';
}

export function readVisualizationMode(): VisualizationMode {
  if (typeof localStorage === 'undefined') return 'detailed';
  return normalizeVisualizationMode(localStorage.getItem(LS_VIZ));
}

export function writeVisualizationMode(mode: VisualizationMode): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_VIZ, mode === 'detailed' ? 'detailed' : 'table');
}

export function readRecentCitiesFromStorage(): RecentCitiesMap {
  if (typeof localStorage === 'undefined') return {};
  return parseRecentCities(localStorage.getItem(LS_RECENT));
}

export function writeRecentCitiesToStorage(map: RecentCitiesMap): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_RECENT, serializeRecentCities(map));
}

export function readFavoritesFromStorage(): FavoriteCitiesMap {
  if (typeof localStorage === 'undefined') return {};
  return parseFavorites(localStorage.getItem(LS_FAVORITES));
}

export function writeFavoritesToStorage(map: FavoriteCitiesMap): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_FAVORITES, serializeFavorites(map));
}

export function readLocaleFromStorage(): AppLocale {
  if (typeof localStorage === 'undefined') return 'en';
  return normalizeAppLocale(localStorage.getItem(LS_LOCALE));
}

export function writeLocaleToStorage(locale: AppLocale): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_LOCALE, locale);
}
