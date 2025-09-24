import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button, Dialog } from "../../../components/ui";
import type { Question, QuestionFormData } from "../types";
import { useQuestionFormStore } from "../../english-listening-test/stores/questionFormStore";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
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

  // Zustand store
  const {
    formData,
    errors,
    activeTab,
    setFormData,
    resetForm,
    setErrors,
    clearErrors,
    setActiveTab,
  } = useQuestionFormStore();

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
          audioText: "The weather is nice today.",
          questionContent: "What did the speaker say about the weather?",
          optionA: "It's nice today",
          optionB: "It's bad today",
          optionC: "It's cold today",
          optionD: "It's hot today",
          correctAnswer: "A",
          questionNumber: 1,
          category: "listening",
          difficulty: "BEGINNER",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          audioText: "I went to the store yesterday.",
          questionContent: "When did the speaker go to the store?",
          optionA: "Today",
          optionB: "Yesterday",
          optionC: "Tomorrow",
          optionD: "Last week",
          correctAnswer: "B",
          questionNumber: 2,
          category: "listening",
          difficulty: "BEGINNER",
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
    resetForm();
    setShowModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      audioText: question.audioText,
      questionContent: question.questionContent,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
    });
    clearErrors();
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

  const validateLocalForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionContent.trim()) {
      newErrors.questionContent = "문제 내용을 입력해주세요.";
    }
    if (!formData.optionA.trim()) {
      newErrors.optionA = "선택지 A를 입력해주세요.";
    }
    if (!formData.optionB.trim()) {
      newErrors.optionB = "선택지 B를 입력해주세요.";
    }
    if (!formData.optionC.trim()) {
      newErrors.optionC = "선택지 C를 입력해주세요.";
    }
    if (!formData.optionD.trim()) {
      newErrors.optionD = "선택지 D를 입력해주세요.";
    }

    if (formData.category === "listening" && !formData.audioText.trim()) {
      newErrors.audioText = "듣기 문제는 TTS 텍스트를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLocalForm()) return;

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
    if (!formData.audioText.trim()) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(formData.audioText);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI 생성은 우측 탭에서 처리

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
                        정답: {question.correctAnswer}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {question.audioText && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            TTS 텍스트
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {question.audioText}
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          문제
                        </h4>
                        <p className="text-sm">{question.questionContent}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((letter, idx) => (
                          <div
                            key={letter}
                            className={`p-2 rounded-md text-sm ${question.correctAnswer === letter ? "bg-green-50 border border-green-200" : "bg-muted"}`}
                          >
                            <span className="font-medium text-muted-foreground">
                              {idx + 1}.{" "}
                            </span>
                            <span>
                              {
                                question[
                                  `option${letter}` as keyof Question
                                ] as string
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    {question.audioText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if ("speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(
                              question.audioText,
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

        {/* 문제 생성 풀다이얼로그 */}
        <Dialog
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingQuestion ? "문제 수정" : "새 문제 추가"}
          maxWidth="full"
        >
          <div className="grid grid-cols-2 gap-8 h-[85vh]">
            {/* 왼쪽: 문제 생성 폼 */}
            <div className="border-r pr-8">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
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
                        value={formData.audioText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            audioText: e.target.value,
                          })
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none ${
                          errors.audioText
                            ? "border-destructive"
                            : "border-border"
                        }`}
                        placeholder="학생이 들을 영어 텍스트를 입력하세요."
                      />
                      {errors.audioText && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.audioText}
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
                      value={formData.questionContent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          questionContent: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none ${
                        errors.questionContent
                          ? "border-destructive"
                          : "border-border"
                      }`}
                      placeholder="학생에게 보여줄 문제를 입력하세요."
                    />
                    {errors.questionContent && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.questionContent}
                      </p>
                    )}
                  </div>

                  {/* 선택지 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["A", "B", "C", "D"].map((letter, idx) => (
                      <div key={letter}>
                        <label className="block text-sm font-medium mb-1">
                          선택지 {idx + 1} *
                        </label>
                        <input
                          type="text"
                          value={
                            formData[
                              `option${letter}` as keyof QuestionFormData
                            ] as string
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [`option${letter}`]: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                            (errors as any)[`option${letter}`]
                              ? "border-destructive"
                              : "border-border"
                          }`}
                          placeholder={`선택지 ${idx + 1}`}
                        />
                        {(errors as any)[`option${letter}`] && (
                          <p className="mt-1 text-xs text-destructive">
                            {(errors as any)[`option${letter}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 정답 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      정답 *
                    </label>
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target
                            .value as QuestionFormData["correctAnswer"],
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      <option value="A">1번 (A)</option>
                      <option value="B">2번 (B)</option>
                      <option value="C">3번 (C)</option>
                      <option value="D">4번 (D)</option>
                    </select>
                  </div>
                </div>

                {/* 하단 버튼 */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-auto">
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
                </div>
              </form>
            </div>

            {/* 오른쪽: 탭 영역 */}
            <div className="flex flex-col h-full">
              {/* 탭 헤더 */}
              <div className="flex border-b mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "list"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  문제 목록
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "ai"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI 생성
                </button>
              </div>

              {/* 탭 컨텐츠 */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "list" ? (
                  <QuestionListTab
                    questions={questions}
                    onEditQuestion={handleEditQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    getCategoryColor={getCategoryColor}
                    getDifficultyColor={getDifficultyColor}
                    categories={categories}
                    difficulties={difficulties}
                  />
                ) : (
                  <AIGeneratorTab />
                )}
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

// 문제 목록 탭 컴포넌트
function QuestionListTab({
  questions,
  onEditQuestion,
  onDeleteQuestion,
  getCategoryColor,
  getDifficultyColor,
  categories,
  difficulties,
}: {
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: number) => void;
  getCategoryColor: (category: string) => string;
  getDifficultyColor: (difficulty: string) => string;
  categories: readonly any[];
  difficulties: readonly any[];
}) {
  return (
    <div className="h-full overflow-y-auto space-y-3">
      {questions.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardDocumentListIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">등록된 문제가 없습니다</p>
        </div>
      ) : (
        questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-card rounded-lg border p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    문제 {index + 1}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${getCategoryColor(question.category)}-100 text-${getCategoryColor(question.category)}-800`}
                  >
                    {categories.find((c) => c.id === question.category)?.name}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(question.difficulty)}-100 text-${getDifficultyColor(question.difficulty)}-800`}
                  >
                    {
                      difficulties.find((d) => d.id === question.difficulty)
                        ?.name
                    }
                  </span>
                </div>

                <div className="space-y-2">
                  {question.audioText && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">
                        TTS
                      </h4>
                      <p className="text-xs bg-muted p-2 rounded">
                        {question.audioText}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      문제
                    </h4>
                    <p className="text-xs">{question.questionContent}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditQuestion(question)}
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteQuestion(question.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// AI 생성 탭 컴포넌트
function AIGeneratorTab() {
  const { applyAIGenerated, setFormData } = useQuestionFormStore();
  const [options, setOptions] = useState({
    topic: "",
    difficulty: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    category: "listening" as "listening" | "vocabulary" | "grammar" | "reading",
    language: "korean" as const,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const difficulties = [
    { id: "BEGINNER", name: "초급", description: "기초적인 단어와 문장" },
    { id: "INTERMEDIATE", name: "중급", description: "일반적인 대화 수준" },
    { id: "ADVANCED", name: "고급", description: "복잡한 문장과 어휘" },
  ] as const;

  const questionCategories = [
    {
      id: "listening",
      name: "듣기",
      description: "TTS 음성이 포함된 듣기 문제",
      icon: "🎧",
      prompt:
        "영어 듣기 문제를 만들어주세요. TTS로 읽을 영어 문장과 그에 대한 한국어 질문을 생성해주세요.",
    },
    {
      id: "vocabulary",
      name: "단어",
      description: "어휘력을 테스트하는 문제",
      icon: "📝",
      prompt:
        "영어 단어/어휘 문제를 만들어주세요. 단어의 뜻이나 사용법을 묻는 문제를 생성해주세요.",
    },
    {
      id: "grammar",
      name: "문법",
      description: "문법 규칙을 확인하는 문제",
      icon: "📚",
      prompt:
        "영어 문법 문제를 만들어주세요. 문법 규칙이나 문장 구조를 묻는 문제를 생성해주세요.",
    },
    {
      id: "reading",
      name: "읽기",
      description: "독해력을 평가하는 문제",
      icon: "📖",
      prompt:
        "영어 독해 문제를 만들어주세요. 짧은 지문을 읽고 내용을 이해했는지 묻는 문제를 생성해주세요.",
    },
  ] as const;

  const topicSuggestions = [
    "일상 대화",
    "날씨",
    "음식",
    "여행",
    "쇼핑",
    "업무",
    "취미",
    "가족",
    "친구",
    "학교",
    "건강",
    "운동",
    "기술",
    "뉴스",
    "문화",
  ];

  const generateCategorySpecificMockData = () => {

    switch (options.category) {
      case "listening":
        return {
          audioText: `Hello, I really enjoy ${options.topic}. It's very interesting and fun.`,
          questionContent: `화자가 ${options.topic}에 대해 어떻게 생각한다고 했나요?`,
          optionA: "재미있고 흥미롭다",
          optionB: "지루하고 어렵다",
          optionC: "별로 좋아하지 않는다",
          optionD: "잘 모르겠다",
          correctAnswer: "A" as const,
          category: options.category,
          difficulty: options.difficulty,
        };

      case "vocabulary":
        return {
          audioText: "", // 단어 문제는 TTS 없음
          questionContent: `다음 중 '${options.topic}'와 관련된 영어 단어의 뜻으로 올바른 것은?`,
          optionA: "정답 의미",
          optionB: "오답 의미 1",
          optionC: "오답 의미 2",
          optionD: "오답 의미 3",
          correctAnswer: "A" as const,
          category: options.category,
          difficulty: options.difficulty,
        };

      case "grammar":
        return {
          audioText: "",
          questionContent: `다음 문장에서 문법적으로 올바른 것은? (주제: ${options.topic})`,
          optionA: "I am interested in " + options.topic,
          optionB: "I am interesting in " + options.topic,
          optionC: "I interesting in " + options.topic,
          optionD: "I am interest in " + options.topic,
          correctAnswer: "A" as const,
          category: options.category,
          difficulty: options.difficulty,
        };

      case "reading":
        return {
          audioText: "",
          questionContent: `다음 글을 읽고 물음에 답하세요.\n\n"${options.topic} is very important in our daily life. Many people enjoy it because it brings happiness."\n\n위 글의 주제는 무엇인가요?`,
          optionA: options.topic,
          optionB: "일상생활",
          optionC: "행복",
          optionD: "만족감",
          correctAnswer: "A" as const,
          category: options.category,
          difficulty: options.difficulty,
        };

      default:
        return {
          audioText: "",
          questionContent: `${options.topic}에 관한 문제입니다.`,
          optionA: "답변 1",
          optionB: "답변 2",
          optionC: "답변 3",
          optionD: "답변 4",
          correctAnswer: "A" as const,
          category: options.category,
          difficulty: options.difficulty,
        };
    }
  };

  const handleGenerate = async () => {
    if (!options.topic.trim()) {
      alert("주제를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      // Mock GPT service call with category-specific prompt
      const selectedCategory = questionCategories.find(
        (c) => c.id === options.category,
      );
      console.log(
        `GPT 프롬프트: ${selectedCategory?.prompt} 주제: ${options.topic}, 난이도: ${options.difficulty}`,
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData = generateCategorySpecificMockData();
      applyAIGenerated(mockData);
      alert("문제가 생성되어 폼에 적용되었습니다!");
    } catch (error) {
      console.error("문제 생성 오류:", error);
      alert("문제 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto space-y-3">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            AI로 듣기 문제 자동 생성
          </span>
        </div>
      </div>

      {/* 주제 입력 */}
      <div>
        <label className="block text-sm font-medium mb-2">주제 *</label>
        <input
          type="text"
          value={options.topic}
          onChange={(e) => setOptions({ ...options, topic: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder="예: 날씨, 음식, 여행, 업무 등"
        />

        {/* 주제 제안 */}
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-2">주제 제안:</p>
          <div className="flex flex-wrap gap-1.5">
            {topicSuggestions.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setOptions({ ...options, topic })}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  options.topic === topic
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background hover:bg-accent text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">카테고리</label>
        <div className="grid grid-cols-2 gap-2">
          {questionCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                console.log("Category clicked:", category.id);
                setOptions({ ...options, category: category.id });
                setFormData({ category: category.id }); // 폼 데이터도 함께 업데이트
              }}
              className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                options.category === category.id
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-gray-300 hover:border-primary/50 bg-white hover:bg-primary/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium text-sm">{category.name}</span>
              </div>
              <div
                className={`text-xs ${
                  options.category === category.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {category.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 난이도 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">난이도</label>
        <div className="grid grid-cols-3 gap-2">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.id}
              type="button"
              onClick={() => {
                setOptions({ ...options, difficulty: difficulty.id });
                setFormData({ difficulty: difficulty.id }); // 폼 데이터도 함께 업데이트
              }}
              className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                options.difficulty === difficulty.id
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-gray-300 hover:border-primary/50 bg-white hover:bg-primary/5"
              }`}
            >
              <div className="font-medium text-sm">{difficulty.name}</div>
              <div
                className={`text-xs mt-1 ${
                  options.difficulty === difficulty.id
                    ? "text-primary/80"
                    : "text-gray-500"
                }`}
              >
                {difficulty.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="pt-4">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !options.topic.trim()}
          className="w-full flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>문제 생성</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
