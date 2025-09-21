export interface TestRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  maxParticipants: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: 'connected' | 'disconnected';
}

export interface TestSession {
  id: string;
  roomId: string;
  testType: 'listening' | 'conversation' | 'quiz';
  startTime?: string;
  endTime?: string;
  settings: TestSettings;
}

export interface TestSettings {
  timeLimit?: number;
  autoNext?: boolean;
  showResults?: boolean;
}
