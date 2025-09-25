import { useState, useRef, useEffect } from "react";
import { voiceApi } from "../api/voice";
import { connectRealtimeVoice, type VoiceConnection } from "../lib/realtime";
import type { CHARACTER_LIST } from "../../character/characters";

export interface UseVoiceConnectionOptions {
  speechLang: "ko" | "en";
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  selectedVoice: string;
  personaCharacter: (typeof CHARACTER_LIST)[number];
  personaGender: "male" | "female";
  onUserMessage?: (text: string) => void;
  onAssistantMessage?: (text: string) => void;
  onUserSpeechStart?: () => void;
  onUserTranscriptUpdate?: (text: string, isFinal: boolean) => void;
}

export interface UseVoiceConnectionReturn {
  // 상태들
  voiceEnabled: boolean;
  isRecording: boolean;
  isListening: boolean;
  isResponding: boolean;

  voiceConn: VoiceConnection | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;

  // 액션들
  startVoice: () => Promise<void>;
  stopVoice: () => void;

  setVoiceEnabled: (enabled: boolean) => void;
  sendVoiceMessage: (message: string) => void;
}

/**
 * OpenAI Realtime API 기반 실시간 AI 음성 대화 훅
 *
 * 사용자 음성 → 음성인식 → AI 응답 생성 → 음성합성 → 재생
 * 전체 파이프라인을 관리하는 핵심 훅
 */
export const useVoiceConnection = (
  options: UseVoiceConnectionOptions,
): UseVoiceConnectionReturn => {
  const {
    speechLang,
    echoCancellation,
    noiseSuppression,
    autoGainControl,
    selectedVoice,
    personaCharacter,
    personaGender,
    onUserMessage,
    onAssistantMessage,
    onUserSpeechStart,
    onUserTranscriptUpdate,
  } = options;

  // 음성 연결 상태들
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRespondingRef = useRef(false);
  const assistantPartialRef = useRef<string>("");
  const lastUserFinalRef = useRef<string>("");
  const lastAssistantFinalRef = useRef<string>("");

  // 텍스트 정규화 함수
  const normalizeText = (s: string) => {
    try {
      if (!s || typeof s !== "string") return "";
      let normalized = s.normalize("NFC");
      normalized = normalized.replace(/[\uFFFD\u0000-\u001F]/g, "");
      normalized = normalized.replace(/\s+/g, " ").trim();
      return normalized;
    } catch (error) {
      console.warn("텍스트 정규화 실패:", error);
      return (s || "").trim();
    }
  };

  // AI 페르소나 지시사항 생성
  const buildPersonaInstructions = () => {
    const genderNote =
      personaGender === "male"
        ? "남성적인 페르소나를 사용하세요. "
        : "여성적인 페르소나를 사용하세요. ";
    const voiceNote = selectedVoice ? `음성: ${selectedVoice}. ` : "";
    const personaSummary = personaCharacter
      ? `${personaCharacter.personality}\n${personaCharacter.background}`
      : "";

    // 자연스러운 영어 역할극 모드
    const languageNote =
      "캐릭터 역할을 유지하면서 자연스럽게 영어로 응답하세요. 사용자가 다른 언어로 말하면 그 의도를 이해하되, 당신의 캐릭터가 하듯이 영어로 응답하세요. 대화를 자연스럽고 직접적으로 유지하세요. 답변은 최대 1-2문장으로 간결하게 하세요. ";

    const characterEmphasis = personaCharacter
      ? `당신은 ${personaCharacter.name}입니다. ${personaSummary} `
      : "";

    const firstMessageNote = personaCharacter.firstMessage
      ? `첫 번째 메시지는 반드시 다음과 같아야 합니다: "${personaCharacter.firstMessage}". `
      : "";

    // 복잡한 캐릭터별 지침 제거됨

    return (
      `나는 ${personaCharacter.name} (${personaCharacter.emoji})입니다. ${genderNote}${voiceNote}` +
      firstMessageNote +
      characterEmphasis +
      languageNote +
      `나는 항상 캐릭터 역할을 유지합니다`
    );
  };

  // 음성 연결 시작
  const startVoice = async () => {
    if (voiceConn) return;

    try {
      const session = await voiceApi.createSession({
        lang: speechLang,
        voice: selectedVoice,
      });

      let micStream: MediaStream | null = null;

      const conn = await connectRealtimeVoice({
        token: session.token,
        model: session.model,
        audioElement: audioRef.current,
        voice: selectedVoice,
        audioConstraints: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          channelCount: 1,
        },
        onEvent: (evt) => {
          const e: any = evt as any;
          const t = e?.type as string | undefined;
          if (t === "input_audio_buffer.speech_started") {
            setIsListening(true);
            onUserSpeechStart?.(); // 음성 시작 알림
          }
          if (t === "input_audio_buffer.speech_stopped") setIsListening(false);
          if (t === "output_audio_buffer.started") {
            setIsResponding(true);
            isRespondingRef.current = true;
            try {
              micStream
                ?.getAudioTracks()
                ?.forEach((tr) => (tr.enabled = false));
            } catch {}
          }
          if (t === "response.done" || t === "output_audio_buffer.stopped") {
            setIsResponding(false);
            isRespondingRef.current = false;
            try {
              micStream?.getAudioTracks()?.forEach((tr) => (tr.enabled = true));
            } catch {}
          }
        },
        onUserTranscript: (text, isFinal) => {
          if (isRespondingRef.current) return; // 어시스턴트 발화 중 전사 무시

          // 실시간 텍스트 업데이트 (final이 아니어도 호출)
          onUserTranscriptUpdate?.(text, isFinal);

          if (isFinal) {
            const finalText = normalizeText(text.trim());
            console.log("[음성 디버그] 최종 텍스트:", finalText);
            console.log("[음성 디버그] 이전 텍스트:", lastUserFinalRef.current);

            // 텍스트가 있으면 무조건 추가 (중복 체크 완화)
            if (finalText && finalText.length > 0) {
              console.log("[음성 디버그] 사용자 메시지 추가 중:", finalText);
              // 사용자 메시지를 외부 콜백으로 전달
              onUserMessage?.(finalText);
              lastUserFinalRef.current = finalText;

              // create_response: false이므로 수동으로 응답 생성 (지연 후)
              setTimeout(() => {
                try {
                  conn?.dc?.send(
                    JSON.stringify({
                      type: "response.create",
                      response: {
                        modalities: ["text", "audio"],
                        instructions: "Please respond naturally and helpfully.",
                      },
                    }),
                  );
                  console.log("[음성 디버그] 응답 생성 요청 전송");
                } catch (e) {
                  console.error("[음성 디버그] 응답 생성 요청 실패:", e);
                }
              }, 1500); // 1.5초 지연 후 응답 생성
            } else {
              console.log("[음성 디버그] 텍스트가 비어있어서 스킵");
            }
          }
        },
        onAssistantText: (text, isFinal) => {
          if (isFinal) {
            const finalText = normalizeText(
              assistantPartialRef.current || text,
            );
            const normalizedFinal = normalizeText(finalText);
            const normalizedLast = normalizeText(lastAssistantFinalRef.current);
            if (normalizedFinal && normalizedFinal !== normalizedLast) {
              // AI 메시지를 외부 콜백으로 전달
              onAssistantMessage?.(finalText);
              lastAssistantFinalRef.current = finalText.trim();
            }
            assistantPartialRef.current = "";
          } else {
            assistantPartialRef.current += text;
          }
        },
      });

      setVoiceConn(conn);
      try {
        micStream = conn.localStream;
      } catch {}
      setIsRecording(true);

      // 세션 기본 퍼소나 업데이트
      try {
        if (conn.dc && conn.dc.readyState === "open") {
          conn.dc.send(
            JSON.stringify({
              type: "session.update",
              session: {
                instructions: buildPersonaInstructions(),
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.6, // 더 확실한 음성만 감지 (잡음 무시)
                  prefix_padding_ms: 300, // 음성 시작 전 여유시간
                  silence_duration_ms: 800, // 침묵 800ms 후 턴 종료 감지
                  create_response: false, // 자동 응답 비활성화 (수동 제어)
                },
              },
            }),
          );
        } else {
          conn.dc?.addEventListener("open", () => {
            try {
              conn.dc?.send(
                JSON.stringify({
                  type: "session.update",
                  session: {
                    instructions: buildPersonaInstructions(),
                    turn_detection: {
                      type: "server_vad",
                      threshold: 0.6, // 더 확실한 음성만 감지 (잡음 무시)
                      prefix_padding_ms: 300, // 음성 시작 전 여유시간
                      silence_duration_ms: 800, // 침묵 800ms 후 턴 종료 감지
                      create_response: false, // 자동 응답 비활성화 (수동 제어)
                    },
                  },
                }),
              );
            } catch {}
          });
        }
      } catch {}
    } catch (e) {
      console.error("음성 연결 실패:", e);
    }
  };

  // 음성 연결 종료
  const stopVoice = () => {
    try {
      voiceConn?.stop();
    } catch {}
    setVoiceConn(null);
    setIsRecording(false);
    setIsListening(false);
    setIsResponding(false);
  };

  // 텍스트 메시지를 음성 연결로 전송
  const sendVoiceMessage = (message: string) => {
    try {
      if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
        voiceConn.dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: message }],
            },
          }),
        );
        voiceConn.dc.send(
          JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["audio", "text"],
              conversation: "auto",
              voice: selectedVoice,
            },
          }),
        );
      }
    } catch (e) {
      console.error("음성 메시지 전송 실패:", e);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  return {
    // 상태들
    voiceEnabled,
    isRecording,
    isListening,
    isResponding,
    voiceConn,
    audioRef,

    // 액션들
    startVoice,
    stopVoice,
    setVoiceEnabled,
    sendVoiceMessage,
  };
};
