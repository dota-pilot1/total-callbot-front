import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";
import {
  ArrowLeftIcon,
  NewspaperIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function News() {
  const navigate = useNavigate();
  const { logout, getUser } = useAuthStore();
  const user = getUser();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const newsCategories = [
    {
      id: "world",
      title: "국제 뉴스",
      description: "전 세계 주요 뉴스와 국제 동향을 확인하세요",
      icon: <GlobeAltIcon className="h-8 w-8" />,
      color: "from-blue-100 to-blue-200",
      borderColor: "border-blue-300",
    },
    {
      id: "business",
      title: "경제 뉴스",
      description: "비즈니스와 경제 관련 최신 소식을 받아보세요",
      icon: <BuildingOfficeIcon className="h-8 w-8" />,
      color: "from-green-100 to-green-200",
      borderColor: "border-green-300",
    },
    {
      id: "technology",
      title: "기술 뉴스",
      description: "IT와 기술 혁신의 최신 트렌드를 살펴보세요",
      icon: <AcademicCapIcon className="h-8 w-8" />,
      color: "from-purple-100 to-purple-200",
      borderColor: "border-purple-300",
    },
    {
      id: "general",
      title: "일반 뉴스",
      description: "사회, 문화, 스포츠 등 다양한 분야의 뉴스를 읽어보세요",
      icon: <NewspaperIcon className="h-8 w-8" />,
      color: "from-orange-100 to-orange-200",
      borderColor: "border-orange-300",
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // TODO: 각 카테고리별 뉴스 목록 페이지로 이동하거나 모달 열기
    console.log(`${categoryId} 뉴스 보기`);
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
                <h1 className="text-2xl font-bold text-gray-900">뉴스 센터</h1>
                <p className="text-gray-600">
                  안녕하세요, {user?.name}님! 오늘의 주요 뉴스를 확인해보세요.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-gray-900"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뉴스 통계 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            오늘의 뉴스 통계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-blue-800">읽은 기사 수</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-green-800">저장한 기사</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-purple-800">즐겨찾는 주제</div>
            </div>
          </div>
        </div>

        {/* 뉴스 카테고리 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            뉴스 카테고리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsCategories.map((category) => (
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

        {/* 최근 읽은 뉴스 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            최근 읽은 뉴스
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">AI 기술의 최신 동향과 전망</span>
              </div>
              <span className="text-sm text-gray-500">2시간 전</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">글로벌 경제 시장 분석</span>
              </div>
              <span className="text-sm text-gray-500">어제</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">국제 정치 동향 리포트</span>
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
                뉴스 기능이 현재 개발 중입니다. 곧 다양한 뉴스 콘텐츠를 제공할
                예정입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
