import { api } from './client';
import type { ApiResponse } from '../types/api';
import type {
  Complaint,
  ComplaintPriority,
  ComplaintTracking,
  CreateComplaintRequest,
} from '../types/complaint';

export const complaintApi = {
  // ----- Public (no login) -----

  async createAsGuest(request: CreateComplaintRequest): Promise<ComplaintTracking> {
    const response = await api.post<ApiResponse<ComplaintTracking>>('/complaints/guest', request);
    return response.data.data;
  },

  async track(code: string): Promise<ComplaintTracking> {
    const response = await api.get<ApiResponse<ComplaintTracking>>(`/complaints/track/${encodeURIComponent(code)}`);
    return response.data.data;
  },

  // ----- Household -----

  async create(request: CreateComplaintRequest): Promise<Complaint> {
    const response = await api.post<ApiResponse<Complaint>>('/complaints', request);
    return response.data.data;
  },

  async getMine(): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints/my');
    return response.data.data;
  },

  // ----- Council officer / admin -----

  async getAll(assignedToMe = false): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints', { params: { assignedToMe } });
    return response.data.data;
  },

  async assign(id: number, officerId: number, priority: ComplaintPriority): Promise<Complaint> {
    const response = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/assign`, { officerId, priority });
    return response.data.data;
  },

  async start(id: number): Promise<Complaint> {
    const response = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/start`);
    return response.data.data;
  },

  async resolve(id: number, note: string): Promise<Complaint> {
    const response = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/resolve`, { note });
    return response.data.data;
  },

  async reject(id: number, note: string): Promise<Complaint> {
    const response = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/reject`, { note });
    return response.data.data;
  },
};