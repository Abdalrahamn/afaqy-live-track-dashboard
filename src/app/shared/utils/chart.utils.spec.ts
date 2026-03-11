import { describe, it, expect } from 'vitest';
import { hasOverlappingRanges, areRangeNamesUnique, generateId } from './chart.utils';
import { ChartRange } from '@core/models';

describe('hasOverlappingRanges', () => {
  it('returns false for empty array', () => {
    expect(hasOverlappingRanges([])).toBe(false);
  });

  it('returns false for a single range', () => {
    const ranges: ChartRange[] = [{ name: 'A', from: 0, to: 10, color: '#fff' }];
    expect(hasOverlappingRanges(ranges)).toBe(false);
  });

  it('returns false for non-overlapping ranges', () => {
    const ranges: ChartRange[] = [
      { name: 'A', from: 0, to: 10, color: '#fff' },
      { name: 'B', from: 10, to: 20, color: '#000' },
      { name: 'C', from: 20, to: 30, color: '#aaa' },
    ];
    expect(hasOverlappingRanges(ranges)).toBe(false);
  });

  it('returns true when two ranges overlap', () => {
    const ranges: ChartRange[] = [
      { name: 'A', from: 0, to: 15, color: '#fff' },
      { name: 'B', from: 10, to: 20, color: '#000' },
    ];
    expect(hasOverlappingRanges(ranges)).toBe(true);
  });

  it('handles unsorted input by sorting before checking', () => {
    const ranges: ChartRange[] = [
      { name: 'B', from: 10, to: 25, color: '#000' },
      { name: 'A', from: 0, to: 15, color: '#fff' },
    ];
    expect(hasOverlappingRanges(ranges)).toBe(true);
  });
});

describe('areRangeNamesUnique', () => {
  it('returns true for empty array', () => {
    expect(areRangeNamesUnique([])).toBe(true);
  });

  it('returns true when all names are unique', () => {
    const ranges: ChartRange[] = [
      { name: 'Low', from: 0, to: 10, color: '#fff' },
      { name: 'Medium', from: 10, to: 20, color: '#000' },
      { name: 'High', from: 20, to: 30, color: '#aaa' },
    ];
    expect(areRangeNamesUnique(ranges)).toBe(true);
  });

  it('returns false when duplicate names exist', () => {
    const ranges: ChartRange[] = [
      { name: 'Low', from: 0, to: 10, color: '#fff' },
      { name: 'low', from: 10, to: 20, color: '#000' },
    ];
    expect(areRangeNamesUnique(ranges)).toBe(false);
  });

  it('is case-insensitive', () => {
    const ranges: ChartRange[] = [
      { name: 'LOW', from: 0, to: 10, color: '#fff' },
      { name: 'Low', from: 10, to: 20, color: '#000' },
    ];
    expect(areRangeNamesUnique(ranges)).toBe(false);
  });
});

describe('generateId', () => {
  it('returns a string starting with "chart-"', () => {
    const id = generateId();
    expect(id).toMatch(/^chart-/);
  });

  it('generates unique IDs on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateId()));
    expect(ids.size).toBe(20);
  });
});
