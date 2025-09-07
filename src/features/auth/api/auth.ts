import { apiClient } from '../../../shared/api/client';
import type { LoginRequest, LoginResponse } from '../../../shared/api/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
};