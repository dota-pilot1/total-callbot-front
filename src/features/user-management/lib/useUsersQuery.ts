import { useQuery } from "@tanstack/react-query";
import { userManagementApi } from "../api/userApi";
import { useAuthStore } from "../../auth";
import type { UserStatus } from "../api/userApi";

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  list: (filters: string) => [...USER_QUERY_KEYS.lists(), filters] as const,
};

export const useUsersQuery = () => {
  const isAuthed = useAuthStore((s) => s.isAuthenticated());

  return useQuery<UserStatus[], Error>({
    queryKey: USER_QUERY_KEYS.lists(),
    queryFn: userManagementApi.getAllUsersWithStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every 1 minute to update online status
    enabled: !!isAuthed, // 토큰이 있을 때만 쿼리 실행
  });
};
