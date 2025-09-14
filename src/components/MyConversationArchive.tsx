import { useState, useRef } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArchiveBoxIcon,
  PencilIcon,
  LanguageIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { examApi } from "../features/chatbot/exam/api/exam";

interface Conversation {
  id: string;
  conversation: string;
  conversationCategory: "역할" | "일상" | "비즈니스" | "학술";
  createdAt: Date;
}

interface MyConversationArchiveProps {
  open: boolean;
  onClose: () => void;
  onInsertConversation?: (conversation: string) => void;
}

const CATEGORIES = ["역할", "일상", "비즈니스", "학술"] as const;

const SimpleOutlineButton = ({
  children,
  onClick,
  variant = "default",
  size = "sm",
  disabled = false,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
  size?: "sm" | "xs";
  disabled?: boolean;
  className?: string;
}) => {
  const baseClasses =
    "border rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-1";
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
  };
  const variantClasses = {
    default:
      "border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    danger: "border-red-300 text-red-600 hover:bg-red-50 focus:ring-red-300",
  };
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function MyConversationArchive({
  open,
  onClose,
  onInsertConversation,
}: MyConversationArchiveProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("일상");
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      conversation: "안녕하세요! 저에 대해 소개해드릴게요.",
      conversationCategory: "일상",
      createdAt: new Date(),
    },
    {
      id: "2",
      conversation: "오늘 발표할 주제에 대해 연습해보겠습니다.",
      conversationCategory: "비즈니스",
      createdAt: new Date(),
    },
  ]);
  const [newConversation, setNewConversation] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const filteredConversations = conversations.filter(
    (c) => c.conversationCategory === selectedCategory,
  );

  const handleAddConversation = () => {
    if (!newConversation.trim()) return;

    const conversation: Conversation = {
      id: Date.now().toString(),
      conversation: newConversation,
      conversationCategory: selectedCategory,
      createdAt: new Date(),
    };

    console.log("Adding new conversation:", conversation);
    setConversations([...conversations, conversation]);
    setNewConversation("");
    setIsAddingNew(false);
  };

  const handleDeleteConversation = (id: string) => {
    console.log("Deleting conversation:", id);
    setConversations(conversations.filter((c) => c.id !== id));
  };

  const handleUseConversation = (conversation: Conversation) => {
    console.log("Using conversation:", conversation);
    onInsertConversation?.(conversation.conversation);
    onClose();
  };

  const handleCategoryChange = (
    conversationId: string,
    newCategory: (typeof CATEGORIES)[number],
  ) => {
    console.log(`Changing category for ${conversationId} to ${newCategory}`);
    setConversations(
      conversations.map((c) =>
        c.id === conversationId
          ? { ...c, conversationCategory: newCategory }
          : c,
      ),
    );
  };

  const handleEditStart = (conversation: Conversation) => {
    console.log("Starting edit for:", conversation.id);
    setEditingId(conversation.id);
    setEditingText(conversation.conversation);
  };

  const handleEditSave = (id: string) => {
    console.log("Saving edit for:", id, editingText);
    setConversations(
      conversations.map((c) =>
        c.id === id ? { ...c, conversation: editingText } : c,
      ),
    );
    setEditingId(null);
    setEditingText("");
  };

  const handleEditCancel = () => {
    console.log("Canceling edit");
    setEditingId(null);
    setEditingText("");
  };

  const requestTranslation = async (
    textToTranslate: string,
  ): Promise<string> => {
    const prompt = `Please translate the following text and provide both the original and Korean translation:

Text: "${textToTranslate}"

Please respond in this exact JSON format:
{
  "original": "original text here",
  "translation": "Korean translation here",
  "language": "detected language (English/Korean/etc)"
}`;

    try {
      const response = await examApi.getSampleAnswers({
        question: prompt,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: false,
      });

      const result = response.samples?.[0]?.text || "";

      try {
        const parsedResult = JSON.parse(result);
        return parsedResult.translation || "번역을 생성할 수 없습니다.";
      } catch (parseError) {
        return result || "번역을 생성할 수 없습니다.";
      }
    } catch (err) {
      console.error("Translation request failed:", err);
      return "번역 요청에 실패했습니다.";
    }
  };

  const handleTranslate = async (conversation: Conversation) => {
    console.log("Translating conversation:", conversation);

    if (editingId === conversation.id) {
      // 편집 모드일 때: 번역 결과를 편집 텍스트에 반영
      setTranslatingId(conversation.id);
      try {
        const translation = await requestTranslation(editingText);
        setEditingText(translation);
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setTranslatingId(null);
      }
    } else {
      // 일반 모드일 때: 번역 결과를 하단에 표시
      setTranslatingId(conversation.id);
      try {
        const translation = await requestTranslation(conversation.conversation);
        setTranslations((prev) => ({
          ...prev,
          [conversation.id]: translation,
        }));
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setTranslatingId(null);
      }
    }
  };

  const handlePlay = async (conversation: Conversation) => {
    console.log("Playing conversation:", conversation);

    if (playingId === conversation.id) {
      // 현재 재생 중인 것을 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingId(null);
      return;
    }

    try {
      setPlayingId(conversation.id);

      // TTS API 호출 (MobileTranslationDialog의 playText 로직 참고)
      const token = localStorage.getItem("accessToken");
      const apiUrl =
        window.location.hostname === "localhost"
          ? "/api/config/openai-key"
          : "https://api.total-callbot.cloud/api/config/openai-key";

      const keyResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keyResponse.ok) {
        throw new Error(`API 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // OpenAI TTS API 호출
      const ttsResponse = await fetch(
        "https://api.openai.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: conversation.conversation,
            voice: "alloy",
            speed: 1.0,
          }),
        },
      );

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const reader = new FileReader();

        reader.onload = async () => {
          if (audioRef.current) {
            audioRef.current.pause();
          }

          audioRef.current = new Audio(reader.result as string);

          audioRef.current.onended = () => {
            setPlayingId(null);
          };

          audioRef.current.onerror = () => {
            setPlayingId(null);
            console.error("Audio playback failed");
          };

          try {
            await audioRef.current.play();
          } catch (playError) {
            console.error("Audio play failed:", playError);
            setPlayingId(null);
          }
        };

        reader.onerror = () => {
          console.error("FileReader error");
          setPlayingId(null);
        };

        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error(`TTS API request failed: ${ttsResponse.status}`);
      }
    } catch (error) {
      console.error("TTS API failed:", error);
      setPlayingId(null);
      alert("음성 재생에 실패했습니다.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-8 px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ArchiveBoxIcon className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              나의 대화 아카이브
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex border-b bg-gray-50">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 대화 목록 */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ArchiveBoxIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">
                아직 {selectedCategory} 카테고리에 보관된 대화가 없습니다.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                중요한 대화를 보관해보세요!
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                {/* 카테고리 변경 버튼들 */}
                <div className="flex space-x-1 mb-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        handleCategoryChange(conversation.id, category)
                      }
                      className={`px-2 py-1 text-xs border rounded transition-colors ${
                        conversation.conversationCategory === category
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="flex items-start justify-between">
                  {/* 대화 내용 또는 편집 입력창 */}
                  <div className="flex-1 mr-4">
                    {editingId === conversation.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <SimpleOutlineButton
                            size="xs"
                            onClick={() => handleTranslate(conversation)}
                            disabled={translatingId === conversation.id}
                          >
                            {translatingId === conversation.id
                              ? "번역중..."
                              : "번역"}
                          </SimpleOutlineButton>
                          <SimpleOutlineButton
                            size="xs"
                            onClick={() => handleEditSave(conversation.id)}
                          >
                            저장
                          </SimpleOutlineButton>
                          <SimpleOutlineButton
                            size="xs"
                            onClick={handleEditCancel}
                          >
                            취소
                          </SimpleOutlineButton>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {conversation.conversation}
                      </p>
                    )}
                  </div>

                  {/* 2x2 버튼 그리드 */}
                  {editingId !== conversation.id && (
                    <div className="grid grid-cols-2 gap-1 flex-shrink-0">
                      {/* 첫 번째 행 */}
                      <button
                        onClick={() => handleEditStart(conversation)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteConversation(conversation.id)
                        }
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>

                      {/* 두 번째 행 */}
                      <button
                        onClick={() => handleTranslate(conversation)}
                        disabled={translatingId === conversation.id}
                        className={`p-2 rounded transition-colors ${
                          translatingId === conversation.id
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-500 hover:text-green-700 hover:bg-green-50"
                        }`}
                        title={
                          translatingId === conversation.id
                            ? "번역 중..."
                            : "번역"
                        }
                      >
                        {translatingId === conversation.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                        ) : (
                          <LanguageIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handlePlay(conversation)}
                        className={`p-2 hover:bg-purple-50 rounded transition-colors ${
                          playingId === conversation.id
                            ? "text-red-500 hover:text-red-700"
                            : "text-purple-500 hover:text-purple-700"
                        }`}
                        title={
                          playingId === conversation.id ? "재생 중지" : "재생"
                        }
                      >
                        {playingId === conversation.id ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 번역 결과 표시 */}
                {editingId !== conversation.id &&
                  translations[conversation.id] && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-700 mb-1">
                            번역:
                          </p>
                          <p className="text-sm text-blue-900">
                            {translations[conversation.id]}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setTranslations((prev) => {
                              const newTranslations = { ...prev };
                              delete newTranslations[conversation.id];
                              return newTranslations;
                            })
                          }
                          className="ml-2 p-1 text-blue-500 hover:text-blue-700 transition-colors"
                          title="번역 숨기기"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                {/* 사용 버튼을 별도로 하단에 배치 */}
                {editingId !== conversation.id && (
                  <div className="mt-3 flex justify-end">
                    <SimpleOutlineButton
                      size="xs"
                      onClick={() => handleUseConversation(conversation)}
                    >
                      사용하기
                    </SimpleOutlineButton>
                  </div>
                )}
              </div>
            ))
          )}

          {/* 새 대화 추가 폼 */}
          {isAddingNew ? (
            <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 bg-indigo-50">
              <textarea
                placeholder="중요한 대화 내용을 보관하세요"
                rows={4}
                value={newConversation}
                onChange={(e) => setNewConversation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex space-x-2">
                <SimpleOutlineButton onClick={handleAddConversation}>
                  보관
                </SimpleOutlineButton>
                <SimpleOutlineButton
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewConversation("");
                  }}
                >
                  취소
                </SimpleOutlineButton>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="text-sm">새 대화 보관</span>
            </button>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              총 {filteredConversations.length}개의 {selectedCategory} 대화
              보관됨
            </p>
            <SimpleOutlineButton onClick={onClose}>닫기</SimpleOutlineButton>
          </div>
        </div>
      </div>
    </div>
  );
}
