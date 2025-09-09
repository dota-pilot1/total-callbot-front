import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth';
import { Button } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('terecal@daum.net');
  const [password, setPassword] = useState('123456');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      navigate('/chatbots');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">콜봇 로그인</h1>
              <div className="w-12 h-1 bg-indigo-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">AI 기반 음성 통화 시스템에 로그인하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? '로그인 중...' : '로그인하기'}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/welcome" className="text-indigo-500 hover:text-indigo-600">← 서비스 소개</Link>
              <Link to="/signup" className="text-indigo-500 hover:text-indigo-600">회원가입 →</Link>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">테스트 계정:</p>
              <p className="text-xs text-gray-500">이메일: terecal@daum.net</p>
              <p className="text-xs text-gray-500">비밀번호: 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
