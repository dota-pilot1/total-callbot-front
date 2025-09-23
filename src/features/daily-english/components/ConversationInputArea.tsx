import { useState, useRef, useCallback } from "react";
import { Button } from "../../../components/ui";
import {
  PaperAirplaneIcon,
  SpeakerWaveIcon,
  PauseIcon,
  SparklesIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

interface ConversationInputAreaProps {
  newMessage: string;
  isIMEComposing: boolean;
  suggestLoading: boolean;
  onMessageChange: (text: string) => void;
  onIMEComposingChange: (composing: boolean) => void;
  onSendMessage: () => void;
  onSuggestReply: () => void;
  onPlayText?: (text: string) => void;
  onStopText?: () => void;
  isPlaying?: boolean;
  disabled?: boolean;
  translation?: string; // API에서 받은 번역
}

export default function ConversationInputArea({
  newMessage,
  isIMEComposing,
  suggestLoading,
  onMessageChange,
  onIMEComposingChange,
  onSendMessage,
  onSuggestReply,
  onPlayText,
  onStopText,
  isPlaying = false,
  disabled = false,
  translation,
}: ConversationInputAreaProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 번역 상태 디버깅
  console.log("🔍 ConversationInputArea 상태:", {
    showTranslation,
    translation,
    hasTranslation: !!translation,
  });

  // 자동 완성 버튼 클릭 시 번역도 함께 표시
  const handleSuggestReply = useCallback(async () => {
    console.log("🎯 자동 완성 버튼 클릭");
    onSuggestReply();
    setShowTranslation(true);
    console.log("🎯 번역 표시 상태:", true);
  }, [onSuggestReply]);

  // 텍스트 변경 시 번역 숨기기
  const handleMessageChange = useCallback(
    (text: string) => {
      onMessageChange(text);
      if (showTranslation && !suggestLoading) {
        setShowTranslation(false);
      }
    },
    [onMessageChange, showTranslation, suggestLoading],
  );

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const anyEvt = e.nativeEvent as any;
    const composing =
      isIMEComposing || anyEvt?.isComposing || anyEvt?.keyCode === 229;

    if (e.key === "Enter" && !e.shiftKey && !composing && !suggestLoading) {
      e.preventDefault();
      onSendMessage();
      setShowTranslation(false);
    }
  };

  return (
    <div className="bg-card border-t border-border">
      {/* 번역 영역 */}
      {showTranslation && (
        <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-200">
          <div className="flex items-start gap-3">
            <LanguageIcon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-700 mb-1">
                한글 번역
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                {translation || "번역을 가져올 수 없습니다."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranslation(false)}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          {/* 왼쪽 미니 버튼들 */}
          <div className="flex flex-col space-y-1">
            <Button
              onClick={handleSuggestReply}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 ${suggestLoading ? "animate-pulse" : ""}`}
              title="자동 완성"
              disabled={suggestLoading || disabled}
            >
              <SparklesIcon className="h-3 w-3" />
            </Button>

            <Button
              onClick={async () => {
                if (isPlaying) {
                  onStopText?.();
                } else {
                  onPlayText?.(newMessage);
                }
              }}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 ${isPlaying ? "animate-pulse" : ""}`}
              title={isPlaying ? "읽기 중지" : "내 답변 듣기"}
              disabled={!newMessage.trim() || disabled}
            >
              {isPlaying ? (
                <PauseIcon className="h-3 w-3 text-red-500" />
              ) : (
                <SpeakerWaveIcon className="h-3 w-3 text-blue-500" />
              )}
            </Button>
          </div>

          {/* 텍스트 입력 */}
          <textarea
            ref={textareaRef}
            rows={3}
            value={newMessage}
            onChange={(e) => {
              handleMessageChange(e.target.value);
              // 자동 높이 조절 (최대 5줄)
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              const lineHeight = parseInt(getComputedStyle(target).lineHeight);
              const maxHeight = lineHeight * 5; // 5줄 최대
              const newHeight = Math.min(target.scrollHeight, maxHeight);
              target.style.height = `${newHeight}px`;
            }}
            onCompositionStart={() => onIMEComposingChange(true)}
            onCompositionEnd={() => onIMEComposingChange(false)}
            onKeyDown={handleKeyDown}
            placeholder={
              suggestLoading ? "AI 응답 생성 중…" : "답변을 입력하세요..."
            }
            className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-[13px] md:text-sm placeholder:text-muted-foreground overflow-y-auto"
            style={{
              minHeight: "4.5rem",
              maxHeight: "7.5rem", // 5줄 정도의 최대 높이
            }}
            disabled={disabled}
          />

          {/* 오른쪽 미니 버튼들 */}
          <div className="flex flex-col space-y-1">
            <Button
              onClick={() => {
                onSendMessage();
                setShowTranslation(false);
              }}
              disabled={
                !newMessage.trim() ||
                isIMEComposing ||
                suggestLoading ||
                disabled
              }
              size="sm"
              className="w-8 h-8 p-0"
            >
              <PaperAirplaneIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
