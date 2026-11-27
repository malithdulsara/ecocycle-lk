export interface Truck {
  id: number;
  registrationNumber: string; // "WP LB-1234"
  model: string | null;
  capacityKg: number;
  councilId: number;
  councilName: string;
  active: boolean;
  lastSeenAt: string | null;
}

export interface TruckRequest {
  registrationNumber: string;
  model: string | null;
  capacityKg: number;
  councilId: number;
  active: boolean;
}

export type RouteStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

// One truck + one driver collecting in one ward on one day
export interface CollectionRoute {
  id: number;
  routeDate: string; // "2026-11-27"
  status: RouteStatus;
  truckId: number;
  registrationNumber: string;
  driverId: number;
  driverName: string;
  wardId: number;
  wardName: string;
  councilName: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface RouteRequest {
  routeDate: string;
  truckId: number;
  driverId: number;
  wardId: number;
}

// Where a truck is now (from the fleet API and the live WebSocket messages)
export interface TruckPosition {
  truckId: number;
  registrationNumber: string;
  councilName: string;
  routeId: number | null; // null = not on a route
  routeStatus: RouteStatus | null;
  wardId: number | null;
  wardName: string | null;
  driverName: string | null;
  latitude: number | null; // null = no GPS point yet
  longitude: number | null;
  speedKmh: number | null;
  heading: number | null;
  lastSeenAt: string | null;
}

export interface TrailPoint {
  latitude: number;
  longitude: number;
  recordedAt: string;
}

export interface TruckEta {
  truck: TruckPosition;
  distanceKm: number | null;
  etaMinutes: number | null;
}

// Household: trucks working in their ward right now
export interface WardTrucks {
  wardId: number;
  wardName: string;
  homeLatitude: number;
  homeLongitude: number;
  trucks: TruckEta[];
}