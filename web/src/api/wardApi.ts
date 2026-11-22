import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Ward, WardRequest } from '../types/admin';

export const wardApi = {
  async getByCouncil(councilId: number): Promise<Ward[]> {
    const response = await api.get<ApiResponse<Ward[]>>(`/councils/${councilId}/wards`);
    return response.data.data;
  },

  async create(councilId: number, request: WardRequest): Promise<Ward> {
    const response = await api.post<ApiResponse<Ward>>(`/councils/${councilId}/wards`, request);
    return response.data.data;
  },

  async update(id: number, request: WardRequest): Promise<Ward> {
    const response = await api.put<ApiResponse<Ward>>(`/wards/${id}`, request);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/wards/${id}`);
  },
};