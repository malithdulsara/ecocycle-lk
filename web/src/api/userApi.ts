import { api } from './client';
import type { ApiResponse, User } from '../types/api';
import type { CreateUserRequest, UpdateUserRequest } from '../types/admin';

export const userApi = {
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  async create(request: CreateUserRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', request);
    return response.data.data;
  },

  async update(id: number, request: UpdateUserRequest): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, request);
    return response.data.data;
  },
};