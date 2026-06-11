import { cleanText } from './clean-text';
import type { SearchLocation } from '../models/search-location.interface';
import type { FavoriteCitiesMap, RecentCitiesMap } from '../store/weather/weather.state';
import { favoriteCityKey } from '../store/weather/weather.state';

export const OFFLINE_PICK_URL_PREFIX = 'offline:';

export function offlinePickUrl(q: string): string {
  return `${OFFLINE_PICK_URL_PREFIX}${q}`;
}

export function parseOfflinePick(url: string): string | null {
  return url.startsWith(OFFLINE_PICK_URL_PREFIX) ? url.slice(OFFLINE_PICK_URL_PREFIX.length) : null;
}

function matchesQuery(cityName: string, normalizedQuery: string): boolean {
  return cleanText(cityName).includes(normalizedQuery);
}

/**
 * Offline autocomplete: match typed text against recent history labels and favorite city names.
 */
export function searchStoredCities(
  query: string,
  recentCities: RecentCitiesMap,
  favoritesCities: FavoriteCitiesMap,
): SearchLocation[] {
  const normalizedQuery = cleanText(query);
  if (!normalizedQuery) {
    return [];
  }

  const seen = new Set<string>();
  const results: SearchLocation[] = [];
  let id = 1;

  for (const row of Object.values(recentCities)) {
    const candidates = [
      row.label,
      row.root.location.name,
      `${row.root.location.name}, ${row.root.location.country}`,
    ];
    if (!candidates.some((name) => matchesQuery(name, normalizedQuery))) {
      continue;
    }
    const dedupeKey = favoriteCityKey(row.label);
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    const loc = row.root.location;
    results.push({
      id: id++,
      name: loc.name,
      region: loc.region,
      country: loc.country,
      lat: loc.lat,
      lon: loc.lon,
      url: offlinePickUrl(row.key),
    });
  }

  for (const favorite of Object.values(favoritesCities)) {
    if (!matchesQuery(favorite.cityLabel, normalizedQuery)) {
      continue;
    }
    const dedupeKey = favoriteCityKey(favorite.cityLabel);
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    const parts = favorite.cityLabel.split(',').map((part) => part.trim());
    const name = parts[0] ?? favorite.cityLabel;
    const country = parts.slice(1).join(', ');
    results.push({
      id: id++,
      name,
      region: '',
      country,
      lat: 0,
      lon: 0,
      url: offlinePickUrl(favorite.cityLabel),
    });
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}
