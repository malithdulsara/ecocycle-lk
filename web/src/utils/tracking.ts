import { API_URL } from '../api/client';
import type { RouteStatus } from '../types/tracking';

// "http://localhost:8080/api/v1" -> "ws://localhost:8080/ws"
export const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api\/v1\/?$/, '/ws');

export const ROUTE_STATUS_LABELS: Record<RouteStatus, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'On the road',
  COMPLETED: 'Finished',
};

// A truck that has not sent its position for this long is shown as "offline"
const OFFLINE_AFTER_MS = 2 * 60 * 1000;

export function isOffline(lastSeenAt: string | null): boolean {
  return lastSeenAt === null || Date.now() - new Date(lastSeenAt).getTime() > OFFLINE_AFTER_MS;
}

// Time in milliseconds (e.g. from Date.now()) -> whole seconds until now
export function secondsSince(time: number): number {
  return Math.max(0, Math.round((Date.now() - time) / 1000));
}

// "just now", "3 min ago", "2 h ago"
export function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) {
    return 'never';
  }
  const minutes = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 60_000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  return `${Math.floor(minutes / 60)} h ago`;
}

// Same rough formula as the backend's EtaCalculator:
// straight-line distance + 30% for roads, at an average of 15 km/h
const ROAD_FACTOR = 1.3;
const AVERAGE_SPEED_KMH = 15;

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function etaMinutes(km: number): number {
  return Math.ceil(((km * ROAD_FACTOR) / AVERAGE_SPEED_KMH) * 60);
}

// 23 -> "about 23 min", 75 -> "about 1 h 15 min"
export function formatEta(minutes: number): string {
  if (minutes <= 1) {
    return 'arriving now';
  }
  if (minutes < 60) {
    return `about ${minutes} min`;
  }
  const rest = minutes % 60;
  return `about ${Math.floor(minutes / 60)} h${rest > 0 ? ` ${rest} min` : ''}`;
}