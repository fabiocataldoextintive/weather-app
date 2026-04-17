/**
 * Production defaults. Development uses `environment.development.ts` via file replacement.
 * Key from `process.env.WEATHER_API_KEY` (esbuild `define`; use `.env` + npm scripts for local builds).
 */
export const environment = {
  production: true,
  weatherApi: {
    baseUrl: 'http://api.weatherapi.com/v1',
    apiKey: process.env.WEATHER_API_KEY ?? '',
  },
};
