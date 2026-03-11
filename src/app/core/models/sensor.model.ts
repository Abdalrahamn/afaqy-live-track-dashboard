export enum SensorType {
  Temperature = 'temperature',
  Humidity = 'humidity',
  Co2 = 'co2',
}

export interface Sensor {
  readonly type: SensorType;
  value: number;
  readonly unit: string;
}

export interface SensorBounds {
  readonly min: number;
  readonly max: number;
  readonly unit: string;
}

export type SensorBoundsMap = Record<SensorType, SensorBounds>;
