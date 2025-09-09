export interface ChatRoom {
  id: string;
  userId: number;
  chatbotId: string;
  chatbotName: string;
  name?: string;
  botType?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  content: string;
  isFromBot: boolean;
  timestamp: string;
}

export interface CreateChatRoomRequest {
  chatbotId: string;
  chatbotName: string;
  botType?: string;
  name?: string;
}

export interface CreateChatRoomResponse {
  chatRoom: ChatRoom;
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  botResponse?: ChatMessage;
}