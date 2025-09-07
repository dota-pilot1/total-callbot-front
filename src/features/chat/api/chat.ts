import { apiClient } from '../../../shared/api/client';
import type { 
  ChatRoom, 
  ChatMessage, 
  CreateChatRoomRequest, 
  CreateChatRoomResponse, 
  SendMessageRequest, 
  SendMessageResponse 
} from '../../../shared/api/chat-types';

export const chatApi = {
  // 채팅방 목록 조회
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get<ChatRoom[]>('/chat/rooms');
    return response.data;
  },

  // 특정 챗봇과의 채팅방 조회 (있으면 기존, 없으면 생성)
  getOrCreateChatRoom: async (data: CreateChatRoomRequest): Promise<ChatRoom> => {
    const response = await apiClient.post<CreateChatRoomResponse>('/chat/rooms/get-or-create', data);
    return response.data.chatRoom;
  },

  // 채팅방 메시지 조회
  getChatMessages: async (chatRoomId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/chat/rooms/${chatRoomId}/messages`);
    return response.data;
  },

  // 메시지 전송
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>('/chat/messages', data);
    return response.data;
  },

  // 채팅방 삭제
  deleteChatRoom: async (chatRoomId: string): Promise<void> => {
    await apiClient.delete(`/chat/rooms/${chatRoomId}`);
  }
};