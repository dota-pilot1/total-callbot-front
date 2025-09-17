import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface TestFormData {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timeLimit: number;
}

export function ListeningTestForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    description: '',
    difficulty: 'BEGINNER',
    timeLimit: 30,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TestFormData>>({});

  useEffect(() => {
    if (isEditing) {
      fetchTest();
    }
  }, [id, isEditing]);

  const fetchTest = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/listening-test/tests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const test = await response.json();
        setFormData({
          title: test.title,
          description: test.description,
          difficulty: test.difficulty,
          timeLimit: test.timeLimit,
        });
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TestFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = '시험 제목을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '시험 설명을 입력해주세요.';
    }

    if (formData.timeLimit < 1 || formData.timeLimit > 180) {
      newErrors.timeLimit = '제한시간은 1분에서 180분 사이여야 합니다.' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const url = isEditing
        ? `/api/listening-test/tests/${id}`
        : '/api/listening-test/tests';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/admin/listening-tests');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save test:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TestFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? '시험 수정' : '새 시험 만들기'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? '시험 정보를 수정합니다.' : '새로운 듣기 시험을 생성합니다.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8">
            <div className="space-y-6">
              {/* 시험 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  시험 제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: 영어 듣기 기초 평가"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* 시험 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  시험 설명 *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="시험의 목적과 내용을 간단히 설명해주세요."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* 난이도 */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 *
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="BEGINNER">초급</option>
                  <option value="INTERMEDIATE">중급</option>
                  <option value="ADVANCED">고급</option>
                </select>
              </div>

              {/* 제한시간 */}
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  제한시간 (분) *
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  min="1"
                  max="180"
                  value={formData.timeLimit}
                  onChange={(e) => handleChange('timeLimit', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.timeLimit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
                {errors.timeLimit && <p className="mt-1 text-sm text-red-600">{errors.timeLimit}</p>}
                <p className="mt-1 text-sm text-gray-500">1분에서 180분까지 설정 가능합니다.</p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/listening-tests')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isEditing ? '수정하기' : '생성하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
