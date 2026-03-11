import {
  Component,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  viewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  DoughnutController,
  ArcElement,
  Tooltip,
} from 'chart.js';

import { DashboardService } from '@core/services';
import {
  WEEKDAY_LABELS,
  TREND_SAMPLE_DATA,
  BRAND_COLOR,
  BRAND_COLOR_ALPHA,
  TREND_Y_MIN,
  TREND_Y_MAX,
  DIALOG_WIDTHS,
  DIALOG_HEIGHTS,
  DIALOG_MAX_HEIGHT,
} from '@core/constants';
import { ChartDisplayData } from '@core/models';
import { ChartCardComponent } from '@features/chart-card/chart-card.component';
import {
  ChartDialogComponent,
  ChartDialogData,
  ChartDialogResult,
} from '@features/chart-dialog/chart-dialog.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData,
} from '@features/delete-confirm-dialog/delete-confirm-dialog.component';
import { ListViewComponent, ListViewDialogData } from '@features/list-view/list-view.component';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  DoughnutController,
  ArcElement,
  Tooltip,
);

@Component({
  selector: 'app-dashboard',
  imports: [
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    ChartCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  private readonly trendCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('trendCanvas');
  private readonly statusCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('statusCanvas');
  private trendChart: Chart | null = null;
  private statusChart: Chart<'doughnut'> | null = null;

  constructor() {
    this.dashboardService.init();

    this.destroyRef.onDestroy(() => {
      this.trendChart?.destroy();
      this.statusChart?.destroy();
    });
  }

  private readonly _trendEffect = effect(() => {
    const canvas = this.trendCanvasRef();
    if (!canvas || this.dashboardService.loading()) return;
    this.renderTrendChart(canvas.nativeElement);
  });

  private readonly _statusEffect = effect(() => {
    const canvas = this.statusCanvasRef();
    const online = this.dashboardService.onlineCount();
    const offline = this.dashboardService.offlineCount();
    if (!canvas) return;
    this.renderStatusChart(canvas.nativeElement, online, offline);
  });

  /* ── Actions ────────────────────────────────────────── */

  openAddDialog(): void {
    const ref = this.dialog.open(ChartDialogComponent, {
      width: DIALOG_WIDTHS.STANDARD,
      height: DIALOG_HEIGHTS.ADD_EDIT,
      disableClose: true,
      data: {} as ChartDialogData,
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result?: ChartDialogResult) => {
        if (result) {
          this.dashboardService.addChart(result.chart);
        }
      });
  }

  openEditDialog(chartId: string): void {
    const chart = this.dashboardService.getChartById(chartId);
    if (!chart) return;

    const ref = this.dialog.open(ChartDialogComponent, {
      width: DIALOG_WIDTHS.STANDARD,
      height: DIALOG_HEIGHTS.ADD_EDIT,
      disableClose: true,
      data: { chart } as ChartDialogData,
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result?: ChartDialogResult) => {
        if (result) {
          this.dashboardService.updateChart(result.chart);
        }
      });
  }

  confirmDelete(chartId: string): void {
    const chart = this.dashboardService.getChartById(chartId);
    if (!chart) return;

    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: DIALOG_WIDTHS.NARROW,
      data: { chartName: chart.name } as DeleteConfirmDialogData,
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          this.dashboardService.deleteChart(chartId);
        }
      });
  }

  openListView(chartId: string): void {
    this.dialog.open(ListViewComponent, {
      width: DIALOG_WIDTHS.WIDE,
      height: DIALOG_HEIGHTS.LIST,
      panelClass: 'list-view-dialog',
      data: { chartId } as ListViewDialogData,
    });
  }

  onDrop(event: CdkDragDrop<ChartDisplayData[]>): void {
    const currentOrder = [...this.dashboardService.chartOrder()];
    moveItemInArray(currentOrder, event.previousIndex, event.currentIndex);
    this.dashboardService.reorderCharts(currentOrder);
  }

  /* ── Overview Charts ────────────────────────────────── */

  private renderTrendChart(canvas: HTMLCanvasElement): void {
    if (this.trendChart) return;

    this.trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [...WEEKDAY_LABELS],
        datasets: [
          {
            data: [...TREND_SAMPLE_DATA],
            borderColor: BRAND_COLOR,
            backgroundColor: BRAND_COLOR_ALPHA,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: BRAND_COLOR,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#94a3b8', font: { size: 12 } },
            min: TREND_Y_MIN,
            max: TREND_Y_MAX,
          },
        },
      },
    });
  }

  private renderStatusChart(canvas: HTMLCanvasElement, online: number, offline: number): void {
    if (this.statusChart) {
      this.statusChart.data.datasets[0].data = [online, offline];
      this.statusChart.update('none');
      return;
    }

    this.statusChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Online', 'Offline'],
        datasets: [
          {
            data: [online, offline],
            backgroundColor: ['#4F6BED', '#F87171'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  }
}
