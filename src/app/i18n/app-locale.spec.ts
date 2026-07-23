import {
  APP_LOCALE_STORAGE_KEY,
  DEFAULT_APP_LOCALE,
  normalizeAppLocale,
  toWeatherApiLang,
} from './app-locale';

describe('app-locale', () => {
  it('exposes default locale and storage key', () => {
    expect(DEFAULT_APP_LOCALE).toBe('en');
    expect(APP_LOCALE_STORAGE_KEY).toBe('app-locale');
  });

  describe('toWeatherApiLang', () => {
    it('returns es for Spanish locale', () => {
      expect(toWeatherApiLang('es')).toBe('es');
    });

    it('returns undefined for English (WeatherAPI default)', () => {
      expect(toWeatherApiLang('en')).toBeUndefined();
    });
  });

  describe('normalizeAppLocale', () => {
    it('keeps Spanish when value is es', () => {
      expect(normalizeAppLocale('es')).toBe('es');
    });

    it('falls back to English for other values', () => {
      expect(normalizeAppLocale('en')).toBe('en');
      expect(normalizeAppLocale('fr')).toBe('en');
      expect(normalizeAppLocale(null)).toBe('en');
      expect(normalizeAppLocale(undefined)).toBe('en');
      expect(normalizeAppLocale('')).toBe('en');
    });
  });
});
