/**
 * Resolve last-update instant from ISO string and/or legacy numeric `updatedAt`.
 */
export function lastUpdateToMs(lastUpdate: string | undefined, updatedAt?: number): number | null {
  if (lastUpdate) {
    const parsed = new Date(lastUpdate).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (typeof updatedAt === 'number' && !Number.isNaN(updatedAt)) {
    return updatedAt;
  }
  return null;
}

/** `true` when no prior timestamp or elapsed time meets/exceeds the active interval. */
export function isWeatherRefreshDue(
  lastUpdateMs: number | null,
  intervalMs: number,
  now = Date.now(),
): boolean {
  if (lastUpdateMs === null) return true;
  return now - lastUpdateMs >= intervalMs;
}

export function createLastUpdateTimestamp(now = Date.now()): string {
  return new Date(now).toISOString();
}
