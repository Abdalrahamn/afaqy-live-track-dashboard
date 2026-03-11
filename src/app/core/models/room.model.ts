import { Sensor } from './sensor.model';

export enum RoomStatus {
  Online = 'online',
  Offline = 'offline',
}

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly floor: number;
  status: RoomStatus;
  sensors: Sensor[];
}
