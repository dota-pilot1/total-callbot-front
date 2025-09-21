export interface TestRoom {
  id: number;
  name: string;
  description: string;
  capacity: number;
  currentParticipants: number;
  testType: TestType;
  testTypeDisplayName: string;
  isActive: boolean;
  isOccupied: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TestType =
  | "ENGLISH_CONVERSATION"
  | "ENGLISH_LISTENING"
  | "ENGLISH_VOCABULARY"
  | "MATHEMATICS";

export type ParticipantStatus = "connected" | "disconnected";

export interface Participant {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: ParticipantStatus;
  answer: string | null;
  isCorrect: boolean | null;
}

export interface TestCenterStats {
  totalActiveRooms: number;
  totalAvailableRooms: number;
  totalOccupiedRooms: number;
}

export interface TestTypeStats {
  testType: TestType;
  displayName: string;
  count: number;
}

export interface CreateRoomRequest {
  name: string;
  description: string;
  capacity: number;
  testType: string;
}

export interface UpdateRoomRequest {
  name: string;
  description: string;
  capacity: number;
  testType: string;
}
