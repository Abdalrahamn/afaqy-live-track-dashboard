import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Room,
  CustomChart,
  ChartDisplayData,
  ChartSegment,
  SensorBoundsMap,
  SensorType,
  RoomStatus,
  SocketEventType,
} from '@core/models';
import { StorageService } from '../storage/storage.service';
import { SocketService } from '../socket/socket.service';

import mockData from '../../../../assets/data/mock-data.json';

interface MockData {
  rooms: Room[];
  customCharts: CustomChart[];
  chartOrder: string[];
  sensorBounds: SensorBoundsMap;
}

/**
 * Central application state backed by Angular Signals.
 *
 * Responsibilities:
 *  - Hold rooms, charts, chart order as writable signals
 *  - Expose computed signals for chart display data
 *  - Apply socket events to mutate state
 *  - Persist charts + order via StorageService
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  /* ── Raw state signals ──────────────────────────────── */

  readonly rooms = signal<Room[]>([]);
  readonly charts = signal<CustomChart[]>([]);
  readonly chartOrder = signal<string[]>([]);
  readonly sensorBounds = signal<SensorBoundsMap | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly storage = inject(StorageService);
  private readonly socket = inject(SocketService);
  private readonly destroyRef = inject(DestroyRef);

  /* ── Derived / computed state ───────────────────────── */

  /** Charts sorted according to the persisted order */
  readonly orderedCharts = computed<CustomChart[]>(() => {
    const order = this.chartOrder();
    const charts = this.charts();
    const orderMap = new Map(order.map((id, i) => [id, i]));
    return [...charts].sort(
      (a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity),
    );
  });

  /** Full display data (segments + counts) per chart, recomputed on any state change */
  readonly chartDisplayData = computed<ChartDisplayData[]>(() => {
    const rooms = this.rooms();
    const ordered = this.orderedCharts();
    return ordered.map((chart) => this.computeChartData(chart, rooms));
  });

  /** Lookup map: roomId → Room */
  readonly roomMap = computed<Map<string, Room>>(() => {
    return new Map(this.rooms().map((r) => [r.id, r]));
  });

  /** Available sensor types across all loaded rooms */
  readonly availableSensorTypes = computed<SensorType[]>(() => {
    const types = new Set<SensorType>();
    for (const room of this.rooms()) {
      for (const s of room.sensors) {
        types.add(s.type);
      }
    }
    return [...types];
  });

  /* ── Stats computed signals ─────────────────────────── */

  readonly totalRooms = computed(() => this.rooms().length);
  readonly onlineCount = computed(
    () => this.rooms().filter((r) => r.status === RoomStatus.Online).length,
  );
  readonly offlineCount = computed(
    () => this.rooms().filter((r) => r.status === RoomStatus.Offline).length,
  );
  readonly onlinePercentage = computed(() => {
    const total = this.totalRooms();
    return total > 0 ? Math.round((this.onlineCount() / total) * 100) : 0;
  });
  readonly offlinePercentage = computed(() => {
    const total = this.totalRooms();
    return total > 0 ? Math.round((this.offlineCount() / total) * 100) : 0;
  });

  /* ── Initialization ─────────────────────────────────── */

  init(): void {
    try {
      const data = mockData as unknown as MockData;

      // Deep-clone rooms so mutations are safe
      const rooms: Room[] = JSON.parse(JSON.stringify(data.rooms));
      this.rooms.set(rooms);
      this.sensorBounds.set(data.sensorBounds);

      // Load persisted charts / order, fall back to mock data
      const savedCharts = this.storage.loadCharts();
      const savedOrder = this.storage.loadChartOrder();
      this.charts.set(savedCharts ?? data.customCharts);
      this.chartOrder.set(savedOrder ?? data.chartOrder);

      this.loading.set(false);

      // Start the real-time simulation
      this.socket.start(rooms, data.sensorBounds);
      this.socket.socketEvents$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        if (event.type === SocketEventType.SensorUpdate) {
          this.applySensorUpdate(
            event.payload.roomId,
            event.payload.sensorType,
            event.payload.value,
          );
        } else {
          this.applyRoomStatus(event.payload.roomId, event.payload.status);
        }
      });
    } catch (err) {
      this.error.set('Failed to load dashboard data.');
      this.loading.set(false);
      console.error(err);
    }
  }

  /* ── CRUD operations ────────────────────────────────── */

  addChart(chart: CustomChart): void {
    const newCharts = [...this.charts(), chart];
    this.charts.set(newCharts);
    this.chartOrder.update((order) => [...order, chart.id]);
    this.persist();
  }

  updateChart(updated: CustomChart): void {
    this.charts.update((charts) => charts.map((c) => (c.id === updated.id ? updated : c)));
    this.persist();
  }

  deleteChart(chartId: string): void {
    this.charts.update((charts) => charts.filter((c) => c.id !== chartId));
    this.chartOrder.update((order) => order.filter((id) => id !== chartId));
    this.persist();
  }

  reorderCharts(newOrder: string[]): void {
    this.chartOrder.set(newOrder);
    this.storage.saveChartOrder(newOrder);
  }

  /* ── Queries ────────────────────────────────────────── */

  getChartById(id: string): CustomChart | undefined {
    return this.charts().find((c) => c.id === id);
  }

  /**
   * Returns sensor types common across the given room IDs.
   * Used in the chart dialog to filter valid sensor options.
   */
  commonSensorTypes(roomIds: string[]): SensorType[] {
    const map = this.roomMap();
    const rooms = roomIds.map((id) => map.get(id)).filter(Boolean) as Room[];
    if (rooms.length === 0) return [];

    const sets = rooms.map((r) => new Set(r.sensors.map((s) => s.type)));
    const first = sets[0];
    return [...first].filter((type) => sets.every((s) => s.has(type)));
  }

  /** Returns rooms that have at least one sensor */
  selectableRooms(): Room[] {
    return this.rooms().filter((r) => r.sensors.length > 0);
  }

  /* ── Real-time event handlers ───────────────────────── */

  private applySensorUpdate(roomId: string, sensorType: SensorType, value: number): void {
    this.rooms.update((rooms) =>
      rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          sensors: room.sensors.map((s) => (s.type === sensorType ? { ...s, value } : s)),
        };
      }),
    );
  }

  private applyRoomStatus(roomId: string, status: RoomStatus): void {
    this.rooms.update((rooms) =>
      rooms.map((room) => (room.id === roomId ? { ...room, status } : room)),
    );
  }

  /* ── Persistence ────────────────────────────────────── */

  private persist(): void {
    this.storage.saveCharts(this.charts());
    this.storage.saveChartOrder(this.chartOrder());
  }

  /* ── Chart count algorithm ──────────────────────────── */

  private computeChartData(chart: CustomChart, rooms: Room[]): ChartDisplayData {
    const segments: ChartSegment[] = chart.ranges.map((r) => ({
      rangeName: r.name,
      color: r.color,
      count: 0,
      roomIds: [],
    }));

    let totalQualified = 0;

    for (const roomId of chart.roomIds) {
      const room = rooms.find((r) => r.id === roomId);
      if (!room || room.status !== 'online') continue;

      const sensor = room.sensors.find((s) => s.type === chart.sensorType);
      if (sensor === undefined) continue;

      totalQualified++;

      const rangeIndex = this.findRangeIndex(chart, sensor.value);
      if (rangeIndex !== -1) {
        segments[rangeIndex].count++;
        segments[rangeIndex].roomIds.push(roomId);
      }
    }

    return { chart, segments, totalQualified };
  }

  /**
   * Range matching:
   *   from ≤ value < to  (for all ranges except the last)
   *   from ≤ value ≤ to  (for the last range)
   */
  private findRangeIndex(chart: CustomChart, value: number): number {
    const ranges = chart.ranges;
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const isLast = i === ranges.length - 1;
      if (isLast) {
        if (value >= r.from && value <= r.to) return i;
      } else {
        if (value >= r.from && value < r.to) return i;
      }
    }
    return -1;
  }
}
