import { useState, useEffect, useCallback } from "react";
import { conversationArchiveApi } from "../../../shared/api/conversationArchive";
import type {
  ConversationArchive,
  CreateConversationRequest,
  UpdateConversationRequest,
  CategoryCounts,
} from "../../../shared/api/conversationArchive";

export const useConversationArchive = () => {
  const [conversations, setConversations] = useState<ConversationArchive[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 대화 조회 (카테고리 개수 포함 - 한 번의 API 호출)
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await conversationArchiveApi.getAll();
      setConversations(data.conversations);
      setCategoryCounts(data.categoryCounts);
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
        // allConversations는 전체 데이터를 유지
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
        // 낙관적 업데이트: 즉시 UI에 반영
        setConversations((prev) => [newConversation, ...(prev || [])]);
        setCategoryCounts((prev) =>
          prev
            ? {
                ...prev,
                [data.conversationCategory]:
                  (prev[data.conversationCategory] || 0) + 1,
              }
            : null,
        );
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
      // 원본 데이터 백업 (롤백용)
      const originalConv = (conversations || []).find((conv) => conv.id === id);
      if (!originalConv) return false;

      try {
        setError(null);
        // 낙관적 업데이트: 즉시 UI에 반영
        const optimisticUpdate = { ...originalConv, ...data };
        setConversations((prev) =>
          (prev || []).map((conv) =>
            conv.id === id ? optimisticUpdate : conv,
          ),
        );

        // 카테고리가 변경된 경우 개수도 업데이트
        if (
          data.conversationCategory &&
          data.conversationCategory !== originalConv.conversationCategory
        ) {
          const newCat =
            data.conversationCategory as ConversationArchive["conversationCategory"];
          setCategoryCounts((prev) =>
            prev
              ? {
                  ...prev,
                  [originalConv.conversationCategory]: Math.max(
                    0,
                    (prev[originalConv.conversationCategory] || 1) - 1,
                  ),
                  [newCat]: (prev[newCat] || 0) + 1,
                }
              : null,
          );
        }

        const updatedConversation = await conversationArchiveApi.update(
          id,
          data,
        );
        // 서버 응답으로 최종 업데이트
        setConversations((prev) =>
          (prev || []).map((conv) =>
            conv.id === id ? updatedConversation : conv,
          ),
        );
        return true;
      } catch (err) {
        console.error("Failed to update conversation:", err);
        setError("대화를 수정하는데 실패했습니다.");
        // 롤백: 원본 데이터로 복구
        setConversations((prev) =>
          (prev || []).map((conv) => (conv.id === id ? originalConv : conv)),
        );
        if (
          data.conversationCategory &&
          data.conversationCategory !== originalConv.conversationCategory
        ) {
          const newCat =
            data.conversationCategory as ConversationArchive["conversationCategory"];
          setCategoryCounts((prev) =>
            prev
              ? {
                  ...prev,
                  [newCat]: Math.max(0, (prev[newCat] || 1) - 1),
                  [originalConv.conversationCategory]:
                    (prev[originalConv.conversationCategory] || 0) + 1,
                }
              : null,
          );
        }
        return false;
      }
    },
    [conversations],
  );

  // 대화 삭제
  const deleteConversation = useCallback(
    async (id: string): Promise<boolean> => {
      // 삭제할 항목을 미리 찾아서 카테고리 정보 저장
      const targetConv = (conversations || []).find((conv) => conv.id === id);
      if (!targetConv) return false;

      try {
        setError(null);
        // 낙관적 업데이트: 즉시 UI에서 제거
        setConversations((prev) =>
          (prev || []).filter((conv) => conv.id !== id),
        );
        setCategoryCounts((prev) =>
          prev
            ? {
                ...prev,
                [targetConv.conversationCategory]: Math.max(
                  0,
                  (prev[targetConv.conversationCategory] || 1) - 1,
                ),
              }
            : null,
        );

        await conversationArchiveApi.delete(id);
        return true;
      } catch (err) {
        console.error("Failed to delete conversation:", err);
        setError("대화를 삭제하는데 실패했습니다.");
        // 롤백: 삭제된 항목 복구
        setConversations((prev) =>
          [...(prev || []), targetConv].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
        setCategoryCounts((prev) =>
          prev
            ? {
                ...prev,
                [targetConv.conversationCategory]:
                  (prev[targetConv.conversationCategory] || 0) + 1,
              }
            : null,
        );
        return false;
      }
    },
    [conversations],
  );

  // 컴포넌트 마운트시 대화 목록 로드
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    categoryCounts,
    loading,
    error,
    fetchConversations,
    fetchConversationsByCategory,
    addConversation,
    updateConversation,
    deleteConversation,
  };
};
