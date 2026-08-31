/** Display label for search/history: `name, region, country` (skips empty parts). */
export function locationDisplayLabel(name: string, region: string, country: string): string {
  return [name, region, country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}
