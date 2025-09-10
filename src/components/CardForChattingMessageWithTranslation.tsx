import { useState } from "react";
import { examApi } from "../features/exam/api/exam";

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
}

export default function CardForChattingMessageWithTranslation({
  message,
  isUser,
}: CardForChattingMessageWithTranslationProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const handleCardClick = async () => {
    if (!isFlipped && !translation && !isTranslating) {
      await translateMessage(message.message);
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="flip-card cursor-pointer"
        onClick={handleCardClick}
        style={{
          perspective: "1000px",
          maxWidth: "80%",
          width: "fit-content",
        }}
      >
        <div className="flip-card-inner transition-opacity duration-300">
          {/* 앞면 (원본 메시지) */}
          {!isFlipped && (
            <div
              className={`px-3 py-2 rounded-lg shadow-sm ${
                isUser
                  ? "bg-indigo-500 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p
                  className={`text-xs ${
                    isUser ? "text-indigo-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
                <p
                  className={`text-xs opacity-60 ${
                    isUser ? "text-indigo-100" : "text-gray-400"
                  }`}
                >
                  탭하여 번역
                </p>
              </div>
            </div>
          )}

          {/* 뒤면 (번역된 메시지) */}
          {isFlipped && (
            <div
              className={`px-3 py-2 rounded-lg shadow-sm ${
                isUser
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-50 text-gray-900 border border-emerald-200"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {isTranslating
                  ? "번역 중..."
                  : translation || "번역을 준비하고 있습니다..."}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p
                  className={`text-xs ${
                    isUser ? "text-emerald-100" : "text-emerald-600"
                  }`}
                >
                  한국어 번역
                </p>
                <p
                  className={`text-xs opacity-60 ${
                    isUser ? "text-emerald-100" : "text-emerald-500"
                  }`}
                >
                  탭하여 원본
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
