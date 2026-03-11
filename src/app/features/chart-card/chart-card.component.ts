import {
  Component,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  input,
  output,
  ElementRef,
  viewChild,
  effect,
  computed,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartDisplayData } from '@core/models';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-chart-card',
  imports: [TitleCasePipe, MatIconModule, MatButtonModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.scss',
})
export class ChartCardComponent {
  /** Input chart display data (segments + metadata) */
  readonly data = input.required<ChartDisplayData>();

  /** Emitters for parent actions */
  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly openList = output<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chartInstance: Chart<'doughnut'> | null = null;

  readonly hasData = computed(() => this.data().segments.some((s) => s.count > 0));

  private readonly _onDestroy = this.destroyRef.onDestroy(() => {
    this.chartInstance?.destroy();
  });

  private readonly _chartEffect = effect(() => {
    const canvas = this.canvasRef();
    const displayData = this.data();
    if (!canvas) return;
    this.renderChart(canvas.nativeElement, displayData);
  });

  onEdit(): void {
    this.edit.emit(this.data().chart.id);
  }

  onDelete(): void {
    this.delete.emit(this.data().chart.id);
  }

  onOpenList(): void {
    this.openList.emit(this.data().chart.id);
  }

  /* ── Chart.js rendering ───────────────────────────── */

  private renderChart(canvas: HTMLCanvasElement, displayData: ChartDisplayData): void {
    const labels = displayData.segments.map((s) => s.rangeName);
    const data = displayData.segments.map((s) => s.count);
    const colors = displayData.segments.map((s) => s.color);

    if (this.chartInstance) {
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.data.datasets[0].backgroundColor = colors;
      this.chartInstance.update('none'); // skip animation for live updates
      return;
    }

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label ?? '';
                const value = ctx.parsed;
                return ` ${label}: ${value} room${value !== 1 ? 's' : ''}`;
              },
            },
          },
        },
      },
    });
  }
}
