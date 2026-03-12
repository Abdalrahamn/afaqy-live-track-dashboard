import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import {
  Room,
  SensorBoundsMap,
  SocketEvent,
  SensorUpdateEvent,
  RoomStatusEvent,
  RoomStatus,
  SocketEventType,
} from '@core/models';
import { SOCKET_TICK_MS } from '@core/constants';

/**
 * Simulates a WebSocket connection as specified in mock-socket.json.
 *
 * Every 2 seconds it emits:
 *  - sensor_update for a random subset of online rooms
 *  - occasionally a room_status toggle
 */
@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly events$ = new Subject<SocketEvent>();
  private tickSub: Subscription | null = null;

  /** Expose as observable so consumers can pipe / subscribe */
  readonly socketEvents$: Observable<SocketEvent> = this.events$.asObservable();

  /** Tracks whether the simulation is active */
  readonly connected = signal(false);

  private rooms: Room[] = [];
  private sensorBounds: SensorBoundsMap | null = null;

  /**
   * Starts the simulation loop.
   * Must be called after mock data is loaded so rooms & bounds are available.
   */
  private readonly _cleanup = this.destroyRef.onDestroy(() => this.stop());

  start(rooms: Room[], sensorBounds: SensorBoundsMap): void {
    this.rooms = rooms;
    this.sensorBounds = sensorBounds;
    this.connected.set(true);

    this.tickSub = interval(SOCKET_TICK_MS).subscribe(() => this.tick());
  }

  stop(): void {
    this.tickSub?.unsubscribe();
    this.tickSub = null;
    this.connected.set(false);
  }

  /** Update the room reference when rooms change externally */
  updateRooms(rooms: Room[]): void {
    this.rooms = rooms;
  }

  /* ── Private ────────────────────────────────────────── */

  private tick(): void {
    // 1. Emit sensor updates for a random subset of online rooms
    const onlineRooms = this.rooms.filter((r) => r.status === RoomStatus.Online);
    const count = Math.max(1, Math.floor(onlineRooms.length * 0.3));
    const selected = this.pickRandom(onlineRooms, count);

    for (const room of selected) {
      const sensor = room.sensors[Math.floor(Math.random() * room.sensors.length)];
      const bounds = this.sensorBounds?.[sensor.type];
      if (!bounds) continue;

      const newValue = this.randomInRange(bounds.min, bounds.max);
      const event: SensorUpdateEvent = {
        roomId: room.id,
        sensorType: sensor.type,
        value: parseFloat(newValue.toFixed(1)),
        unit: sensor.unit,
        timestamp: new Date().toISOString(),
      };
      this.events$.next({ type: SocketEventType.SensorUpdate, payload: event });
    }

    // 2. Occasionally toggle a room's online/offline status (~10 % chance per tick)
    if (Math.random() < 0.1) {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const newStatus = room.status === RoomStatus.Online ? RoomStatus.Offline : RoomStatus.Online;
      const event: RoomStatusEvent = {
        roomId: room.id,
        status: newStatus,
        timestamp: new Date().toISOString(),
      };
      this.events$.next({ type: SocketEventType.RoomStatus, payload: event });
    }
  }

  private pickRandom<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
