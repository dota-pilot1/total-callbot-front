import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowsRightLeftIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { examApi } from "../features/exam/api/exam";

interface MobileTranslationDialogProps {
  open: boolean;
  onClose: () => void;
  text: string;
  onInsertText?: (text: string) => void; // 텍스트를 인풋에 삽입하는 함수
}

interface TranslationResponse {
  original: string;
  translation: string;
  language: string;
}

export default function MobileTranslationDialog({
  open,
  onClose,
  text,
  onInsertText,
}: MobileTranslationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationResponse | null>(
    null,
  );
  const [error, setError] = useState<string>("");
  const [playingOriginal, setPlayingOriginal] = useState(false);
  const [playingTranslation, setPlayingTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 다이얼로그가 열릴 때 번역 요청
  useEffect(() => {
    if (open && text.trim()) {
      requestTranslation(text.trim());
    }
  }, [open, text]);

  // 오디오 권한 확인 및 요청
  const checkAudioPermission = async () => {
    try {
      // 짧은 무음 오디오로 테스트
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // 간단한 beep 소리로 테스트
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);

      alert("오디오 권한 확인 성공!");
      return true;
    } catch (error) {
      const errorMsg = `오디오 권한 확인 실패: ${error instanceof Error ? error.message : String(error)}`;
      console.error("오디오 권한 확인 실패:", error);
      alert(errorMsg);
      return false;
    }
  };

  // TTS 기능 (OpenAI TTS API 직접 호출)
  const playText = async (text: string, isOriginal: boolean) => {
    try {
      // 이전 오디오 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // 플레이 상태 설정
      if (isOriginal) {
        setPlayingOriginal(true);
      } else {
        setPlayingTranslation(true);
      }

      // 백엔드에서 OpenAI API 키 받기
      const token = localStorage.getItem("accessToken");
      const keyResponse = await fetch("/api/config/openai-key", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const { key } = await keyResponse.json();

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
            voice: isOriginal ? "alloy" : "nova",
            speed: 1.0,
          }),
        },
      );

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();

        // Data URL 방식으로 변환 (모바일 호환성)
        const reader = new FileReader();
        reader.onload = async () => {
          // 새로운 오디오 객체 생성
          audioRef.current = new Audio(reader.result as string);

          // 오디오 이벤트 핸들러
          audioRef.current.onended = () => {
            if (isOriginal) {
              setPlayingOriginal(false);
            } else {
              setPlayingTranslation(false);
            }
          };

          audioRef.current.onerror = () => {
            if (isOriginal) {
              setPlayingOriginal(false);
            } else {
              setPlayingTranslation(false);
            }
            console.error("Audio playback failed");
          };

          // 오디오 재생
          try {
            await audioRef.current.play();
          } catch (playError) {
            console.error("Audio play failed:", playError);
            if (isOriginal) {
              setPlayingOriginal(false);
            } else {
              setPlayingTranslation(false);
            }
          }
        };

        reader.onerror = () => {
          console.error("FileReader error");
          if (isOriginal) {
            setPlayingOriginal(false);
          } else {
            setPlayingTranslation(false);
          }
        };

        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error(`TTS API request failed: ${ttsResponse.status}`);
      }
    } catch (error) {
      const errorMsg = `TTS API 실패: ${error instanceof Error ? error.message : String(error)}`;
      console.error("TTS API failed:", error);
      alert(errorMsg);
      // 에러 시 상태 리셋
      if (isOriginal) {
        setPlayingOriginal(false);
      } else {
        setPlayingTranslation(false);
      }
    }
  };

  // 음성 중지
  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingOriginal(false);
    setPlayingTranslation(false);
  };

  // 텍스트 입력
  const insertText = (textToInsert: string) => {
    if (onInsertText) {
      onInsertText(textToInsert);
      onClose();
    }
  };

  const requestTranslation = async (textToTranslate: string) => {
    if (!textToTranslate || loading) return;

    setLoading(true);
    setError("");
    setTranslation(null);

    try {
      // examApi를 활용해서 번역 요청 (GPT 기반)
      const prompt = `Please translate the following text and provide both the original and Korean translation:

Text: "${textToTranslate}"

Please respond in this exact JSON format:
{
  "original": "original text here",
  "translation": "Korean translation here",
  "language": "detected language (English/Korean/etc)"
}`;

      const response = await examApi.getSampleAnswers({
        question: prompt,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: false,
      });

      const result = response.samples?.[0]?.text || "";

      try {
        // JSON 파싱 시도
        const parsedResult = JSON.parse(result);
        setTranslation({
          original: parsedResult.original || textToTranslate,
          translation: parsedResult.translation || "번역을 생성할 수 없습니다.",
          language: parsedResult.language || "Unknown",
        });
      } catch (parseError) {
        // JSON 파싱 실패 시 간단한 처리
        setTranslation({
          original: textToTranslate,
          translation: result || "번역을 생성할 수 없습니다.",
          language: "Unknown",
        });
      }
    } catch (err) {
      console.error("Translation request failed:", err);
      setError("번역 요청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* 다이얼로그 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ArrowsRightLeftIcon className="h-5 w-5 text-blue-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                해석 결과
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="닫기"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">번역 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => requestTranslation(text)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : translation ? (
              <div className="space-y-4">
                {/* 원문 */}
                <div className="bg-gray-50 rounded-lg p-4 relative overflow-hidden">
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700">원문</h3>
                  </div>
                  <p className="text-gray-900 leading-relaxed pr-20">
                    {translation.original}
                  </p>

                  {/* 우측 상단 버튼들 */}
                  <div
                    className="absolute top-2 right-2 flex space-x-1"
                    style={{
                      zIndex: 9999,
                      pointerEvents: "auto",
                    }}
                  >
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("재생 버튼 클릭됨");

                        try {
                          if (playingOriginal) {
                            stopSpeech();
                          } else {
                            // 오디오 권한 먼저 확인
                            const hasPermission = await checkAudioPermission();
                            if (!hasPermission) {
                              alert(
                                "오디오 재생 권한이 필요합니다. 브라우저 설정에서 오디오를 허용해주세요.",
                              );
                              return;
                            }

                            await playText(translation.original, true);
                          }
                        } catch (error) {
                          console.error("재생 중 에러:", error);
                          alert("재생 에러: " + error);
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        console.log("재생 버튼 터치됨 (onTouchEnd)");
                        alert("재생 버튼 터치! (onTouchEnd)");
                      }}
                      onTouchStart={() => {}} // 터치 이벤트 활성화
                      className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 border border-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{
                        zIndex: 51,
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                      }}
                      title={playingOriginal ? "재생 중지" : "원문 읽기"}
                    >
                      {playingOriginal ? (
                        <PauseIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <PlayIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                    <button
                      onClick={() => insertText(translation.original)}
                      className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-300"
                      style={{ zIndex: 51 }}
                      title="원문 입력"
                    >
                      <DocumentTextIcon className="h-4 w-4 text-green-500" />
                    </button>
                  </div>
                </div>

                {/* 번역 */}
                <div className="bg-blue-50 rounded-lg p-4 relative overflow-hidden">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">
                    번역
                  </h3>
                  <p className="text-blue-900 leading-relaxed pr-20">
                    {translation.translation}
                  </p>

                  {/* 우측 상단 버튼들 */}
                  <div
                    className="absolute top-2 right-2 flex space-x-1"
                    style={{ zIndex: 50 }}
                  >
                    <button
                      onClick={() =>
                        playingTranslation
                          ? stopSpeech()
                          : playText(translation.translation, false)
                      }
                      className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-300"
                      style={{ zIndex: 51 }}
                      title={playingTranslation ? "재생 중지" : "번역문 읽기"}
                    >
                      {playingTranslation ? (
                        <PauseIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <PlayIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                    <button
                      onClick={() => insertText(translation.translation)}
                      className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-300"
                      style={{ zIndex: 51 }}
                      title="번역문 입력"
                    >
                      <DocumentTextIcon className="h-4 w-4 text-green-500" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">번역할 텍스트가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
