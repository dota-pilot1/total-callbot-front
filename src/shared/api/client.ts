import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 직접 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error occurred:', error.response?.status, error.response?.statusText);
    console.log('Error URL:', error.config?.url);
    
    // 개발 중에는 401 자동 리다이렉트 비활성화
    const skipAutoLogout = true; // 배포 시 false로 변경
    
    if (error.response?.status === 401 && !skipAutoLogout) {
      console.log('!!! 401 ERROR - CLEARING LOCALSTORAGE AND REDIRECTING !!!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);