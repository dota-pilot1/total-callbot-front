import { create } from 'zustand';
import { chatApi } from '../api/chat';
import type { ChatRoom, ChatMessage } from '../../../../shared/api/chat-types';

interface ChatState {
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  messages: ChatMessage[];
  isLoading: boolean;
}

interface ChatActions {
  loadChatRooms: () => Promise<void>;
  getOrCreateChatRoom: (chatbotId: string, chatbotName: string) => Promise<ChatRoom>;
  selectChatRoom: (chatRoom: ChatRoom) => Promise<void>;
  loadMessages: (chatRoomId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteChatRoom: (chatRoomId: string) => Promise<void>;
  clearCurrentChat: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  chatRooms: [],
  currentChatRoom: null,
  messages: [],
  isLoading: false,

  loadChatRooms: async () => {
    set({ isLoading: true });
    try {
      const chatRooms = await chatApi.getChatRooms();
      set({ chatRooms, isLoading: false });
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      set({ isLoading: false });
    }
  },

  getOrCreateChatRoom: async (chatbotId: string, chatbotName: string) => {
    set({ isLoading: true });
    try {
      const chatRoom = await chatApi.getOrCreateChatRoom({ chatbotId, chatbotName });
      
      // 채팅방 목록 업데이트
      const { chatRooms } = get();
      const existingIndex = chatRooms.findIndex(room => room.id === chatRoom.id);
      
      let updatedChatRooms;
      if (existingIndex >= 0) {
        updatedChatRooms = [...chatRooms];
        updatedChatRooms[existingIndex] = chatRoom;
      } else {
        updatedChatRooms = [chatRoom, ...chatRooms];
      }
      
      set({ 
        chatRooms: updatedChatRooms,
        currentChatRoom: chatRoom,
        isLoading: false 
      });
      
      return chatRoom;
    } catch (error) {
      console.error('Failed to get or create chat room:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  selectChatRoom: async (chatRoom: ChatRoom) => {
    set({ currentChatRoom: chatRoom });
    await get().loadMessages(chatRoom.id);
  },

  loadMessages: async (chatRoomId: string) => {
    set({ isLoading: true });
    try {
      const messages = await chatApi.getChatMessages(chatRoomId);
      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ messages: [], isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    const { currentChatRoom, messages } = get();
    if (!currentChatRoom) return;

    set({ isLoading: true });
    try {
      const response = await chatApi.sendMessage({
        chatRoomId: currentChatRoom.id,
        content
      });

      // 사용자 메시지와 봇 응답 추가
      const newMessages = [response.message];
      if (response.botResponse) {
        newMessages.push(response.botResponse);
      }

      set({ 
        messages: [...messages, ...newMessages],
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isLoading: false });
    }
  },

  deleteChatRoom: async (chatRoomId: string) => {
    set({ isLoading: true });
    try {
      await chatApi.deleteChatRoom(chatRoomId);
      
      const { chatRooms, currentChatRoom } = get();
      const updatedChatRooms = chatRooms.filter(room => room.id !== chatRoomId);
      
      set({
        chatRooms: updatedChatRooms,
        currentChatRoom: currentChatRoom?.id === chatRoomId ? null : currentChatRoom,
        messages: currentChatRoom?.id === chatRoomId ? [] : get().messages,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to delete chat room:', error);
      set({ isLoading: false });
    }
  },

  clearCurrentChat: () => {
    set({ currentChatRoom: null, messages: [] });
  }
}));