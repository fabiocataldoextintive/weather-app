import { mockRecentCity, mockWeatherRoot } from './weather-test-fixtures';
import {
  favoriteCityKey,
  favoritesCitiesOrdered,
  findRecentCityForFavorite,
  initialWeatherState,
  recentCitiesOrdered,
  type FavoriteCitiesMap,
  type RecentCity,
  type RecentCitiesMap,
} from './weather.state';

describe('weather.state helpers', () => {
  describe('favoriteCityKey', () => {
    it('normalizes labels', () => {
      expect(favoriteCityKey('  São Paulo  ')).toBe('sao paulo');
    });

    it('returns empty string for blank input', () => {
      expect(favoriteCityKey('   ')).toBe('');
    });
  });

  describe('recentCitiesOrdered', () => {
    it('sorts by updatedAt descending', () => {
      const a = mockRecentCity({ key: 'a', label: 'A', updatedAt: 100 });
      const b = mockRecentCity({ key: 'b', label: 'B', updatedAt: 200 });
      const map: RecentCitiesMap = { a, b };
      expect(recentCitiesOrdered(map).map((r) => r.key)).toEqual(['b', 'a']);
    });
  });

  describe('favoritesCitiesOrdered', () => {
    it('sorts alphabetically by cityLabel', () => {
      const map: FavoriteCitiesMap = {
        z: { cityLabel: 'zurich' },
        a: { cityLabel: 'amsterdam' },
      };
      expect(favoritesCitiesOrdered(map).map((f) => f.cityLabel)).toEqual(['amsterdam', 'zurich']);
    });
  });

  describe('findRecentCityForFavorite', () => {
    it('finds history row by favorite label', () => {
      const map: RecentCitiesMap = {
        '48.85,2.35': mockRecentCity({
          key: '48.85,2.35',
          label: 'paris, france',
        }),
      };
      expect(findRecentCityForFavorite(map, 'paris, france')?.key).toBe('48.85,2.35');
    });
  });

  it('initialWeatherState has expected defaults', () => {
    expect(initialWeatherState.searchText).toBe('');
    expect(initialWeatherState.visualizationMode).toBe('detailed');
    expect(initialWeatherState.currentStatus).toBe('idle');
    expect(initialWeatherState.weatherUpdateTimeInterval).toBe(300_000);
  });
});
