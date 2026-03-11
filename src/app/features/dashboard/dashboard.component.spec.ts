import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '@core/services';
import { ChartDisplayData, SensorType } from '@core/models';
import { of } from 'rxjs';

const mockDisplayData: ChartDisplayData[] = [
  {
    chart: {
      id: 'chart-1',
      name: 'Temp Chart',
      sensorType: SensorType.Temperature,
      roomIds: ['room-1'],
      ranges: [{ name: 'Low', from: 0, to: 30, color: '#4ADE80' }],
      order: 0,
    },
    segments: [{ rangeName: 'Low', color: '#4ADE80', count: 1, roomIds: ['room-1'] }],
    totalQualified: 1,
  },
];

describe('DashboardComponent', () => {
  let mockService: Partial<DashboardService>;
  let mockDialog: Partial<MatDialog>;

  beforeEach(() => {
    mockService = {
      chartDisplayData: signal(mockDisplayData),
      chartOrder: signal(['chart-1']),
      charts: signal(mockDisplayData.map((d) => d.chart)),
      loading: signal(false),
      error: signal(null),
      init: vi.fn(),
      addChart: vi.fn(),
      updateChart: vi.fn(),
      deleteChart: vi.fn(),
      reorderCharts: vi.fn(),
      getChartById: vi.fn().mockReturnValue(mockDisplayData[0].chart),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
    };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: mockService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls dashboardService.init on construction', () => {
    TestBed.createComponent(DashboardComponent);
    expect(mockService.init).toHaveBeenCalled();
  });

  it('onDrop reorders charts via dashboardService', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const event = { previousIndex: 0, currentIndex: 1 } as unknown as CdkDragDrop<
      ChartDisplayData[]
    >;
    fixture.componentInstance.onDrop(event);
    expect(mockService.reorderCharts).toHaveBeenCalled();
  });

  it('openAddDialog opens the ChartDialogComponent', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.openAddDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('openEditDialog opens the ChartDialogComponent when chart exists', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.openEditDialog('chart-1');
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('openEditDialog does nothing if chart is not found', () => {
    (mockService.getChartById as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.openEditDialog('unknown');
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('confirmDelete opens DeleteConfirmDialogComponent when chart exists', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.confirmDelete('chart-1');
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('openListView opens ListViewComponent', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.openListView('chart-1');
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
