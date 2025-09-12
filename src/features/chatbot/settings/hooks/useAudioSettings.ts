import { useState, useCallback } from "react";

// 오디오 설정 타입 정의
export interface AudioSettings {
  speechLang: "ko" | "en";
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  coalesceDelayMs: number;
  responseDelayMs: number;
  debugEvents: boolean;
}

// 기본 오디오 설정값
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  speechLang: "en",
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false,
  coalesceDelayMs: 800,
  responseDelayMs: 2000, // 2초 지연 (사용자 메시지 등록 후 적절한 대기시간)
  debugEvents: false,
};

export interface UseAudioSettingsReturn {
  // 모든 설정을 객체로 반환
  settings: AudioSettings;

  // 개별 설정 업데이트 함수들
  setSpeechLang: (value: "ko" | "en") => void;
  setEchoCancellation: (value: boolean) => void;
  setNoiseSuppression: (value: boolean) => void;
  setAutoGainControl: (value: boolean) => void;
  setCoalesceDelayMs: (value: number) => void;
  setResponseDelayMs: (value: number) => void;
  setDebugEvents: (value: boolean) => void;

  // 편의 함수들
  updateSetting: <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K],
  ) => void;
  resetToDefaults: () => void;
  resetVoiceSettings: () => void; // 음성 관련 설정만 리셋
}

/**
 * 오디오 설정 관리 훅
 *
 * OpenAI Realtime API 음성 연결 및 일반적인 오디오 처리에 필요한
 * 모든 설정값들을 중앙집중식으로 관리합니다.
 *
 * 주요 설정:
 * - speechLang: 음성 언어 (한국어/영어)
 * - echoCancellation/noiseSuppression/autoGainControl: WebRTC 오디오 처리
 * - coalesceDelayMs: 음성 입력 합병 지연시간
 * - responseDelayMs: AI 응답 지연시간 (사용자 메시지 등록 시간 확보)
 * - debugEvents: 디버그 이벤트 표시 여부
 */
export const useAudioSettings = (
  initialSettings?: Partial<AudioSettings>,
): UseAudioSettingsReturn => {
  // 초기값 적용 (사용자 정의값 + 기본값)
  const [settings, setSettings] = useState<AudioSettings>(() => ({
    ...DEFAULT_AUDIO_SETTINGS,
    ...initialSettings,
  }));

  // 개별 설정 업데이트 함수들
  const setSpeechLang = useCallback((value: "ko" | "en") => {
    setSettings((prev) => ({ ...prev, speechLang: value }));
  }, []);

  const setEchoCancellation = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, echoCancellation: value }));
  }, []);

  const setNoiseSuppression = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, noiseSuppression: value }));
  }, []);

  const setAutoGainControl = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, autoGainControl: value }));
  }, []);

  const setCoalesceDelayMs = useCallback((value: number) => {
    // 범위 검증 (100ms ~ 3000ms)
    const clampedValue = Math.max(100, Math.min(3000, value));
    setSettings((prev) => ({ ...prev, coalesceDelayMs: clampedValue }));
  }, []);

  const setResponseDelayMs = useCallback((value: number) => {
    // 범위 검증 (1000ms ~ 10000ms)
    const clampedValue = Math.max(1000, Math.min(10000, value));
    setSettings((prev) => ({ ...prev, responseDelayMs: clampedValue }));
  }, []);

  const setDebugEvents = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, debugEvents: value }));
  }, []);

  // 범용 설정 업데이트 함수
  const updateSetting = useCallback(
    <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // 모든 설정을 기본값으로 리셋
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_AUDIO_SETTINGS);
  }, []);

  // 음성 관련 설정만 리셋 (디버그, 지연시간은 유지)
  const resetVoiceSettings = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      speechLang: DEFAULT_AUDIO_SETTINGS.speechLang,
      echoCancellation: DEFAULT_AUDIO_SETTINGS.echoCancellation,
      noiseSuppression: DEFAULT_AUDIO_SETTINGS.noiseSuppression,
      autoGainControl: DEFAULT_AUDIO_SETTINGS.autoGainControl,
      coalesceDelayMs: DEFAULT_AUDIO_SETTINGS.coalesceDelayMs,
    }));
  }, []);

  return {
    settings,
    setSpeechLang,
    setEchoCancellation,
    setNoiseSuppression,
    setAutoGainControl,
    setCoalesceDelayMs,
    setResponseDelayMs,
    setDebugEvents,
    updateSetting,
    resetToDefaults,
    resetVoiceSettings,
  };
};
