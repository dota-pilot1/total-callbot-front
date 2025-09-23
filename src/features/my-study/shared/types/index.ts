export interface ConversationScenario {
  id: number;
  category: string;
  title: string;
  description: string;
  systemInstructions: string;
  userRole?: string;
  aiRole?: string;
  scenarioBackground?: string;
  learningGoals?: string;
  aiKnowledge?: string;
  aiStarts: boolean;
  openingMessage?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  expectedTurns: number;
  conversationStyle: "FORMAL" | "INFORMAL" | "MIXED";
  modalities: ("TEXT" | "AUDIO")[];
  voice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioFilters {
  category?: string;
  difficulty?: ConversationScenario["difficulty"];
  keyword?: string;
}

export interface RandomScenarioRequest {
  category?: string;
  count?: number;
}

export interface StudySession {
  id: string;
  title: string;
  category: string;
  description: string;
  progress: number;
  totalTime: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string;
  tags?: string[];
}

export interface StudyStats {
  totalSessions: number;
  totalTime: number;
  averageScore: number;
  streakDays: number;
  completedToday: number;
}
