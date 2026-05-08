import { mockWeatherRoot } from './weather-test-fixtures';
import type { FavoriteCitiesMap, RecentCitiesMap } from './weather.state';
import {
  parseFavorites,
  parseRecentCities,
  readFavoritesFromStorage,
  readRecentCitiesFromStorage,
  readVisualizationMode,
  serializeFavorites,
  serializeRecentCities,
  writeFavoritesToStorage,
  writeRecentCitiesToStorage,
  writeVisualizationMode,
} from './weather.storage';

describe('weather.storage', () => {
  const root = mockWeatherRoot();

  describe('serializeRecentCities / parseRecentCities', () => {
    it('round-trips object-shaped recent cities', () => {
      const map: RecentCitiesMap = {
        '40,-74': {
          key: '40,-74',
          label: 'nyc, us',
          root,
          updatedAt: 99,
        },
      };
      const json = serializeRecentCities(map);
      expect(json).toContain('recentCities');
      const back = parseRecentCities(json);
      expect(back['40,-74']?.label).toBe('nyc, us');
      expect(back['40,-74']?.root.location.name).toBe(root.location.name);
    });

    it('parses legacy city/weather shape', () => {
      const raw = JSON.stringify({
        recentCities: {
          k1: { city: 'Town', weather: root },
        },
      });
      const map = parseRecentCities(raw);
      expect(Object.keys(map).length).toBeGreaterThan(0);
      expect(map[Object.keys(map)[0]!]?.root).toEqual(root);
    });

    it('parses array recent cities', () => {
      const raw = JSON.stringify({
        recentCities: [{ city: 'Town', weather: root }],
      });
      const map = parseRecentCities(raw);
      expect(Object.keys(map).length).toBe(1);
    });

    it('parses native recent entries with key, label, root', () => {
      const raw = JSON.stringify({
        recentCities: {
          k1: { key: 'k1', label: 'Native', root, updatedAt: 42 },
        },
      });
      const map = parseRecentCities(raw);
      expect(map.k1?.label).toBe('Native');
      expect(map.k1?.updatedAt).toBe(42);
    });

    it('returns {} on invalid JSON', () => {
      expect(parseRecentCities('{')).toEqual({});
      expect(parseRecentCities(null)).toEqual({});
    });
  });

  describe('serializeFavorites / parseFavorites', () => {
    it('round-trips favorites map', () => {
      const map: FavoriteCitiesMap = { paris: { cityLabel: 'paris' } };
      const back = parseFavorites(serializeFavorites(map));
      expect(back.paris).toEqual({ cityLabel: 'paris' });
    });

    it('parses array of strings at root', () => {
      const raw = JSON.stringify(['Paris', 'Lyon']);
      const m = parseFavorites(raw);
      expect(Object.keys(m).length).toBe(2);
    });

    it('parses favoritesCities array form', () => {
      const raw = JSON.stringify({ favoritesCities: ['A', 'B'] });
      expect(Object.keys(parseFavorites(raw)).length).toBe(2);
    });

    it('parses favoritesCities array when nested under object', () => {
      const raw = JSON.stringify({ favoritesCities: ['Z', 1, 'Y'] });
      const m = parseFavorites(raw);
      expect(Object.keys(m).length).toBe(2);
    });

    it('returns {} when favoritesCities is not an object', () => {
      const raw = JSON.stringify({ favoritesCities: 404 });
      expect(parseFavorites(raw)).toEqual({});
    });

    it('skips empty cityLabel entries', () => {
      const raw = JSON.stringify({
        favoritesCities: { a: { cityLabel: '   ' } },
      });
      expect(parseFavorites(raw)).toEqual({});
    });

    it('parses object entries with cityLabel', () => {
      const raw = JSON.stringify({
        favoritesCities: { x: { cityLabel: '  Rio  ' } },
      });
      const m = parseFavorites(raw);
      expect(Object.keys(m).length).toBeGreaterThan(0);
    });

    it('parses string entries in favorites object', () => {
      const raw = JSON.stringify({
        favoritesCities: { x: '  Tokyo  ' },
      });
      const m = parseFavorites(raw);
      expect(Object.keys(m).length).toBeGreaterThan(0);
    });

    it('returns {} on invalid favorites JSON', () => {
      expect(parseFavorites('not-json')).toEqual({});
    });
  });

  describe('visualization localStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('readVisualizationMode defaults', () => {
      expect(readVisualizationMode()).toBe('detailed');
      localStorage.setItem('visualization-mode', 'table');
      expect(readVisualizationMode()).toBe('table');
      localStorage.setItem('visualization-mode', 'detail');
      expect(readVisualizationMode()).toBe('detailed');
    });

    it('writeVisualizationMode maps detailed/table', () => {
      writeVisualizationMode('table');
      expect(localStorage.getItem('visualization-mode')).toBe('table');
      writeVisualizationMode('detailed');
      expect(localStorage.getItem('visualization-mode')).toBe('detailed');
    });

    it('read/write recent and favorites', () => {
      writeRecentCitiesToStorage({});
      expect(readRecentCitiesFromStorage()).toEqual({});
      writeFavoritesToStorage({});
      expect(readFavoritesFromStorage()).toEqual({});
    });
  });

  describe('when global localStorage is unavailable', () => {
    let saved: Storage;

    beforeEach(() => {
      saved = globalThis.localStorage;
      vi.stubGlobal('localStorage', undefined as unknown as Storage);
    });

    afterEach(() => {
      vi.stubGlobal('localStorage', saved);
    });

    it('read helpers return defaults without throwing', () => {
      expect(readVisualizationMode()).toBe('detailed');
      expect(readRecentCitiesFromStorage()).toEqual({});
      expect(readFavoritesFromStorage()).toEqual({});
    });

    it('write helpers no-op without throwing', () => {
      expect(() => {
        writeVisualizationMode('table');
        writeRecentCitiesToStorage({});
        writeFavoritesToStorage({});
      }).not.toThrow();
    });
  });
});
