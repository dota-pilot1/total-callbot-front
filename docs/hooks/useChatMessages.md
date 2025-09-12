# useChatMessages 훅 제작 가이드

## 📝 개요

`useChatMessages`는 **채팅 메시지 상태 관리 및 텍스트 기반 대화 처리**를 담당하는 커스텀 훅으로 분리하는 작업입니다.

## 💬 채팅 메시지 시스템

이 훅은 **텍스트 기반 채팅 인터페이스의 핵심 기능**을 담당합니다:

### 🔄 메시지 플로우
```
텍스트 입력 → 사용자 메시지 추가 → 음성/API 전송 → AI 응답 수신 → AI 메시지 추가 → 자동 스크롤
```

### 💻 실제 동작 예시
1. **사용자 입력**: 텍스트 박스에 "안녕하세요" 타이핑
2. **전송**: Enter 키 또는 전송 버튼 클릭
3. **메시지 추가**: 채팅창에 사용자 메시지 즉시 표시
4. **AI 응답**: 음성 연결 또는 API를 통해 AI 응답 수신
5. **응답 표시**: 채팅창에 AI 응답 추가 및 자동 스크롤

### 🎯 핵심 기능
- **메시지 배열 관리** (사용자/AI 메시지 구분)
- **실시간 텍스트 입력** (IME 지원, 멀티라인)  
- **자동 스크롤** (새 메시지 시 하단으로 스크롤)
- **AI 제안 기능** (샘플 답변 API 활용)
- **채팅 초기화** (대화 내용 전체 삭제)
- **음성 연결 통합** (텍스트 ↔ 음성 메시지 연동)

## 🎯 현재 MobileChat.tsx에서 담당하는 역할

### 1. 상태 관리 (5개)
```typescript
const [messages, setMessages] = useState<any[]>([]);           // 메시지 배열
const [newMessage, setNewMessage] = useState("");              // 입력 중인 텍스트  
const [isIMEComposing, setIsIMEComposing] = useState(false);   // IME 입력 상태
const [suggestLoading, setSuggestLoading] = useState(false);   // AI 제안 로딩
const messagesEndRef = useRef<HTMLDivElement>(null);           // 자동 스크롤용
```

### 2. 핵심 함수들 (5개)
- **`handleUserMessage()`** - 사용자 메시지를 배열에 추가 (15줄)
- **`handleAssistantMessage()`** - AI 메시지를 배열에 추가 (15줄)  
- **`handleSendMessage()`** - 텍스트 입력을 전송 처리 (45줄)
- **`handleClearChat()`** - 모든 메시지 삭제 (3줄)
- **`handleSuggestReply()`** - AI가 제안하는 답변 생성 (50줄)

### 3. 자동 스크롤 로직 (5줄)
```typescript
useEffect(() => {
  try {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  } catch {}
}, [messages]);
```

### 4. UI 렌더링 연동
- **메시지 목록 렌더링**: `messages.map()` (빈 상태 처리 포함)
- **입력 박스**: `value={newMessage}`, `onChange`, `onKeyDown`
- **전송/제안 버튼**: 로딩 상태 및 비활성화 처리

## 🔧 분리 전략

### Phase 1: 기본 구조 생성
```typescript
// features/chatbot/messaging/hooks/useChatMessages.ts
export interface UseChatMessagesOptions {
  onSendMessage?: (text: string) => void;      // 메시지 전송 시 콜백
  suggestApiCall?: (context: string) => Promise<string>; // AI 제안 API
  responseDelayMs?: number;                     // 시뮬레이션 응답 지연
}

export interface UseChatMessagesReturn {
  // 상태들
  messages: Message[];
  newMessage: string;
  isIMEComposing: boolean;
  suggestLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  
  // 액션들
  setNewMessage: (text: string) => void;
  setIsIMEComposing: (composing: boolean) => void;
  addUserMessage: (text: string) => void;
  addAssistantMessage: (text: string) => void;
  sendMessage: () => void;
  clearChat: () => void;
  suggestReply: () => Promise<void>;
}
```

### Phase 2: 메시지 타입 정의
```typescript
export interface Message {
  id: string;
  sender: 'user' | 'callbot';
  message: string;
  timestamp: string;
  type: 'text';
}
```

### Phase 3: 상태 및 함수 이전
- `useState`들을 훅 내부로 이동
- 메시지 생성 로직 (timestamp, ID 생성)
- AI 제안 API 호출 로직

### Phase 4: 외부 연동 처리  
- `voiceConn` 상태 확인 후 음성 전송
- 시뮬레이션 응답 로직 (responseDelayMs 활용)
- 외부 콜백을 통한 메시지 전송 처리

## 🚧 주의사항

### 1. 음성 연결과의 분리
```typescript
// 문제: 음성 연결 상태가 MobileChat에 있음
if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
  sendVoiceMessage(userMessage.message);
}

// 해결: 콜백으로 분리
const useChatMessages = ({ onSendMessage }) => {
  const sendMessage = () => {
    // ...메시지 처리 후
    onSendMessage?.(messageText);  // 외부에서 음성/API 처리
  }
}
```

### 2. AI 제안 API 의존성
- `examApi.getSampleAnswers()` 호출을 props로 주입
- 캐릭터 정보 등 외부 컨텍스트는 콜백 파라미터로 전달

### 3. 메시지 ID 생성
- `crypto.randomUUID()` vs `Date.now()` vs `prev.length + 1` 일관성
- 중복 방지 및 정렬 순서 보장

## 📦 기대 효과

### 1. 코드 감소
- MobileChat.tsx에서 **약 130-150줄 감소**
- 메시지 관련 로직 완전 분리

### 2. 재사용성  
- CallbotChat.tsx에서도 동일한 채팅 기능 사용 가능
- 다른 채팅 인터페이스에서 즉시 활용

### 3. 테스트 용이성
- 메시지 로직만 독립적으로 테스트 가능
- Mock 데이터로 다양한 시나리오 테스트

### 4. 기능 확장성
- 메시지 타입 확장 (이미지, 파일 등)
- 메시지 검색, 필터링 기능 추가 용이
- 메시지 저장/불러오기 기능 추가

## 🛠️ 구현 단계

1. **훅 파일 생성**: `features/chatbot/messaging/hooks/useChatMessages.ts`
2. **메시지 타입 정의**: Message 인터페이스 및 유틸리티
3. **상태 이전**: useState들 훅으로 이동  
4. **함수 이전**: 메시지 처리 함수들 이전
5. **MobileChat 수정**: 훅 사용하도록 변경
6. **테스트**: 텍스트 입력, 전송, AI 제안 등 기능 확인

## 📁 파일 구조
```
features/chatbot/messaging/
├── api/chat.ts
├── model/chatStore.ts
├── hooks/
│   └── useChatMessages.ts  # 🆕 새로 생성
└── index.ts  # export 추가
```

## 🎯 사용 예시
```typescript
// MobileChat.tsx에서
const {
  messages, newMessage, suggestLoading,
  setNewMessage, sendMessage, clearChat, suggestReply,
  messagesEndRef
} = useChatMessages({
  onSendMessage: (text) => {
    // 음성 연결이 있으면 음성으로, 없으면 시뮬레이션 응답
    if (voiceConn) sendVoiceMessage(text);
    else simulateResponse(text);
  }
});
```

이 가이드를 따라 구현하면 채팅 인터페이스가 완전히 모듈화되어 다른 컴포넌트에서도 쉽게 재사용할 수 있습니다.