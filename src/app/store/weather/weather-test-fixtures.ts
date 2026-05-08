import type { Root } from '../../models/root.interface';

/** Minimal valid `Root` for store tests. */
export function mockWeatherRoot(overrides?: Partial<Root>): Root {
  return {
    location: {
      name: 'Test City',
      region: '',
      country: 'TC',
      lat: 40.7,
      lon: -74,
      tz_id: 'UTC',
      localtime_epoch: 0,
      localtime: '2024-01-01 12:00',
      ...overrides?.location,
    },
    current: {
      last_updated_epoch: 0,
      last_updated: '',
      temp_c: 10,
      temp_f: 50,
      is_day: 1,
      condition: { text: 'Clear', icon: '', code: 1000 },
      wind_mph: 0,
      wind_kph: 0,
      wind_degree: 0,
      wind_dir: 'N',
      pressure_mb: 1000,
      pressure_in: 30,
      precip_mm: 0,
      precip_in: 0,
      humidity: 50,
      cloud: 0,
      feelslike_c: 10,
      feelslike_f: 50,
      vis_km: 10,
      vis_miles: 6,
      uv: 0,
      gust_mph: 0,
      gust_kph: 0,
      ...overrides?.current,
    },
  };
}
