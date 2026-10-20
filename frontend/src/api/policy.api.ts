import { apiClient } from './client';
import { ApiResponse, SystemPolicy } from '../types';

export const policyApi = {
  async getPolicy(): Promise<ApiResponse<SystemPolicy>> {
    const res = await apiClient.get<ApiResponse<SystemPolicy>>('/admin/policy');
    return res.data;
  },

  async updatePolicy(policy: Partial<SystemPolicy>): Promise<ApiResponse<SystemPolicy>> {
    const res = await apiClient.patch<ApiResponse<SystemPolicy>>('/admin/policy', policy);
    return res.data;
  },
};
