import { environment } from '../../../environments/environment';

export function getWeatherApiBaseUrl(): string {
  return environment.weatherApi.baseUrl.replace(/\/$/, '');
}

/** Key from `process.env.WEATHER_API_KEY` (inlined at build via `define`). */
export function getWeatherApiKey(): string {
  return process.env.WEATHER_API_KEY ?? '';
}

/**
 * Call during bootstrap so missing key fails before any HTTP call.
 * Unit tests use `build:test` with a placeholder key.
 */
export function assertWeatherApiKeyConfigured(): void {
  const key = process.env.WEATHER_API_KEY ?? '';
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error(
      'Weather API key missing. Set WEATHER_API_KEY in `.env` and use `npm start` / `npm run build`, or pass `--define process.env.WEATHER_API_KEY=...` to Angular CLI. Do not commit keys. See README.',
    );
  }
}
