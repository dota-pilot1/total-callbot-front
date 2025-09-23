export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ConversationStyle = 'FORMAL' | 'INFORMAL' | 'MIXED';
export type Modality = 'TEXT' | 'AUDIO';

export interface ScenarioTemplate {
  id: number;
  title: string;
  description?: string;
  category: string;
  difficulty: Difficulty;
  conversationStyle: ConversationStyle;
  expectedTurns: number;
  aiStarts: boolean;
  userRole?: string;
  aiRole?: string;
  systemInstructions: string;
  openingMessage?: string;
  scenarioBackground?: string;
  learningGoals?: string;
  aiKnowledge?: string;
  voice?: string;
  isActive: boolean;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  modalities?: Modality[];
}

export interface CopyScenarioRequest {
  sourceScenarioId: number;
  title?: string;
  category?: string;
  isPrivate?: boolean;
}

export interface ScenarioTemplateFilters {
  category?: string;
  difficulty?: Difficulty;
  conversationStyle?: ConversationStyle;
  isPrivate?: boolean;
  search?: string;
}

export interface PaginatedScenarios {
  scenarios: ScenarioTemplate[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}
