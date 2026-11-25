import type { WasteType } from './schedule';

export type PickupStatus = 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface PickupRequest {
  id: number;
  status: PickupStatus;
  wasteType: WasteType;
  description: string;
  preferredDate: string; // "2026-12-05"
  scheduledDate: string | null;
  addressText: string;
  latitude: number;
  longitude: number;
  wardId: number;
  wardName: string;
  councilName: string;
  photoFileName: string | null;
  requesterName: string;
  requesterPhone: string | null;
  driverId: number | null;
  driverName: string | null;
  staffNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreatePickupRequest {
  addressId: number;
  wasteTypeId: number;
  description: string;
  preferredDate: string;
  photoFileName: string | null;
}