import { mockRecentCity, mockWeatherRoot } from '../store/weather/weather-test-fixtures';
import type { FavoriteCitiesMap, RecentCitiesMap } from '../store/weather/weather.state';
import { offlinePickUrl, parseOfflinePick, searchStoredCities } from './search-stored-cities';

describe('searchStoredCities', () => {
  const root = mockWeatherRoot();

  it('matches recent cities by label', () => {
    const recentCities: RecentCitiesMap = {
      '48.85,2.35': mockRecentCity({
        key: '48.85,2.35',
        label: 'paris, france',
        root,
      }),
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
      '45.75,4.85': mockRecentCity({
        key: '45.75,4.85',
        label: 'lyon, france',
        root: { ...root, location: { ...root.location, name: 'Lyon' } },
      }),
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

  it('returns empty list when query sanitizes to empty', () => {
    expect(searchStoredCities('!!!', { '1,1': mockRecentCity() }, {})).toEqual([]);
  });

  it('skips recent cities that do not match the query', () => {
    const recentCities: RecentCitiesMap = {
      '48.85,2.35': mockRecentCity({
        key: '48.85,2.35',
        label: 'paris, france',
        root,
      }),
    };
    expect(searchStoredCities('tokyo', recentCities, {})).toEqual([]);
  });

  it('deduplicates duplicate recent rows for the same city label', () => {
    const recentCities: RecentCitiesMap = {
      '1,1': mockRecentCity({
        key: '1,1',
        label: 'paris, france',
        root,
        updatedAt: 2,
      }),
      '2,2': mockRecentCity({
        key: '2,2',
        label: 'paris, france',
        root,
        updatedAt: 1,
      }),
    };
    const results = searchStoredCities('paris', recentCities, {});
    expect(results).toHaveLength(1);
  });

  it('skips favorites that do not match the query', () => {
    const favoritesCities: FavoriteCitiesMap = {
      'lyon, france': { cityLabel: 'lyon, france' },
      'paris, france': { cityLabel: 'paris, france' },
    };
    const results = searchStoredCities('paris', {}, favoritesCities);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('paris');
  });

  it('offlinePickUrl round-trips through parseOfflinePick', () => {
    expect(parseOfflinePick(offlinePickUrl('paris, france'))).toBe('paris, france');
  });

  it('parseOfflinePick returns null for non-offline urls', () => {
    expect(parseOfflinePick('https://example.com')).toBeNull();
  });
});

