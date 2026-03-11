import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RoomDetailComponent } from './room-detail.component';
import { Room, CustomChart, ChartRange, RoomStatus, SensorType } from '@core/models';

const mockRoom: Room = {
  id: 'room-1',
  name: 'Conference Room',
  floor: 2,
  status: RoomStatus.Online,
  sensors: [{ type: SensorType.Temperature, value: 22, unit: '°C' }],
};

const mockChart: CustomChart = {
  id: 'chart-1',
  name: 'Temperature Chart',
  sensorType: SensorType.Temperature,
  roomIds: ['room-1'],
  ranges: [{ name: 'Comfort', from: 18, to: 26, color: '#4ADE80' }],
  order: 0,
};

const mockRange: ChartRange = { name: 'Comfort', from: 18, to: 26, color: '#4ADE80' };

describe('RoomDetailComponent', () => {
  const mockDialogRef = { close: () => {} };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RoomDetailComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            room: mockRoom,
            chart: mockChart,
            range: mockRange,
            currentValue: 22,
            unit: '°C',
          },
        },
      ],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(RoomDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes the injected dialog data', () => {
    const fixture = TestBed.createComponent(RoomDetailComponent);
    const cmp = fixture.componentInstance;
    expect(cmp.data.room.name).toBe('Conference Room');
    expect(cmp.data.currentValue).toBe(22);
    expect(cmp.data.range?.name).toBe('Comfort');
  });

  it('renders the room name in the template', () => {
    const fixture = TestBed.createComponent(RoomDetailComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Conference Room');
  });

  it('renders the sensor value in the template', () => {
    const fixture = TestBed.createComponent(RoomDetailComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('22');
  });
});
