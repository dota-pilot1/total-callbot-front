import { create } from 'zustand';

// 기본 문제 폼 데이터 타입 (영어 시험 공통)
export interface QuestionFormData {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  explanation?: string;
}

interface QuestionFormStore {
  // Form data
  formData: QuestionFormData;
  errors: Record<string, string>;

  // UI states
  activeTab: 'list' | 'ai';

  // Actions
  setFormData: (data: Partial<QuestionFormData>) => void;
  resetForm: () => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setActiveTab: (tab: 'list' | 'ai') => void;

  // AI specific actions
  applyAIGenerated: (aiData: any) => void;

  // Form validation
  validateForm: () => boolean;
}

const initialFormData: QuestionFormData = {
  audioText: "",
  questionContent: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  category: "listening",
  difficulty: "BEGINNER",
  explanation: "",
};

export const useQuestionFormStore = create<QuestionFormStore>((set, get) => ({
  // Initial state
  formData: initialFormData,
  errors: {},
  activeTab: 'list',

  // Form actions
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetForm: () =>
    set({
      formData: initialFormData,
      errors: {},
    }),

  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Form validation
  validateForm: () => {
    const { formData } = get();
    const newErrors: Record<string, string> = {};

    if (!formData.questionContent.trim()) {
      newErrors.questionContent = "문제 내용을 입력해주세요.";
    }
    if (!formData.optionA.trim()) {
      newErrors.optionA = "선택지 A를 입력해주세요.";
    }
    if (!formData.optionB.trim()) {
      newErrors.optionB = "선택지 B를 입력해주세요.";
    }
    if (!formData.optionC.trim()) {
      newErrors.optionC = "선택지 C를 입력해주세요.";
    }
    if (!formData.optionD.trim()) {
      newErrors.optionD = "선택지 D를 입력해주세요.";
    }

    if (formData.category === "listening" && !formData.audioText.trim()) {
      newErrors.audioText = "듣기 문제는 TTS 텍스트를 입력해주세요.";
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // AI integration
  applyAIGenerated: (aiData) => {
    // Convert AI data format to form data format
    const convertedData: Partial<QuestionFormData> = {
      audioText: aiData.ttsText || aiData.audioText || "",
      questionContent: aiData.questionText || aiData.questionContent || "",
      optionA: aiData.option1 || aiData.optionA || "",
      optionB: aiData.option2 || aiData.optionB || "",
      optionC: aiData.option3 || aiData.optionC || "",
      optionD: aiData.option4 || aiData.optionD || "",
      correctAnswer: typeof aiData.correctAnswer === 'number'
        ? ['A', 'B', 'C', 'D'][aiData.correctAnswer - 1] as 'A' | 'B' | 'C' | 'D'
        : aiData.correctAnswer || "A",
      category: aiData.category || "listening",
      difficulty: aiData.difficulty?.toUpperCase() || "BEGINNER",
      explanation: aiData.explanation || "",
    };

    set((state) => ({
      formData: { ...state.formData, ...convertedData },
      errors: {}, // Clear errors when AI data is applied
      activeTab: 'list', // Switch to list tab to show the generated data
    }));
  },
}));
