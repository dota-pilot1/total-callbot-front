import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";
import { HeaderAuthControls } from "../../../components/layout/HeaderAuthControls";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  AcademicCapIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Study() {
  const navigate = useNavigate();
  const { getUser } = useAuthStore();
  const user = getUser();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const studyCategories = [
    {
      id: "vocabulary",
      title: "단어 학습",
      description: "영어 단어와 표현을 익혀보세요",
      icon: <BookOpenIcon className="h-8 w-8" />,
      color: "from-blue-100 to-blue-200",
      borderColor: "border-blue-300",
    },
    {
      id: "grammar",
      title: "문법 학습",
      description: "영어 문법 규칙을 체계적으로 학습하세요",
      icon: <AcademicCapIcon className="h-8 w-8" />,
      color: "from-green-100 to-green-200",
      borderColor: "border-green-300",
    },
    {
      id: "practice",
      title: "연습 문제",
      description: "다양한 연습 문제로 실력을 확인하세요",
      icon: <PencilIcon className="h-8 w-8" />,
      color: "from-purple-100 to-purple-200",
      borderColor: "border-purple-300",
    },
    {
      id: "quiz",
      title: "퀴즈",
      description: "재미있는 퀴즈로 학습한 내용을 점검하세요",
      icon: <ClipboardDocumentListIcon className="h-8 w-8" />,
      color: "from-orange-100 to-orange-200",
      borderColor: "border-orange-300",
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // TODO: 각 카테고리별 상세 페이지로 이동하거나 모달 열기
    console.log(`${categoryId} 학습 시작`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
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
                <h1 className="text-2xl font-bold text-gray-900">학습 센터</h1>
                <p className="text-gray-600">
                  안녕하세요, {user?.name}님! 오늘도 열심히 학습해보세요.
                </p>
              </div>
            </div>
            <HeaderAuthControls showProfile={false} showSettings={false} />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 학습 진도 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            학습 진도 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-blue-800">완료한 레슨</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-green-800">정답률</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">7</div>
              <div className="text-sm text-purple-800">연속 학습일</div>
            </div>
          </div>
        </div>

        {/* 학습 카테고리 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            학습 카테고리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`bg-gradient-to-br ${category.color} border-2 ${category.borderColor} rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  selectedCategory === category.id
                    ? "ring-2 ring-blue-400 shadow-lg"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-gray-700 flex-shrink-0">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            최근 학습 활동
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">기초 영문법 - 현재완료</span>
              </div>
              <span className="text-sm text-gray-500">2시간 전</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">비즈니스 영어 단어 퀴즈</span>
              </div>
              <span className="text-sm text-gray-500">어제</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">일상 회화 연습</span>
              </div>
              <span className="text-sm text-gray-500">3일 전</span>
            </div>
          </div>
        </div>

        {/* 임시 개발 중 메시지 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600">🚧</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                개발 진행 중
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                학습 기능이 현재 개발 중입니다. 곧 다양한 학습 콘텐츠를 제공할
                예정입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
