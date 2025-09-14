import { useState, useEffect, useCallback } from "react";
import { conversationArchiveApi } from "../../../shared/api/conversationArchive";
import type {
  ConversationArchive,
  CreateConversationRequest,
  UpdateConversationRequest,
} from "../../../shared/api/conversationArchive";

export const useConversationArchive = () => {
  const [conversations, setConversations] = useState<ConversationArchive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 대화 조회
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await conversationArchiveApi.getAll();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("대화 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 카테고리별 대화 조회
  const fetchConversationsByCategory = useCallback(
    async (category: "역할" | "일상" | "비즈니스" | "학술") => {
      try {
        setLoading(true);
        setError(null);
        const data = await conversationArchiveApi.getByCategory(category);
        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations by category:", err);
        setError("대화 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 대화 추가
  const addConversation = useCallback(
    async (data: CreateConversationRequest): Promise<boolean> => {
      try {
        setError(null);
        const newConversation = await conversationArchiveApi.create(data);
        setConversations((prev) => [newConversation, ...prev]);
        return true;
      } catch (err) {
        console.error("Failed to add conversation:", err);
        setError("대화를 저장하는데 실패했습니다.");
        return false;
      }
    },
    [],
  );

  // 대화 수정
  const updateConversation = useCallback(
    async (id: string, data: UpdateConversationRequest): Promise<boolean> => {
      try {
        setError(null);
        const updatedConversation = await conversationArchiveApi.update(
          id,
          data,
        );
        setConversations((prev) =>
          prev.map((conv) => (conv.id === id ? updatedConversation : conv)),
        );
        return true;
      } catch (err) {
        console.error("Failed to update conversation:", err);
        setError("대화를 수정하는데 실패했습니다.");
        return false;
      }
    },
    [],
  );

  // 대화 삭제
  const deleteConversation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);
        await conversationArchiveApi.delete(id);
        setConversations((prev) => prev.filter((conv) => conv.id !== id));
        return true;
      } catch (err) {
        console.error("Failed to delete conversation:", err);
        setError("대화를 삭제하는데 실패했습니다.");
        return false;
      }
    },
    [],
  );

  // 컴포넌트 마운트시 대화 목록 로드
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    fetchConversationsByCategory,
    addConversation,
    updateConversation,
    deleteConversation,
  };
};
