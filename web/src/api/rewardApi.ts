import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Redemption, Reward, RewardRequest } from '../types/recycling';

export const rewardApi = {
  // ----- Catalogue -----

  async getActive(): Promise<Reward[]> {
    const response = await api.get<ApiResponse<Reward[]>>('/rewards');
    return response.data.data;
  },

  // Also hidden rewards (recycler manager / admin)
  async getAll(): Promise<Reward[]> {
    const response = await api.get<ApiResponse<Reward[]>>('/rewards/all');
    return response.data.data;
  },

  async create(request: RewardRequest): Promise<Reward> {
    const response = await api.post<ApiResponse<Reward>>('/rewards', request);
    return response.data.data;
  },

  async update(id: number, request: RewardRequest): Promise<Reward> {
    const response = await api.put<ApiResponse<Reward>>(`/rewards/${id}`, request);
    return response.data.data;
  },

  // ----- Vouchers -----

  async redeem(id: number): Promise<Redemption> {
    const response = await api.post<ApiResponse<Redemption>>(`/rewards/${id}/redeem`);
    return response.data.data;
  },

  async getMyRedemptions(): Promise<Redemption[]> {
    const response = await api.get<ApiResponse<Redemption[]>>('/rewards/redemptions/my');
    return response.data.data;
  },

  async getAllRedemptions(): Promise<Redemption[]> {
    const response = await api.get<ApiResponse<Redemption[]>>('/rewards/redemptions');
    return response.data.data;
  },

  // The reward was handed over
  async collect(voucherCode: string): Promise<Redemption> {
    const response = await api.post<ApiResponse<Redemption>>('/rewards/redemptions/collect', { voucherCode });
    return response.data.data;
  },
};