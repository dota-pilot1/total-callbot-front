import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CHARACTER_LIST } from "../features/chatbot/character/characters";
import { Button } from "./ui";

export type CharacterOption = { id: string; name: string; emoji: string };
export type ScenarioOption = { id: string; name: string; desc: string };
export type GenderOption = "male" | "female";

// 공통 캐릭터 버튼 컴포넌트
interface CharacterButtonProps {
  character: CharacterOption;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const CharacterButton = ({
  character,
  selected,
  disabled = false,
  onClick,
}: CharacterButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center rounded-lg border transition-colors ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${
      selected
        ? "border-blue-500 bg-blue-50 text-gray-900 ring-1 ring-blue-200"
        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
    }`}
    style={{ width: "64px", height: "64px" }}
    title={disabled ? `${character.name} (구현 예정)` : character.name}
  >
    <div className="mb-1" style={{ fontSize: "22px", lineHeight: "22px" }}>
      {character.emoji}
    </div>
    <div className="text-[9px] leading-tight text-center px-1 truncate w-full">
      {character.name}
    </div>
  </button>
);

interface MobileCharacterDialogProps {
  open: boolean;
  onClose: () => void;
  value?: {
    characterId: string;
    scenarioId?: string;
    gender: GenderOption;
    voice?: "verse" | "alloy" | "sage";
  };
  onConfirm: (v: {
    characterId: string;
    scenarioId?: string;
    gender: GenderOption;
    voice: "verse" | "alloy" | "sage";
  }) => void;
}

// 카테고리별 캐릭터 분류
const GENERAL_CHARACTERS: CharacterOption[] = CHARACTER_LIST.filter(
  (c) => c.category === "general",
).map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }));

const QUIZ_CHARACTERS: CharacterOption[] = CHARACTER_LIST.filter(
  (c) => c.category === "quiz",
).map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }));

const ROLEPLAY_CHARACTERS: CharacterOption[] = CHARACTER_LIST.filter(
  (c) => c.category === "roleplay",
).map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }));

const NEWS_CHARACTERS: CharacterOption[] = CHARACTER_LIST.filter(
  (c) => c.category === "news",
).map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }));

const ALL_CHARACTERS = [
  ...GENERAL_CHARACTERS,
  ...QUIZ_CHARACTERS,
  ...ROLEPLAY_CHARACTERS,
  ...NEWS_CHARACTERS,
];

// 극적인 장면 5개
const SCENARIOS: ScenarioOption[] = [
  { id: "final_duel", name: "Final duel", desc: "마지막 결전을 앞둔 순간" },
  {
    id: "interrogation",
    name: "Interrogation room",
    desc: "심문실에서 팽팽한 대치",
  },
  { id: "heist", name: "Heist planning", desc: "대담한 작전을 세우는 회의" },
  { id: "chase", name: "Runaway chase", desc: "도심 속 추격전 한가운데" },
  { id: "farewell", name: "Farewell at station", desc: "역에서의 극적인 작별" },
];

export default function MobileCharacterDialog({
  open,
  onClose,
  value,
  onConfirm,
}: MobileCharacterDialogProps) {
  const [characterId, setCharacterId] = useState<string>(
    value?.characterId || ALL_CHARACTERS[0].id,
  );
  const [scenarioId, setScenarioId] = useState<string>(value?.scenarioId || "");
  const [gender, setGender] = useState<GenderOption>(value?.gender || "male");
  const [voice, setVoice] = useState<"verse" | "alloy" | "sage">(
    value?.voice || "verse",
  );

  // 카테고리별 접기/열기 상태
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    quiz: true,
    roleplay: true,
    news: false, // 뉴스는 기본적으로 접어둠 (구현 예정)
  });

  useEffect(() => {
    if (!open) return;
    setCharacterId(value?.characterId || ALL_CHARACTERS[0].id);
    setScenarioId(value?.scenarioId || "");
    setGender(value?.gender || "male");
    setVoice(value?.voice || "verse");
  }, [open]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const confirm = () => {
    onConfirm({ characterId, scenarioId, gender, voice });
    onClose();
  };

  const handleCharacterSelect = (id: string) => {
    setCharacterId(id);
    const meta = CHARACTER_LIST.find((x) => x.id === id);
    if (meta?.voice) setVoice(meta.voice);
    if (meta?.defaultGender) setGender(meta.defaultGender);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="absolute inset-0 bg-white md:rounded-t-xl md:top-auto md:bottom-0 md:h-[90vh] shadow-xl border-t md:border border-gray-200"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="font-semibold text-gray-900">
                캐릭터/상황 설정
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                aria-label="닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-7rem)]">
              {/* 캐릭터 선택 - 카테고리별 */}

              {/* 💬 일반 대화 */}
              <div>
                <button
                  onClick={() => toggleSection("general")}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-2"
                >
                  <span>💬 일반 대화 ({GENERAL_CHARACTERS.length})</span>
                  <span className="text-gray-500">
                    {expandedSections.general ? "▼" : "▶"}
                  </span>
                </button>
                {expandedSections.general && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {GENERAL_CHARACTERS.map((c) => (
                      <CharacterButton
                        key={c.id}
                        character={c}
                        selected={c.id === characterId}
                        onClick={() => handleCharacterSelect(c.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 📚 퀴즈 */}
              <div>
                <button
                  onClick={() => toggleSection("quiz")}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-2"
                >
                  <span>📚 퀴즈 ({QUIZ_CHARACTERS.length})</span>
                  <span className="text-gray-500">
                    {expandedSections.quiz ? "▼" : "▶"}
                  </span>
                </button>
                {expandedSections.quiz && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {QUIZ_CHARACTERS.map((c) => (
                      <CharacterButton
                        key={c.id}
                        character={c}
                        selected={c.id === characterId}
                        onClick={() => handleCharacterSelect(c.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 🎭 상황극 */}
              <div>
                <button
                  onClick={() => toggleSection("roleplay")}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-2"
                >
                  <span>🎭 상황극 ({ROLEPLAY_CHARACTERS.length})</span>
                  <span className="text-gray-500">
                    {expandedSections.roleplay ? "▼" : "▶"}
                  </span>
                </button>
                {expandedSections.roleplay && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {ROLEPLAY_CHARACTERS.map((c) => (
                      <CharacterButton
                        key={c.id}
                        character={c}
                        selected={c.id === characterId}
                        onClick={() => handleCharacterSelect(c.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 📰 뉴스 (구현 예정) */}
              <div>
                <button
                  onClick={() => toggleSection("news")}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-2"
                >
                  <span>📰 뉴스 (구현 예정) ({NEWS_CHARACTERS.length})</span>
                  <span className="text-gray-500">
                    {expandedSections.news ? "▼" : "▶"}
                  </span>
                </button>
                {expandedSections.news && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {NEWS_CHARACTERS.map((c) => (
                      <CharacterButton
                        key={c.id}
                        character={c}
                        selected={c.id === characterId}
                        disabled={true}
                        onClick={() => handleCharacterSelect(c.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 선택 캐릭터 성격/배경 미리보기 */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  성격/배경
                </div>
                <div className="text-xs text-gray-600 whitespace-pre-wrap">
                  {(() => {
                    const sel = CHARACTER_LIST.find(
                      (c) => c.id === characterId,
                    );
                    if (!sel) return "캐릭터 정보를 불러오는 중...";
                    return `${sel.personality}\n\n${sel.background}`;
                  })()}
                </div>
              </div>

              {/* 성별 */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  성별
                </div>
                <div className="flex items-center space-x-3">
                  {(["male", "female"] as GenderOption[]).map((g) => (
                    <label
                      key={g}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                        gender === g
                          ? "border-blue-500 bg-blue-50 text-gray-900"
                          : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => setGender(g)}
                      />
                      <span className="text-sm capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 목소리 선택 (3종) */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  목소리
                </div>
                <div className="flex items-center space-x-3">
                  {(["verse", "alloy", "sage"] as const).map((v) => (
                    <label
                      key={v}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                        voice === v
                          ? "border-blue-500 bg-blue-50 text-gray-900"
                          : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="voice"
                        checked={voice === v}
                        onChange={() => setVoice(v)}
                      />
                      <span className="text-sm">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border px-4 py-3 flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline" size="sm">
                취소
              </Button>
              <Button onClick={confirm} size="sm" variant="outline">
                확인
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const CHARACTER_OPTIONS = ALL_CHARACTERS;
export const SCENARIO_OPTIONS = SCENARIOS;
