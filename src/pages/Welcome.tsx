import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">콜봇에 오신것을 환영합니다!</h1>
              <div className="w-16 h-1 bg-indigo-500 mx-auto"></div>
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              AI 기반 음성 통화 시스템으로 더 나은 커뮤니케이션을 경험하세요.
            </p>
            
            <div className="space-y-3">
              <Link to="/login" className="block w-full">
                <Button className="w-full" size="lg">
                  로그인하기
                </Button>
              </Link>
              <Link to="/dashboard" className="block w-full">
                <Button variant="outline" className="w-full" size="lg">
                  대시보드 둘러보기
                </Button>
              </Link>
              <Button variant="ghost" className="w-full" size="sm">
                서비스 소개 보기
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Made with ❤️ using Headless UI & React
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}