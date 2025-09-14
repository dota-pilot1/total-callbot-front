export interface ChatRoom {
  id: string;
  roomId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  maxParticipants: number;
  isPrivate: boolean;
  participantCount?: number;
}

export interface CreateChatRoomRequest {
  name: string;
  description: string;
  createdBy: string;
}

export interface ChatRoomResponse {
  success: boolean;
  data?: ChatRoom[];
  message?: string;
}
