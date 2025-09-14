import { useState } from "react";
import {
  PlusIcon,
  MicrophoneIcon,
  StopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui/Button";
import { useVoiceConnection } from "../../chatbot/voice/hooks/useVoiceConnection";
import { CHARACTER_LIST } from "../../chatbot/character/characters";

interface ConversationInputFormProps {
  showForm: boolean;
  onToggleForm: () => void;
  onSubmit: (
    conversation: string,
    category: "역할" | "일상" | "비즈니스" | "학술",
  ) => Promise<void>;
  loading?: boolean;
}

const CATEGORIES = ["역할", "일상", "비즈니스", "학술"] as const;
const CATEGORY_COLORS = {
  역할: "bg-orange-100 text-orange-800 border-orange-200",
  일상: "bg-green-100 text-green-800 border-green-200",
  비즈니스: "bg-blue-100 text-blue-800 border-blue-200",
  학술: "bg-purple-100 text-purple-800 border-purple-200",
} as const;

export default function ConversationInputForm({
  showForm,
  onToggleForm,
  onSubmit,
  loading = false,
}: ConversationInputFormProps) {
  const [conversation, setConversation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "역할" | "일상" | "비즈니스" | "학술"
  >("일상");
  const [speechLang, setSpeechLang] = useState<"ko" | "en">("ko");
  const [lastTranscript, setLastTranscript] = useState("");

  // Voice-to-text with optional AI responses
  const { isRecording, isListening, audioRef, startVoice, stopVoice } =
    useVoiceConnection({
      speechLang,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      selectedVoice: "alloy",
      personaCharacter: CHARACTER_LIST[0], // Default character
      personaGender: "female",
      // Empty callbacks - no messages sent to chatbot, ignore AI responses
      onUserMessage: () => {},
      onAssistantMessage: () => {},
      onUserSpeechStart: () => {
        console.log("🎤 Voice input started");
      },
      onUserTranscriptUpdate: (text: string, isFinal: boolean) => {
        console.log("🔤 Transcript:", text, "isFinal:", isFinal);
        if (isFinal && text.trim()) {
          const cleanText = text.trim();
          // 중복 방지: 같은 내용이면 추가하지 않음
          if (cleanText !== lastTranscript) {
            setConversation((prev) => prev + (prev ? " " : "") + cleanText);
            setLastTranscript(cleanText);
          }
        }
      },
    });

  const handleVoiceToggle = async () => {
    if (isRecording) {
      console.log("🛑 Stopping voice input");
      stopVoice();
    } else {
      console.log("🎤 Starting voice input");
      setLastTranscript(""); // 새 음성 인식 시작 시 중복 방지 초기화
      await startVoice();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation.trim()) return;

    await onSubmit(conversation.trim(), selectedCategory);
    setConversation("");
  };

  const clearConversation = () => {
    setConversation("");
  };

  return (
    <div className="mb-6">
      {/* Hidden audio element for voice connection */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Toggle Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggleForm}
        className="w-full flex items-center justify-center gap-2 mb-4"
      >
        <PlusIcon className="h-4 w-4" />새 대화 추가
        {showForm ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </Button>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gray-50 p-4 rounded-lg"
        >
          {/* Language Selection and AI Response Toggle */}
          <div className="flex items-center gap-4 mb-3 p-2 bg-white rounded border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">언어:</span>
              <button
                type="button"
                onClick={() => setSpeechLang("ko")}
                className={`px-2 py-1 text-xs rounded ${
                  speechLang === "ko"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                한국어
              </button>
              <button
                type="button"
                onClick={() => setSpeechLang("en")}
                className={`px-2 py-1 text-xs rounded ${
                  speechLang === "en"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Category Selection and Voice Input */}
          <div className="flex items-center gap-2 mb-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedCategory === category
                    ? CATEGORY_COLORS[category]
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`ml-auto p-2 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } ${isListening ? "animate-pulse" : ""}`}
              title={isRecording ? "음성 입력 중지" : "음성 입력 시작"}
            >
              {isRecording ? (
                <StopIcon className="h-4 w-4" />
              ) : (
                <MicrophoneIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div
              className={`text-sm p-2 rounded flex items-center gap-2 ${
                isListening
                  ? "text-green-700 bg-green-50 border border-green-200"
                  : "text-blue-700 bg-blue-50 border border-blue-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isListening ? "bg-green-500 animate-pulse" : "bg-blue-500"
                }`}
              ></div>
              {isListening ? "음성 감지 중..." : "음성 대기 중..."}
            </div>
          )}

          {/* Text Input with Clear Button */}
          <div className="relative">
            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="대화 내용을 입력하거나 마이크 버튼을 눌러 음성으로 입력하세요..."
              className="w-full p-3 pr-10 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            {conversation && (
              <button
                type="button"
                onClick={clearConversation}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="입력 내용 지우기"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!conversation.trim() || loading}
            className="w-full"
          >
            {loading ? "저장 중..." : "저장"}
          </Button>
        </form>
      )}
    </div>
  );
}
