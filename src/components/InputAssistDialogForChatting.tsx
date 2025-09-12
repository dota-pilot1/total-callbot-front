import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  XMarkIcon,
  LanguageIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
}

interface InputAssistDialogForChattingProps {
  onInsertKorean?: (text: string) => void;
  onInsertEnglish?: (text: string) => void;
  onPauseVoice?: () => void;
  onResumeVoice?: () => void;
}

export default function InputAssistDialogForChatting({
  onInsertKorean,
  onInsertEnglish,
  onPauseVoice,
  onResumeVoice,
}: InputAssistDialogForChattingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [koreanText, setKoreanText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
    }
  }, []);

  const startListening = () => {
    if (!isSupported) return;

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "ko-KR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setKoreanText((prev) => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("음성인식 오류:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("음성인식 초기화 오류:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const translateToEnglish = async () => {
    if (!koreanText.trim()) return;

    setIsTranslating(true);
    try {
      // OpenAI API를 통한 번역 (실제 구현 시 API 키와 엔드포인트 필요)
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: koreanText,
          from: "ko",
          to: "en",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEnglishText(data.translatedText);
      } else {
        // 임시 fallback - 실제로는 번역 API 사용
        setEnglishText(`[번역 필요] ${koreanText}`);
      }
    } catch (error) {
      console.error("번역 오류:", error);
      // 임시 fallback
      setEnglishText(`[번역 필요] ${koreanText}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const insertKorean = () => {
    if (koreanText.trim() && onInsertKorean) {
      onInsertKorean(koreanText);
      setIsOpen(false);
      setKoreanText("");
      setEnglishText("");
    }
  };

  const insertEnglish = () => {
    if (englishText.trim() && onInsertEnglish) {
      onInsertEnglish(englishText);
      setIsOpen(false);
      setKoreanText("");
      setEnglishText("");
    }
  };

  const openDialog = () => {
    setIsOpen(true);
    if (onPauseVoice) {
      onPauseVoice();
      console.log("📢 챗봇 음성 입력이 일시정지되었습니다");
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
    setKoreanText("");
    setEnglishText("");
    if (isListening) {
      stopListening();
    }
    if (onResumeVoice) {
      onResumeVoice();
      console.log("📢 챗봇 음성 입력이 재개되었습니다");
    }
  };

  return (
    <>
      {/* 💬 버튼 */}
      <button
        onClick={openDialog}
        className="w-10 h-10 rounded-full transition-colors flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
        title="입력 도우미"
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
      </button>

      {/* 전체 화면 다이얼로그 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="w-full bg-white rounded-t-2xl h-[100vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  음성 입력 도구
                </h3>
                <button
                  onClick={closeDialog}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* 마이크 버튼 (맨 위) */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={!isSupported}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isListening ? "음성인식 중지" : "음성인식 시작"}
                  >
                    <MicrophoneIcon className="h-8 w-8" />
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    {!isSupported
                      ? "음성인식을 지원하지 않는 브라우저입니다"
                      : isListening
                        ? "말씀해 주세요..."
                        : "마이크를 눌러 음성을 입력하세요"}
                  </p>
                </div>

                {/* 한국어 입력 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      한국어 입력
                    </label>
                    <button
                      onClick={insertKorean}
                      disabled={!koreanText.trim()}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <PaperAirplaneIcon className="h-3 w-3" />
                      <span>입력</span>
                    </button>
                  </div>
                  <textarea
                    value={koreanText}
                    onChange={(e) => setKoreanText(e.target.value)}
                    placeholder="음성으로 입력되거나 직접 타이핑하세요"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                  <button
                    onClick={translateToEnglish}
                    disabled={!koreanText.trim() || isTranslating}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <LanguageIcon className="h-4 w-4" />
                    <span>{isTranslating ? "번역 중..." : "영어로 번역"}</span>
                  </button>
                </div>

                {/* 영어 입력 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      영어 입력
                    </label>
                    <button
                      onClick={insertEnglish}
                      disabled={!englishText.trim()}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <PaperAirplaneIcon className="h-3 w-3" />
                      <span>입력</span>
                    </button>
                  </div>
                  <textarea
                    value={englishText}
                    onChange={(e) => setEnglishText(e.target.value)}
                    placeholder="번역된 영어 텍스트가 여기에 표시됩니다"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
