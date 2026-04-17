import { environment } from '../../../environments/environment';

export function getWeatherApiBaseUrl(): string {
  return environment.weatherApi.baseUrl.replace(/\/$/, '');
}

/** Key from `process.env.WEATHER_API_KEY` (inlined at build via `define`). */
export function getWeatherApiKey(): string {
  return process.env.WEATHER_API_KEY ?? '';
}

/**
 * Call from code that needs the key (e.g. WeatherService before HTTP). Do not run at app bootstrap.
 * Unit tests use `build:test` with a placeholder key.
 */
export function assertWeatherApiKeyConfigured(): void {
  const key = process.env.WEATHER_API_KEY ?? '';
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error(
      'Weather API key missing. Set `WEATHER_API_KEY` in the environment and rebuild with `--define process.env.WEATHER_API_KEY=...` (see README). Do not commit keys.',
    );
  }
}
