import { api } from './client';
import type { ApiResponse } from '../types/api';
import type {
  Schedule,
  ScheduleChange,
  ScheduleChangeRequest,
  ScheduleRequest,
  WardCollections,
  WasteType,
} from '../types/schedule';

export const scheduleApi = {
  async getWasteTypes(): Promise<WasteType[]> {
    const response = await api.get<ApiResponse<WasteType[]>>('/waste-types');
    return response.data.data;
  },

  // ----- Weekly schedules -----

  async getByWard(wardId: number): Promise<Schedule[]> {
    const response = await api.get<ApiResponse<Schedule[]>>(`/wards/${wardId}/schedules`);
    return response.data.data;
  },

  async create(wardId: number, request: ScheduleRequest): Promise<Schedule> {
    const response = await api.post<ApiResponse<Schedule>>(`/wards/${wardId}/schedules`, request);
    return response.data.data;
  },

  async update(id: number, request: ScheduleRequest): Promise<Schedule> {
    const response = await api.put<ApiResponse<Schedule>>(`/schedules/${id}`, request);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/schedules/${id}`);
  },

  // ----- Holiday changes -----

  async getChanges(councilId: number): Promise<ScheduleChange[]> {
    const response = await api.get<ApiResponse<ScheduleChange[]>>(`/councils/${councilId}/schedule-changes`);
    return response.data.data;
  },

  async createChange(councilId: number, request: ScheduleChangeRequest): Promise<ScheduleChange> {
    const response = await api.post<ApiResponse<ScheduleChange>>(`/councils/${councilId}/schedule-changes`, request);
    return response.data.data;
  },

  async removeChange(id: number): Promise<void> {
    await api.delete(`/schedule-changes/${id}`);
  },

  // ----- Upcoming collections -----

  async getUpcoming(wardId: number, days = 14): Promise<WardCollections> {
    const response = await api.get<ApiResponse<WardCollections>>(`/wards/${wardId}/collections/upcoming`, {
      params: { days },
    });
    return response.data.data;
  },

  async getMine(days = 14): Promise<WardCollections> {
    const response = await api.get<ApiResponse<WardCollections>>('/schedules/my', { params: { days } });
    return response.data.data;
  },
};