import { apiClient } from "../../../shared/api/client";
import type { ChatRoom, CreateChatRoomRequest } from "../types";

export const chatRoomApi = {
  // 채팅방 목록 조회 (사용자별)
  async getUserRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get<ChatRoom[]>("/chat/rooms");
    return response.data;
  },

  // 전체 공개 채팅방 목록 조회 - 새로운 다중 사용자용
  async getRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get<ChatRoom[]>(
      "/multiuser-chat/rooms/public",
    );
    return response.data;
  },

  // 다중 사용자 채팅방 생성
  async createRoom(roomData: CreateChatRoomRequest): Promise<ChatRoom> {
    const response = await apiClient.post<ChatRoom>("/multiuser-chat/rooms", {
      name: roomData.name,
      description: roomData.description,
      maxParticipants: 50,
      isPublic: true,
    });
    return response.data;
  },

  // 채팅방 삭제 - 새로운 다중 사용자용
  async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(`/multiuser-chat/rooms/${roomId}`);
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
