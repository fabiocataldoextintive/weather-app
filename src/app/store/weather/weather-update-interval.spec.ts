import { describe, expect, it } from 'vitest';

import {
  DEFAULT_WEATHER_UPDATE_INTERVAL_MS,
  isAllowedWeatherUpdateInterval,
  normalizeWeatherUpdateInterval,
  WEATHER_UPDATE_INTERVAL_OPTIONS,
  WEATHER_UPDATE_INTERVALS_MS,
} from './weather-update-interval';

describe('weather-update-interval', () => {
  it('exposes allowed intervals in ascending order', () => {
    expect([...WEATHER_UPDATE_INTERVALS_MS]).toEqual([300_000, 600_000, 900_000, 1_800_000]);
    expect(WEATHER_UPDATE_INTERVAL_OPTIONS.map((o) => o.value)).toEqual([...WEATHER_UPDATE_INTERVALS_MS]);
  });

  it('normalizes invalid stored values to default', () => {
    expect(normalizeWeatherUpdateInterval(undefined)).toBe(DEFAULT_WEATHER_UPDATE_INTERVAL_MS);
    expect(normalizeWeatherUpdateInterval(123)).toBe(DEFAULT_WEATHER_UPDATE_INTERVAL_MS);
    expect(normalizeWeatherUpdateInterval(600_000)).toBe(600_000);
  });

  it('isAllowedWeatherUpdateInterval guards allowed values', () => {
    expect(isAllowedWeatherUpdateInterval(300_000)).toBe(true);
    expect(isAllowedWeatherUpdateInterval(1)).toBe(false);
  });
});
