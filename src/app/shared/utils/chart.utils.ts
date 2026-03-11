import { ChartRange } from '@core/models';

/**
 * Returns true if any two ranges in the array overlap.
 * Ranges are considered overlapping if they share any value.
 */
export function hasOverlappingRanges(ranges: ChartRange[]): boolean {
  const sorted = [...ranges].sort((a, b) => a.from - b.from);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from < sorted[i - 1].to) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if all range names are unique (case-insensitive).
 */
export function areRangeNamesUnique(ranges: ChartRange[]): boolean {
  const names = ranges.map((r) => r.name.trim().toLowerCase());
  return new Set(names).size === names.length;
}

/**
 * Generates a UUID-like identifier suitable for chart IDs.
 */
export function generateId(): string {
  return `chart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
