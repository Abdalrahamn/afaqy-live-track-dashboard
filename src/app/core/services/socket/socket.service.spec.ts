import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
import { Room, RoomStatus, SensorType, SocketEventType } from '@core/models';

const mockRoom: Room = {
  id: 'room-1',
  name: 'Room 1',
  floor: 1,
  status: RoomStatus.Online,
  sensors: [{ type: SensorType.Temperature, value: 22, unit: '°C' }],
};

const mockSensorBounds = {
  [SensorType.Temperature]: { min: 10, max: 40 },
};

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [SocketService],
    });
    service = TestBed.inject(SocketService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('connected signal is false before start()', () => {
    expect(service.connected()).toBe(false);
  });

  it('connected signal becomes true after start()', () => {
    service.start([mockRoom], mockSensorBounds);
    expect(service.connected()).toBe(true);
  });

  it('connected signal becomes false after stop()', () => {
    service.start([mockRoom], mockSensorBounds);
    service.stop();
    expect(service.connected()).toBe(false);
  });

  it('emits socket events after one tick interval', () => {
    const received: unknown[] = [];
    service.socketEvents$.subscribe((e) => received.push(e));
    service.start([mockRoom], mockSensorBounds);
    vi.advanceTimersByTime(2100);
    expect(received.length).toBeGreaterThan(0);
  });

  it('emits only sensor_update or room_status event types', () => {
    const received: { type: string }[] = [];
    service.socketEvents$.subscribe((e) => received.push(e as { type: string }));
    service.start([mockRoom], mockSensorBounds);
    vi.advanceTimersByTime(2100);
    const validTypes = [SocketEventType.SensorUpdate, SocketEventType.RoomStatus];
    received.forEach((e) => expect(validTypes).toContain(e.type));
  });

  it('does not emit events after stop()', () => {
    const received: unknown[] = [];
    service.socketEvents$.subscribe((e) => received.push(e));
    service.start([mockRoom], mockSensorBounds);
    vi.advanceTimersByTime(2100);
    service.stop();
    const countAfterStop = received.length;
    vi.advanceTimersByTime(4000);
    expect(received.length).toBe(countAfterStop);
  });

  it('updateRooms updates without throwing', () => {
    service.start([mockRoom], mockSensorBounds);
    const newRoom: Room = { ...mockRoom, id: 'room-2', name: 'Room 2' };
    expect(() => service.updateRooms([newRoom])).not.toThrow();
  });
});
