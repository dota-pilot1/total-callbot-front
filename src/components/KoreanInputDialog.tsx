import { useState } from "react";
import {
  MicrophoneIcon,
  PlayIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "./ui/FullScreenSlideDialog";
import { translateToEnglish } from "../features/daily-english/utils/translationApi";

interface KoreanInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
}

export default function KoreanInputDialog({
  isOpen,
  onClose,
  onInsertText,
}: KoreanInputDialogProps) {
  const [koreanText, setKoreanText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const startListening = () => {
    setIsListening(true);
    // TODO: 음성 인식 로직
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleTranslateToEnglish = async () => {
    if (!koreanText.trim()) return;

    setIsTranslating(true);
    try {
      const translatedText = await translateToEnglish(koreanText);
      if (translatedText) {
        setEnglishText(translatedText);
      } else {
        console.warn("번역 결과가 없습니다");
        setEnglishText("번역에 실패했습니다");
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setEnglishText("번역 중 오류가 발생했습니다");
    } finally {
      setIsTranslating(false);
    }
  };

  const playText = (text: string) => {
    if (!text.trim()) return;
    // TODO: TTS 재생 로직
  };

  const applyText = () => {
    const textToApply = koreanText.trim() || englishText.trim();
    if (textToApply && onInsertText) {
      onInsertText(textToApply);
      onClose();
    }
  };

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={onClose}
      title="한국어 입력 도우미"
      className="h-[100vh]"
    >
      <div className="space-y-6">
        {/* 마이크 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <MicrophoneIcon className="h-8 w-8" />
          </button>
        </div>

        {/* 한국어 입력 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">한국어</label>
            <div className="flex space-x-2">
              <button
                onClick={() => playText(koreanText)}
                disabled={!koreanText.trim()}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                <PlayIcon className="h-3 w-3" />
              </button>
              <button
                onClick={handleTranslateToEnglish}
                disabled={!koreanText.trim() || isTranslating}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {isTranslating ? "번역중..." : "번역"}
              </button>
            </div>
          </div>
          <textarea
            value={koreanText}
            onChange={(e) => setKoreanText(e.target.value)}
            placeholder="한국어 입력"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* 영어 입력 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">영어</label>
            <button
              onClick={() => playText(englishText)}
              disabled={!englishText.trim()}
              className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              <PlayIcon className="h-3 w-3" />
            </button>
          </div>
          <textarea
            value={englishText}
            onChange={(e) => setEnglishText(e.target.value)}
            placeholder="영어 입력"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* 적용 버튼 */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={applyText}
            disabled={!koreanText.trim() && !englishText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-1"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>적용</span>
          </button>
        </div>
      </div>
    </FullScreenSlideDialog>
  );
}
