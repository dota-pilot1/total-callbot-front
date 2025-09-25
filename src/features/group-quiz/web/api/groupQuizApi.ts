import { apiClient } from "@/shared/api/client";
import type { CreateRoomData } from "../components/CreateRoomDialog";

// API 응답 타입 정의
export interface CreateRoomResponse {
  roomCode: string;
  title: string;
  message: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  nickname: string;
}

export interface JoinRoomResponse {
  roomCode: string;
  nickname: string;
  message: string;
}

export interface QuestionResponse {
  id: number;
  questionNumber: number;
  questionText: string;
  questionTextKorean?: string;
  options: string[];
  timeLimit: number;
  points: number;
}

export interface MemberResponse {
  memberId: number;
  nickname: string;
  role: string;
  status: string;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
}

export interface RoomDetailsResponse {
  roomCode: string;
  title: string;
  description?: string;
  status: string;
  maxParticipants: number;
  questionCount: number;
  timePerQuestion: number;
  difficulty: string;
  category: string;
  members: MemberResponse[];
  currentQuestion?: QuestionResponse;
}

export interface RoomSummaryResponse {
  roomCode: string;
  title: string;
  description?: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  questionCount: number;
  timePerQuestion: number;
  difficulty: string;
  category: string;
  createdAt: string;
}

export interface RoomListResponse {
  rooms: RoomSummaryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface SubmitAnswerRequest {
  selectedOption: number;
  responseTimeMs: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pointsEarned: number;
  message: string;
}

export interface GameStartResponse {
  message: string;
  firstQuestion?: QuestionResponse;
}

export interface NextQuestionResponse {
  question?: QuestionResponse;
  message: string;
  gameEnded?: boolean;
}

// API 함수들
export const groupQuizApi = {
  // 방 생성
  createRoom: async (roomData: CreateRoomData): Promise<CreateRoomResponse> => {
    const response = await apiClient.post('/group-quiz/rooms', roomData);
    return response.data;
  },

  // 방 참여
  joinRoom: async (joinData: JoinRoomRequest): Promise<JoinRoomResponse> => {
    const response = await apiClient.post('/group-quiz/rooms/join', joinData);
    return response.data;
  },

  // 방 나가기
  leaveRoom: async (roomCode: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/group-quiz/rooms/${roomCode}/leave`);
    return response.data;
  },

  // 준비 상태 토글
  toggleReady: async (roomCode: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/group-quiz/rooms/${roomCode}/ready`);
    return response.data;
  },

  // 게임 시작
  startGame: async (roomCode: string): Promise<GameStartResponse> => {
    const response = await apiClient.post(`/group-quiz/rooms/${roomCode}/start`);
    return response.data;
  },

  // 답변 제출
  submitAnswer: async (roomCode: string, answerData: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
    const response = await apiClient.post(`/group-quiz/rooms/${roomCode}/answer`, answerData);
    return response.data;
  },

  // 다음 문제 시작
  startNextQuestion: async (roomCode: string): Promise<NextQuestionResponse> => {
    const response = await apiClient.post(`/group-quiz/rooms/${roomCode}/next-question`);
    return response.data;
  },

  // 방 상세 정보 조회
  getRoomDetails: async (roomCode: string): Promise<RoomDetailsResponse> => {
    const response = await apiClient.get(`/group-quiz/rooms/${roomCode}`);
    return response.data;
  },

  // 참여 가능한 방 목록 조회
  getJoinableRooms: async (page = 0, size = 10): Promise<RoomListResponse> => {
    const response = await apiClient.get(`/group-quiz/rooms?page=${page}&size=${size}`);
    return response.data;
  },

  // 내가 호스트인 방 목록 조회
  getMyHostedRooms: async (page = 0, size = 10): Promise<RoomListResponse> => {
    const response = await apiClient.get(`/group-quiz/my-rooms?page=${page}&size=${size}`);
    return response.data;
  },

  // 현재 문제 조회
  getCurrentQuestion: async (roomCode: string): Promise<QuestionResponse> => {
    const response = await apiClient.get(`/group-quiz/rooms/${roomCode}/current-question`);
    return response.data;
  }
};
