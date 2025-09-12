import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { examApi } from "../features/chatbot/exam/api/exam";

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
  const [editableText, setEditableText] = useState<string>("");
  const [hasTextChanged, setHasTextChanged] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 다이얼로그가 열릴 때 번역 요청 및 텍스트 초기화
  useEffect(() => {
    if (open && text.trim()) {
      setEditableText(text.trim());
      setHasTextChanged(false);
      requestTranslation(text.trim());
    }
  }, [open, text]);

  // 텍스트 변경 감지
  const handleTextChange = (newText: string) => {
    setEditableText(newText);
    setHasTextChanged(newText !== text.trim());
  };

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

      return true;
    } catch (error) {
      console.error("오디오 권한 확인 실패:", error);
      return false;
    }
  };

  // TTS 기능 및 재번역 (OpenAI TTS API 직접 호출)
  const playTextAndRetranslate = async (
    textToPlay: string,
    isOriginal: boolean,
  ) => {
    // 원문이 편집된 경우 재번역 먼저 수행
    if (isOriginal && hasTextChanged) {
      await requestTranslation(editableText);
      setHasTextChanged(false);
    }

    // TTS 재생
    await playText(textToPlay, isOriginal);
  };

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
      // alert(`토큰: ${token ? "있음" : "없음"}`);

      // EC2 환경에서는 절대 URL 사용
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

      // alert(`API 응답 상태: ${keyResponse.status} ${keyResponse.statusText}`);

      if (!keyResponse.ok) {
        throw new Error(`API 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // OpenAI TTS API 직접 호출
      // alert(`OpenAI TTS 요청 시작: ${text.substring(0, 50)}...`);

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

      // alert(`OpenAI TTS 응답: ${ttsResponse.status} ${ttsResponse.statusText}`);

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
      console.error("TTS API failed:", error);
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

      {/* 다이얼로그 컨테이너 - 최상단 위치 */}
      <div className="fixed top-0 left-0 right-0 flex justify-center pt-4 px-4 z-50">
        <Dialog.Panel className="max-w-lg w-full bg-white rounded-lg shadow-xl">
          {/* 헤더 제거하고 닫기 버튼만 우상단에 */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors bg-white shadow-sm"
              title="닫기"
            >
              <XMarkIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* 내용 - 패딩 축소 */}
          <div className="p-3 space-y-3">
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
              <div className="space-y-3">
                {/* 원문 */}
                <div className="bg-gray-50 rounded-lg p-3 relative overflow-hidden">
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700">원문</h3>
                  </div>
                  <textarea
                    value={editableText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="w-full text-gray-900 leading-relaxed bg-transparent border-none resize-none focus:outline-none pr-20 min-h-[60px]"
                    placeholder="원문을 입력하세요..."
                    style={{ fontFamily: "inherit" }}
                  />
                  {hasTextChanged && (
                    <div className="text-xs text-orange-600 mt-1">
                      텍스트가 변경되었습니다. 재생 버튼을 누르면 재번역됩니다.
                    </div>
                  )}

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
                              return;
                            }

                            await playTextAndRetranslate(editableText, true);
                          }
                        } catch (error) {
                          console.error("재생 중 에러:", error);
                        }
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
                <div className="bg-blue-50 rounded-lg p-3 relative overflow-hidden">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">
                    번역
                  </h3>
                  <p className="text-blue-900 leading-relaxed pr-20">
                    {translation.translation}
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
                        console.log("번역문 재생 버튼 클릭됨");

                        try {
                          if (playingTranslation) {
                            stopSpeech();
                          } else {
                            // 오디오 권한 먼저 확인
                            const hasPermission = await checkAudioPermission();
                            if (!hasPermission) {
                              // alert(
                              //   "오디오 재생 권한이 필요합니다. 브라우저 설정에서 오디오를 허용해주세요.",
                              // );
                              return;
                            }

                            await playText(translation.translation, false);
                          }
                        } catch (error) {
                          console.error("번역문 재생 중 에러:", error);
                          // alert("재생 에러: " + error);
                        }
                      }}
                      onTouchStart={() => {}} // 터치 이벤트 활성화
                      className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 border border-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{
                        zIndex: 51,
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                      }}
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
                      className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 border border-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{
                        zIndex: 51,
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                      }}
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

          {/* 푸터 제거 */}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
