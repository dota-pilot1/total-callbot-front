import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CHARACTER_LIST } from "../features/chatbot/character/characters";

export type CharacterOption = { id: string; name: string; emoji: string };
export type ScenarioOption = { id: string; name: string; desc: string };
export type GenderOption = "male" | "female";

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

// 캐릭터 9개 (동화 3, 영화 3, 유명 인사 3)
const CHARACTERS: CharacterOption[] = CHARACTER_LIST.map((c) => ({
  id: c.id,
  name: c.name,
  emoji: c.emoji,
}));

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
    value?.characterId || CHARACTERS[0].id,
  );
  const [scenarioId, setScenarioId] = useState<string>(value?.scenarioId || "");
  const [gender, setGender] = useState<GenderOption>(value?.gender || "male");
  const [voice, setVoice] = useState<"verse" | "alloy" | "sage">(
    value?.voice || "verse",
  );

  useEffect(() => {
    if (!open) return;
    setCharacterId(value?.characterId || CHARACTERS[0].id);
    setScenarioId(value?.scenarioId || "");
    setGender(value?.gender || "male");
    setVoice(value?.voice || "verse");
  }, [open]);

  const confirm = () => {
    onConfirm({ characterId, scenarioId, gender, voice });
    onClose();
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
            className="absolute inset-0 bg-white md:rounded-t-xl md:top-auto md:bottom-0 md:h-[90vh] shadow-xl"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">캐릭터/상황 설정</div>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-7rem)]">
              {/* 캐릭터 선택 */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  캐릭터
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {CHARACTERS.map((c) => {
                    const selected = c.id === characterId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCharacterId(c.id);
                          const meta = CHARACTER_LIST.find(
                            (x) => x.id === c.id,
                          );
                          if (meta?.voice) setVoice(meta.voice);
                          if (meta?.defaultGender)
                            setGender(meta.defaultGender);
                        }}
                        className={`flex flex-col items-center justify-center rounded-md border py-3 ${selected ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-300 bg-gray-50 text-gray-700"}`}
                        style={{ aspectRatio: "1 / 1" }}
                        title={c.name}
                      >
                        <div className="text-xl mb-1">{c.emoji}</div>
                        <div className="text-[10px] leading-tight text-center px-1 truncate">
                          {c.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded border ${gender === g ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}
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
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded border ${voice === v ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}
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

            <div className="border-t px-4 py-3 flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white"
              >
                취소
              </button>
              <button
                onClick={confirm}
                className="px-4 py-2 text-sm rounded bg-indigo-600 text-white"
              >
                확인
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const CHARACTER_OPTIONS = CHARACTERS;
export const SCENARIO_OPTIONS = SCENARIOS;
