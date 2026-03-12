import { Room } from './room.model';
import { CustomChart } from './chart.model';
import { SensorBoundsMap } from './sensor.model';

export interface MockData {
  rooms: Room[];
  customCharts: CustomChart[];
  chartOrder: string[];
  sensorBounds: SensorBoundsMap;
}
