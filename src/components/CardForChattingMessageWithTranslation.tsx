import { useState, useRef } from "react";
import { examApi } from "../features/chatbot/exam/api/exam";
import {
  LanguageIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import SentenceSplitterDialogButtonWithTranslate from "./SentenceSplitterDialogButtonWithTranslate";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 저장 기능 구현 예정
    console.log("Save message:", message.id);
  };

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
              className={`px-3 py-2 pb-6 rounded-lg shadow-sm relative ${
                isUser
                  ? "bg-indigo-500 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap pr-24">
                {message.message}
              </p>
              <div className="mt-1">
                <p
                  className={`text-xs ${
                    isUser ? "text-indigo-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
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
                  disabled={isTranslating}
                  className={`p-1.5 rounded-full border transition-colors ${
                    isUser
                      ? "hover:bg-indigo-400 text-indigo-100 border-indigo-200"
                      : "hover:bg-gray-100 text-gray-600 border-gray-300"
                  } ${isTranslating ? "opacity-50" : ""}`}
                  title="번역"
                >
                  <LanguageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlayClick}
                  disabled={isPlaying}
                  className={`p-1.5 rounded-full border transition-colors ${
                    isUser
                      ? "hover:bg-indigo-400 text-indigo-100 border-indigo-200"
                      : "hover:bg-gray-100 text-gray-600 border-gray-300"
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
                  className={`p-1.5 rounded-full border transition-colors ${
                    isUser
                      ? "hover:bg-indigo-400 text-indigo-100 border-indigo-200"
                      : "hover:bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                  title="저장"
                >
                  💾
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
                  className={`p-1.5 rounded-full border transition-colors ${
                    isUser
                      ? "hover:bg-emerald-400 text-emerald-100 border-emerald-200"
                      : "hover:bg-emerald-100 text-emerald-600 border-emerald-300"
                  }`}
                  title="원본"
                >
                  <LanguageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlayClick}
                  disabled={isPlaying}
                  className={`p-1.5 rounded-full border transition-colors ${
                    isUser
                      ? "hover:bg-emerald-400 text-emerald-100 border-emerald-200"
                      : "hover:bg-emerald-100 text-emerald-600 border-emerald-300"
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
                  className={`p-1.5 rounded-full border transition-colors ${
                    isUser
                      ? "hover:bg-emerald-400 text-emerald-100 border-emerald-200"
                      : "hover:bg-emerald-100 text-emerald-600 border-emerald-300"
                  }`}
                  title="저장"
                >
                  💾
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
