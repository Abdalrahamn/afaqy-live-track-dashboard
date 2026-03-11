import { SensorType } from './sensor.model';

export interface ChartRange {
  name: string;
  from: number;
  to: number;
  color: string;
}

export interface CustomChart {
  id: string;
  name: string;
  sensorType: SensorType;
  roomIds: string[];
  ranges: ChartRange[];
  order: number;
}

/** Computed segment data fed to the doughnut chart */
export interface ChartSegment {
  rangeName: string;
  color: string;
  count: number;
  roomIds: string[];
}

/** Aggregated chart data for display */
export interface ChartDisplayData {
  chart: CustomChart;
  segments: ChartSegment[];
  totalQualified: number;
}
