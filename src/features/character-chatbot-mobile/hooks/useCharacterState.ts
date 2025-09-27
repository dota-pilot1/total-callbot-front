import { useState, useEffect } from 'react';
import { CHARACTER_LIST } from '../../../shared/chatbot-utils/character/characters';

export interface SelectedCharacter {
  id: string;
  name: string;
  emoji: string;
  personality: string;
  background: string;
  firstMessage?: string;
  voice?: string;
  defaultGender?: 'male' | 'female';
}

export interface CharacterSettings {
  character: SelectedCharacter;
  gender: 'male' | 'female';
  voice: 'alloy' | 'sage' | 'verse';
}

/**
 * 캐릭터 챗봇 전용 상태 관리 훅
 * zustand store 없이 localStorage 기반으로 단순하게 관리
 */
export const useCharacterState = () => {
  const [settings, setSettings] = useState<CharacterSettings>(() => {
    // localStorage에서 복원
    try {
      const saved = localStorage.getItem('character-chatbot-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // CHARACTER_LIST에서 전체 정보 가져오기
        const fullCharacter = CHARACTER_LIST.find(c => c.id === parsed.character.id) || CHARACTER_LIST[0];
        return {
          character: fullCharacter,
          gender: parsed.gender || 'male',
          voice: parsed.voice || 'alloy',
        };
      }
    } catch (error) {
      console.warn('캐릭터 설정 복원 실패:', error);
    }

    // 기본값: 첫 번째 캐릭터
    return {
      character: CHARACTER_LIST[0],
      gender: 'male' as const,
      voice: 'alloy' as const,
    };
  });

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem('character-chatbot-settings', JSON.stringify(settings));
      console.log('🎭 [useCharacterState] 캐릭터 설정 저장:', settings);
    } catch (error) {
      console.error('캐릭터 설정 저장 실패:', error);
    }
  }, [settings]);

  const updateCharacter = (characterId: string) => {
    const character = CHARACTER_LIST.find(c => c.id === characterId);
    if (character) {
      console.log('🎭 [useCharacterState] 캐릭터 변경:', character);
      setSettings(prev => ({
        ...prev,
        character,
        // 캐릭터 기본 설정 적용
        gender: character.defaultGender || prev.gender,
        voice: (character.voice as any) || prev.voice,
      }));
    }
  };

  const updateGender = (gender: 'male' | 'female') => {
    console.log('🎭 [useCharacterState] 성별 변경:', gender);
    setSettings(prev => ({ ...prev, gender }));
  };

  const updateVoice = (voice: 'alloy' | 'sage' | 'verse') => {
    console.log('🎭 [useCharacterState] 음성 변경:', voice);
    setSettings(prev => ({ ...prev, voice }));
  };

  return {
    settings,
    updateCharacter,
    updateGender,
    updateVoice,
  };
};
