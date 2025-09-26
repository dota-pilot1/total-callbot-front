import { apiClient } from "../../../shared/api/client";
import type {
  IntervalListeningTest,
  IntervalListeningQuestion,
  IntervalListeningSession,
  StartSessionRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  SessionResult,
  CreateTestSetRequest,
  AddQuestionRequest,
  TestFilters,
} from "../types";

class IntervalListeningApi {
  // Listening Tests
  async getAllTests(): Promise<IntervalListeningTest[]> {
    const response = await apiClient.get("/interval-listening/tests");
    return response.data;
  }

  async getTestsByDifficulty(
    difficulty: string,
  ): Promise<IntervalListeningTest[]> {
    const response = await apiClient.get(
      `/interval-listening/tests/difficulty/${difficulty}`,
    );
    return response.data;
  }

  async getTestById(testId: number): Promise<IntervalListeningTest> {
    const response = await apiClient.get(`/interval-listening/tests/${testId}`);
    return response.data;
  }

  async searchTests(filters: TestFilters): Promise<IntervalListeningTest[]> {
    const params: Record<string, string | number> = {};

    if (filters.difficulty) {
      params.difficulty = filters.difficulty;
    }
    if (filters.page !== undefined) {
      params.page = filters.page;
    }
    if (filters.size !== undefined) {
      params.size = filters.size;
    }

    const response = await apiClient.get("/interval-listening/tests/search", {
      params,
    });

    return response.data;
  }

  async searchTestsByKeyword(keyword: string): Promise<IntervalListeningTest[]> {
    const response = await apiClient.get(
      `/interval-listening/tests/keyword/${encodeURIComponent(keyword)}`,
    );
    return response.data;
  }

  async getQuestionsByTestSet(
    testSetId: number,
  ): Promise<IntervalListeningQuestion[]> {
    const response = await apiClient.get(
      `/interval-listening/tests/${testSetId}/questions`,
    );
    return response.data;
  }

  // Session Management
  async startSession(
    request: StartSessionRequest,
  ): Promise<{ sessionUuid: string; testSetId: number; message: string }> {
    const response = await apiClient.post(
      "/interval-listening/sessions/start",
      request,
    );
    return response.data;
  }

  async getCurrentQuestion(
    sessionUuid: string,
  ): Promise<IntervalListeningQuestion> {
    const response = await apiClient.get(
      `/interval-listening/sessions/${sessionUuid}/current-question`,
    );
    return response.data;
  }

  async submitAnswer(
    sessionUuid: string,
    request: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post(
      `/interval-listening/sessions/${sessionUuid}/submit-answer`,
      request,
    );
    return response.data;
  }

  async getSessionResult(sessionUuid: string): Promise<SessionResult> {
    const response = await apiClient.get(
      `/interval-listening/sessions/${sessionUuid}/result`,
    );
    return response.data;
  }

  async getUserSessions(): Promise<IntervalListeningSession[]> {
    const response = await apiClient.get("/interval-listening/my-sessions");
    return response.data;
  }

  async getSession(sessionUuid: string): Promise<IntervalListeningSession> {
    const response = await apiClient.get(
      `/interval-listening/sessions/${sessionUuid}`,
    );
    return response.data;
  }

  async getCompletedSessions(): Promise<IntervalListeningSession[]> {
    const response = await apiClient.get(
      "/interval-listening/my-completed-sessions",
    );
    return response.data;
  }

  async getActiveSessions(): Promise<IntervalListeningSession[]> {
    const response = await apiClient.get(
      "/interval-listening/my-sessions/active",
    );
    return response.data;
  }

  async getActiveUserSessions(): Promise<IntervalListeningSession[]> {
    return this.getActiveSessions();
  }

  // Test Set Creation
  async createTestSet(
    request: CreateTestSetRequest,
  ): Promise<IntervalListeningTest> {
    const response = await apiClient.post("/interval-listening/tests", request);
    return response.data;
  }

  async createTest(
    request: CreateTestSetRequest,
  ): Promise<IntervalListeningTest> {
    return this.createTestSet(request);
  }

  async addQuestionToTestSet(
    testSetId: number,
    request: AddQuestionRequest,
  ): Promise<IntervalListeningQuestion> {
    const response = await apiClient.post(
      `/interval-listening/tests/${testSetId}/questions`,
      request,
    );
    return response.data;
  }

  async deleteTestSet(testSetId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `/interval-listening/tests/${testSetId}`,
    );
    return response.data;
  }

  // Test Data (Development)
  async generateTestData(): Promise<{ message: string }> {
    const response = await apiClient.post("/interval-listening/init/test-data");
    return response.data;
  }
}

export const intervalListeningApi = new IntervalListeningApi();
