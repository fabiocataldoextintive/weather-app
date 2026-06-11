import { mockWeatherRoot } from '../store/weather/weather-test-fixtures';
import type { FavoriteCitiesMap, RecentCitiesMap } from '../store/weather/weather.state';
import { offlinePickUrl, parseOfflinePick, searchStoredCities } from './search-stored-cities';

describe('searchStoredCities', () => {
  const root = mockWeatherRoot();

  it('matches recent cities by label', () => {
    const recentCities: RecentCitiesMap = {
      '48.85,2.35': {
        key: '48.85,2.35',
        label: 'paris, france',
        root,
        updatedAt: 1,
      },
    };
    const results = searchStoredCities('paris', recentCities, {});
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe(root.location.name);
    expect(parseOfflinePick(results[0]?.url ?? '')).toBe('48.85,2.35');
  });

  it('matches favorites by city label', () => {
    const favoritesCities: FavoriteCitiesMap = {
      'lyon, france': { cityLabel: 'lyon, france' },
    };
    const results = searchStoredCities('lyon', {}, favoritesCities);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('lyon');
    expect(parseOfflinePick(results[0]?.url ?? '')).toBe('lyon, france');
  });

  it('deduplicates recent and favorite entries for same city', () => {
    const recentCities: RecentCitiesMap = {
      '45.75,4.85': {
        key: '45.75,4.85',
        label: 'lyon, france',
        root: { ...root, location: { ...root.location, name: 'Lyon' } },
        updatedAt: 1,
      },
    };
    const favoritesCities: FavoriteCitiesMap = {
      'lyon, france': { cityLabel: 'lyon, france' },
    };
    const results = searchStoredCities('lyon', recentCities, favoritesCities);
    expect(results).toHaveLength(1);
  });

  it('returns empty list when nothing matches', () => {
    expect(searchStoredCities('tokyo', {}, {})).toEqual([]);
  });

  it('offlinePickUrl round-trips through parseOfflinePick', () => {
    expect(parseOfflinePick(offlinePickUrl('paris, france'))).toBe('paris, france');
  });
});
