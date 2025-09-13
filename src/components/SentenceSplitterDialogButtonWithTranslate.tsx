import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  XMarkIcon,
  LanguageIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { examApi } from "../features/chatbot/exam/api/exam";

interface SentenceSplitterDialogButtonWithTranslateProps {
  message: string;
  isUser?: boolean;
}

export default function SentenceSplitterDialogButtonWithTranslate({
  message,
  isUser = false,
}: SentenceSplitterDialogButtonWithTranslateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);
  const [translations, setTranslations] = useState<{ [key: number]: string }>(
    {},
  );
  const [translatingIndexes, setTranslatingIndexes] = useState<Set<number>>(
    new Set(),
  );
  const [playingIndexes, setPlayingIndexes] = useState<Set<number>>(new Set());
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  const splitIntoSentences = (text: string): string[] => {
    // 한글과 영어 문장 분리를 위한 정규식
    const sentenceEnders = /[.!?。！？]/;
    const sentences = text
      .split(sentenceEnders)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return sentences;
  };

  const detectLanguage = (text: string): "ko" | "en" => {
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text) ? "ko" : "en";
  };

  const translateSentence = async (sentence: string, index: number) => {
    if (translations[index] || translatingIndexes.has(index)) return;

    setTranslatingIndexes((prev) => new Set([...prev, index]));

    try {
      const sourceLanguage = detectLanguage(sentence);
      const targetLanguage = sourceLanguage === "ko" ? "en" : "ko";

      const translationQuestion =
        sourceLanguage === "ko"
          ? `Translate this Korean sentence to English: "${sentence}"`
          : `Translate this English sentence to Korean: "${sentence}"`;

      const response = await examApi.getSampleAnswers({
        question: translationQuestion,
        topic: "translation",
        level: "intermediate",
        count: 1,
        englishOnly: targetLanguage === "en",
        context: `Please provide only the translated sentence without any explanations or additional text.`,
      });

      const translatedText = (response.samples?.[0]?.text || "").trim();
      if (translatedText) {
        setTranslations((prev) => ({ ...prev, [index]: translatedText }));
      } else {
        throw new Error("No translation received");
      }
    } catch (error) {
      console.error("번역 실패:", error);
      const sourceLanguage = detectLanguage(sentence);
      const fallbackTranslation =
        sourceLanguage === "ko"
          ? `[영어 번역] ${sentence}`
          : `[한국어 번역] ${sentence}`;
      setTranslations((prev) => ({ ...prev, [index]: fallbackTranslation }));
    } finally {
      setTranslatingIndexes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const playText = async (text: string, index: number) => {
    try {
      // 이전 오디오 중지
      if (audioRefs.current[index]) {
        audioRefs.current[index]?.pause();
        audioRefs.current[index] = null;
      }

      setPlayingIndexes((prev) => new Set([...prev, index]));

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
          const audio = new Audio(reader.result as string);
          audioRefs.current[index] = audio;

          audio.onended = () => {
            setPlayingIndexes((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
            audioRefs.current[index] = null;
          };

          audio.onerror = () => {
            setPlayingIndexes((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
            audioRefs.current[index] = null;
            console.error("Audio playback failed");
          };

          await audio.play();
        };

        reader.onerror = () => {
          console.error("FileReader error");
          setPlayingIndexes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        };

        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error(`TTS API request failed: ${ttsResponse.status}`);
      }
    } catch (error) {
      console.error("TTS API failed:", error);
      setPlayingIndexes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const stopAudio = (index: number) => {
    if (audioRefs.current[index]) {
      audioRefs.current[index]?.pause();
      audioRefs.current[index] = null;
    }
    setPlayingIndexes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleToggle = () => {
    if (!isOpen) {
      const splitSentences = splitIntoSentences(message);
      setSentences(splitSentences);
      setTranslations({});
      setTranslatingIndexes(new Set());
    }
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSentences([]);
    setTranslations({});
    setTranslatingIndexes(new Set());
    setPlayingIndexes(new Set());
    // 모든 오디오 중지
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
      }
    });
    audioRefs.current = {};
  };

  return (
    <>
      {/* 문장별 해석 버튼 */}
      <button
        onClick={handleToggle}
        className={`p-1.5 rounded-full border transition-colors ${
          isUser
            ? "hover:bg-indigo-400 text-indigo-100 border-indigo-200"
            : "hover:bg-gray-100 text-gray-600 border-gray-300"
        }`}
        title="문장별 해석"
      >
        <AcademicCapIcon className="h-4 w-4" />
      </button>

      {/* 전체 화면 다이얼로그 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={handleClose}
            />
            <motion.div
              className="absolute inset-0 bg-white md:rounded-t-xl md:top-auto md:bottom-0 md:h-[90vh] shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
            >
              <div className="flex flex-col h-full">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    문장별 번역
                  </h3>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {sentences.map((sentence, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        {/* 원본 문장 */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-gray-900 leading-relaxed flex-1">
                              {sentence}
                            </p>
                            <button
                              onClick={() => {
                                if (playingIndexes.has(index)) {
                                  stopAudio(index);
                                } else {
                                  playText(sentence, index);
                                }
                              }}
                              className="flex-shrink-0 p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                              title="원본 음성 재생"
                            >
                              {playingIndexes.has(index) ? (
                                <PauseIcon className="h-4 w-4" />
                              ) : (
                                <PlayIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* 번역 섹션 */}
                        <div className="border-t border-gray-100 pt-3">
                          {translations[index] ? (
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-green-700 bg-green-50 p-2 rounded leading-relaxed flex-1">
                                {translations[index]}
                              </p>
                              <button
                                onClick={() => {
                                  const translationIndex = `translation_${index}`;
                                  const playingKey =
                                    parseInt(
                                      translationIndex.replace(
                                        "translation_",
                                        "",
                                      ),
                                    ) + 1000; // 번역용 인덱스

                                  if (playingIndexes.has(playingKey)) {
                                    stopAudio(playingKey);
                                  } else {
                                    playText(translations[index], playingKey);
                                  }
                                }}
                                className="flex-shrink-0 p-1.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                                title="번역 음성 재생"
                              >
                                {playingIndexes.has(index + 1000) ? (
                                  <PauseIcon className="h-4 w-4" />
                                ) : (
                                  <PlayIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => translateSentence(sentence, index)}
                              disabled={translatingIndexes.has(index)}
                              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                            >
                              <LanguageIcon className="h-4 w-4" />
                              <span>
                                {translatingIndexes.has(index)
                                  ? "번역 중..."
                                  : "번역하기"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
