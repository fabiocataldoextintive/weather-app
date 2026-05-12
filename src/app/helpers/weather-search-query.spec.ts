import { countLettersAndDigits, sanitizeWeatherSearchInput } from './weather-search-query';

describe('sanitizeWeatherSearchInput', () => {
  it('keeps letters, digits, space, comma, dot, hyphen', () => {
    expect(sanitizeWeatherSearchInput('  São Paulo 40.7,-74  ')).toBe('Sao Paulo 40.7,-74');
  });

  it('strips unsafe characters', () => {
    expect(sanitizeWeatherSearchInput("London<script>alert(1)</script>")).toBe('Londonscriptalert1script');
  });
});

describe('countLettersAndDigits', () => {
  it('counts only letters and digits', () => {
    expect(countLettersAndDigits('ab12 ,.-')).toBe(4);
  });

  it('handles empty string', () => {
    expect(countLettersAndDigits('')).toBe(0);
  });
});
