import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GenderOption = 'male' | 'female';
export type VoiceOption = 'verse' | 'alloy' | 'sage';

interface CharacterState {
  // 캐릭터 정보
  personaCharacter: { id: string; name: string; emoji: string };
  personaScenario: string;
  personaGender: GenderOption;
  selectedVoice: VoiceOption;
  
  // Actions
  setPersonaCharacter: (character: { id: string; name: string; emoji: string }) => void;
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
      personaCharacter: { id: 'gpt', name: 'GPT', emoji: '🤖' },
      personaScenario: '',
      personaGender: 'male',
      selectedVoice: 'alloy',

      setPersonaCharacter: (character) => set({ personaCharacter: character }),
      setPersonaScenario: (scenario) => set({ personaScenario: scenario }),
      setPersonaGender: (gender) => set({ personaGender: gender }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      
      setCharacterSettings: (settings) => {
        const mapChar: Record<string, { id: string; name: string; emoji: string }> = {
          gpt: { id: 'gpt', name: 'GPT', emoji: '🤖' },
          sejong: { id: 'sejong', name: '세종대왕', emoji: '📜' },
          yi_sunsin: { id: 'yi_sunsin', name: '이순신', emoji: '⚓️' },
          yu_gwansun: { id: 'yu_gwansun', name: '유관순', emoji: '🎗️' },
          honggildong: { id: 'honggildong', name: '홍길동', emoji: '🥷' },
          songkh_detective: { id: 'songkh_detective', name: '송강호 형사', emoji: '🕵️' },
          einstein: { id: 'einstein', name: '알버트 아인슈타인', emoji: '🧠' },
          edison: { id: 'edison', name: '토머스 에디슨', emoji: '💡' },
          musk: { id: 'musk', name: '일론 머스크', emoji: '🚀' },
          davinci: { id: 'davinci', name: '레오나르도 다 빈치', emoji: '🎨' },
        };
        
        const newCharacter = mapChar[settings.characterId] || mapChar['gpt'];
        
        set({
          personaCharacter: newCharacter,
          personaScenario: settings.scenarioId,
          personaGender: settings.gender,
          selectedVoice: settings.voice,
        });
      },
    }),
    {
      name: 'callbot-character-storage', // localStorage key
    }
  )
);