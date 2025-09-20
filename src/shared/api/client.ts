import axios from "axios";

// Decide API base URL by environment
// - Local dev: localhost:8080
// - Prod: backend at https://api.total-callbot.cloud
// - Override with VITE_API_BASE_URL if provided
const resolveApiBaseUrl = () => {
  const envUrl = (import.meta as any)?.env?.VITE_API_BASE_URL as
    | string
    | undefined;
  if (envUrl && envUrl.length > 0) return envUrl;

  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocal = host === "localhost" || host === "127.0.0.1";
  if (isLocal) return "http://localhost:8080/api";

  // Default prod mapping
  return "https://api.total-callbot.cloud/api";
};

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 직접 토큰 가져오기
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData일 때는 Content-Type을 제거하여 브라우저가 자동으로 설정하도록 함
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(
      "API Error occurred:",
      error.response?.status,
      error.response?.statusText,
    );
    console.log("Error URL:", error.config?.url);

    // 개발 중에는 401 자동 리다이렉트 비활성화
    const skipAutoLogout = true; // 배포 시 false로 변경

    if (error.response?.status === 401 && !skipAutoLogout) {
      console.log("!!! 401 ERROR - CLEARING LOCALSTORAGE AND REDIRECTING !!!");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
