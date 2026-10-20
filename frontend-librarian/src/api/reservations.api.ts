import { apiClient } from './client';
import { ApiResponse, Reservation } from '../types';

export const reservationsApi = {
  // View reservations
  async getReservations(): Promise<ApiResponse<Reservation[]>> {
    const res = await apiClient.get<ApiResponse<Reservation[]>>('/reservations');
    return res.data;
  },

  // Create reservation on behalf of patron
  async createReservation(data: { bookId: string; userId?: string }): Promise<ApiResponse<Reservation>> {
    const res = await apiClient.post<ApiResponse<Reservation>>('/reservations', data);
    return res.data;
  },

  // Cancel reservation
  async cancelReservation(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.patch<ApiResponse<null>>(`/reservations/${id}/cancel`);
    return res.data;
  },

  // Trigger expired hold sweep
  async processExpired(): Promise<ApiResponse<{ expiredCount: number }>> {
    const res = await apiClient.post<ApiResponse<{ expiredCount: number }>>('/reservations/process-expired');
    return res.data;
  },
};
