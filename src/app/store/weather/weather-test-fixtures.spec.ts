import { mockWeatherRoot } from './weather-test-fixtures';

describe('mockWeatherRoot', () => {
  it('returns a minimal valid Root with defaults', () => {
    const r = mockWeatherRoot();
    expect(r.location.name).toBe('Test City');
    expect(r.current.temp_c).toBe(10);
    expect(r.current.condition.code).toBe(1000);
  });

  it('merges partial location and current overrides', () => {
    const r = mockWeatherRoot({
      location: { name: 'Override' },
      current: { temp_c: 99 },
    });
    expect(r.location.name).toBe('Override');
    expect(r.location.country).toBe('TC');
    expect(r.current.temp_c).toBe(99);
    expect(r.current.temp_f).toBe(50);
  });
});
