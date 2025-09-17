import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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
}

interface ListeningTest {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
}

interface QuestionFormData {
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
}

export function QuestionManagement() {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<ListeningTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    ttsText: '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 1,
  });
  const [errors, setErrors] = useState<Partial<QuestionFormData>>({});

  useEffect(() => {
    if (id) {
      fetchTestAndQuestions();
    }
  }, [id]);

  const fetchTestAndQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Fetch test info
      const testResponse = await fetch(`/api/listening-test/tests/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (testResponse.ok) {
        const testData = await testResponse.json();
        setTest(testData);
      }

      // Fetch questions
      const questionsResponse = await fetch(`/api/listening-test/tests/${id}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.sort((a: Question, b: Question) => a.orderIndex - b.orderIndex));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
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
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('정말로 이 문제를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/listening-test/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId));
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<QuestionFormData> = {};

    if (!formData.ttsText.trim()) {
      newErrors.ttsText = 'TTS 텍스트를 입력해주세요.';
    }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const url = editingQuestion
        ? `/api/listening-test/questions/${editingQuestion.id}`
        : `/api/listening-test/tests/${id}/questions`;

      const method = editingQuestion ? 'PUT' : 'POST';
      const payload = editingQuestion
        ? formData
        : { ...formData, orderIndex: questions.length + 1 };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTestAndQuestions();
        setShowModal(false);
      }
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/admin/listening-tests" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
                ← 시험 목록으로 돌아가기
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{test?.title} - 문제 관리</h1>
              <p className="text-gray-600 mt-1">총 {questions.length}개의 문제가 등록되어 있습니다.</p>
            </div>
            <button
              onClick={handleAddQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              문제 추가
            </button>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 문제가 없습니다</h3>
              <p className="text-gray-600 mb-6">첫 번째 듣기 문제를 만들어보세요.</p>
              <button
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                문제 추가
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          문제 {index + 1}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          정답: {question.correctAnswer}번
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">TTS 텍스트</h4>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{question.ttsText}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">문제</h4>
                          <p className="text-gray-900">{question.questionText}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-lg ${question.correctAnswer === 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <span className="text-sm font-medium text-gray-700">1. </span>
                            <span className="text-gray-900">{question.option1}</span>
                          </div>
                          <div className={`p-3 rounded-lg ${question.correctAnswer === 2 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <span className="text-sm font-medium text-gray-700">2. </span>
                            <span className="text-gray-900">{question.option2}</span>
                          </div>
                          <div className={`p-3 rounded-lg ${question.correctAnswer === 3 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <span className="text-sm font-medium text-gray-700">3. </span>
                            <span className="text-gray-900">{question.option3}</span>
                          </div>
                          <div className={`p-3 rounded-lg ${question.correctAnswer === 4 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <span className="text-sm font-medium text-gray-700">4. </span>
                            <span className="text-gray-900">{question.option4}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(question.ttsText);
                            utterance.lang = 'en-US';
                            utterance.rate = 0.8;
                            window.speechSynthesis.speak(utterance);
                          }
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 7a1 1 0 011-1h1.586a1 1 0 01.707.293L10 8v8l-1.707 1.707A1 1 0 017.586 18H6a1 1 0 01-1-1V7z" />
                        </svg>
                        재생
                      </button>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Question Form Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingQuestion ? '문제 수정' : '새 문제 추가'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* TTS Text */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <label htmlFor="ttsText" className="block text-sm font-medium text-gray-700">
                          TTS 텍스트 *
                        </label>
                        <button
                          type="button"
                          onClick={handleTTSPreview}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 7a1 1 0 011-1h1.586a1 1 0 01.707.293L10 8v8l-1.707 1.707A1 1 0 017.586 18H6a1 1 0 01-1-1V7z" />
                          </svg>
                          미리듣기
                        </button>
                      </div>
                      <textarea
                        id="ttsText"
                        value={formData.ttsText}
                        onChange={(e) => setFormData({ ...formData, ttsText: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                          errors.ttsText ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="학생이 들을 영어 텍스트를 입력하세요."
                      />
                      {errors.ttsText && <p className="mt-1 text-sm text-red-600">{errors.ttsText}</p>}
                    </div>

                    {/* Question Text */}
                    <div>
                      <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-2">
                        문제 내용 *
                      </label>
                      <textarea
                        id="questionText"
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        rows={2}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                          errors.questionText ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="학생에게 보여줄 문제를 입력하세요."
                      />
                      {errors.questionText && <p className="mt-1 text-sm text-red-600">{errors.questionText}</p>}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num}>
                          <label htmlFor={`option${num}`} className="block text-sm font-medium text-gray-700 mb-2">
                            선택지 {num} *
                          </label>
                          <input
                            type="text"
                            id={`option${num}`}
                            value={formData[`option${num}` as keyof QuestionFormData] as string}
                            onChange={(e) => setFormData({ ...formData, [`option${num}`]: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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

                    {/* Correct Answer */}
                    <div>
                      <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                        정답 *
                      </label>
                      <select
                        id="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value={1}>1번</option>
                        <option value={2}>2번</option>
                        <option value={3}>3번</option>
                        <option value={4}>4번</option>
                      </select>
                    </div>
                  </div>

                  {/* Modal Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                    >
                      {editingQuestion ? '수정하기' : '추가하기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
