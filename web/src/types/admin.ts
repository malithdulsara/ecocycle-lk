import type { Role } from './api';

// One map point as the backend sends it: [longitude, latitude]
export type LngLat = [number, number];

export interface Council {
  id: number;
  name: string;
  district: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface CouncilRequest {
  name: string;
  district: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface Ward {
  id: number;
  councilId: number;
  councilName: string;
  name: string;
  wardCode: string;
  boundary: LngLat[] | null;
}

export interface WardRequest {
  name: string;
  wardCode: string;
  boundary: LngLat[] | null;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone: string | null;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  role?: Role;
  enabled?: boolean;
}