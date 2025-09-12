# 다음 단계: 추가 훅 분리 계획

## 현재 상황
- ✅ **useChatMessages**: 채팅 메시지 상태 및 텍스트 대화 처리 완료
- ✅ **useVoiceConnection**: OpenAI Realtime API 음성 연결 관리 완료

## 다음 분리 대상 훅들

### 1. 🎯 **useExamMode** (최우선)
**분리할 로직:**
- `examSending` 상태 관리
- `triggerExam` 함수 - 시험 모드 시작 로직
- 시험 주제 랜덤 선택 및 프롬프트 생성
- 음성 연결을 통한 시험 지시 전송

**훅 인터페이스:**
```typescript
interface UseExamModeOptions {
  voiceConnection?: VoiceConnection;
  onAddAssistantMessage: (message: string) => void;
}

interface UseExamModeReturn {
  examSending: boolean;
  triggerExam: () => Promise<void>;
}
```

**장점:**
- 시험 기능이 독립적이고 명확한 도메인
- 재사용 가능한 시험 로직
- MobileChat.tsx에서 ~50줄 코드 제거 가능

---

### 2. 🔗 **useConnectionState** (중간 우선순위)
**분리할 로직:**
- `isConnected`, `isConnecting` 상태
- `ensureConnectedAndReady` 함수
- 채팅방 생성/참여 로직 (`chatApi` 연동)
- 연결 상태에 따른 UI 상태 관리

**훅 인터페이스:**
```typescript
interface UseConnectionStateOptions {
  chatbotId: string;
  chatbotName: string;
}

interface UseConnectionStateReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectToChatRoom: () => Promise<void>;
  disconnect: () => void;
  ensureConnected: () => Promise<void>;
}
```

**장점:**
- 연결 상태 로직의 중앙집중화
- 에러 처리 개선 가능
- 다른 컴포넌트에서 재사용 가능

---

### 3. ⚙️ **useAudioSettings** (중간 우선순위)
**분리할 로직:**
- 모든 오디오 설정 상태들:
  - `speechLang`, `echoCancellation`, `noiseSuppression`
  - `autoGainControl`, `coalesceDelayMs`, `responseDelayMs`
  - `debugEvents`
- 설정 값들의 기본값 관리
- 설정 변경 시 검증 로직

**훅 인터페이스:**
```typescript
interface AudioSettings {
  speechLang: "ko" | "en";
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  coalesceDelayMs: number;
  responseDelayMs: number;
  debugEvents: boolean;
}

interface UseAudioSettingsReturn {
  settings: AudioSettings;
  updateSetting: <K extends keyof AudioSettings>(
    key: K, 
    value: AudioSettings[K]
  ) => void;
  resetToDefaults: () => void;
}
```

**장점:**
- 설정 관리의 체계화
- 타입 안전성 향상
- 설정 값 검증 및 기본값 관리 개선

---

### 4. 👤 **useCharacterSelection** (낮은 우선순위)
**분리할 로직:**
- `selectedCharacterId`, `selectedVoice` 상태
- 캐릭터 변경 시 기본 음성 동기화
- CHARACTER_PRESETS와의 연동

**장점:**
- 캐릭터 선택 로직 분리
- zustand store와 local state 조화

---

### 5. 🎨 **useUIState** (낮은 우선순위)
**분리할 로직:**
- UI 다이얼로그 상태들:
  - `settingsOpen`, `translationOpen`, `characterDialogOpen`
  - `translationText`
- 다이얼로그 열기/닫기 핸들러들

**장점:**
- UI 상태 관리 중앙집중화
- 모달/다이얼로그 상태 패턴 통일

---

## 권장 진행 순서

1. **useExamMode** ← 🎯 **다음 작업**
   - 독립적인 기능으로 분리하기 쉬움
   - 명확한 도메인 경계
   - 즉시 효과를 볼 수 있는 리팩토링

2. **useConnectionState**
   - 핵심 기능이지만 복잡함
   - 신중한 설계 필요

3. **useAudioSettings**
   - 설정 관리 개선
   - 타입 안전성 향상

4. **useCharacterSelection**, **useUIState**
   - 상대적으로 우선순위가 낮음
   - 코드 정리 차원에서 진행

## 예상 효과
- **MobileChat.tsx**: ~550줄 → ~300줄 (45% 감소)
- **재사용성**: 각 훅을 다른 컴포넌트에서 활용 가능
- **테스트 용이성**: 독립적인 훅 단위 테스트 가능
- **유지보수성**: 관심사 분리로 코드 이해도 향상