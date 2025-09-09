import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth';
import { Button } from '../components/ui';
import Sidebar from '../components/Sidebar';

export default function ChatbotSelector() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 모바일 디바이스 감지 및 리다이렉트
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      navigate('/mobile');
    }
  }, [navigate]);
  
  // localStorage에서 직접 사용자 정보 가져오기
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user:', e);
        return null;
      }
    }
    return null;
  };
  
  const user = getUserFromStorage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <nav className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">콜</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">개발 교육 챗봇</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email || '게스트'}님
              </span>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Logout button clicked');
                  logout();
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 */}
        <div className="flex-shrink-0">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                전문 분야별 AI 개발 멘토
              </h2>
              <p className="text-xl text-gray-600">
                왼쪽 사이드바에서 원하는 전문 분야의 챗봇을 선택하세요. 
                각 분야의 전문가 AI가 실무에서 바로 활용할 수 있는 맞춤형 조언을 제공합니다.
              </p>
            </div>

            {/* 카테고리 소개 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">개발봇 (11개)</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  백엔드, 프론트엔드, DevOps, AI 등 개발 실무의 모든 영역을 커버하는 전문 챗봇들
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">교육봇 (3개)</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  영어 교육, 학원 안내, 면접 준비까지 개발자의 성장을 돕는 교육 전문 봇들
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">문서관리+유틸봇 (4개)</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  프로젝트 관리, 문서화, 일정 관리 등 개발 업무 효율성을 높이는 도구들
                </p>
              </div>
            </div>

            {/* 사용 안내 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                💡 사이드바 사용법
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🎯 초보자 추천 순서</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>1. 프론트엔드 전문가 → 기초 UI 개발</p>
                    <p>2. 백엔드 전문가 → 서버 개발 이해</p>
                    <p>3. SQL 전문가 → 데이터베이스 활용</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🚀 취업 준비자 추천</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>1. 면접 전문가 → 기술 면접 준비</p>
                    <p>2. 영어 교육 전문가 → IT 영어 학습</p>
                    <p>3. 포트폴리오 관련 개발봇 활용</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  💬 각 챗봇은 해당 분야의 전문 지식과 실무 경험을 바탕으로 맞춤형 조언을 제공합니다.
                  <br />궁금한 점이 있으면 언제든지 채팅을 시작해보세요!
                </p>
              </div>
            </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}