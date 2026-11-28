import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Campaign, CampaignRequest, Centre, CentreRequest, MaterialRate } from '../types/recycling';

// Centres, material rates and campaigns
export const recyclingApi = {
  // ----- Centres -----

  // Open centres (any logged-in user)
  async getCentres(): Promise<Centre[]> {
    const response = await api.get<ApiResponse<Centre[]>>('/centres');
    return response.data.data;
  },

  // Also closed centres (recycler manager / admin)
  async getAllCentres(): Promise<Centre[]> {
    const response = await api.get<ApiResponse<Centre[]>>('/centres/all');
    return response.data.data;
  },

  async createCentre(request: CentreRequest): Promise<Centre> {
    const response = await api.post<ApiResponse<Centre>>('/centres', request);
    return response.data.data;
  },

  async updateCentre(id: number, request: CentreRequest): Promise<Centre> {
    const response = await api.put<ApiResponse<Centre>>(`/centres/${id}`, request);
    return response.data.data;
  },

  // ----- Material rates -----

  async getRates(): Promise<MaterialRate[]> {
    const response = await api.get<ApiResponse<MaterialRate[]>>('/rates');
    return response.data.data;
  },

  async setRate(wasteTypeId: number, pointsPerKg: number): Promise<MaterialRate> {
    const response = await api.put<ApiResponse<MaterialRate>>(`/rates/${wasteTypeId}`, { pointsPerKg });
    return response.data.data;
  },

  async removeRate(wasteTypeId: number): Promise<void> {
    await api.delete(`/rates/${wasteTypeId}`);
  },

  // ----- Campaigns -----

  async getCampaigns(): Promise<Campaign[]> {
    const response = await api.get<ApiResponse<Campaign[]>>('/campaigns');
    return response.data.data;
  },

  // Running today (any logged-in user)
  async getRunningCampaigns(): Promise<Campaign[]> {
    const response = await api.get<ApiResponse<Campaign[]>>('/campaigns/running');
    return response.data.data;
  },

  async createCampaign(request: CampaignRequest): Promise<Campaign> {
    const response = await api.post<ApiResponse<Campaign>>('/campaigns', request);
    return response.data.data;
  },

  async updateCampaign(id: number, request: CampaignRequest): Promise<Campaign> {
    const response = await api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, request);
    return response.data.data;
  },
};