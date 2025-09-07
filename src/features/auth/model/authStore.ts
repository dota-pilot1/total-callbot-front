import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { User, LoginRequest } from '../../../shared/api/types';

interface AuthState {
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  getUser: () => User | null;
  getAccessToken: () => string | null;
  isAuthenticated: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(credentials);
      const user = {
        id: response.memberId,
        email: response.email,
        name: response.name
      };
      
      // localStorage에 직접 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    console.log('!!! LOGOUT FUNCTION CALLED !!!');
    console.trace('Logout called from:'); // 호출 스택 추적
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
    
    // 페이지 이동
    window.location.href = '/login';
  },

  setLoading: (loading) => set({ isLoading: loading }),

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAccessToken: () => localStorage.getItem('accessToken'),

  isAuthenticated: () => !!localStorage.getItem('accessToken'),
}));