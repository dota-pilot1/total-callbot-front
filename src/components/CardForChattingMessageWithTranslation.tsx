import { useState, useRef } from "react";
import { examApi } from "../features/chatbot/exam/api/exam";
import { examArchiveApi } from "../features/exam/api/examArchive";
import {
  LanguageIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import SentenceSplitterDialogButtonWithTranslate from "./SentenceSplitterDialogButtonWithTranslate";
import { useConversationArchive } from "../features/conversation-archive/hooks/useConversationArchive";
import { useToast } from "./ui/Toast";

interface Message {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
  type: string;
}

interface CardForChattingMessageWithTranslationProps {
  message: Message;
  isUser: boolean;
  isExamMode?: boolean; // 시험 모드 여부
  examCharacterId?: string; // 시험 캐릭터 ID
  relatedMessages?: Message[]; // 관련 메시지들 (문제-답변 매칭용)
}

export default function CardForChattingMessageWithTranslation({
  message,
  isUser,
  isExamMode = false,
  examCharacterId,
  relatedMessages = [],
}: CardForChattingMessageWithTranslationProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addConversation } = useConversationArchive();
  const { showToast } = useToast();

  const detectLanguage = (text: string): "ko" | "en" => {
    // 한글 문자 포함 여부 확인
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text) ? "ko" : "en";
  };

  const translateMessage = async (text: string) => {
    if (translation || isTranslating) return;

    setIsTranslating(true);
    try {
      // 언어 감지
      const sourceLanguage = detectLanguage(text);
      const targetLanguage = sourceLanguage === "ko" ? "en" : "ko";

      // examApi의 getSampleAnswers를 사용해서 번역 요청
      const translationQuestion =
        sourceLanguage === "ko"
          ? `Translate this Korean text to English: "${text}"`
          : `Translate this English text to Korean: "${text}"`;

      const response = await examApi.getSampleAnswers({
        question: translationQuestion,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: targetLanguage === "en",
        context: `Please provide only the translated text without any explanations or additional text.`,
      });

      const translatedText = (response.samples?.[0]?.text || "").trim();
      if (translatedText) {
        setTranslation(translatedText);
      } else {
        throw new Error("No translation received");
      }
    } catch (error) {
      console.error("번역 실패:", error);
      // 간단한 fallback 번역
      const sourceLanguage = detectLanguage(text);
      const fallbackTranslation =
        sourceLanguage === "ko"
          ? `[영어 번역] ${text}`
          : `[한국어 번역] ${text}`;
      setTranslation(fallbackTranslation);
    } finally {
      setIsTranslating(false);
    }
  };

  // TTS 기능
  const playText = async (text: string) => {
    try {
      // 이전 오디오 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsPlaying(true);

      // 백엔드에서 OpenAI API 키 받기
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

      // 언어 감지
      const isKorean = detectLanguage(text) === "ko";

      // OpenAI TTS API 직접 호출
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
            input: text,
            voice: isKorean ? "nova" : "alloy",
            speed: 1.0,
          }),
        },
      );

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();

        // Data URL 방식으로 변환 (모바일 호환성)
        const reader = new FileReader();
        reader.onload = async () => {
          audioRef.current = new Audio(reader.result as string);

          audioRef.current.onended = () => {
            setIsPlaying(false);
          };

          audioRef.current.onerror = () => {
            setIsPlaying(false);
            console.error("Audio playback failed");
          };

          await audioRef.current.play();
        };

        reader.onerror = () => {
          console.error("FileReader error");
          setIsPlaying(false);
        };

        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error(`TTS API request failed: ${ttsResponse.status}`);
      }
    } catch (error) {
      console.error("TTS API failed:", error);
      setIsPlaying(false);
    }
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleTranslateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!translation && !isTranslating) {
      await translateMessage(message.message);
    }
    setIsFlipped(!isFlipped);
  };

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeech();
    } else {
      const textToPlay =
        isFlipped && translation ? translation : message.message;
      await playText(textToPlay);
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("북마크 버튼 클릭됨!");

    try {
      if (isExamMode) {
        // 시험 모드에서는 구조화된 Q&A 저장
        await saveAsExamQA();
      } else {
        // 일반 모드에서는 기존 아카이브 저장
        const conversationText = message.message;
        const success = await addConversation({
          conversation: conversationText,
          conversationCategory: "학술",
        });

        if (success) {
          showToast("대화가 아카이브에 저장되었습니다", "success", 3000);
        } else {
          showToast("저장에 실패했습니다", "error", 3000);
        }
      }
    } catch (error) {
      console.error("Save failed:", error);
      showToast("저장 중 오류가 발생했습니다", "error", 3000);
    }
  };

  const saveAsExamQA = async () => {
    try {
      // AI 메시지인 경우 (문제)
      if (!isUser) {
        const { question, questionKorean } =
          examArchiveApi.parseQuestionFromMessage(message.message);

        // 사용자의 답변을 찾기 (다음 메시지)
        const currentIndex = relatedMessages.findIndex(
          (msg) => msg.id === message.id,
        );
        const userAnswerMsg = relatedMessages[currentIndex + 1];
        const userAnswer =
          userAnswerMsg?.sender === "user" ? userAnswerMsg.message : undefined;

        // 채점 결과를 찾기 (그 다음 메시지)
        const feedbackMsg = relatedMessages[currentIndex + 2];
        let score: number | undefined;
        let modelFeedback: string | undefined;

        if (feedbackMsg && feedbackMsg.sender === "assistant") {
          const result = examArchiveApi.parseExamResult(feedbackMsg.message);
          score = result.score;
          modelFeedback = result.feedback;
        }

        await examArchiveApi.saveArchivedQuestion({
          question,
          questionKorean,
          userAnswer,
          modelFeedback,
          score,
          examCharacterId,
          difficultyLevel: "INTERMEDIATE", // 기본값
          topicCategory: "DAILY_CONVERSATION", // 기본값
        });

        showToast("시험 문제가 저장되었습니다", "success", 3000);
      } else {
        // 사용자 메시지인 경우 (답변) - 이전 AI 메시지를 문제로 찾기
        const currentIndex = relatedMessages.findIndex(
          (msg) => msg.id === message.id,
        );
        const questionMsg = relatedMessages[currentIndex - 1];

        if (questionMsg && questionMsg.sender === "assistant") {
          const { question, questionKorean } =
            examArchiveApi.parseQuestionFromMessage(questionMsg.message);

          // 채점 결과를 찾기 (다음 메시지)
          const feedbackMsg = relatedMessages[currentIndex + 1];
          let score: number | undefined;
          let modelFeedback: string | undefined;

          if (feedbackMsg && feedbackMsg.sender === "assistant") {
            const result = examArchiveApi.parseExamResult(feedbackMsg.message);
            score = result.score;
            modelFeedback = result.feedback;
          }

          await examArchiveApi.saveArchivedQuestion({
            question,
            questionKorean,
            userAnswer: message.message,
            modelFeedback,
            score,
            examCharacterId,
            difficultyLevel: "INTERMEDIATE",
            topicCategory: "DAILY_CONVERSATION",
          });

          showToast("답변이 저장되었습니다", "success", 3000);
        } else {
          showToast("관련 문제를 찾을 수 없습니다", "error", 3000);
        }
      }
    } catch (error) {
      console.error("Failed to save exam Q&A:", error);
      throw error;
    }
  };

  // 메시지에서 [KO] 해석 부분을 분리하는 함수
  const parseMessageContent = (text: string) => {
    // [KO] 또는 [ko]로 시작하는 부분을 찾기
    const koPattern = /(\[KO\]|\[ko\])/i;
    const match = text.search(koPattern);

    if (match === -1) {
      // [KO] 해석이 없는 경우 원본 그대로 반환
      return { englishPart: text, koreanPart: null };
    }

    // [KO] 이전 부분과 이후 부분으로 분리
    const englishPart = text.substring(0, match).trim();
    const koreanPart = text.substring(match).replace(koPattern, "").trim();

    return { englishPart, koreanPart };
  };

  const { englishPart, koreanPart } = parseMessageContent(message.message);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="relative"
        style={{
          maxWidth: "80%",
          width: "fit-content",
        }}
      >
        <div className="transition-opacity duration-300">
          {/* 앞면 (원본 메시지) */}
          {!isFlipped && (
            <div
              className={`rounded-lg shadow-sm relative border overflow-hidden ${
                isUser
                  ? "bg-blue-50 border-blue-200 rounded-2xl"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {/* 영어 부분 */}
              <div
                className={`px-3 py-2 pb-6 ${koreanPart ? "pb-2" : "pb-6"} ${
                  isUser ? "text-blue-900" : "text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap pr-24">
                  {englishPart}
                </p>
              </div>

              {/* 한국어 해석 부분 (있는 경우에만) */}
              {koreanPart && (
                <div
                  className={`px-3 py-2 pb-6 border-t ${
                    isUser
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                  }`}
                >
                  <p className="text-xs leading-relaxed whitespace-pre-wrap pr-24 font-medium">
                    해석: {koreanPart}
                  </p>
                </div>
              )}

              {/* 타임스탬프 */}
              <div
                className={`px-3 pb-2 ${koreanPart ? "absolute bottom-0 right-0" : "mt-1"}`}
              >
                <p
                  className={`text-xs ${
                    isUser ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>

              {/* 버튼 영역 - 우측 중앙 2x2 그리드 */}
              <div
                className={`absolute right-2 grid grid-cols-2 gap-1 ${
                  koreanPart ? "top-6" : "top-1/2 -translate-y-1/2"
                }`}
              >
                <SentenceSplitterDialogButtonWithTranslate
                  message={message.message}
                  isUser={isUser}
                />
                <button
                  onClick={handleTranslateClick}
                  disabled={isTranslating}
                  className={`p-1.5 rounded border transition-colors ${
                    isUser
                      ? "text-gray-700 hover:bg-blue-200 border-gray-400 bg-white"
                      : "text-gray-700 hover:bg-gray-200 border-gray-400 bg-white"
                  } ${isTranslating ? "opacity-50" : ""}`}
                  title="번역"
                >
                  <LanguageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlayClick}
                  disabled={isPlaying}
                  className={`p-1.5 rounded border transition-colors ${
                    isUser
                      ? "text-gray-700 hover:bg-blue-200 border-gray-400 bg-white"
                      : "text-gray-700 hover:bg-gray-200 border-gray-400 bg-white"
                  }`}
                  title="음성 재생"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleSaveClick}
                  className={`p-1.5 rounded border transition-colors ${
                    isUser
                      ? "text-gray-700 hover:bg-blue-200 border-gray-400 bg-white"
                      : "text-gray-700 hover:bg-gray-200 border-gray-400 bg-white"
                  }`}
                  title="저장"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* 뒤면 (번역된 메시지) */}
          {isFlipped && (
            <div
              className={`px-3 py-2 pb-6 rounded-lg shadow-sm relative ${
                isUser
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-50 text-gray-900 border border-emerald-200"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap pr-24">
                {isTranslating
                  ? "번역 중..."
                  : translation || "번역을 준비하고 있습니다..."}
              </p>
              <div className="mt-1">
                <p
                  className={`text-xs ${
                    isUser ? "text-emerald-100" : "text-emerald-600"
                  }`}
                >
                  번역 결과
                </p>
              </div>

              {/* 버튼 영역 - 우측 중앙 2x2 그리드 */}
              <div className="absolute top-1/2 right-2 -translate-y-1/2 grid grid-cols-2 gap-1">
                <SentenceSplitterDialogButtonWithTranslate
                  message={message.message}
                  isUser={isUser}
                />
                <button
                  onClick={handleTranslateClick}
                  className={`p-1.5 rounded border transition-colors ${
                    isUser
                      ? "text-gray-700 hover:bg-emerald-200 border-gray-400 bg-white"
                      : "text-gray-700 hover:bg-emerald-200 border-gray-400 bg-white"
                  }`}
                  title="원본"
                >
                  <LanguageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlayClick}
                  disabled={isPlaying}
                  className={`p-1.5 rounded border transition-colors ${
                    isUser
                      ? "text-gray-700 hover:bg-emerald-200 border-gray-400 bg-white"
                      : "text-gray-700 hover:bg-emerald-200 border-gray-400 bg-white"
                  }`}
                  title="음성 재생"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleSaveClick}
                  className={`p-1.5 rounded border transition-colors ${
                    isUser
                      ? "text-gray-700 hover:bg-emerald-200 border-gray-400 bg-white"
                      : "text-gray-700 hover:bg-emerald-200 border-gray-400 bg-white"
                  }`}
                  title="저장"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
