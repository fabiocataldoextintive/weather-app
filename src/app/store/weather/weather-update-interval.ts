import type { MessageId } from '../../i18n/messages';

/** Allowed refresh intervals in milliseconds (ascending). */
export const WEATHER_UPDATE_INTERVALS_MS = [300_000, 600_000, 900_000, 1_800_000] as const;

export type WeatherUpdateIntervalMs = (typeof WEATHER_UPDATE_INTERVALS_MS)[number];

export const DEFAULT_WEATHER_UPDATE_INTERVAL_MS: WeatherUpdateIntervalMs = 300_000;

export const WEATHER_UPDATE_INTERVAL_STORAGE_KEY = 'weather-update-interval';

export interface WeatherUpdateIntervalOption {
  labelKey: MessageId;
  value: WeatherUpdateIntervalMs;
}

/** Options in ascending order (5, 10, 15, 30 min). */
export const WEATHER_UPDATE_INTERVAL_OPTIONS: readonly WeatherUpdateIntervalOption[] = [
  { labelKey: 'interval.5min', value: 300_000 },
  { labelKey: 'interval.10min', value: 600_000 },
  { labelKey: 'interval.15min', value: 900_000 },
  { labelKey: 'interval.30min', value: 1_800_000 },
];

export function isAllowedWeatherUpdateInterval(value: number): value is WeatherUpdateIntervalMs {
  return (WEATHER_UPDATE_INTERVALS_MS as readonly number[]).includes(value);
}

export function normalizeWeatherUpdateInterval(value: number | null | undefined): WeatherUpdateIntervalMs {
  if (typeof value === 'number' && isAllowedWeatherUpdateInterval(value)) {
    return value;
  }
  return DEFAULT_WEATHER_UPDATE_INTERVAL_MS;
}
