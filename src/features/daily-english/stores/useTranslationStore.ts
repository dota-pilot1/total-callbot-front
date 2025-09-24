import { create } from "zustand";

interface TranslationState {
  // 번역 표시 상태
  isVisible: boolean;
  isLoading: boolean;

  // 번역 데이터
  originalText: string;
  translatedText: string;

  // 액션들
  setVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTranslation: (original: string, translated: string) => void;
  clearTranslation: () => void;
  toggleVisible: () => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({
  // 초기 상태
  isVisible: false,
  isLoading: false,
  originalText: "",
  translatedText: "",

  // 액션들
  setVisible: (visible: boolean) => set({ isVisible: visible }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setTranslation: (original: string, translated: string) =>
    set({ originalText: original, translatedText: translated }),

  clearTranslation: () =>
    set({ originalText: "", translatedText: "", isLoading: false }),

  toggleVisible: () => set((state) => ({ isVisible: !state.isVisible })),
}));
