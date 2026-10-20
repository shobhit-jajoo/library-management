import { apiClient } from './client';
import { ApiResponse, User, UserRole, UserStatus } from '../types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateUserData {
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  status?: UserStatus;
}

export const usersApi = {
  async getUsers(params?: GetUsersParams): Promise<ApiResponse<User[]>> {
    const res = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data;
  },

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>('/admin/users', data);
    return res.data;
  },

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    return res.data;
  },

  async activateUser(id: string): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/activate`);
    return res.data;
  },

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/deactivate`);
    return res.data;
  },

  async createLibrarian(data: {
    registrationNumber: string;
    name: string;
    email: string;
    phoneNumber?: string;
    password?: string;
  }): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>('/admin/librarians', data);
    return res.data;
  },
};
