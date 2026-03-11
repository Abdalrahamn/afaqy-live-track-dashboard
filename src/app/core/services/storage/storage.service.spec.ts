import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from './storage.service';
import { CustomChart, SensorType } from '@core/models';

const mockChart: CustomChart = {
  id: 'chart-1',
  name: 'Test Chart',
  sensorType: SensorType.Temperature,
  roomIds: ['room-1'],
  ranges: [{ name: 'Low', from: 0, to: 25, color: '#4ADE80' }],
  order: 0,
};

describe('StorageService', () => {
  let service: StorageService;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      store[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete store[key];
    });

    service = new StorageService();
  });

  describe('loadCharts', () => {
    it('returns null when nothing is stored', () => {
      expect(service.loadCharts()).toBeNull();
    });

    it('returns parsed charts from localStorage', () => {
      store['dashboard_custom_charts'] = JSON.stringify([mockChart]);
      expect(service.loadCharts()).toEqual([mockChart]);
    });
  });

  describe('saveCharts', () => {
    it('persists charts to localStorage', () => {
      service.saveCharts([mockChart]);
      expect(store['dashboard_custom_charts']).toBe(JSON.stringify([mockChart]));
    });
  });

  describe('loadChartOrder', () => {
    it('returns null when nothing is stored', () => {
      expect(service.loadChartOrder()).toBeNull();
    });

    it('returns parsed order from localStorage', () => {
      store['dashboard_chart_order'] = JSON.stringify(['chart-1', 'chart-2']);
      expect(service.loadChartOrder()).toEqual(['chart-1', 'chart-2']);
    });
  });

  describe('saveChartOrder', () => {
    it('persists chart order to localStorage', () => {
      service.saveChartOrder(['chart-1', 'chart-2']);
      expect(store['dashboard_chart_order']).toBe(JSON.stringify(['chart-1', 'chart-2']));
    });
  });

  describe('clear', () => {
    it('removes both charts and order from localStorage', () => {
      store['dashboard_custom_charts'] = JSON.stringify([mockChart]);
      store['dashboard_chart_order'] = JSON.stringify(['chart-1']);
      service.clear();
      expect(store['dashboard_custom_charts']).toBeUndefined();
      expect(store['dashboard_chart_order']).toBeUndefined();
    });
  });
});
