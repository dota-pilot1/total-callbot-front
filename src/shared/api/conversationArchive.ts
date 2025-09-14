import apiClient from "./axiosConfig";

export interface ConversationArchive {
  id: string;
  conversation: string;
  conversationCategory: "역할" | "일상" | "비즈니스" | "학술";
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  conversation: string;
  conversationCategory: "역할" | "일상" | "비즈니스" | "학술";
}

export interface UpdateConversationRequest {
  conversation?: string;
  conversationCategory?: "역할" | "일상" | "비즈니스" | "학술";
}

export const conversationArchiveApi = {
  // 대화 저장
  create: async (
    data: CreateConversationRequest,
  ): Promise<ConversationArchive> => {
    const response = await apiClient.post("/conversation-archives", data);
    return response.data;
  },

  // 모든 대화 조회
  getAll: async (): Promise<ConversationArchive[]> => {
    const response = await apiClient.get("/conversation-archives");
    return response.data;
  },

  // 카테고리별 대화 조회
  getByCategory: async (
    category: "역할" | "일상" | "비즈니스" | "학술",
  ): Promise<ConversationArchive[]> => {
    const response = await apiClient.get(
      `/conversation-archives/category/${category}`,
    );
    return response.data;
  },

  // 특정 대화 조회
  getById: async (id: string): Promise<ConversationArchive> => {
    const response = await apiClient.get(`/conversation-archives/${id}`);
    return response.data;
  },

  // 대화 수정
  update: async (
    id: string,
    data: UpdateConversationRequest,
  ): Promise<ConversationArchive> => {
    const response = await apiClient.put(`/conversation-archives/${id}`, data);
    return response.data;
  },

  // 대화 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/conversation-archives/${id}`);
  },
};
