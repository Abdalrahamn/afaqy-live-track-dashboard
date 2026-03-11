import { Injectable } from '@angular/core';
import { CustomChart } from '@core/models';
import { STORAGE_KEYS } from '@core/constants';

/**
 * Thin persistence layer using localStorage.
 * In a production app this would be swapped for an HTTP-backed service.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /* ── Charts ─────────────────────────────────────────── */

  loadCharts(): CustomChart[] | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARTS);
    return raw ? (JSON.parse(raw) as CustomChart[]) : null;
  }

  saveCharts(charts: CustomChart[]): void {
    localStorage.setItem(STORAGE_KEYS.CHARTS, JSON.stringify(charts));
  }

  /* ── Chart Order ────────────────────────────────────── */

  loadChartOrder(): string[] | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDER);
    return raw ? (JSON.parse(raw) as string[]) : null;
  }

  saveChartOrder(order: string[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(order));
  }

  /* ── Utility ────────────────────────────────────────── */

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.CHARTS);
    localStorage.removeItem(STORAGE_KEYS.ORDER);
  }
}
