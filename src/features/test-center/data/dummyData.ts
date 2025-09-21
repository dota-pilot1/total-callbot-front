import type { ExamStatus, Question, Participant, ChatMessage } from '../types/exam';

// 더미 시험 상태
export const dummyExamStatus: ExamStatus = {
  currentQuestion: 3,
  totalQuestions: 10,
  timeRemaining: '08:45',
  status: 'IN_PROGRESS',
  startedAt: '2024-01-15 14:30:00'
};

// 더미 문제 데이터
export const dummyQuestion: Question = {
  id: 3,
  questionNumber: 3,
  type: 'MULTIPLE_CHOICE',
  category: 'ENGLISH_LISTENING',
  content: "다음 대화를 듣고 여자가 남자에게 제안한 것은 무엇인가요?",
  audioText: "A: I'm really stressed about the presentation tomorrow. B: Why don't you practice with me? I can give you some feedback.",
  options: [
    "발표 연습을 도와주겠다고 제안했다",
    "새로운 발표 주제를 제안했다",
    "발표를 대신해주겠다고 제안했다",
    "발표 자료를 만들어주겠다고 제안했다"
  ],
  correctAnswer: "A",
  difficulty: "INTERMEDIATE"
};

// 더미 참가자 데이터
export const dummyParticipants: Participant[] = [
  { id: 1, name: "김철수", currentScore: 85, progress: 3, status: "ANSWERING", isHost: true },
  { id: 2, name: "이영희", currentScore: 95, progress: 3, status: "COMPLETED", isHost: false },
  { id: 3, name: "박민수", currentScore: 70, progress: 2, status: "THINKING", isHost: false },
  { id: 4, name: "최지원", currentScore: 80, progress: 3, status: "ANSWERING", isHost: false },
  { id: 5, name: "정미래", currentScore: 90, progress: 3, status: "COMPLETED", isHost: false },
];

// 더미 채팅 메시지
export const dummyChatMessages: ChatMessage[] = [
  { id: 1, userName: "이영희", message: "3번 문제 어려웠어요!", timestamp: "14:35", type: "chat" },
  { id: 2, userName: "시스템", message: "박민수님이 2번 문제를 완료했습니다.", timestamp: "14:34", type: "system" },
  { id: 3, userName: "김철수", message: "다들 화이팅!", timestamp: "14:33", type: "chat" },
];
