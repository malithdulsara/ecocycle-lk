import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Council, CouncilRequest } from '../types/admin';

export const councilApi = {
  async getAll(): Promise<Council[]> {
    const response = await api.get<ApiResponse<Council[]>>('/councils');
    return response.data.data;
  },

  async getById(id: number): Promise<Council> {
    const response = await api.get<ApiResponse<Council>>(`/councils/${id}`);
    return response.data.data;
  },

  async create(request: CouncilRequest): Promise<Council> {
    const response = await api.post<ApiResponse<Council>>('/councils', request);
    return response.data.data;
  },

  async update(id: number, request: CouncilRequest): Promise<Council> {
    const response = await api.put<ApiResponse<Council>>(`/councils/${id}`, request);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/councils/${id}`);
  },
};