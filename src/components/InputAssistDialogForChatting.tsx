import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenIcon,
  MicrophoneIcon,
  XMarkIcon,
  LanguageIcon,
  PaperAirplaneIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { examApi } from "../features/chatbot/exam/api/exam";
// TODO: GPT Realtime API 통합 예정
// import { voiceApi } from "../features/chatbot/voice/api/voice";
// import { connectRealtimeVoice, type VoiceConnection } from "../features/chatbot/voice/lib/realtime";

// GPT 기반 연습장: Web Speech API (실시간 음성인식) + OpenAI TTS (음성합성)

// GPT Realtime API를 사용하므로 Web Speech API 선언 제거

interface InputAssistDialogForChattingProps {
  onInsertKorean?: (text: string) => void;
  onInsertEnglish?: (text: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function InputAssistDialogForChatting({
  onInsertKorean,
  onInsertEnglish,
  onOpenChange,
}: InputAssistDialogForChattingProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to update dialog state and optionally notify parent
  const updateIsOpen = (newState: boolean, notifyParent = true) => {
    setIsOpen(newState);
    if (notifyParent) {
      onOpenChange?.(newState);
    }
  };

  const [koreanText, setKoreanText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const voiceConnRef = useRef<any>(null); // TODO: VoiceConnection 타입 추후 적용
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // GPT Realtime API 사용으로 변경

  const startListening = async () => {
    console.log("🎤 연습장 GPT Realtime 마이크 시작");

    if (voiceConnRef.current) {
      console.log("이미 음성인식이 활성화되어 있습니다.");
      return;
    }

    // 추가 안전 대기 시간 (메인 마이크 완전 종료 보장)
    console.log("⏳ 연습장 마이크 시작 전 추가 대기 (500ms)...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // 마이크 권한 상태 확인
      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      console.log("🎤 마이크 권한 상태:", permissionStatus.state);

      if (permissionStatus.state === "denied") {
        alert(
          "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.",
        );
        return;
      }

      // 마이크 실제 접근 테스트
      console.log("🎤 마이크 실제 접근 가능성 테스트...");
      let testStream;
      try {
        testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log(
          "✅ 마이크 접근 테스트 성공:",
          testStream.getAudioTracks().length,
          "개 트랙",
        );

        // 테스트 스트림 즉시 정리
        testStream.getTracks().forEach((track) => {
          console.log("🧹 테스트 트랙 정리:", track.label);
          track.stop();
        });

        // 스트림 정리 후 추가 대기
        console.log("⏳ 테스트 스트림 정리 후 대기 (300ms)...");
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (micError) {
        console.error("❌ 마이크 접근 테스트 실패:", micError);
        const errorMessage =
          micError instanceof Error ? micError.message : String(micError);
        alert(`마이크에 접근할 수 없습니다: ${errorMessage}`);
        return;
      }

      console.log("🎤 Web Speech API 초기화 시작...");
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "ko-KR";
      recognition.continuous = false;
      recognition.interimResults = true; // 중간 결과 표시로 사용자 피드백 개선
      recognition.maxAlternatives = 3; // 대안 결과 제공

      // 타임아웃 설정 (10초)
      const recognitionTimeout = setTimeout(() => {
        if (recognition && isListening) {
          recognition.stop();
          console.log("🕐 음성인식 타임아웃으로 종료");
        }
      }, 10000);

      recognition.onstart = () => {
        setIsListening(true);
        console.log("🎤 연습장 음성인식 시작");
      };

      recognition.onresult = (event: any) => {
        clearTimeout(recognitionTimeout);

        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;

            // 대안 결과들도 로깅 (디버깅용)
            console.log(
              "🎤 최종 결과:",
              result[0].transcript,
              "신뢰도:",
              result[0].confidence,
            );
            for (let j = 1; j < Math.min(result.length, 3); j++) {
              console.log(
                `🎤 대안 ${j}:`,
                result[j].transcript,
                "신뢰도:",
                result[j].confidence,
              );
            }
          } else {
            interimTranscript += result[0].transcript;
            console.log("🎤 중간 결과:", interimTranscript);
          }
        }

        if (finalTranscript) {
          console.log("🎤 연습장 음성인식 최종 결과:", finalTranscript);
          setKoreanText((prev) => prev + (prev ? " " : "") + finalTranscript);
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        clearTimeout(recognitionTimeout);
        console.error("연습장 음성인식 오류:", event.error, "상세:", event);

        let userMessage = "";
        switch (event.error) {
          case "no-speech":
            userMessage = "음성이 감지되지 않았습니다. 다시 시도해주세요.";
            break;
          case "not-allowed":
            userMessage =
              "마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.";
            break;
          case "aborted":
            userMessage = "음성 인식이 중단되었습니다.";
            break;
          case "network":
            userMessage = "네트워크 오류입니다. 인터넷 연결을 확인해주세요.";
            break;
          case "service-not-allowed":
            userMessage = "음성인식 서비스를 사용할 수 없습니다.";
            break;
          default:
            userMessage = `음성인식 오류가 발생했습니다: ${event.error}`;
        }

        console.log("사용자 메시지:", userMessage);
        // alert 대신 더 부드러운 처리 (나중에 toast 등으로 대체 가능)
        if (event.error !== "aborted") {
          setTimeout(() => alert(userMessage), 100);
        }

        setIsListening(false);
      };

      recognition.onend = () => {
        clearTimeout(recognitionTimeout);
        setIsListening(false);
        console.log("🎤 연습장 음성인식 종료");
      };

      // recognitionRef.current = recognition; // TODO: GPT Realtime으로 교체 예정
      recognition.start();
    } catch (error) {
      console.error("음성인식 초기화 오류:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (voiceConnRef.current) {
      voiceConnRef.current.stop();
      voiceConnRef.current = null;
    }
    setIsListening(false);
  };

  const translateToEnglish = async () => {
    if (!koreanText.trim()) return;
    setIsTranslating(true);
    try {
      const prompt = `Please translate the following Korean text to English. Only provide the English translation, no additional text:

Korean: "${koreanText}"`;

      const response = await examApi.getSampleAnswers({
        question: prompt,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: true,
      });

      const translation = response.samples?.[0]?.text?.trim() || "";
      if (translation) {
        setEnglishText(translation);
      } else {
        setEnglishText(`[Translation failed] ${koreanText}`);
      }
    } catch (error) {
      console.error("번역 오류:", error);
      setEnglishText(`[Translation error] ${koreanText}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // 한글 입력이 변경될 때마다 자동으로 영어 번역 (1초 디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (koreanText.trim() && koreanText.length > 2) {
        translateToEnglish();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [koreanText]);

  // 언어 감지 함수
  const detectLanguage = (text: string): "ko" | "en" => {
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text) ? "ko" : "en";
  };

  // TTS 기능
  const playText = async (text: string) => {
    if (!text.trim()) return;

    try {
      // 이전 오디오 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsSpeaking(true);
      setSpeakingText(text);

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
            setIsSpeaking(false);
            setSpeakingText("");
          };
          audioRef.current.onerror = () => {
            setIsSpeaking(false);
            setSpeakingText("");
            console.error("Audio playback failed");
          };
          await audioRef.current.play();
        };
        reader.onerror = () => {
          console.error("FileReader error");
          setIsSpeaking(false);
          setSpeakingText("");
        };
        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error("TTS API 요청 실패");
      }
    } catch (error) {
      console.error("TTS 오류:", error);
      setIsSpeaking(false);
      setSpeakingText("");
      alert("음성 재생에 실패했습니다.");
    }
  };

  const applyKorean = () => {
    if (koreanText.trim() && onInsertKorean) {
      onInsertKorean(koreanText);
      updateIsOpen(false);
      setKoreanText("");
      setEnglishText("");
    }
  };

  const applyEnglish = () => {
    if (englishText.trim() && onInsertEnglish) {
      onInsertEnglish(englishText);
      updateIsOpen(false);
      setKoreanText("");
      setEnglishText("");
    }
  };

  const openDialog = async () => {
    // 1단계: 부모 컴포넌트에 메인 마이크 종료 요청
    console.log("🎯 연습장 열기 요청 - 메인 마이크 종료 시작");
    if (onOpenChange) {
      await onOpenChange(true); // 메인 마이크 종료 대기
    }

    // 2단계: 메인 마이크 완전 종료 후 연습장 열기 (부모 알림 중복 방지)
    console.log("📖 메인 마이크 종료 완료 - 연습장 열기");
    updateIsOpen(true, false);
  };

  const closeDialog = () => {
    updateIsOpen(false);
    setKoreanText("");
    setEnglishText("");
    if (isListening) {
      stopListening();
    }
  };

  return (
    <>
      {/* 📖 버튼 */}
      <button
        onClick={openDialog}
        className="w-10 h-10 rounded-full transition-colors flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
        title="연습장"
      >
        <BookOpenIcon className="h-5 w-5" />
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
                  음성 입력 연습장
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
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                    title={
                      isListening ? "GPT 음성인식 중지" : "GPT 음성인식 시작"
                    }
                  >
                    <MicrophoneIcon className="h-8 w-8" />
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    {isListening
                      ? "GPT가 듣고 있어요..."
                      : "GPT Realtime 마이크로 음성을 입력하세요"}
                  </p>
                </div>

                {/* 한국어 입력 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      한국어 입력
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playText(koreanText)}
                        disabled={
                          !koreanText.trim() ||
                          (isSpeaking && speakingText === koreanText)
                        }
                        className="px-2 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        title="한국어 음성 재생"
                      >
                        <PlayIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={applyKorean}
                        disabled={!koreanText.trim()}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                      >
                        <PaperAirplaneIcon className="h-3 w-3" />
                        <span>적용</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={koreanText}
                    onChange={(e) => setKoreanText(e.target.value)}
                    placeholder="음성으로 입력되거나 직접 타이핑하세요"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* 영어 입력 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      영어 입력{" "}
                      {isTranslating && (
                        <span className="text-blue-500">(번역 중...)</span>
                      )}
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playText(englishText)}
                        disabled={
                          !englishText.trim() ||
                          (isSpeaking && speakingText === englishText)
                        }
                        className="px-2 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        title="영어 음성 재생"
                      >
                        <PlayIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={applyEnglish}
                        disabled={!englishText.trim() || isTranslating}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                      >
                        <PaperAirplaneIcon className="h-3 w-3" />
                        <span>적용</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={englishText}
                    onChange={(e) => setEnglishText(e.target.value)}
                    placeholder="한글 입력 시 자동으로 영어 번역이 표시됩니다"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                  {koreanText.trim() && (
                    <button
                      onClick={translateToEnglish}
                      disabled={isTranslating}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <LanguageIcon className="h-4 w-4" />
                      <span>{isTranslating ? "번역 중..." : "다시 번역"}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
