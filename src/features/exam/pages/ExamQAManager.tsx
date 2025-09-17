import { useState, useEffect } from "react";
import { examArchiveApi, type ArchivedExamQuestion } from "../api/examArchive";
import { useToast } from "../../../components/ui/Toast";
import { Button } from "../../../components/ui";
import {
  TrashIcon,
  FunnelIcon,
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function ExamQAManager() {
  const [qaList, setQAList] = useState<ArchivedExamQuestion[]>([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    recentAverageScore: 0,
    totalQuestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    difficulty: "",
    topic: "",
    character: "",
  });
  const [reviewQuestions, setReviewQuestions] = useState<
    ArchivedExamQuestion[]
  >([]);
  const [showReview, setShowReview] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadQAList();
    loadStats();
  }, [page, filters]);

  const loadQAList = async () => {
    try {
      setLoading(true);
      const filterObj = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== ""),
      );
      const response = await examArchiveApi.getArchivedQuestions(
        page,
        20,
        filterObj,
      );
      setQAList(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to load Q&A list:", error);
      showToast("목록을 불러오는데 실패했습니다", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await examArchiveApi.getStats();
      setStats(response);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadReviewQuestions = async (type: "low-score" | "random") => {
    try {
      const response =
        type === "low-score"
          ? await examArchiveApi.getLowScoreQuestions(6)
          : await examArchiveApi.getRandomQuestions(5);
      setReviewQuestions(response.questions);
      setShowReview(true);
    } catch (error) {
      console.error("Failed to load review questions:", error);
      showToast("복습 문제를 불러오는데 실패했습니다", "error", 3000);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await examArchiveApi.deleteArchivedQuestion(id);
      showToast("삭제되었습니다", "success", 3000);
      loadQAList();
      loadStats();
    } catch (error) {
      console.error("Failed to delete question:", error);
      showToast("삭제에 실패했습니다", "error", 3000);
    }
  };

  const formatScore = (score?: number) => {
    if (score === undefined || score === null) return "미채점";
    return `${score}/10`;
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-gray-500";
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            시험 문제 관리
          </h1>

          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-600">전체 평균 점수</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {stats.averageScore.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AcademicCapIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-green-600">최근 7일 평균</p>
                  <p className="text-2xl font-bold text-green-800">
                    {stats.recentAverageScore.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-purple-600">총 문제 수</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {stats.totalQuestions}개
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => loadReviewQuestions("low-score")}
              variant="outline"
              size="sm"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            >
              낮은 점수 복습 (6점 이하)
            </Button>
            <Button
              onClick={() => loadReviewQuestions("random")}
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              랜덤 복습 (5문제)
            </Button>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <FunnelIcon className="h-5 w-5 text-gray-500" />

            <select
              value={filters.difficulty}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, difficulty: e.target.value }));
                setPage(0);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">모든 난이도</option>
              <option value="BEGINNER">초급</option>
              <option value="INTERMEDIATE">중급</option>
              <option value="ADVANCED">고급</option>
            </select>

            <select
              value={filters.topic}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, topic: e.target.value }));
                setPage(0);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">모든 주제</option>
              <option value="DAILY_CONVERSATION">일상대화</option>
              <option value="BUSINESS">비즈니스</option>
              <option value="TRAVEL">여행</option>
              <option value="ACADEMIC">학술</option>
              <option value="JOB_INTERVIEW">면접</option>
            </select>

            <Button
              onClick={() => {
                setFilters({ difficulty: "", topic: "", character: "" });
                setPage(0);
              }}
              variant="outline"
              size="sm"
            >
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 복습 모달 */}
        {showReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">복습 문제</h2>
                  <Button
                    onClick={() => setShowReview(false)}
                    variant="outline"
                    size="sm"
                  >
                    닫기
                  </Button>
                </div>
                <div className="space-y-4">
                  {reviewQuestions.map((qa) => (
                    <div key={qa.id} className="border rounded-lg p-4">
                      <div className="mb-2">
                        <p className="font-medium text-gray-900">
                          {qa.question}
                        </p>
                        {qa.questionKorean && (
                          <p className="text-sm text-gray-600 mt-1">
                            해석: {qa.questionKorean}
                          </p>
                        )}
                      </div>
                      {qa.userAnswer && (
                        <div className="mb-2">
                          <p className="text-sm text-blue-700">
                            내 답변: {qa.userAnswer}
                          </p>
                        </div>
                      )}
                      {qa.modelFeedback && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-700">
                            피드백: {qa.modelFeedback}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {new Date(qa.createdAt).toLocaleDateString()}
                        </span>
                        <span className={getScoreColor(qa.score)}>
                          {formatScore(qa.score)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Q&A 목록 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              저장된 문제 ({qaList.length}개)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : qaList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              저장된 문제가 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {qaList.map((qa) => (
                <div key={qa.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="mb-2">
                        <p className="font-medium text-gray-900">
                          {qa.question}
                        </p>
                        {qa.questionKorean && (
                          <p className="text-sm text-gray-600 mt-1">
                            해석: {qa.questionKorean}
                          </p>
                        )}
                      </div>

                      {qa.userAnswer && (
                        <div className="mb-2">
                          <p className="text-sm text-blue-700">
                            내 답변: {qa.userAnswer}
                          </p>
                        </div>
                      )}

                      {qa.modelFeedback && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-700">
                            피드백: {qa.modelFeedback}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {new Date(qa.createdAt).toLocaleDateString()}
                        </span>
                        {qa.difficultyLevel && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {qa.difficultyLevel}
                          </span>
                        )}
                        {qa.topicCategory && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {qa.topicCategory}
                          </span>
                        )}
                        <span className={getScoreColor(qa.score)}>
                          {formatScore(qa.score)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => deleteQuestion(qa.id)}
                      variant="outline"
                      size="sm"
                      className="ml-4 text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-center gap-2">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                variant="outline"
                size="sm"
              >
                이전
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                variant="outline"
                size="sm"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
