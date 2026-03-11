import type { Room, ChartRange } from '@core/models';

export interface RoomRow {
  room: Room;
  sensorValue: number | null;
  unit: string;
  range: ChartRange | null;
}
