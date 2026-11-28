import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { PointsSummary, PointTransaction, RecyclingCard } from '../types/recycling';

// Household: my QR card, balance and history
export const pointsApi = {
  async getSummary(): Promise<PointsSummary> {
    const response = await api.get<ApiResponse<PointsSummary>>('/points/me');
    return response.data.data;
  },

  async getHistory(): Promise<PointTransaction[]> {
    const response = await api.get<ApiResponse<PointTransaction[]>>('/points/me/history');
    return response.data.data;
  },

  async getCard(): Promise<RecyclingCard> {
    const response = await api.get<ApiResponse<RecyclingCard>>('/points/me/card');
    return response.data.data;
  },

  // New code. The old QR code stops working.
  async regenerateCard(): Promise<RecyclingCard> {
    const response = await api.post<ApiResponse<RecyclingCard>>('/points/me/card/regenerate');
    return response.data.data;
  },
};