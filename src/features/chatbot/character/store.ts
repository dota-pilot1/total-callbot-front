import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GenderOption = "male" | "female";
export type VoiceOption = "verse" | "alloy" | "sage";

interface CharacterState {
  // 캐릭터 정보
  personaCharacter: { id: string; name: string; emoji: string };
  personaScenario: string;
  personaGender: GenderOption;
  selectedVoice: VoiceOption;

  // Actions
  setPersonaCharacter: (character: {
    id: string;
    name: string;
    emoji: string;
  }) => void;
  setPersonaScenario: (scenario: string) => void;
  setPersonaGender: (gender: GenderOption) => void;
  setSelectedVoice: (voice: VoiceOption) => void;
  setCharacterSettings: (settings: {
    characterId: string;
    scenarioId: string;
    gender: GenderOption;
    voice: VoiceOption;
  }) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      // 기본값: GPT
      personaCharacter: { id: "gpt", name: "GPT", emoji: "🤖" },
      personaScenario: "",
      personaGender: "male",
      selectedVoice: "alloy",

      setPersonaCharacter: (character) => set({ personaCharacter: character }),
      setPersonaScenario: (scenario) => set({ personaScenario: scenario }),
      setPersonaGender: (gender) => set({ personaGender: gender }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),

      setCharacterSettings: (settings) => {
        const mapChar: Record<
          string,
          { id: string; name: string; emoji: string }
        > = {
          gpt: { id: "gpt", name: "GPT", emoji: "🤖" },
          linus_torvalds: {
            id: "linus_torvalds",
            name: "리눅스 토발즈",
            emoji: "🐧",
          },
          ronnie_coleman: {
            id: "ronnie_coleman",
            name: "로니 콜먼",
            emoji: "💪",
          },
          buddha: { id: "buddha", name: "부처", emoji: "🧘" },
          jesus: { id: "jesus", name: "예수", emoji: "✝️" },
          santa: { id: "santa", name: "산타클로스", emoji: "🎅" },
          lee_jaeyong: { id: "lee_jaeyong", name: "이재용", emoji: "📱" },
          kim_jongun: { id: "kim_jongun", name: "김정은", emoji: "🚀" },
          nietzsche: { id: "nietzsche", name: "니체", emoji: "⚡" },
          schopenhauer: { id: "schopenhauer", name: "쇼펜하우어", emoji: "🌑" },
          xi_jinping: { id: "xi_jinping", name: "시진핑", emoji: "🇨🇳" },
          hitler: { id: "hitler", name: "히틀러", emoji: "📢" },
          peter_thiel: { id: "peter_thiel", name: "피터 틸", emoji: "🦄" },
          elon_musk: { id: "elon_musk", name: "일론 머스크", emoji: "🚀" },
          warren_buffett: {
            id: "warren_buffett",
            name: "워렌 버핏",
            emoji: "💰",
          },
        };

        const newCharacter = mapChar[settings.characterId] || mapChar["gpt"];

        set({
          personaCharacter: newCharacter,
          personaScenario: settings.scenarioId,
          personaGender: settings.gender,
          selectedVoice: settings.voice,
        });
      },
    }),
    {
      name: "callbot-character-storage", // localStorage key
    },
  ),
);
