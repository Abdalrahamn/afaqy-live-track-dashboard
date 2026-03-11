import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CustomChart, ChartRange, RoomStatus, ListViewDialogData } from '@core/models';
import { DashboardService } from '@core/services';
import {
  RoomDetailComponent,
  RoomDetailDialogData,
} from '@features/room-detail/room-detail.component';
import { exportToCsv, CsvColumn } from '@shared/utils';
import { RoomRow } from './list-view.model';

export type { ListViewDialogData };

@Component({
  selector: 'app-list-view',
  imports: [TitleCasePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss',
})
export class ListViewComponent {
  protected readonly RoomStatus = RoomStatus;
  private readonly dialogRef = inject(MatDialogRef<ListViewComponent>);
  private readonly dialogData = inject<ListViewDialogData>(MAT_DIALOG_DATA);
  private readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(MatDialog);

  readonly searchQuery = signal('');

  readonly displayedColumns = ['name', 'floor', 'status', 'value', 'range'];

  readonly chart = computed<CustomChart | undefined>(() =>
    this.dashboardService.getChartById(this.dialogData.chartId),
  );

  readonly rows = computed<RoomRow[]>(() => {
    const chart = this.dashboardService.charts().find((c) => c.id === this.dialogData.chartId);
    if (!chart) return [];

    const roomMap = this.dashboardService.roomMap();
    const rows: RoomRow[] = [];

    for (const roomId of chart.roomIds) {
      const room = roomMap.get(roomId);
      if (!room) continue;

      const sensor = room.sensors.find((s) => s.type === chart.sensorType);
      const sensorValue = sensor?.value ?? null;
      const unit = sensor?.unit ?? '';
      const range = sensorValue !== null ? this.findRange(chart, sensorValue) : null;

      rows.push({ room, sensorValue, unit, range });
    }

    return rows;
  });

  readonly filteredRows = computed<RoomRow[]>(() => {
    const query = this.searchQuery().toLowerCase();
    const allRows = this.rows();
    if (!query) return allRows;
    return allRows.filter((row) => row.room.name.toLowerCase().includes(query));
  });

  readonly rangeSummary = computed(() => {
    const chart = this.chart();
    const allRows = this.rows();
    if (!chart) return [];
    return chart.ranges.map((range) => ({
      name: range.name,
      color: range.color,
      count: allRows.filter((r) => r.range?.name === range.name).length,
    }));
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  close(): void {
    this.dialogRef.close();
  }

  openRoomDetail(row: RoomRow): void {
    const chart = this.chart();
    if (!chart) return;

    this.dialog.open(RoomDetailComponent, {
      width: '480px',
      data: {
        room: row.room,
        chart,
        range: row.range,
        currentValue: row.sensorValue,
        unit: row.unit,
      } as RoomDetailDialogData,
    });
  }

  exportCsv(): void {
    const chart = this.chart();
    if (!chart) return;

    const columns: CsvColumn<RoomRow>[] = [
      { header: 'Room', accessor: (r) => r.room.name },
      { header: 'Floor', accessor: (r) => r.room.floor },
      { header: 'Status', accessor: (r) => r.room.status },
      { header: `${chart.sensorType} Value`, accessor: (r) => r.sensorValue ?? 'N/A' },
      { header: 'Unit', accessor: (r) => r.unit },
      { header: 'Range', accessor: (r) => r.range?.name ?? 'Out of range' },
    ];

    exportToCsv(`${chart.name}-list.csv`, this.rows(), columns);
  }

  trackByRoomId(_index: number, row: RoomRow): string {
    return row.room.id;
  }

  private findRange(chart: CustomChart, value: number): ChartRange | null {
    for (let i = 0; i < chart.ranges.length; i++) {
      const r = chart.ranges[i];
      const isLast = i === chart.ranges.length - 1;
      if (isLast ? value >= r.from && value <= r.to : value >= r.from && value < r.to) {
        return r;
      }
    }
    return null;
  }
}
