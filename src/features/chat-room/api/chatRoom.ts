import { apiClient } from "../../../shared/api/client";
import type { ChatRoom, CreateChatRoomRequest } from "../types";

export const chatRoomApi = {
  // 채팅방 목록 조회 (사용자별)
  async getUserRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get<ChatRoom[]>("/chat/rooms");
    return response.data;
  },

  // 채팅방 목록 조회
  async getRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get<ChatRoom[]>("/chat/rooms");
    return response.data;
  },

  // 채팅방 생성 (get-or-create 엔드포인트 사용)
  async createRoom(roomData: CreateChatRoomRequest): Promise<ChatRoom> {
    const response = await apiClient.post<{ chatRoom: ChatRoom }>(
      "/chat/rooms/get-or-create",
      {
        chatbotId: roomData.name, // name을 chatbotId로 사용
        chatbotName: roomData.description || roomData.name, // description이 있으면 사용, 없으면 name 사용
      },
    );
    return response.data.chatRoom;
  },

  // 채팅방 삭제
  async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(`/chat/rooms/${roomId}`);
  },

  // 채팅방 상세 조회
  async getRoomById(roomId: string): Promise<ChatRoom> {
    const response = await apiClient.get<ChatRoom>(`/chat/rooms/${roomId}`);
    return response.data;
  },

  // 채팅방 검색
  async searchRooms(keyword: string): Promise<ChatRoom[]> {
    const response = await apiClient.get<ChatRoom[]>(`/chat/rooms/search`, {
      params: { keyword },
    });
    return response.data;
  },
};
