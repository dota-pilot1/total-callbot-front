import type {
  ExamStatus,
  Question,
  Participant as ExamParticipant,
  ChatMessage,
} from "../types/exam";

export const dummyExamStatus: ExamStatus = {
  currentQuestion: 2,
  totalQuestions: 10,
  timeRemaining: "08:45",
  status: "IN_PROGRESS",
  startedAt: "14:00",
};

export const dummyQuestion: Question = {
  id: 1,
  questionNumber: 2,
  type: "MULTIPLE_CHOICE",
  category: "ENGLISH_LISTENING",
  content:
    "What is the main idea of the passage about environmental protection?",
  audioText:
    "Today we are going to talk about protecting the environment. Listen carefully and choose the best answer.",
  options: [
    "It describes different types of pollution.",
    "It explains ways individuals can help the environment.",
    "It compares environmental policies between countries.",
    "It argues that environmental protection is too expensive.",
  ],
  correctAnswer: "It explains ways individuals can help the environment.",
  difficulty: "INTERMEDIATE",
};

export const dummyParticipants: ExamParticipant[] = [
  {
    id: 1,
    name: "김영희",
    currentScore: 85,
    progress: 60,
    status: "ANSWERING",
    isHost: true,
    isOnline: true,
  },
  {
    id: 2,
    name: "이철수",
    currentScore: 72,
    progress: 60,
    status: "THINKING",
    isHost: false,
    isOnline: true,
  },
  {
    id: 3,
    name: "박민수",
    currentScore: 95,
    progress: 100,
    status: "COMPLETED",
    isHost: false,
    isOnline: true,
  },
  {
    id: 4,
    name: "최지은",
    currentScore: 50,
    progress: 20,
    status: "WAITING",
    isHost: false,
    isOnline: false,
  },
];

export const dummyChatMessages: ChatMessage[] = [
  {
    id: 1,
    userName: "시스템",
    message: "시험이 곧 시작됩니다. 모두 준비해주세요!",
    timestamp: "13:55",
    type: "system",
  },
  {
    id: 2,
    userName: "김영희",
    message: "모두 화이팅!",
    timestamp: "13:56",
    type: "chat",
  },
];
