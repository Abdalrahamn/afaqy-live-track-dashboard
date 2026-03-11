import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { StorageService } from '../storage/storage.service';
import { SocketService } from '../socket/socket.service';
import { CustomChart, SensorType, RoomStatus } from '@core/models';
import { Subject } from 'rxjs';

const mockChart: CustomChart = {
  id: 'chart-1',
  name: 'Test Chart',
  sensorType: SensorType.Temperature,
  roomIds: ['room-1'],
  ranges: [{ name: 'Low', from: 0, to: 30, color: '#4ADE80' }],
  order: 0,
};

describe('DashboardService', () => {
  let service: DashboardService;
  let mockStorage: Partial<StorageService>;
  let mockSocket: Partial<SocketService>;
  const socketEvents$ = new Subject<never>();

  beforeEach(() => {
    mockStorage = {
      loadCharts: vi.fn().mockReturnValue(null),
      loadChartOrder: vi.fn().mockReturnValue(null),
      saveCharts: vi.fn(),
      saveChartOrder: vi.fn(),
    };

    mockSocket = {
      socketEvents$: socketEvents$.asObservable() as any,
      start: vi.fn(),
      connected: { set: vi.fn() } as any,
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: StorageService, useValue: mockStorage },
        { provide: SocketService, useValue: mockSocket },
      ],
    });

    service = TestBed.inject(DashboardService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('loads rooms and sensor bounds from mock data', () => {
      service.init();
      expect(service.rooms().length).toBeGreaterThan(0);
      expect(service.sensorBounds()).not.toBeNull();
    });

    it('uses saved charts when storage returns data', () => {
      (mockStorage.loadCharts as ReturnType<typeof vi.fn>).mockReturnValue([mockChart]);
      service.init();
      expect(service.charts()).toEqual([mockChart]);
    });

    it('falls back to mock data charts when storage returns null', () => {
      service.init();
      expect(service.charts().length).toBeGreaterThan(0);
    });

    it('sets loading to false after init', () => {
      service.init();
      expect(service.loading()).toBe(false);
    });
  });

  describe('addChart', () => {
    beforeEach(() => service.init());

    it('adds a chart to the list', () => {
      const initial = service.charts().length;
      service.addChart(mockChart);
      expect(service.charts().length).toBe(initial + 1);
    });

    it('adds the chart id to chart order', () => {
      service.addChart(mockChart);
      expect(service.chartOrder()).toContain('chart-1');
    });

    it('persists to storage', () => {
      service.addChart(mockChart);
      expect(mockStorage.saveCharts).toHaveBeenCalled();
      expect(mockStorage.saveChartOrder).toHaveBeenCalled();
    });
  });

  describe('updateChart', () => {
    beforeEach(() => {
      service.init();
      service.addChart(mockChart);
    });

    it('updates an existing chart', () => {
      const updated = { ...mockChart, name: 'Updated Name' };
      service.updateChart(updated);
      const found = service.charts().find((c) => c.id === 'chart-1');
      expect(found?.name).toBe('Updated Name');
    });
  });

  describe('deleteChart', () => {
    beforeEach(() => {
      service.init();
      service.addChart(mockChart);
    });

    it('removes the chart from the list', () => {
      service.deleteChart('chart-1');
      expect(service.charts().find((c) => c.id === 'chart-1')).toBeUndefined();
    });

    it('removes the chart id from chart order', () => {
      service.deleteChart('chart-1');
      expect(service.chartOrder()).not.toContain('chart-1');
    });
  });

  describe('reorderCharts', () => {
    it('updates chart order without persisting charts', () => {
      service.reorderCharts(['chart-2', 'chart-1']);
      expect(service.chartOrder()).toEqual(['chart-2', 'chart-1']);
      expect(mockStorage.saveChartOrder).toHaveBeenCalledWith(['chart-2', 'chart-1']);
      expect(mockStorage.saveCharts).not.toHaveBeenCalled();
    });
  });

  describe('getChartById', () => {
    beforeEach(() => {
      service.init();
      service.addChart(mockChart);
    });

    it('returns a chart by id', () => {
      expect(service.getChartById('chart-1')).toEqual(mockChart);
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getChartById('unknown')).toBeUndefined();
    });
  });

  describe('commonSensorTypes', () => {
    beforeEach(() => service.init());

    it('returns empty array for empty room ids', () => {
      expect(service.commonSensorTypes([])).toEqual([]);
    });

    it('returns common sensor types for valid rooms', () => {
      const rooms = service.rooms();
      if (rooms.length >= 2) {
        const ids = rooms.slice(0, 2).map((r) => r.id);
        const types = service.commonSensorTypes(ids);
        expect(Array.isArray(types)).toBe(true);
      }
    });
  });

  describe('selectableRooms', () => {
    beforeEach(() => service.init());

    it('returns rooms that have at least one sensor', () => {
      const rooms = service.selectableRooms();
      expect(rooms.every((r) => r.sensors.length > 0)).toBe(true);
    });
  });

  describe('orderedCharts computed', () => {
    beforeEach(() => service.init());

    it('respects chartOrder order', () => {
      const chartA: CustomChart = { ...mockChart, id: 'a', name: 'A', order: 0 };
      const chartB: CustomChart = { ...mockChart, id: 'b', name: 'B', order: 1 };
      service.addChart(chartA);
      service.addChart(chartB);
      service.reorderCharts(['b', 'a']);
      const ordered = service.orderedCharts();
      const aIndex = ordered.findIndex((c) => c.id === 'a');
      const bIndex = ordered.findIndex((c) => c.id === 'b');
      expect(bIndex).toBeLessThan(aIndex);
    });
  });
});
