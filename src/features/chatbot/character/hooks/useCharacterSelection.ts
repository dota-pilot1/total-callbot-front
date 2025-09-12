import { useState, useEffect, useCallback } from "react";
import { CHARACTER_PRESETS } from "../constants/presets";
import { useCharacterStore } from "../store";
import { type GenderOption, type VoiceOption } from "../store";

export interface CharacterSelectionValue {
  characterId: string;
  scenarioId?: string;
  gender: GenderOption;
  voice: VoiceOption;
}

export interface UseCharacterSelectionReturn {
  // 현재 선택된 캐릭터/음성
  selectedCharacterId: (typeof CHARACTER_PRESETS)[number]["id"];
  selectedVoice: string;

  // 다이얼로그 상태
  characterDialogOpen: boolean;

  // 액션 함수들
  setSelectedCharacterId: (
    id: (typeof CHARACTER_PRESETS)[number]["id"],
  ) => void;
  setSelectedVoice: (voice: string) => void;
  openCharacterDialog: () => void;
  closeCharacterDialog: () => void;

  // 캐릭터 설정 적용
  applyCharacterSettings: (settings: CharacterSelectionValue) => void;

  // 현재 다이얼로그에 표시할 값
  getCurrentDialogValue: () => CharacterSelectionValue;
}

/**
 * 캐릭터 선택 및 관리 훅
 *
 * 캐릭터/음성 선택, 다이얼로그 상태, zustand store 동기화를 담당합니다.
 *
 * 주요 기능:
 * - 로컬 캐릭터/음성 상태 관리 (selectedCharacterId, selectedVoice)
 * - 캐릭터 변경 시 기본 음성 자동 동기화
 * - 캐릭터 설정 다이얼로그 상태 관리
 * - zustand store와 로컬 상태 동기화
 * - 캐릭터 설정 변경 처리 및 적용
 */
export const useCharacterSelection = (): UseCharacterSelectionReturn => {
  // zustand store에서 캐릭터 상태 가져오기
  const {
    personaCharacter,
    personaScenario,
    personaGender,
    setCharacterSettings,
  } = useCharacterStore();

  // 로컬 캐릭터/음성 선택 상태
  const [selectedCharacterId, setSelectedCharacterId] = useState<
    (typeof CHARACTER_PRESETS)[number]["id"]
  >(CHARACTER_PRESETS[0].id);

  const [selectedVoice, setSelectedVoice] = useState<string>(
    CHARACTER_PRESETS[0].defaultVoice,
  );

  // 캐릭터 다이얼로그 상태
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);

  /**
   * 캐릭터 변경 시 기본 음성 동기화
   * CHARACTER_PRESETS에서 해당 캐릭터의 기본 음성으로 자동 설정
   */
  useEffect(() => {
    const character =
      CHARACTER_PRESETS.find(
        (c: (typeof CHARACTER_PRESETS)[number]) => c.id === selectedCharacterId,
      ) || CHARACTER_PRESETS[0];
    setSelectedVoice(character.defaultVoice);
  }, [selectedCharacterId]);

  /**
   * 다이얼로그 열기
   */
  const openCharacterDialog = useCallback(() => {
    setCharacterDialogOpen(true);
  }, []);

  /**
   * 다이얼로그 닫기
   */
  const closeCharacterDialog = useCallback(() => {
    setCharacterDialogOpen(false);
  }, []);

  /**
   * 현재 다이얼로그에 표시할 값 반환
   * zustand store의 값들과 현재 선택된 음성을 조합
   */
  const getCurrentDialogValue = useCallback((): CharacterSelectionValue => {
    return {
      characterId: personaCharacter.id,
      scenarioId: personaScenario,
      gender: personaGender,
      voice: selectedVoice as VoiceOption,
    };
  }, [personaCharacter.id, personaScenario, personaGender, selectedVoice]);

  /**
   * 캐릭터 설정 적용
   * 1. zustand store 업데이트
   * 2. 로컬 음성 상태 업데이트
   * 3. 다이얼로그 닫기
   */
  const applyCharacterSettings = useCallback(
    (settings: CharacterSelectionValue) => {
      console.log("Setting new character via store:", settings);

      // zustand store를 통해 캐릭터 설정 업데이트
      setCharacterSettings({
        characterId: settings.characterId,
        scenarioId: settings.scenarioId || "",
        gender: settings.gender,
        voice: settings.voice,
      });

      // 로컬 selectedVoice 상태도 업데이트
      setSelectedVoice(settings.voice);

      // 다이얼로그 닫기
      closeCharacterDialog();
    },
    [setCharacterSettings, closeCharacterDialog],
  );

  return {
    selectedCharacterId,
    selectedVoice,
    characterDialogOpen,
    setSelectedCharacterId,
    setSelectedVoice,
    openCharacterDialog,
    closeCharacterDialog,
    applyCharacterSettings,
    getCurrentDialogValue,
  };
};
