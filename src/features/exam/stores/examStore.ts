import { create } from "zustand";

export type ExamConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed";

interface ExamState {
  // OpenAI Realtime API 연결 상태
  connectionState: ExamConnectionState;
  voiceConnection: any; // voiceConn 객체

  // 시험 진행 상태
  examInProgress: boolean;
  examSending: boolean;
  currentTopic: string | null;

  // 에러 상태
  lastError: string | null;

  // 액션들
  setConnectionState: (state: ExamConnectionState) => void;
  setVoiceConnection: (connection: any) => void;
  setExamInProgress: (inProgress: boolean) => void;
  setExamSending: (sending: boolean) => void;
  setCurrentTopic: (topic: string | null) => void;
  setLastError: (error: string | null) => void;

  // 편의 메서드들
  isConnected: () => boolean;
  isConnecting: () => boolean;
  canStartExam: () => boolean;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  // 초기 상태
  connectionState: "disconnected",
  voiceConnection: null,
  examInProgress: false,
  examSending: false,
  currentTopic: null,
  lastError: null,

  // 액션들
  setConnectionState: (state) => set({ connectionState: state }),
  setVoiceConnection: (connection) => set({ voiceConnection: connection }),
  setExamInProgress: (inProgress) => set({ examInProgress: inProgress }),
  setExamSending: (sending) => set({ examSending: sending }),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setLastError: (error) => set({ lastError: error }),

  // 편의 메서드들
  isConnected: () => get().connectionState === "connected",
  isConnecting: () => get().connectionState === "connecting",
  canStartExam: () => {
    const state = get();
    return (
      state.connectionState === "connected" &&
      !state.examInProgress &&
      !state.examSending &&
      state.voiceConnection?.dc?.readyState === "open"
    );
  },

  reset: () =>
    set({
      connectionState: "disconnected",
      voiceConnection: null,
      examInProgress: false,
      examSending: false,
      currentTopic: null,
      lastError: null,
    }),
}));
