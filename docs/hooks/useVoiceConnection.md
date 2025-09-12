# useVoiceConnection 훅 제작 가이드

## 📝 개요

`useVoiceConnection`은 **OpenAI Realtime API 기반 실시간 AI 음성 대화 엔진**을 커스텀 훅으로 분리하는 작업입니다.

## 🎯 실시간 AI 대화 시스템

이 훅은 단순한 "음성 연결"이 아닌 **챗봇과의 실시간 음성 대화 전체 파이프라인**을 담당합니다:

### 🔄 대화 플로우
```
사용자 음성 → 음성인식 → OpenAI Realtime API → AI 응답 생성 → 음성합성 → 스피커 출력
             ↓                                                    ↓
        채팅창에 표시                                          채팅창에 표시
```

### 💬 실제 동작 예시
1. **사용자**: "안녕하세요" (음성)
   - 실시간 음성인식 → 텍스트 변환 → 채팅창에 추가
2. **AI**: "안녕하세요! 오늘 어떻게 도와드릴까요?" 
   - OpenAI가 맥락 이해 → 답변 생성 → 음성으로 재생 → 채팅창에 추가
3. **연속 대화**: 끊김 없이 자연스러운 대화 지속

### 🎤 핵심 기능
- **WebRTC 기반 실시간 양방향 오디오**
- **OpenAI Realtime API 통합**  
- **캐릭터 페르소나 적용** (역할극 대화)
- **Turn-based 대화 관리** (사용자 발화 중 AI 대기)
- **실시간 상태 표시** (듣는 중/응답 중)

## 🎯 현재 MobileChat.tsx에서 담당하는 역할

### 1. 상태 관리 (7개)
```typescript
const [voiceEnabled, setVoiceEnabled] = useState(false);
const [isRecording, setIsRecording] = useState(false);  
const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);
const [isListening, setIsListening] = useState(false);
const [isResponding, setIsResponding] = useState(false);
const isRespondingRef = useRef(false);
const [selectedVoice, setSelectedVoice] = useState<string>("verse");
const audioRef = useRef<HTMLAudioElement>(null);
```

### 2. 핵심 함수들 (3개)
- **`startVoice()`** - 음성 세션 생성 및 연결 (80줄)
- **`stopVoice()`** - 음성 연결 종료 (6줄)  
- **`buildPersonaInstructions()`** - AI 페르소나 지시사항 생성 (15줄)

### 3. 복잡한 실시간 처리 로직
- 🎤 **마이크 입력 처리**: `onUserTranscript` 콜백
- 🔊 **AI 음성 출력**: `onAssistantText` 콜백
- 📡 **WebRTC 연결**: `connectRealtimeVoice` 설정
- 🎛️ **오디오 제어**: 마이크 on/off, 에코 제거, 노이즈 억제

## 🔧 분리 전략

### Phase 1: 기본 구조 생성
```typescript
// features/chatbot/voice/hooks/useVoiceConnection.ts
export interface UseVoiceConnectionOptions {
  speechLang: 'ko' | 'en';
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  selectedVoice: string;
  personaCharacter: any;
  personaGender: 'male' | 'female';
}

export interface UseVoiceConnectionReturn {
  // 상태들
  voiceEnabled: boolean;
  isRecording: boolean;
  isListening: boolean;
  isResponding: boolean;
  voiceConn: VoiceConnection | null;
  audioRef: RefObject<HTMLAudioElement>;
  
  // 액션들  
  startVoice: () => Promise<void>;
  stopVoice: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
}
```

### Phase 2: 상태 이전
- useState들을 훅 내부로 이동
- useRef들을 훅 내부로 이동
- 의존성 주입을 통한 외부 props 처리

### Phase 3: 함수 이전
- `startVoice` 함수 로직 이전
- `stopVoice` 함수 로직 이전
- `buildPersonaInstructions` 로직 포함

### Phase 4: 이벤트 핸들러 처리
- `onUserTranscript` 콜백을 훅으로 전달
- `onAssistantText` 콜백을 훅으로 전달
- 메시지 업데이트는 외부에서 처리하도록 콜백 제공

## 🚧 주의사항

### 1. 메시지 상태 의존성
```typescript
// 문제: 메시지 상태가 MobileChat에 있음
setMessages((prev) => [...prev, userMessage]);

// 해결: 콜백으로 분리
const useVoiceConnection = ({ onUserMessage, onAssistantMessage }) => {
  // ...
  onUserTranscript: (text, isFinal) => {
    if (isFinal) onUserMessage?.(text);
  }
}
```

### 2. 외부 설정 의존성
- `speechLang`, `echoCancellation` 등은 MobileChat에서 props로 전달
- `selectedVoice`, `personaCharacter` 등도 props로 주입

### 3. 생명주기 관리
- 컴포넌트 언마운트 시 자동 정리 필요
- 메모리 누수 방지를 위한 cleanup 로직

## 📦 기대 효과

### 1. 코드 감소
- MobileChat.tsx에서 **약 100-120줄 감소**
- 음성 관련 로직 완전 분리

### 2. 재사용성
- 다른 챗봇 컴포넌트에서 동일한 음성 기능 사용 가능
- CallbotChat.tsx에서도 활용 가능

### 3. 테스트 용이성
- 음성 로직만 독립적으로 테스트 가능
- Mock 객체를 통한 단위 테스트 작성 용이

### 4. 유지보수성  
- 음성 관련 버그 수정 시 한 곳만 변경
- 새로운 음성 기능 추가 시 훅에만 집중

## 🛠️ 구현 단계

1. **훅 파일 생성**: `features/chatbot/voice/hooks/useVoiceConnection.ts`
2. **인터페이스 정의**: 옵션과 반환 타입 명시
3. **상태 이전**: useState, useRef 들 훅으로 이동
4. **함수 이전**: startVoice, stopVoice 로직 이전
5. **MobileChat 수정**: 훅 사용하도록 변경
6. **테스트**: 기존 기능이 정상 동작하는지 확인

## 📁 파일 구조
```
features/chatbot/voice/
├── api/voice.ts
├── lib/realtime.ts  
├── hooks/
│   └── useVoiceConnection.ts  # 🆕 새로 생성
└── index.ts  # export 추가
```

이 가이드를 따라 구현하면 MobileChat.tsx가 훨씬 간결해지고, 음성 기능의 재사용성이 크게 향상될 것입니다.