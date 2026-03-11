import { SensorType } from './sensor.model';
import { RoomStatus } from './room.model';

export enum SocketEventType {
  SensorUpdate = 'sensor_update',
  RoomStatus = 'room_status',
}

export interface SensorUpdateEvent {
  roomId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
}

export interface RoomStatusEvent {
  roomId: string;
  status: RoomStatus;
  timestamp: string;
}

export type SocketEvent =
  | { type: SocketEventType.SensorUpdate; payload: SensorUpdateEvent }
  | { type: SocketEventType.RoomStatus; payload: RoomStatusEvent };
