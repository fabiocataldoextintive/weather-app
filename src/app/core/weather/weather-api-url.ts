import { getWeatherApiBaseUrl } from './weather-environment';

/**
 * Resolves WeatherAPI paths (`current.json`, `search.json`, etc.) against the configured base URL.
 * Use this for all HttpClient calls so the base stays in `environment*.ts`.
 */
export function weatherApiUrl(path: string): string {
  const base = getWeatherApiBaseUrl();
  const segment = path.replace(/^\//, '');
  return `${base}/${segment}`;
}
