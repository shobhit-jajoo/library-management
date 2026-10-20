import { apiClient } from './client';
import { ApiResponse, User, Loan } from '../types';

export interface SearchUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const usersApi = {
  // Staff patron search (Librarian/Admin)
  async searchUsers(params?: SearchUsersParams): Promise<ApiResponse<User[]>> {
    const res = await apiClient.get<ApiResponse<User[]>>('/librarian/users', { params });
    return res.data;
  },

  // Get user borrowing history (Librarian/Admin)
  async getUserLoans(userId: string): Promise<ApiResponse<Loan[]>> {
    const res = await apiClient.get<ApiResponse<Loan[]>>(`/librarian/users/${userId}/loans`);
    return res.data;
  },

  // In case user is also Admin or Admin routes are available
  async createUser(data: {
    registrationNumber: string;
    name: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>('/admin/users', data);
    return res.data;
  },

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    }
  ): Promise<ApiResponse<User>> {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    return res.data;
  },
};
