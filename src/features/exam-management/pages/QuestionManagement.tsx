import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button, Dialog, DialogActions } from "../../../components/ui";
import type { Question, QuestionFormData } from "../types";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function QuestionManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [examTitle, setExamTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState<QuestionFormData>({
    audioText: "",
    questionContent: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    category: "listening",
    difficulty: "BEGINNER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { id: "vocabulary", name: "단어", color: "blue" },
    { id: "grammar", name: "문법", color: "green" },
    { id: "listening", name: "듣기", color: "purple" },
    { id: "reading", name: "읽기", color: "orange" },
  ];

  const difficulties = [
    { id: "BEGINNER", name: "초급", color: "green" },
    { id: "INTERMEDIATE", name: "중급", color: "yellow" },
    { id: "ADVANCED", name: "고급", color: "red" },
  ] as const;

  useEffect(() => {
    if (id) {
      fetchExamAndQuestions();
    }
  }, [id]);

  const fetchExamAndQuestions = async () => {
    try {
      // TODO: API 연동 - 현재는 mock 데이터
      setExamTitle("영어 듣기 기초");

      const mockQuestions: Question[] = [
        {
          id: 1,
          ttsText: "The weather is nice today.",
          questionText: "What did the speaker say about the weather?",
          option1: "It's nice today",
          option2: "It's bad today",
          option3: "It's cold today",
          option4: "It's hot today",
          correctAnswer: 1,
          orderIndex: 1,
          category: "listening",
          difficulty: "beginner",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          ttsText: "I went to the store yesterday.",
          questionText: "When did the speaker go to the store?",
          option1: "Today",
          option2: "Yesterday",
          option3: "Tomorrow",
          option4: "Last week",
          correctAnswer: 2,
          orderIndex: 2,
          category: "listening",
          difficulty: "beginner",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ];
      setQuestions(mockQuestions);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      ttsText: "",
      questionText: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: 1,
      category: "listening",
      difficulty: "beginner",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      ttsText: question.ttsText,
      questionText: question.questionText,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("정말로 이 문제를 삭제하시겠습니까?")) return;

    try {
      // TODO: API 연동
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = "문제 내용을 입력해주세요.";
    }
    if (!formData.option1.trim()) {
      newErrors.option1 = "선택지 1을 입력해주세요.";
    }
    if (!formData.option2.trim()) {
      newErrors.option2 = "선택지 2를 입력해주세요.";
    }
    if (!formData.option3.trim()) {
      newErrors.option3 = "선택지 3을 입력해주세요.";
    }
    if (!formData.option4.trim()) {
      newErrors.option4 = "선택지 4를 입력해주세요.";
    }

    if (formData.category === "listening" && !formData.ttsText.trim()) {
      newErrors.ttsText = "듣기 문제는 TTS 텍스트를 입력해주세요.";
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
      await fetchExamAndQuestions();
    } catch (error) {
      console.error("Failed to save question:", error);
    }
  };

  const handleTTSPreview = () => {
    if (!formData.ttsText.trim()) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(formData.ttsText);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find((c) => c.id === category);
    return categoryData?.color || "gray";
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
                onClick={() => navigate("/exam-management")}
                className="flex items-center space-x-1"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>시험 목록</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {examTitle} - 문제 관리
                </h1>
                <p className="text-sm text-muted-foreground">
                  총 {questions.length}개의 문제
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleAddQuestion}
                size="sm"
                className="flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>문제 추가</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 문제 목록 */}
        {questions.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">문제가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 문제를 만들어보세요.
            </p>
            <Button
              onClick={handleAddQuestion}
              className="inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>문제 추가</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-card rounded-lg border p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        문제 {index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium bg-${getCategoryColor(question.category)}-100 text-${getCategoryColor(question.category)}-800`}
                      >
                        {
                          categories.find((c) => c.id === question.category)
                            ?.name
                        }
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium bg-${getDifficultyColor(question.difficulty)}-100 text-${getDifficultyColor(question.difficulty)}-800`}
                      >
                        {
                          difficulties.find((d) => d.id === question.difficulty)
                            ?.name
                        }
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        정답: {question.correctAnswer}번
                      </span>
                    </div>

                    <div className="space-y-3">
                      {question.ttsText && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            TTS 텍스트
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {question.ttsText}
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          문제
                        </h4>
                        <p className="text-sm">{question.questionText}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((num) => (
                          <div
                            key={num}
                            className={`p-2 rounded-md text-sm ${question.correctAnswer === num ? "bg-green-50 border border-green-200" : "bg-muted"}`}
                          >
                            <span className="font-medium text-muted-foreground">
                              {num}.{" "}
                            </span>
                            <span>
                              {
                                question[
                                  `option${num}` as keyof Question
                                ] as string
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    {question.ttsText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if ("speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(
                              question.ttsText,
                            );
                            utterance.lang = "en-US";
                            utterance.rate = 0.8;
                            window.speechSynthesis.speak(utterance);
                          }
                        }}
                      >
                        <PlayIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
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

        {/* 문제 추가/수정 모달 */}
        <Dialog
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingQuestion ? "문제 수정" : "새 문제 추가"}
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 카테고리와 난이도 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    카테고리 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>

              {/* TTS 텍스트 (듣기 문제일 때만) */}
              {formData.category === "listening" && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <label className="block text-sm font-medium">
                      TTS 텍스트 *
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTTSPreview}
                      className="flex items-center space-x-1"
                    >
                      <PlayIcon className="h-3 w-3" />
                      <span>미리듣기</span>
                    </Button>
                  </div>
                  <textarea
                    value={formData.ttsText}
                    onChange={(e) =>
                      setFormData({ ...formData, ttsText: e.target.value })
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none ${
                      errors.ttsText ? "border-destructive" : "border-border"
                    }`}
                    placeholder="학생이 들을 영어 텍스트를 입력하세요."
                  />
                  {errors.ttsText && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.ttsText}
                    </p>
                  )}
                </div>
              )}

              {/* 문제 내용 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  문제 내용 *
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionText: e.target.value,
                    })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none ${
                    errors.questionText ? "border-destructive" : "border-border"
                  }`}
                  placeholder="학생에게 보여줄 문제를 입력하세요."
                />
                {errors.questionText && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.questionText}
                  </p>
                )}
              </div>

              {/* 선택지 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium mb-1">
                      선택지 {num} *
                    </label>
                    <input
                      type="text"
                      value={
                        formData[
                          `option${num}` as keyof QuestionFormData
                        ] as string
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`option${num}`]: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                        errors[`option${num}`]
                          ? "border-destructive"
                          : "border-border"
                      }`}
                      placeholder={`선택지 ${num}`}
                    />
                    {errors[`option${num}`] && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors[`option${num}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 정답 */}
              <div>
                <label className="block text-sm font-medium mb-1">정답 *</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      correctAnswer: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value={1}>1번</option>
                  <option value={2}>2번</option>
                  <option value={3}>3번</option>
                  <option value={4}>4번</option>
                </select>
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
                {editingQuestion ? "수정" : "추가"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
