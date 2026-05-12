export function toWeatherUserMessage(err: Error): string {
  const raw = err.message ?? '';
  if (/location/i.test(raw) || /no matching/i.test(raw)) {
    return $localize`:@@err.locationNotFound:That location could not be found. Try another city.`;
  }
  if (/Weather API request failed/i.test(raw)) {
    return raw.replace(
      /^Weather API request failed:\s*/i,
      $localize`:@@err.apiLoadPrefix:Weather could not be loaded: `,
    );
  }
  return $localize`:@@err.generic:Something went wrong. Check your connection and try again.`;
}
