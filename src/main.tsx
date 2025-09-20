// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { useAuthStore } from "./features/auth";
import { setTokenProvider } from "./shared/api/tokenProvider";

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 토큰 제공자를 authStore로 연결
setTokenProvider(() => useAuthStore.getState().getAccessToken());

// StrictMode 임시 비활성화 - 웹소켓 중복 연결 방지
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
