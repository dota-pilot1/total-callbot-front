import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  MicrophoneIcon,
  LanguageIcon,
  PaperAirplaneIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { examApi } from "../features/chatbot/exam/api/exam";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function Practice() {
  const navigate = useNavigate();

  const [koreanText, setKoreanText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
    }
  }, []);

  const startListening = () => {
    console.log("🎤 연습장 마이크 시작");
    if (!isSupported) {
      alert("이 브라우저에서는 음성 인식이 지원되지 않습니다.");
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // 더 견고한 설정
      recognition.lang = "ko-KR";
      recognition.continuous = true; // 연속 인식 활성화
      recognition.interimResults = true; // 중간 결과 포함
      recognition.maxAlternatives = 1;

      // 타임아웃 설정
      if ("webkitSpeechRecognition" in window) {
        (recognition as any).webkitSpeechRecognition = true;
      }

      recognition.onstart = () => {
        setIsListening(true);
        console.log("🎤 음성인식 시작");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          console.log("🎤 최종 음성인식 결과:", finalTranscript);
          setKoreanText(finalTranscript.trim());
          setIsListening(false);
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        } else if (interimTranscript) {
          console.log("🎤 중간 음성인식 결과:", interimTranscript);
          // 중간 결과는 UI에 표시하지 않음 (혼란 방지)
        }
      };

      recognition.onerror = (event: any) => {
        console.error("음성인식 오류:", event.error);

        switch (event.error) {
          case "no-speech":
            console.log("음성이 감지되지 않았습니다. 다시 시도해주세요.");
            // no-speech 오류 시 자동 재시작하지 않음 (무한 루프 방지)
            break;
          case "not-allowed":
            alert(
              "마이크 권한이 필요합니다. 브라우저에서 마이크 접근을 허용해주세요.",
            );
            break;
          case "audio-capture":
            alert(
              "마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.",
            );
            break;
          case "network":
            console.log("네트워크 오류가 발생했습니다.");
            break;
          default:
            console.log(`음성인식 오류: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log("🎤 음성인식 종료");
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

  const copyToClipboard = (text: string, type: string) => {
    if (!text.trim()) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${type} 텍스트가 클립보드에 복사되었습니다.`);
      })
      .catch(() => {
        alert("클립보드 복사에 실패했습니다.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full transition-colors flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="뒤로가기"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                음성 입력 연습장
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-6">
        {/* 마이크 버튼 */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isListening ? "음성인식 중지" : "음성인식 시작"}
          >
            <MicrophoneIcon className="h-10 w-10" />
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">한국어</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playText(koreanText)}
                disabled={
                  !koreanText.trim() ||
                  (isSpeaking && speakingText === koreanText)
                }
                className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                title="한국어 음성 재생"
              >
                <PlayIcon className="h-4 w-4" />
                <span>재생</span>
              </button>
              <button
                onClick={() => copyToClipboard(koreanText, "한국어")}
                disabled={!koreanText.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>복사</span>
              </button>
            </div>
          </div>
          <textarea
            value={koreanText}
            onChange={(e) => setKoreanText(e.target.value)}
            placeholder="음성으로 입력되거나 직접 타이핑하세요"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
          />
        </div>

        {/* 영어 입력 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              English{" "}
              {isTranslating && (
                <span className="text-blue-500">(번역 중...)</span>
              )}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playText(englishText)}
                disabled={
                  !englishText.trim() ||
                  (isSpeaking && speakingText === englishText)
                }
                className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                title="영어 음성 재생"
              >
                <PlayIcon className="h-4 w-4" />
                <span>재생</span>
              </button>
              <button
                onClick={() => copyToClipboard(englishText, "영어")}
                disabled={!englishText.trim() || isTranslating}
                className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>복사</span>
              </button>
            </div>
          </div>
          <textarea
            value={englishText}
            onChange={(e) => setEnglishText(e.target.value)}
            placeholder="한글 입력 시 자동으로 영어 번역이 표시됩니다"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
          />
          {koreanText.trim() && (
            <button
              onClick={translateToEnglish}
              disabled={isTranslating}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <LanguageIcon className="h-5 w-5" />
              <span>{isTranslating ? "번역 중..." : "다시 번역"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
