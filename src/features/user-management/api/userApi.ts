import { apiClient } from "../../../shared/api/client";

export interface UserStatus {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  online: boolean; // 백엔드에서 'online' 필드로 전송
}

export const userManagementApi = {
  getAllUsersWithStatus: async (): Promise<UserStatus[]> => {
    const response = await apiClient.get<UserStatus[]>("/members");

    console.log("=== API 응답 원본 데이터 ===", response.data);
    console.log("응답 사용자 수:", response.data.length);

    response.data.forEach((user, index) => {
      console.log(`API 응답 사용자 ${index + 1}:`, {
        id: user.id,
        name: user.name,
        email: user.email,
        online: user.online,
        onlineType: typeof user.online,
        createdAt: user.createdAt,
      });
    });

    return response.data;
  },
};
