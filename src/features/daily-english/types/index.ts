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
