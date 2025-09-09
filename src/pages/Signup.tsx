import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { authApi } from '../features/auth/api/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authApi.signup({ email, password, name });
      alert('회원가입이 완료되었습니다. 로그인 해주세요.');
      navigate('/login');
    } catch (e) {
      console.error('Signup failed:', e);
      alert('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
              <div className="w-12 h-1 bg-indigo-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">계정을 생성하고 시작하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full" size="lg">{loading ? '가입 중...' : '가입하기'}</Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-indigo-500 hover:text-indigo-600">← 로그인으로 돌아가기</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

