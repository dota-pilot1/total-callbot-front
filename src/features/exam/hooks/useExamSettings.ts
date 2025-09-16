import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExamSettings {
  // 시험 관련 설정
  examDifficulty: "easy" | "medium" | "hard";
  examDuration: number; // 분 단위 (5-30분)
  autoStartExam: boolean;
  showScoreAfterEach: boolean;
}

interface ExamSettingsState extends ExamSettings {
  // 설정 업데이트 함수들
  setExamDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
  setExamDuration: (duration: number) => void;
  setAutoStartExam: (enabled: boolean) => void;
  setShowScoreAfterEach: (enabled: boolean) => void;

  // 설정 초기화
  resetExamSettings: () => void;
}

const defaultExamSettings: ExamSettings = {
  examDifficulty: "medium",
  examDuration: 15, // 기본 15분
  autoStartExam: false,
  showScoreAfterEach: false,
};

export const useExamSettings = create<ExamSettingsState>()(
  persist(
    (set) => ({
      // 기본값들
      ...defaultExamSettings,

      // 설정 업데이트 함수들
      setExamDifficulty: (difficulty) =>
        set({ examDifficulty: difficulty }),

      setExamDuration: (duration) =>
        set({ examDuration: Math.max(5, Math.min(30, duration)) }),

      setAutoStartExam: (enabled) =>
        set({ autoStartExam: enabled }),

      setShowScoreAfterEach: (enabled) =>
        set({ showScoreAfterEach: enabled }),

      // 설정 초기화
      resetExamSettings: () =>
        set(defaultExamSettings),
    }),
    {
      name: 'exam-settings', // localStorage key
      partialize: (state) => ({
        examDifficulty: state.examDifficulty,
        examDuration: state.examDuration,
        autoStartExam: state.autoStartExam,
        showScoreAfterEach: state.showScoreAfterEach,
      }),
    }
  )
);

/**
 * 시험 설정을 관리하는 React 훅
 * Zustand store를 래핑하여 더 편리한 인터페이스 제공
 */
export const useExamSettingsHook = () => {
  const {
    examDifficulty,
    examDuration,
    autoStartExam,
    showScoreAfterEach,
    setExamDifficulty,
    setExamDuration,
    setAutoStartExam,
    setShowScoreAfterEach,
    resetExamSettings,
  } = useExamSettings();

  return {
    // 현재 설정값들
    settings: {
      examDifficulty,
      examDuration,
      autoStartExam,
      showScoreAfterEach,
    },

    // 설정 업데이트 함수들
    setExamDifficulty,
    setExamDuration,
    setAutoStartExam,
    setShowScoreAfterEach,
    resetExamSettings,

    // 유틸리티 함수들
    getDifficultyLabel: () => {
      switch (examDifficulty) {
        case "easy": return "쉬움";
        case "medium": return "보통";
        case "hard": return "어려움";
        default: return "보통";
      }
    },

    getDurationText: () => `${examDuration}분`,

    isValidDuration: (duration: number) => duration >= 5 && duration <= 30,
  };
};
