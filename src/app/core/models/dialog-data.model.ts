import type { CustomChart, ChartRange } from './chart.model';
import type { Room } from './room.model';

// ── Chart Dialog ─────────────────────────────────────────────────────────────

export interface ChartDialogData {
  /** Provide to open in edit mode; omit for create mode. */
  chart?: CustomChart;
}

export interface ChartDialogResult {
  chart: CustomChart;
}

// ── List View Dialog ──────────────────────────────────────────────────────────

export interface ListViewDialogData {
  chartId: string;
}

// ── Room Detail Dialog ────────────────────────────────────────────────────────

export interface RoomDetailDialogData {
  room: Room;
  chart: CustomChart;
  range: ChartRange | null;
  currentValue: number | null;
  unit: string;
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

export interface DeleteConfirmDialogData {
  chartName: string;
}
