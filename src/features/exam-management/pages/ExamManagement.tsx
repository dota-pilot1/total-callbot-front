import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button, Dialog, DialogActions } from "../../../components/ui";
import type { ExamTest, ExamFormData } from "../types";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function ExamManagement() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [tests, setTests] = useState<ExamTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<ExamTest | null>(null);

  const [formData, setFormData] = useState<ExamFormData>({
    title: "",
    description: "",
    difficulty: "BEGINNER",
    timeLimit: 30,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const difficulties = [
    { id: "BEGINNER", name: "초급", color: "green" },
    { id: "INTERMEDIATE", name: "중급", color: "yellow" },
    { id: "ADVANCED", name: "고급", color: "red" },
  ] as const;

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      // TODO: API 연동 - 현재는 mock 데이터
      const mockTests: ExamTest[] = [
        {
          id: 1,
          title: "영어 듣기 기초",
          description: "기본적인 영어 듣기 능력을 평가하는 시험입니다.",
          difficulty: "BEGINNER",
          questionCount: 10,
          timeLimit: 30,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          title: "비즈니스 영어",
          description: "업무 환경에서 사용되는 영어 표현을 다루는 시험입니다.",
          difficulty: "INTERMEDIATE",
          questionCount: 15,
          timeLimit: 45,
          isActive: true,
          createdAt: "2024-01-02T00:00:00Z",
        },
      ];
      setTests(mockTests);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = () => {
    setEditingTest(null);
    setFormData({
      title: "",
      description: "",
      difficulty: "BEGINNER",
      timeLimit: 30,
      isActive: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditTest = (test: ExamTest) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      timeLimit: test.timeLimit,
      isActive: test.isActive,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm("정말로 이 시험을 삭제하시겠습니까?")) return;

    try {
      // TODO: API 연동
      setTests(tests.filter((t) => t.id !== testId));
    } catch (error) {
      console.error("Failed to delete test:", error);
    }
  };

  const handleManageQuestions = (testId: number) => {
    navigate(`/exam-management/${testId}/questions`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "시험 제목을 입력해주세요.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "시험 설명을 입력해주세요.";
    }
    if (formData.timeLimit <= 0) {
      newErrors.timeLimit = "제한 시간은 1분 이상이어야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // TODO: API 연동
      console.log("Submit form data:", formData);
      setShowModal(false);
      await fetchTests();
    } catch (error) {
      console.error("Failed to save test:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const difficultyData = difficulties.find((d) => d.id === difficulty);
    return difficultyData?.color || "gray";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-1"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>뒤로</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">시험 관리</h1>
                <p className="text-sm text-muted-foreground">
                  총 {tests.length}개의 시험
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleAddTest}
                size="sm"
                className="flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>시험 추가</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="로그아웃"
                aria-label="로그아웃"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="sr-only">로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 시험 목록 */}
        {tests.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">시험이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 시험을 만들어보세요.
            </p>
            <Button
              onClick={handleAddTest}
              className="inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>시험 추가</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-card rounded-lg border p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{test.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(test.difficulty)}-100 text-${getDifficultyColor(test.difficulty)}-800`}
                      >
                        {
                          difficulties.find((d) => d.id === test.difficulty)
                            ?.name
                        }
                      </span>
                      {!test.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          비활성
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {test.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>문제 {test.questionCount}개</span>
                      <span>제한시간 {test.timeLimit}분</span>
                      <span>
                        {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageQuestions(test.id)}
                      className="flex items-center space-x-1"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                      <span>문제 관리</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTest(test)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTest(test.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 시험 추가/수정 모달 */}
        <Dialog
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTest ? "시험 수정" : "새 시험 추가"}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 시험 제목 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  시험 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.title ? "border-destructive" : "border-border"
                  }`}
                  placeholder="시험 제목을 입력하세요"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* 시험 설명 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  시험 설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none ${
                    errors.description ? "border-destructive" : "border-border"
                  }`}
                  placeholder="시험에 대한 설명을 입력하세요"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* 난이도와 제한시간 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    난이도 *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.id} value={difficulty.id}>
                        {difficulty.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    제한시간(분) *
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                      errors.timeLimit ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.timeLimit && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.timeLimit}
                    </p>
                  )}
                </div>
              </div>

              {/* 활성화 여부 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  시험 활성화
                </label>
              </div>
            </div>

            <DialogActions>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                취소
              </Button>
              <Button type="submit" size="sm">
                {editingTest ? "수정" : "추가"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
