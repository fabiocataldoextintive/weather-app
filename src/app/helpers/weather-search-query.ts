/**
 * Strips characters that are not useful for WeatherAPI city / coordinate search.
 * Keeps Unicode letters, digits, spaces, comma, dot, hyphen (e.g. "São Paulo", "40.7,-74").
 */
export function sanitizeWeatherSearchInput(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s,.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Count of Unicode letters + digits in `s` (after any caller-side sanitize). */
export function countLettersAndDigits(s: string): number {
  return s.replace(/[^\p{L}\p{N}]/gu, '').length;
}
