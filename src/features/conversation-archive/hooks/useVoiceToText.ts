import { useState, useRef, useCallback, useEffect } from "react";
import { voiceApi } from "../../chatbot/voice/api/voice";
import {
  connectRealtimeVoice,
  type VoiceConnection,
} from "../../chatbot/voice/lib/realtime";

export interface UseVoiceToTextOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceToTextReturn {
  isRecording: boolean;
  isListening: boolean;
  transcriptText: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
}

/**
 * 음성을 텍스트로 변환하는 전용 훅 (대화 없음)
 * OpenAI Realtime API 사용하여 브라우저/모바일 모두 지원
 */
export const useVoiceToText = (
  options: UseVoiceToTextOptions = {},
): UseVoiceToTextReturn => {
  const { onTranscript, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");

  const voiceConnRef = useRef<VoiceConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      console.log("🎤 Starting voice-to-text recording...");

      // Create session for voice recognition only
      const session = await voiceApi.createSession({
        lang: "ko",
        voice: "alloy", // 기본값, 실제로는 사용하지 않음
      });

      const conn = await connectRealtimeVoice({
        token: session.token,
        model: session.model,
        audioElement: audioRef.current,
        voice: "alloy",
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        // 음성 입력 감지
        onEvent: (evt) => {
          const e: any = evt as any;
          const t = e?.type as string | undefined;
          if (t === "input_audio_buffer.speech_started") {
            console.log("🎤 Speech detected");
            setIsListening(true);
          }
          if (t === "input_audio_buffer.speech_stopped") {
            console.log("🎤 Speech ended");
            setIsListening(false);
          }
        },
        // 사용자 음성 텍스트 변환 결과
        onUserTranscript: (text, isFinal) => {
          console.log("🔤 Transcript:", text, "isFinal:", isFinal);

          if (isFinal) {
            setTranscriptText((prev) => {
              const newText = prev + (prev ? " " : "") + text;
              onTranscript?.(newText, true);
              return newText;
            });
          } else {
            // 실시간 업데이트
            onTranscript?.(text, false);
          }
        },
        // AI 응답은 무시 (텍스트 변환 전용이므로)
        onAssistantText: () => {},
      });

      voiceConnRef.current = conn;
      setIsRecording(true);

      // 음성 인식 전용으로 설정 (AI 응답 비활성화)
      try {
        if (conn.dc && conn.dc.readyState === "open") {
          conn.dc.send(
            JSON.stringify({
              type: "session.update",
              session: {
                instructions:
                  "You are a voice transcription service. Do not respond to user input, just transcribe.",
                turn_detection: { type: "server_vad" },
                input_audio_transcription: { model: "whisper-1" },
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
                    instructions:
                      "You are a voice transcription service. Do not respond to user input, just transcribe.",
                    turn_detection: { type: "server_vad" },
                    input_audio_transcription: { model: "whisper-1" },
                  },
                }),
              );
            } catch (err) {
              console.error("Failed to configure session:", err);
            }
          });
        }
      } catch (err) {
        console.error("Failed to configure session:", err);
      }

      console.log("✅ Voice-to-text recording started");
    } catch (error) {
      console.error("❌ Failed to start voice-to-text:", error);
      setIsRecording(false);
      setIsListening(false);
      onError?.("음성 인식 시작에 실패했습니다: " + (error as Error).message);
    }
  }, [isRecording, onTranscript, onError]);

  const stopRecording = useCallback(() => {
    console.log("🛑 Stopping voice-to-text recording...");

    try {
      voiceConnRef.current?.stop();
    } catch (err) {
      console.error("Error stopping voice connection:", err);
    }

    voiceConnRef.current = null;
    setIsRecording(false);
    setIsListening(false);

    console.log("✅ Voice-to-text recording stopped");
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscriptText("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceConnRef.current) {
        stopRecording();
      }
    };
  }, [stopRecording]);

  return {
    isRecording,
    isListening,
    transcriptText,
    startRecording,
    stopRecording,
    clearTranscript,
  };
};
