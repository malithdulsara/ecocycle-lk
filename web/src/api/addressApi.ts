import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Address, AddressRequest } from '../types/address';

export const addressApi = {
  async getMine(): Promise<Address[]> {
    const response = await api.get<ApiResponse<Address[]>>('/addresses');
    return response.data.data;
  },

  async create(request: AddressRequest): Promise<Address> {
    const response = await api.post<ApiResponse<Address>>('/addresses', request);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },
};