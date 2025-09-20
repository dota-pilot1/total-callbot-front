import { apiClient } from '../../../shared/api/client';
import { useQuery } from '@tanstack/react-query';

export interface User {
  id: number;
  name: string;
  email: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },
};

export const useGetAllUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });
};
