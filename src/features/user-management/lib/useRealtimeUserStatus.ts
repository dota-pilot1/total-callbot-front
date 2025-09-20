import { useEffect, useRef } from "react";
import { useAuthStore } from "../../auth";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEYS } from "./useUsersQuery";

export const useRealtimeUserStatus = () => {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(true); // 폴링 방식에서는 항상 연결된 것으로 표시
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const token = useAuthStore.getState().getAccessToken();
    if (!token) {
      isConnectedRef.current = false;
      return;
    }

    // 폴링 방식으로 사용자 상태 업데이트
    const startPolling = () => {
      console.log("사용자 상태 폴링 시작 (30초 간격)");
      isConnectedRef.current = true;

      // 30초마다 사용자 목록 새로고침
      intervalRef.current = setInterval(() => {
        console.log("사용자 상태 폴링 업데이트");
        queryClient.invalidateQueries({
          queryKey: USER_QUERY_KEYS.lists(),
        });
      }, 30000); // 30초 간격
    };

    startPolling();

    // 정리 함수
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.log("사용자 상태 폴링 중지");
    };
  }, [queryClient]);

  return {
    isConnected: isConnectedRef.current,
  };
};
