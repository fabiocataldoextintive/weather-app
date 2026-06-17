import { describe, expect, it } from 'vitest';

import {
  createLastUpdateTimestamp,
  isWeatherRefreshDue,
  lastUpdateToMs,
} from './weather-refresh';

describe('weather-refresh', () => {
  const now = 1_700_000_000_000;
  const fiveMin = 300_000;

  it('lastUpdateToMs prefers ISO lastUpdate', () => {
    const iso = '2024-06-01T12:00:00.000Z';
    expect(lastUpdateToMs(iso, 99)).toBe(new Date(iso).getTime());
  });

  it('lastUpdateToMs falls back to updatedAt', () => {
    expect(lastUpdateToMs(undefined, 42)).toBe(42);
  });

  it('lastUpdateToMs returns null when no valid timestamp', () => {
    expect(lastUpdateToMs('not-a-date')).toBeNull();
    expect(lastUpdateToMs(undefined, undefined)).toBeNull();
  });

  it('isWeatherRefreshDue is true without prior timestamp', () => {
    expect(isWeatherRefreshDue(null, fiveMin, now)).toBe(true);
  });

  it('isWeatherRefreshDue is false inside interval', () => {
    const last = now - 60_000;
    expect(isWeatherRefreshDue(last, fiveMin, now)).toBe(false);
  });

  it('isWeatherRefreshDue is true when interval elapsed', () => {
    const last = now - fiveMin;
    expect(isWeatherRefreshDue(last, fiveMin, now)).toBe(true);
  });

  it('createLastUpdateTimestamp returns ISO string', () => {
    const iso = createLastUpdateTimestamp(now);
    expect(iso).toBe(new Date(now).toISOString());
  });
});
