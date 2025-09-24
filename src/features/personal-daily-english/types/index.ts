export interface PersonalConversationScenario {
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
  createdBy: number;
  isPrivate: boolean;
  isCopy: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalScenarioFilters {
  category?: string;
  difficulty?: PersonalConversationScenario["difficulty"];
  keyword?: string;
}

export interface PersonalRandomScenarioRequest {
  category?: string;
  count?: number;
}

export interface AutoGenerateScenarioRequest {
  topic: string;
  difficulty?: PersonalConversationScenario["difficulty"];
  conversationStyle?: PersonalConversationScenario["conversationStyle"];
  targetLanguage?: string;
}

export interface AutoGenerateScenarioResponse {
  category: string;
  title: string;
  description: string;
  systemInstructions: string;
  userRole: string;
  aiRole: string;
  scenarioBackground: string;
  learningGoals: string;
  aiKnowledge: string;
  openingMessage: string;
}
