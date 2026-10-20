import { apiClient } from './client';
import { ApiResponse, Fine } from '../types';

export const finesApi = {
  // Staff view all fines
  async getAllFines(): Promise<ApiResponse<Fine[]>> {
    const res = await apiClient.get<ApiResponse<Fine[]>>('/fines');
    return res.data;
  },

  // Mark fine as paid
  async markAsPaid(fineId: string): Promise<ApiResponse<Fine>> {
    const res = await apiClient.patch<ApiResponse<Fine>>(`/fines/${fineId}/payment`);
    return res.data;
  },

  // Fine details
  async getFineById(id: string): Promise<ApiResponse<Fine>> {
    const res = await apiClient.get<ApiResponse<Fine>>(`/fines/${id}`);
    return res.data;
  },
};
