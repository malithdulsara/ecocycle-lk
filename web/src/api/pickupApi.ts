import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { CreatePickupRequest, PickupRequest, PickupStatus } from '../types/pickup';

export const pickupApi = {
  // ----- Household -----

  async create(request: CreatePickupRequest): Promise<PickupRequest> {
    const response = await api.post<ApiResponse<PickupRequest>>('/pickup-requests', request);
    return response.data.data;
  },

  async getMine(): Promise<PickupRequest[]> {
    const response = await api.get<ApiResponse<PickupRequest[]>>('/pickup-requests/my');
    return response.data.data;
  },

  async cancel(id: number): Promise<PickupRequest> {
    const response = await api.post<ApiResponse<PickupRequest>>(`/pickup-requests/${id}/cancel`);
    return response.data.data;
  },

  // ----- Council officer / admin -----

  async getAll(status?: PickupStatus): Promise<PickupRequest[]> {
    const response = await api.get<ApiResponse<PickupRequest[]>>('/pickup-requests', { params: { status } });
    return response.data.data;
  },

  async approve(id: number, scheduledDate: string, note: string | null): Promise<PickupRequest> {
    const response = await api.post<ApiResponse<PickupRequest>>(`/pickup-requests/${id}/approve`, {
      scheduledDate,
      note,
    });
    return response.data.data;
  },

  async reject(id: number, reason: string): Promise<PickupRequest> {
    const response = await api.post<ApiResponse<PickupRequest>>(`/pickup-requests/${id}/reject`, { reason });
    return response.data.data;
  },

  async assign(id: number, driverId: number): Promise<PickupRequest> {
    const response = await api.post<ApiResponse<PickupRequest>>(`/pickup-requests/${id}/assign`, { driverId });
    return response.data.data;
  },

  // ----- Driver (and staff) -----

  async getAssigned(): Promise<PickupRequest[]> {
    const response = await api.get<ApiResponse<PickupRequest[]>>('/pickup-requests/assigned');
    return response.data.data;
  },

  async complete(id: number): Promise<PickupRequest> {
    const response = await api.post<ApiResponse<PickupRequest>>(`/pickup-requests/${id}/complete`);
    return response.data.data;
  },
};