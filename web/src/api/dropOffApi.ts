import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { DropOff, DropOffPreview, DropOffRequest, HouseholdLookup } from '../types/recycling';

export const dropOffApi = {
  // ----- Centre operator -----

  // Whose QR code is this?
  async lookup(code: string): Promise<HouseholdLookup> {
    const response = await api.get<ApiResponse<HouseholdLookup>>('/drop-offs/lookup', { params: { code } });
    return response.data.data;
  },

  // Work out the points without saving
  async preview(request: DropOffRequest): Promise<DropOffPreview> {
    const response = await api.post<ApiResponse<DropOffPreview>>('/drop-offs/preview', request);
    return response.data.data;
  },

  async create(request: DropOffRequest): Promise<DropOff> {
    const response = await api.post<ApiResponse<DropOff>>('/drop-offs', request);
    return response.data.data;
  },

  async getRecent(): Promise<DropOff[]> {
    const response = await api.get<ApiResponse<DropOff[]>>('/drop-offs/recent');
    return response.data.data;
  },

  // ----- Household -----

  async getMine(): Promise<DropOff[]> {
    const response = await api.get<ApiResponse<DropOff[]>>('/drop-offs/my');
    return response.data.data;
  },

  // ----- Recycler manager / admin -----

  async getPendingReview(): Promise<DropOff[]> {
    const response = await api.get<ApiResponse<DropOff[]>>('/drop-offs/review');
    return response.data.data;
  },

  async approve(id: number, note: string): Promise<DropOff> {
    const response = await api.post<ApiResponse<DropOff>>(`/drop-offs/${id}/approve`, { note });
    return response.data.data;
  },

  async reject(id: number, note: string): Promise<DropOff> {
    const response = await api.post<ApiResponse<DropOff>>(`/drop-offs/${id}/reject`, { note });
    return response.data.data;
  },
};