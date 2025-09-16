import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  TrashIcon,
  Bars3Icon,
  PencilIcon,
  LanguageIcon,
  PlayIcon,
  PauseIcon,
  ArrowsRightLeftIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui/Button";
import { examApi } from "../../chatbot/exam/api/exam";
import { useConversationArchive } from "../hooks/useConversationArchive";
import type { ConversationArchive } from "../../../shared/api/conversationArchive";
import ConversationInputForm from "./ConversationInputForm";
import { useToast } from "../../../components/ui/Toast";

interface MyConversationArchiveProps {
  open: boolean;
  onClose: () => void;
  onInsertConversation?: (conversation: string) => void;
}

const CATEGORIES = ["역할", "일상", "비즈니스", "학술"] as const;
const CATEGORY_COLORS = {
  역할: "bg-muted/20 text-foreground border-border",
  일상: "bg-muted/20 text-foreground border-border",
  비즈니스: "bg-muted/20 text-foreground border-border",
  학술: "bg-muted/20 text-foreground border-border",
} as const;

export default function MyConversationArchive({
  open,
  onClose,
  onInsertConversation,
}: MyConversationArchiveProps) {
  const {
    conversations,
    categoryCounts,
    loading,
    error,
    fetchConversations,
    fetchConversationsByCategory,
    addConversation,
    updateConversation,
    deleteConversation,
  } = useConversationArchive();

  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<
    "전체" | "역할" | "일상" | "비즈니스" | "학술"
  >("전체");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingConversation, setEditingConversation] = useState("");
  const [editingCategory, setEditingCategory] = useState<
    "역할" | "일상" | "비즈니스" | "학술"
  >("일상");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [translatedTexts, setTranslatedTexts] = useState<{
    [key: string]: string;
  }>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  if (typeof window !== "undefined") {
    speechSynthesis.current = window.speechSynthesis;
  }

  // 필터링된 대화 목록
  const filteredConversations = conversations.filter(
    (conv) =>
      filterCategory === "전체" || conv.conversationCategory === filterCategory,
  );

  // 백엔드에서 받은 카테고리 개수 사용 (더 이상 프론트엔드에서 계산 안함)

  // 대화 추가
  const handleAddConversation = async (
    conversation: string,
    category: "역할" | "일상" | "비즈니스" | "학술",
  ) => {
    try {
      const success = await addConversation({
        conversation,
        conversationCategory: category,
      });

      if (success) {
        setShowAddForm(false);
        showToast("대화가 추가되었습니다", "success", 2000);
      } else {
        showToast("추가에 실패했습니다", "error", 2000);
      }
    } catch (error) {
      console.error("Add failed:", error);
      showToast("추가 중 오류가 발생했습니다", "error", 2000);
    }
  };

  // 대화 수정 시작
  const startEditing = (conv: ConversationArchive) => {
    setEditingId(conv.id);
    setEditingConversation(conv.conversation);
    setEditingCategory(conv.conversationCategory);
  };

  // 대화 수정 완료
  const handleUpdateConversation = async () => {
    if (editingId && editingConversation.trim()) {
      try {
        const success = await updateConversation(editingId, {
          conversation: editingConversation.trim(),
          conversationCategory: editingCategory,
        });

        if (success) {
          setEditingId(null);
          setEditingConversation("");
          showToast("대화가 수정되었습니다", "success", 2000);
        } else {
          showToast("수정에 실패했습니다", "error", 2000);
        }
      } catch (error) {
        console.error("Update failed:", error);
        showToast("수정 중 오류가 발생했습니다", "error", 2000);
      }
    }
  };

  // 대화 삭제
  const handleDeleteConversation = async (id: string) => {
    if (window.confirm("이 대화를 삭제하시겠습니까?")) {
      try {
        const success = await deleteConversation(id);
        if (success) {
          showToast("대화가 삭제되었습니다", "success", 2000);
        } else {
          showToast("삭제에 실패했습니다", "error", 2000);
        }
      } catch (error) {
        console.error("Delete failed:", error);
        showToast("삭제 중 오류가 발생했습니다", "error", 2000);
      }
    }
  };

  // 번역 기능
  const handleTranslate = async (id: string, text: string) => {
    if (translatedTexts[id]) {
      setTranslatedTexts((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      return;
    }

    setTranslatingIds((prev) => new Set([...prev, id]));

    try {
      const translationQuestion = `Translate this sentence to English: "${text}"`;
      const response = await examApi.getSampleAnswers({
        question: translationQuestion,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: true,
      });

      const translatedText = response.samples[0]?.text || "Translation failed";
      setTranslatedTexts((prev) => ({ ...prev, [id]: translatedText }));
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setTranslatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // TTS 기능
  const handlePlayPause = (id: string, text: string) => {
    if (!speechSynthesis.current) return;

    if (playingId === id) {
      speechSynthesis.current.cancel();
      setPlayingId(null);
      return;
    }

    speechSynthesis.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;

    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    currentUtterance.current = utterance;
    speechSynthesis.current.speak(utterance);
    setPlayingId(id);
  };

  // 필터 변경 처리
  const handleFilterChange = (
    category: "전체" | "역할" | "일상" | "비즈니스" | "학술",
  ) => {
    setFilterCategory(category);
    if (category === "전체") {
      fetchConversations();
    } else {
      fetchConversationsByCategory(category);
    }
  };

  // 대화 사용하기
  const handleUseConversation = (conversation: string) => {
    if (onInsertConversation) {
      onInsertConversation(conversation);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />

          {/* 대화 아카이브 패널 */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3,
            }}
            className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 h-screen overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <Bars3Icon className="h-5 w-5 text-slate-600" />
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    나의 대화 아카이브
                  </h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    총 {conversations.length}개
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Conversation Input Form */}
              <ConversationInputForm
                showForm={showAddForm}
                onToggleForm={() => setShowAddForm(!showAddForm)}
                onSubmit={handleAddConversation}
                loading={loading}
              />

              {/* Category Filter */}
              <div className="sticky top-16 bg-white pt-4 pb-2 -mx-4 px-4 border-b border-gray-100 z-10">
                <div className="flex flex-wrap gap-2">
                  {["전체", ...CATEGORIES].map((category) => {
                    const count =
                      category === "전체"
                        ? null
                        : categoryCounts?.[
                            category as "역할" | "일상" | "비즈니스" | "학술"
                          ] || 0;

                    return (
                      <button
                        key={category}
                        onClick={() => handleFilterChange(category as any)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                          filterCategory === category
                            ? "bg-slate-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{category === "전체" ? "전체" : category}</span>
                        {count !== null && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              filterCategory === category
                                ? "bg-slate-600 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/40"></div>
                </div>
              )}

              {/* Conversations List */}
              <div className="space-y-3">
                {filteredConversations.length === 0 && !loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bars3Icon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p>저장된 대화가 없습니다.</p>
                  </div>
                ) : (
                  filteredConversations.map((conv, index) => (
                    <div
                      key={conv.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Header - 파스텔톤 배경 */}
                      <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* 아바타 */}
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm">🤖</span>
                          </div>

                          {/* 시간 */}
                          <span className="text-sm text-gray-500">
                            {new Date(
                              conv.createdAt || Date.now(),
                            ).toLocaleString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {/* 카테고리 배지 */}
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {conv.conversationCategory}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleUseConversation(conv.conversation)
                            }
                            className="h-6 w-6 bg-white hover:bg-blue-50"
                            title="사용하기"
                          >
                            <PaperAirplaneIcon className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteConversation(conv.id)}
                            className="h-6 w-6 bg-white hover:bg-red-50"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      {editingId === conv.id ? (
                        <div className="space-y-3">
                          <div className="flex gap-4">
                            <div className="flex flex-col gap-2">
                              {CATEGORIES.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setEditingCategory(cat)}
                                  className={`px-2 py-1 text-xs rounded-md border transition-all ${
                                    editingCategory === cat
                                      ? CATEGORY_COLORS[cat]
                                      : "bg-gray-50 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={editingConversation}
                              onChange={(e) =>
                                setEditingConversation(e.target.value)
                              }
                              className="flex-1 rounded-lg border border-border p-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              취소
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleUpdateConversation}
                              className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            >
                              저장
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Content - 본문 영역 */}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed flex-1">
                                {conv.conversation}
                              </p>

                              {/* Action Buttons - 우측 2x2 그리드 */}
                              <div className="flex-shrink-0 grid grid-cols-2 gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditing(conv)}
                                  className="w-7 h-7 p-0"
                                  title="수정"
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleTranslate(conv.id, conv.conversation)
                                  }
                                  disabled={translatingIds.has(conv.id)}
                                  className="w-7 h-7 p-0"
                                  title={
                                    translatedTexts[conv.id]
                                      ? "번역 숨기기"
                                      : "번역"
                                  }
                                >
                                  {translatingIds.has(conv.id) ? (
                                    <div className="animate-spin rounded-full h-2.5 w-2.5 border border-current border-t-transparent" />
                                  ) : (
                                    <LanguageIcon className="h-3 w-3" />
                                  )}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handlePlayPause(conv.id, conv.conversation)
                                  }
                                  className="w-7 h-7 p-0"
                                  title={
                                    playingId === conv.id ? "중지" : "듣기"
                                  }
                                >
                                  {playingId === conv.id ? (
                                    <PauseIcon className="h-3 w-3" />
                                  ) : (
                                    <PlayIcon className="h-3 w-3" />
                                  )}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // 이후 구현 예정: 댓글/질문-답변 기능
                                    console.log("댓글 기능 - 구현 예정");
                                  }}
                                  className="w-7 h-7 p-0"
                                  title="댓글 (구현 예정)"
                                >
                                  <ChatBubbleLeftRightIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {translatedTexts[conv.id] && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 relative mt-3">
                              <p className="text-blue-800 text-sm font-medium mb-1">
                                번역:
                              </p>
                              <p className="text-blue-700 pr-10">
                                {translatedTexts[conv.id]}
                              </p>

                              {/* 번역문 사용 버튼 */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUseConversation(
                                    translatedTexts[conv.id],
                                  )
                                }
                                className="absolute top-2 right-2 w-8 h-8 p-0"
                                title="번역문 사용"
                              >
                                <ArrowsRightLeftIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
