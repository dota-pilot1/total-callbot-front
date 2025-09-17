export interface Question {
  audioText: string;
  question: string;
  options: string[];
  correct: number;
}

export interface ListeningSettings {
  speechRate: number;
  autoRepeat: boolean;
  showSubtitles: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
