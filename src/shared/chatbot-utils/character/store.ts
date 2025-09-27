import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CHARACTER_LIST } from "./characters";

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

const CHARACTER_META_MAP: Record<string, { id: string; name: string; emoji: string }> =
  CHARACTER_LIST.reduce((acc, character) => {
    acc[character.id] = {
      id: character.id,
      name: character.name,
      emoji: character.emoji,
    };
    return acc;
  }, {} as Record<string, { id: string; name: string; emoji: string }>);

const DEFAULT_CHARACTER =
  CHARACTER_META_MAP["gpt"] ||
  (CHARACTER_LIST.length > 0
    ? {
        id: CHARACTER_LIST[0].id,
        name: CHARACTER_LIST[0].name,
        emoji: CHARACTER_LIST[0].emoji,
      }
    : { id: "gpt", name: "GPT", emoji: "🤖" });

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      // 기본값: 캐릭터 목록의 기본 캐릭터 (기본적으로 GPT)
      personaCharacter: DEFAULT_CHARACTER,
      personaScenario: "",
      personaGender: "male",
      selectedVoice: "alloy",

      setPersonaCharacter: (character) => set({ personaCharacter: character }),
      setPersonaScenario: (scenario) => set({ personaScenario: scenario }),
      setPersonaGender: (gender) => set({ personaGender: gender }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),

      setCharacterSettings: (settings) => {
        const newCharacter =
          CHARACTER_META_MAP[settings.characterId] || DEFAULT_CHARACTER;

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
