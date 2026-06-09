export type AppLocale = 'en' | 'es';

export const DEFAULT_APP_LOCALE: AppLocale = 'en';

export const APP_LOCALE_STORAGE_KEY = 'app-locale';

/** WeatherAPI `lang` query param; omit for English default. */
export function toWeatherApiLang(locale: AppLocale): string | undefined {
  return locale === 'es' ? 'es' : undefined;
}

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  return value === 'es' ? 'es' : 'en';
}
