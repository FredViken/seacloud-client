export type Node = {
  id: number;
  name: string;
  sensors: Sensor[];
};

export type SimpleArea = {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export type Area = SimpleArea & {
  nodes: Node[];
}

export type Location = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  aquacultureRegisterSiteNr: number | null;
  areas: Area[];
};

export type LocationsResponse = Location[];

export type AreasResponse = Area[];

export type Position = {
  timestamp: string;
  latitude: number;
  longitude: number;
};

export type PositionsResponse = Position[];

export type CO2Emission = Position & {
  value: number;
}

export type Sensor = {
  id: number;
  name: string;
  typeId: number;
  type: string;
  unit: string;
  depth: number;
  sensorValue: SensorValue;
}

export type SensorValue = {
  timestamp: string;
  value: number;
  lat: number;
  lng: number;
}

export type AggregatedSensorValue = {
  from: string;
  to: string;
  min: number;
  max: number;
  average: number;
}
