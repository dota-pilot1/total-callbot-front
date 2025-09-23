export interface StudySession {
  id: string;
  title: string;
  category: StudyCategory;
  description: string;
  progress: number; // 0-100
  totalTime: number; // 분 단위
  completedAt?: Date;
  createdAt: Date;
  tags: string[];
}

export type StudyCategory =
  | 'english'
  | 'math'
  | 'conversation'
  | 'listening'
  | 'grammar'
  | 'vocabulary';

export interface StudyStats {
  totalSessions: number;
  totalTime: number; // 분 단위
  averageScore: number;
  streakDays: number;
  completedToday: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string; // '시간', '문제', '점수' 등
  deadline?: Date;
  isCompleted: boolean;
}
