import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { CollectionRoute, RouteRequest, TrailPoint, Truck, TruckRequest } from '../types/tracking';

export const truckApi = {
  // ----- Trucks (list: officer + admin, change: admin) -----

  async getAll(): Promise<Truck[]> {
    const response = await api.get<ApiResponse<Truck[]>>('/trucks');
    return response.data.data;
  },

  async create(request: TruckRequest): Promise<Truck> {
    const response = await api.post<ApiResponse<Truck>>('/trucks', request);
    return response.data.data;
  },

  async update(id: number, request: TruckRequest): Promise<Truck> {
    const response = await api.put<ApiResponse<Truck>>(`/trucks/${id}`, request);
    return response.data.data;
  },

  // ----- Routes (officer + admin) -----

  async getRoutes(date: string): Promise<CollectionRoute[]> {
    const response = await api.get<ApiResponse<CollectionRoute[]>>('/routes', { params: { date } });
    return response.data.data;
  },

  async createRoute(request: RouteRequest): Promise<CollectionRoute> {
    const response = await api.post<ApiResponse<CollectionRoute>>('/routes', request);
    return response.data.data;
  },

  async deleteRoute(id: number): Promise<void> {
    await api.delete(`/routes/${id}`);
  },

  async getTrail(routeId: number): Promise<TrailPoint[]> {
    const response = await api.get<ApiResponse<TrailPoint[]>>(`/routes/${routeId}/trail`);
    return response.data.data;
  },

  // ----- Driver -----

  async getMyToday(): Promise<CollectionRoute[]> {
    const response = await api.get<ApiResponse<CollectionRoute[]>>('/routes/my');
    return response.data.data;
  },

  async start(id: number): Promise<CollectionRoute> {
    const response = await api.post<ApiResponse<CollectionRoute>>(`/routes/${id}/start`);
    return response.data.data;
  },

  async finish(id: number): Promise<CollectionRoute> {
    const response = await api.post<ApiResponse<CollectionRoute>>(`/routes/${id}/finish`);
    return response.data.data;
  },
};