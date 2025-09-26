import { apiClient } from "../../../shared/api/client";
import type {
  IntervalReadingTest,
  IntervalReadingSession,
  CreateTestRequest,
  StartSessionRequest,
  UpdateProgressRequest,
  UserStats,
  TestFilters,
} from "../types";

class IntervalReadingApi {
  // Reading Tests
  async getAllTests(): Promise<IntervalReadingTest[]> {
    const response = await apiClient.get('/interval-reading/tests');
    return response.data;
  }

  async getTestsByDifficulty(difficulty: string): Promise<IntervalReadingTest[]> {
    const response = await apiClient.get(`/interval-reading/tests/difficulty/${difficulty}`);
    return response.data;
  }

  async getTestById(testId: number): Promise<IntervalReadingTest> {
    const response = await apiClient.get(`/interval-reading/tests/${testId}`);
    return response.data;
  }

  async searchTests(filters: TestFilters): Promise<{ content: IntervalReadingTest[]; totalPages: number; totalElements: number }> {
    const params = new URLSearchParams();

    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minWords) params.append('minWords', filters.minWords.toString());
    if (filters.maxWords) params.append('maxWords', filters.maxWords.toString());
    if (filters.maxTime) params.append('maxTime', filters.maxTime.toString());
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await apiClient.get(`/interval-reading/tests/search?${params}`);
    return response.data;
  }

  async searchTestsByKeyword(keyword: string): Promise<IntervalReadingTest[]> {
    const response = await apiClient.get(`/interval-reading/tests/keyword/${encodeURIComponent(keyword)}`);
    return response.data;
  }

  async createTest(request: CreateTestRequest): Promise<IntervalReadingTest> {
    const response = await apiClient.post('/interval-reading/tests', request);
    return response.data;
  }

  // Session Management
  async startSession(request: StartSessionRequest): Promise<IntervalReadingSession> {
    const response = await apiClient.post('/interval-reading/sessions', request);
    return response.data;
  }

  async getSession(sessionUuid: string): Promise<IntervalReadingSession> {
    const response = await apiClient.get(`/interval-reading/sessions/${sessionUuid}`);
    return response.data;
  }

  async updateProgress(sessionUuid: string, request: UpdateProgressRequest): Promise<IntervalReadingSession> {
    const response = await apiClient.put(`/interval-reading/sessions/${sessionUuid}/progress`, request);
    return response.data;
  }

  async pauseSession(sessionUuid: string): Promise<IntervalReadingSession> {
    const response = await apiClient.put(`/interval-reading/sessions/${sessionUuid}/pause`);
    return response.data;
  }

  async resumeSession(sessionUuid: string): Promise<IntervalReadingSession> {
    const response = await apiClient.put(`/interval-reading/sessions/${sessionUuid}/resume`);
    return response.data;
  }

  async completeSession(sessionUuid: string): Promise<IntervalReadingSession> {
    const response = await apiClient.put(`/interval-reading/sessions/${sessionUuid}/complete`);
    return response.data;
  }

  async getUserSessions(): Promise<IntervalReadingSession[]> {
    const response = await apiClient.get('/interval-reading/my-sessions');
    return response.data;
  }

  async getActiveUserSessions(): Promise<IntervalReadingSession[]> {
    const response = await apiClient.get('/interval-reading/my-sessions/active');
    return response.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get('/interval-reading/my-stats');
    return response.data;
  }
}

export const intervalReadingApi = new IntervalReadingApi();
