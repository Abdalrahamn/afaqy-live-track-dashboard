import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChartDialogComponent, ChartDialogData } from './chart-dialog.component';
import { DashboardService } from '@core/services';
import { CustomChart, SensorType, RoomStatus } from '@core/models';

const mockChart: CustomChart = {
  id: 'chart-1',
  name: 'Existing Chart',
  sensorType: SensorType.Temperature,
  roomIds: ['room-1'],
  ranges: [{ name: 'Low', from: 0, to: 30, color: '#4ADE80' }],
  order: 0,
};

const mockRooms = [
  {
    id: 'room-1',
    name: 'Room A',
    floor: 1,
    status: RoomStatus.Online,
    sensors: [{ type: SensorType.Temperature, value: 22, unit: '°C' }],
  },
];

function createMockService(charts: CustomChart[] = []): Partial<DashboardService> {
  return {
    selectableRooms: vi.fn().mockReturnValue(mockRooms),
    charts: signal(charts),
    commonSensorTypes: vi.fn().mockReturnValue([SensorType.Temperature]),
    roomMap: signal(new Map(mockRooms.map((r) => [r.id, r]))),
  };
}

describe('ChartDialogComponent — create mode', () => {
  const mockDialogRef = { close: vi.fn() };
  const createData: ChartDialogData = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChartDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: createData },
        { provide: DashboardService, useValue: createMockService() },
      ],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isEditMode is false when no chart is provided', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.isEditMode).toBe(false);
  });

  it('title is "Add Custom Chart" in create mode', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.title).toBe('Add Custom Chart');
  });

  it('closes dialog on cancel', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    fixture.componentInstance.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('marks form as touched when submitting invalid form', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.form.touched).toBe(true);
  });

  it('initializes with one empty range group', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.rangesArray.length).toBe(1);
  });

  it('addRange increases range count', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    fixture.componentInstance.addRange();
    expect(fixture.componentInstance.rangesArray.length).toBe(2);
  });

  it('removeRange decreases range count when more than one', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    fixture.componentInstance.addRange();
    expect(fixture.componentInstance.rangesArray.length).toBe(2);
    fixture.componentInstance.removeRange(1);
    expect(fixture.componentInstance.rangesArray.length).toBe(1);
  });

  it('does not remove the last range', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    fixture.componentInstance.removeRange(0);
    expect(fixture.componentInstance.rangesArray.length).toBe(1);
  });
});

describe('ChartDialogComponent — edit mode', () => {
  const mockDialogRef = { close: vi.fn() };
  const editData: ChartDialogData = { chart: mockChart };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChartDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: editData },
        { provide: DashboardService, useValue: createMockService([mockChart]) },
      ],
    });
  });

  it('isEditMode is true when chart is provided', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.isEditMode).toBe(true);
  });

  it('title is "Edit Chart" in edit mode', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.title).toBe('Edit Chart');
  });

  it('pre-fills form with existing chart name', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.form.get('name')?.value).toBe('Existing Chart');
  });

  it('pre-fills rangesArray with chart ranges', () => {
    const fixture = TestBed.createComponent(ChartDialogComponent);
    expect(fixture.componentInstance.rangesArray.length).toBe(mockChart.ranges.length);
  });
});
