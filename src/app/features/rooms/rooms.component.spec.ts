import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RoomsComponent } from './rooms.component';
import { DashboardService } from '@core/services';
import { Room, RoomStatus } from '@core/models';

const mockRooms: Room[] = [
  {
    id: 'r-101',
    name: 'Room 101',
    floor: 1,
    status: RoomStatus.Online,
    sensors: [{ type: 'temperature' as any, value: 21.5, unit: '°C' }],
  },
  {
    id: 'r-102',
    name: 'Room 102',
    floor: 1,
    status: RoomStatus.Offline,
    sensors: [{ type: 'humidity' as any, value: 55, unit: '%' }],
  },
];

describe('RoomsComponent', () => {
  let mockService: Partial<DashboardService>;

  beforeEach(() => {
    mockService = {
      rooms: signal(mockRooms),
      loading: signal(false),
      error: signal(null),
      onlineCount: signal(1),
      offlineCount: signal(1),
      init: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      imports: [RoomsComponent],
      providers: [{ provide: DashboardService, useValue: mockService }],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(RoomsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls init on construction', () => {
    TestBed.createComponent(RoomsComponent);
    expect(mockService.init).toHaveBeenCalledOnce();
  });

  it('shows all rooms when no search query', () => {
    const fixture = TestBed.createComponent(RoomsComponent);
    expect(fixture.componentInstance.filteredRooms().length).toBe(2);
  });

  it('filters rooms by name', () => {
    const fixture = TestBed.createComponent(RoomsComponent);
    fixture.componentInstance.searchQuery.set('101');
    expect(fixture.componentInstance.filteredRooms().length).toBe(1);
    expect(fixture.componentInstance.filteredRooms()[0].name).toBe('Room 101');
  });

  it('filters rooms by floor', () => {
    const fixture = TestBed.createComponent(RoomsComponent);
    fixture.componentInstance.searchQuery.set('floor 2');
    expect(fixture.componentInstance.filteredRooms().length).toBe(0);
  });
});
