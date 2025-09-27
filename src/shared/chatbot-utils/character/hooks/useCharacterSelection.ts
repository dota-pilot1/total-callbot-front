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
  applyCharacterSettings: (
    settings: CharacterSelectionValue,
    onComplete?: () => void,
  ) => void;

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
    selectedVoice: storedVoice,
    setCharacterSettings,
  } = useCharacterStore();

  // 로컬 캐릭터/음성 선택 상태
  const resolveCharacterId = useCallback(
    (characterId: string): (typeof CHARACTER_PRESETS)[number]["id"] => {
      const preset = CHARACTER_PRESETS.find((c) => c.id === characterId);
      return (preset?.id ||
        CHARACTER_PRESETS[0].id) as (typeof CHARACTER_PRESETS)[number]["id"];
    },
    [],
  );

  const [selectedCharacterId, setSelectedCharacterIdState] = useState<
    (typeof CHARACTER_PRESETS)[number]["id"]
  >(() => resolveCharacterId(personaCharacter.id));

  const [selectedVoice, setSelectedVoiceState] = useState<string>(storedVoice);

  // 캐릭터 다이얼로그 상태
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);

  /**
   * zustand store 값이 변경되면 로컬 상태 동기화
   */
  useEffect(() => {
    setSelectedCharacterIdState(resolveCharacterId(personaCharacter.id));
  }, [personaCharacter.id, resolveCharacterId]);

  useEffect(() => {
    setSelectedVoiceState(storedVoice);
  }, [storedVoice]);

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
   * 캐릭터 선택 시 로컬 상태 업데이트 (미리보기 목적)
   * 새로운 캐릭터 기본 음성으로 자동 전환
   */
  const setSelectedCharacterId = useCallback(
    (id: (typeof CHARACTER_PRESETS)[number]["id"]) => {
      setSelectedCharacterIdState(id);
      const preset = CHARACTER_PRESETS.find((c) => c.id === id);
      if (preset?.defaultVoice) {
        setSelectedVoiceState(preset.defaultVoice);
      }
    },
    [],
  );

  const setSelectedVoice = useCallback((voice: string) => {
    setSelectedVoiceState(voice);
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
   * 4. 음성 연결 재시작 콜백 호출
   */
  const applyCharacterSettings = useCallback(
    (settings: CharacterSelectionValue, onComplete?: () => void) => {
      console.log("🎭 [캐릭터 변경] 새로운 캐릭터 적용 시작:", settings);

      // zustand store를 통해 캐릭터 설정 업데이트
      setCharacterSettings({
        characterId: settings.characterId,
        scenarioId: settings.scenarioId || "",
        gender: settings.gender,
        voice: settings.voice,
      });

      // 로컬 selectedVoice 상태도 업데이트
      setSelectedCharacterIdState(resolveCharacterId(settings.characterId));
      setSelectedVoiceState(settings.voice);

      console.log(
        "🎭 [캐릭터 변경] store 업데이트 완료, 상태 동기화 대기 중...",
      );

      // 다이얼로그 닫기
      closeCharacterDialog();

      // 상태 동기화를 위한 지연 후 완료 콜백 호출
      setTimeout(() => {
        console.log("🎭 [캐릭터 변경] 상태 동기화 완료, 음성 재시작 준비");
        onComplete?.();
      }, 100); // 짧은 지연으로 상태 동기화 보장
    },
    [setCharacterSettings, closeCharacterDialog, resolveCharacterId],
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
