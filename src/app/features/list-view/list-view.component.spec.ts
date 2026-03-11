import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ListViewComponent, ListViewDialogData } from './list-view.component';
import { DashboardService } from '@core/services';
import { CustomChart, Room, RoomStatus, SensorType } from '@core/models';
import { of } from 'rxjs';

const mockChart: CustomChart = {
  id: 'chart-1',
  name: 'Temp Chart',
  sensorType: SensorType.Temperature,
  roomIds: ['room-1', 'room-2'],
  ranges: [
    { name: 'Low', from: 0, to: 22, color: '#60A5FA' },
    { name: 'High', from: 22, to: 40, color: '#F87171' },
  ],
  order: 0,
};

const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Room Alpha',
    floor: 1,
    status: RoomStatus.Online,
    sensors: [{ type: SensorType.Temperature, value: 20, unit: '°C' }],
  },
  {
    id: 'room-2',
    name: 'Room Beta',
    floor: 2,
    status: RoomStatus.Online,
    sensors: [{ type: SensorType.Temperature, value: 25, unit: '°C' }],
  },
];

function createMockService(): Partial<DashboardService> {
  return {
    charts: signal([mockChart]),
    roomMap: signal(new Map(mockRooms.map((r) => [r.id, r]))),
    getChartById: vi.fn().mockReturnValue(mockChart),
  };
}

describe('ListViewComponent', () => {
  const mockDialogRef = { close: vi.fn() };
  const mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }) };
  const dialogData: ListViewDialogData = { chartId: 'chart-1' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListViewComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: DashboardService, useValue: createMockService() },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computes rows for the chart rooms', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    const rows = fixture.componentInstance.rows();
    expect(rows.length).toBe(2);
    expect(rows[0].room.name).toBe('Room Alpha');
    expect(rows[1].room.name).toBe('Room Beta');
  });

  it('assigns correct sensor value to each row', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    const rows = fixture.componentInstance.rows();
    expect(rows[0].sensorValue).toBe(20);
    expect(rows[1].sensorValue).toBe(25);
  });

  it('assigns range based on sensor value', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    const rows = fixture.componentInstance.rows();
    // Room Alpha (20) → Low range [0, 22)
    expect(rows[0].range?.name).toBe('Low');
    // Room Beta (25) → High range [22, 40] (last)
    expect(rows[1].range?.name).toBe('High');
  });

  it('close calls dialogRef.close', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    fixture.componentInstance.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('trackByRoomId returns room id', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    const rows = fixture.componentInstance.rows();
    expect(fixture.componentInstance.trackByRoomId(0, rows[0])).toBe('room-1');
  });

  it('renders room names in the template', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Room Alpha');
    expect(html).toContain('Room Beta');
  });

  it('chart computed returns the chart', () => {
    const fixture = TestBed.createComponent(ListViewComponent);
    expect(fixture.componentInstance.chart()?.id).toBe('chart-1');
  });
});
