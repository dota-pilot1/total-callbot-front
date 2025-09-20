import { useAuthStore } from "../../auth";

export interface ArchivedExamQuestion {
  id: number;
  question: string;
  questionKorean?: string;
  userAnswer?: string;
  modelFeedback?: string;
  score?: number;
  examCharacterId?: string;
  difficultyLevel?: string;
  topicCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveArchivedQuestionRequest {
  question: string;
  questionKorean?: string;
  userAnswer?: string;
  modelFeedback?: string;
  score?: number;
  examCharacterId?: string;
  difficultyLevel?: string;
  topicCategory?: string;
}

export interface SaveArchivedQuestionResponse {
  id: number;
  message: string;
}

export interface ArchivedQuestionListResponse {
  items: ArchivedExamQuestion[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ExamStatsResponse {
  averageScore: number;
  recentAverageScore: number;
  totalQuestions: number;
}

export interface ReviewQuestionsResponse {
  questions: ArchivedExamQuestion[];
}

class ExamArchiveApi {
  private getApiBaseUrl(): string {
    return window.location.hostname === "localhost"
      ? "/api"
      : "https://api.total-callbot.cloud/api";
  }

  private getAuthToken(): string {
    const token = useAuthStore.getState().getAccessToken();
    if (!token) throw new Error("No access token found");
    return token;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.getApiBaseUrl()}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  // 시험 문제 아카이브 저장
  async saveArchivedQuestion(data: SaveArchivedQuestionRequest): Promise<SaveArchivedQuestionResponse> {
    return this.makeRequest<SaveArchivedQuestionResponse>("/exam/archive/save", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 아카이브된 시험 문제 목록 조회
  async getArchivedQuestions(
    page: number = 0,
    size: number = 20,
    filters?: {
      difficulty?: string;
      topic?: string;
      character?: string;
    }
  ): Promise<ArchivedQuestionListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters?.difficulty) params.append("difficulty", filters.difficulty);
    if (filters?.topic) params.append("topic", filters.topic);
    if (filters?.character) params.append("character", filters.character);

    return this.makeRequest<ArchivedQuestionListResponse>(`/exam/archive/list?${params}`);
  }

  // 통계 조회
  async getStats(): Promise<ExamStatsResponse> {
    return this.makeRequest<ExamStatsResponse>("/exam/archive/stats");
  }

  // 낮은 점수 문제들 (복습용)
  async getLowScoreQuestions(threshold: number = 6): Promise<ReviewQuestionsResponse> {
    return this.makeRequest<ReviewQuestionsResponse>(
      `/exam/archive/review/low-score?threshold=${threshold}`
    );
  }

  // 랜덤 복습 문제들
  async getRandomQuestions(limit: number = 5): Promise<ReviewQuestionsResponse> {
    return this.makeRequest<ReviewQuestionsResponse>(
      `/exam/archive/review/random?limit=${limit}`
    );
  }

  // 문제 삭제
  async deleteArchivedQuestion(id: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/exam/archive/${id}`, {
      method: "DELETE",
    });
  }

  // 메시지에서 문제와 해석 파싱
  parseQuestionFromMessage(message: string): { question: string; questionKorean?: string } {
    const koPattern = /(\[KO\]|\[ko\])/i;
    const match = message.search(koPattern);

    if (match === -1) {
      return { question: message };
    }

    const question = message.substring(0, match).trim();
    const questionKorean = message.substring(match).replace(koPattern, '').trim();

    return { question, questionKorean };
  }

  // 시험 메시지에서 점수 및 피드백 파싱
  parseExamResult(message: string): { score?: number; feedback?: string } {
    const scoreMatch = message.match(/(\d+)\/10|점수[:\s]*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : undefined;

    // 한줄평이나 피드백 추출
    const feedbackPatterns = [
      /한줄평[:\s]*(.*?)(?:\n|$)/,
      /피드백[:\s]*(.*?)(?:\n|$)/,
      /평가[:\s]*(.*?)(?:\n|$)/
    ];

    let feedback: string | undefined;
    for (const pattern of feedbackPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        feedback = match[1].trim();
        break;
      }
    }

    return { score, feedback: feedback || message };
  }
}

export const examArchiveApi = new ExamArchiveApi();
