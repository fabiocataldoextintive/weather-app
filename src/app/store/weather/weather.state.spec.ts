import { mockWeatherRoot } from './weather-test-fixtures';
import {
  favoriteCityKey,
  initialWeatherState,
  recentCitiesOrdered,
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

  it('initialWeatherState has expected defaults', () => {
    expect(initialWeatherState.searchText).toBe('');
    expect(initialWeatherState.visualizationMode).toBe('detailed');
    expect(initialWeatherState.currentStatus).toBe('idle');
  });
});
