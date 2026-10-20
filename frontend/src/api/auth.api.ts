import axios from 'axios';
import { apiClient } from './client';
import { ApiResponse, LoginResponseData, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const authApi = {
  async login(identifier: string, password: string): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', {
      identifier,
      password,
    });
    return res.data;
  },

  async me(): Promise<ApiResponse<User>> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const res = await apiClient.post<ApiResponse<null>>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return res.data;
  },

  async checkHealth(): Promise<{ status: string }> {
    const res = await axios.get(`${API_BASE_URL}/health`);
    return res.data;
  },

  async checkDbHealth(): Promise<{ status: string }> {
    const res = await axios.get(`${API_BASE_URL}/health/db`);
    return res.data;
  },
};
