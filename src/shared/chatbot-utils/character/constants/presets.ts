// 캐릭터/목소리 프리셋 (목소리만 선택 가능)
export const CHARACTER_PRESETS = [
  {
    id: "buddy",
    name: "버디",
    emoji: "🤖",
    color: "from-indigo-500 to-purple-600",
    defaultVoice: "verse",
  },
  {
    id: "sage",
    name: "세이지",
    emoji: "🧠",
    color: "from-emerald-500 to-teal-600",
    defaultVoice: "sage",
  },
  {
    id: "spark",
    name: "스파크",
    emoji: "⚡️",
    color: "from-amber-500 to-orange-600",
    defaultVoice: "alloy",
  },
] as const;

// 사용 가능한 음성 옵션들
export const VOICE_OPTIONS = ["verse", "alloy", "sage"] as const;

// 타입 정의
export type CharacterPreset = typeof CHARACTER_PRESETS[number];
export type VoiceOption = typeof VOICE_OPTIONS[number];
