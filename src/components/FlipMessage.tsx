import { useState } from "react";
import { examApi } from "../features/exam/api/exam";

interface FlipMessageProps {
  message: {
    id: number;
    sender: string;
    message: string;
    timestamp: string;
    type: string;
  };
}

export default function FlipMessage({ message }: FlipMessageProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateMessage = async (text: string) => {
    if (translation || isTranslating) return;

    setIsTranslating(true);
    try {
      // GPT를 사용한 번역
      const translationPrompt = `Translate the following English text to Korean. Only return the Korean translation, nothing else:\n\n"${text}"`;

      const response = await examApi.getSampleAnswers({
        question: translationPrompt,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: false,
        context: `Please provide only the translated text without any explanations.`,
      });

      const translatedText =
        (response.samples?.[0]?.text || "").trim() || `[번역] ${text}`;
      setTranslation(translatedText);
    } catch (error) {
      console.error("번역 실패:", error);
      setTranslation(`[번역 오류] ${text}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClick = async () => {
    if (!isFlipped && !translation) {
      await translateMessage(message.message);
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative">
      {/* Flip Card Container */}
      <div
        className="flip-card cursor-pointer"
        style={{
          perspective: "1000px",
          minHeight: "60px",
        }}
        onClick={handleClick}
      >
        <div
          className={`flip-card-inner transition-transform duration-700 ease-in-out ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* 앞면 (원본 메시지) */}
          <div
            className={`absolute inset-0 w-full px-4 py-2 rounded-lg ${
              message.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-900 border border-gray-200"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
          >
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            <p
              className={`text-xs mt-1 ${
                message.sender === "user" ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {message.timestamp}
            </p>
            {/* 번역 힌트 */}
            <p
              className={`text-xs mt-1 opacity-60 ${
                message.sender === "user" ? "text-blue-100" : "text-gray-400"
              }`}
            >
              탭하여 번역 보기
            </p>
          </div>

          {/* 뒤면 (번역된 메시지) */}
          <div
            className={`absolute inset-0 w-full px-4 py-2 rounded-lg ${
              message.sender === "user"
                ? "bg-green-500 text-white"
                : "bg-green-50 text-gray-900 border border-green-200"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-sm whitespace-pre-wrap">
              {isTranslating
                ? "번역 중..."
                : translation || "번역을 준비 중입니다..."}
            </p>
            <p
              className={`text-xs mt-1 ${
                message.sender === "user" ? "text-green-100" : "text-green-600"
              }`}
            >
              한국어 번역
            </p>
            {/* 원본으로 돌아가기 힌트 */}
            <p
              className={`text-xs mt-1 opacity-60 ${
                message.sender === "user" ? "text-green-100" : "text-green-500"
              }`}
            >
              탭하여 원본 보기
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
