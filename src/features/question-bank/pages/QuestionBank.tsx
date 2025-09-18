import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface Question {
  id: number;
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
  orderIndex: number;
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

interface QuestionFormData {
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const { logout, getUser } = useAuthStore();
  const user = getUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<QuestionFormData>({
    ttsText: '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'beginner',
  });
  const [errors, setErrors] = useState<Partial<QuestionFormData>>({});

  const categories = [
    { id: 'vocabulary', name: '단어', icon: <BookOpenIcon className="h-5 w-5" />, color: 'blue' },
    { id: 'grammar', name: '문법', icon: <AcademicCapIcon className="h-5 w-5" />, color: 'green' },
    { id: 'listening', name: '듣기', icon: <PlayIcon className="h-5 w-5" />, color: 'purple' },
    { id: 'reading', name: '읽기', icon: <ClipboardDocumentListIcon className="h-5 w-5" />, color: 'orange' },
  ];

  const difficulties = [
    { id: 'beginner', name: '초급', color: 'green' },
    { id: 'intermediate', name: '중급', color: 'yellow' },
    { id: 'advanced', name: '고급', color: 'red' },
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, selectedCategory, selectedDifficulty, searchQuery]);

  const fetchQuestions = async () => {
    try {
      // TODO: API 연동 - 현재는 mock 데이터
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
          category: 'listening',
          difficulty: 'beginner',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          ttsText: "",
          questionText: "Choose the correct past tense of 'go':",
          option1: "goed",
          option2: "went",
          option3: "gone",
          option4: "going",
          correctAnswer: 2,
          orderIndex: 2,
          category: 'grammar',
          difficulty: 'beginner',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];
      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.ttsText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      ttsText: '',
      questionText: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 1,
      category: 'vocabulary',
      difficulty: 'beginner',
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
    if (!confirm('정말로 이 문제를 삭제하시겠습니까?')) return;

    try {
      // TODO: API 연동
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<QuestionFormData> = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = '문제 내용을 입력해주세요.';
    }
    if (!formData.option1.trim()) {
      newErrors.option1 = '선택지 1을 입력해주세요.';
    }
    if (!formData.option2.trim()) {
      newErrors.option2 = '선택지 2를 입력해주세요.';
    }
    if (!formData.option3.trim()) {
      newErrors.option3 = '선택지 3을 입력해주세요.';
    }
    if (!formData.option4.trim()) {
      newErrors.option4 = '선택지 4를 입력해주세요.';
    }

    if (formData.category === 'listening' && !formData.ttsText.trim()) {
      newErrors.ttsText = '듣기 문제는 TTS 텍스트를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // TODO: API 연동
      console.log('Submit form data:', formData);
      setShowModal(false);
      await fetchQuestions();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleTTSPreview = () => {
    if (!formData.ttsText.trim()) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(formData.ttsText);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.color || 'gray';
  };

  const getDifficultyColor = (difficulty: string) => {
    const difficultyData = difficulties.find(d => d.id === difficulty);
    return difficultyData?.color || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>뒤로</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">문제 은행</h1>
                <p className="text-gray-600">
                  안녕하세요, {user?.name}님! 총 {filteredQuestions.length}개의 문제가 있습니다.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </Button>
              <Button
                onClick={handleAddQuestion}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>문제 추가</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="문제 내용 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* 난이도 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                ))}
              </select>
            </div>

            {/* 통계 */}
            <div className="flex items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredQuestions.length}</div>
                <div className="text-sm text-gray-600">문제 수</div>
              </div>
            </div>
          </div>
        </div>

        {/* 문제 목록 */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">문제가 없습니다</h3>
            <p className="text-gray-600 mb-6">새로운 문제를 추가해보세요.</p>
            <Button onClick={handleAddQuestion} className="inline-flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>문제 추가</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        문제 {index + 1}
                      </span>
                      <span className={`bg-${getCategoryColor(question.category)}-100 text-${getCategoryColor(question.category)}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                        {categories.find(c => c.id === question.category)?.name}
                      </span>
                      <span className={`bg-${getDifficultyColor(question.difficulty)}-100 text-${getDifficultyColor(question.difficulty)}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                        {difficulties.find(d => d.id === question.difficulty)?.name}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        정답: {question.correctAnswer}번
                      </span>
                    </div>

                    <div className="space-y-3">
                      {question.ttsText && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">TTS 텍스트</h4>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{question.ttsText}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">문제</h4>
                        <p className="text-gray-900">{question.questionText}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(num => (
                          <div key={num} className={`p-3 rounded-lg ${question.correctAnswer === num ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <span className="text-sm font-medium text-gray-700">{num}. </span>
                            <span className="text-gray-900">{question[`option${num}` as keyof Question] as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    {question.ttsText && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(question.ttsText);
                            utterance.lang = 'en-US';
                            utterance.rate = 0.8;
                            window.speechSynthesis.speak(utterance);
                          }
                        }}
                        className="flex items-center space-x-1"
                      >
                        <PlayIcon className="h-4 w-4" />
                        <span>재생</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                      className="flex items-center space-x-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>수정</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>삭제</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 문제 추가/수정 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingQuestion ? '문제 수정' : '새 문제 추가'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 카테고리와 난이도 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">난이도 *</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {difficulties.map(difficulty => (
                          <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* TTS 텍스트 (듣기 문제일 때만) */}
                  {formData.category === 'listening' && (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <label className="block text-sm font-medium text-gray-700">TTS 텍스트 *</label>
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
                        onChange={(e) => setFormData({ ...formData, ttsText: e.target.value })}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          errors.ttsText ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="학생이 들을 영어 텍스트를 입력하세요."
                      />
                      {errors.ttsText && <p className="mt-1 text-sm text-red-600">{errors.ttsText}</p>}
                    </div>
                  )}

                  {/* 문제 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">문제 내용 *</label>
                    <textarea
                      value={formData.questionText}
                      onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors.questionText ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="학생에게 보여줄 문제를 입력하세요."
                    />
                    {errors.questionText && <p className="mt-1 text-sm text-red-600">{errors.questionText}</p>}
                  </div>

                  {/* 선택지 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">선택지 {num} *</label>
                        <input
                          type="text"
                          value={formData[`option${num}` as keyof QuestionFormData] as string}
                          onChange={(e) => setFormData({ ...formData, [`option${num}`]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`option${num}` as keyof QuestionFormData] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder={`선택지 ${num}`}
                        />
                        {errors[`option${num}` as keyof QuestionFormData] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`option${num}` as keyof QuestionFormData]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 정답 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">정답 *</label>
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1번</option>
                      <option value={2}>2번</option>
                      <option value={3}>3번</option>
                      <option value={4}>4번</option>
                    </select>
                  </div>
                </div>

                {/* 모달 버튼 */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit">
                    {editingQuestion ? '수정하기' : '추가하기'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
