import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { TruckPosition, WardTrucks } from '../types/tracking';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  heading: number | null;
}

export const trackingApi = {
  // Driver: send the phone's current GPS position
  async sendLocation(update: LocationUpdate): Promise<TruckPosition> {
    const response = await api.post<ApiResponse<TruckPosition>>('/tracking/location', update);
    return response.data.data;
  },

  // Officer / admin: every truck and where it was last seen
  async getFleet(): Promise<TruckPosition[]> {
    const response = await api.get<ApiResponse<TruckPosition[]>>('/tracking/fleet');
    return response.data.data;
  },

  // Household: trucks in my ward right now, with arrival time
  async getMyWard(): Promise<WardTrucks> {
    const response = await api.get<ApiResponse<WardTrucks>>('/tracking/my-ward');
    return response.data.data;
  },
};