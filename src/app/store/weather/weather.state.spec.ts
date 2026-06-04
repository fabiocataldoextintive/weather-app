import { mockWeatherRoot } from './weather-test-fixtures';
import {
  favoriteCityKey,
  favoritesCitiesOrdered,
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
      const a: RecentCity = {
        key: 'a',
        label: 'A',
        root: mockWeatherRoot(),
        updatedAt: 100,
      };
      const b: RecentCity = {
        key: 'b',
        label: 'B',
        root: mockWeatherRoot(),
        updatedAt: 200,
      };
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

  it('initialWeatherState has expected defaults', () => {
    expect(initialWeatherState.searchText).toBe('');
    expect(initialWeatherState.visualizationMode).toBe('detailed');
    expect(initialWeatherState.currentStatus).toBe('idle');
  });
});
