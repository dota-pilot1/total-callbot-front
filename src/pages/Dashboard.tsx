import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {user?.email}님
              </span>
              <button
                onClick={logout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-200"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">통계 1</h3>
            <p className="text-3xl font-bold text-indigo-600">1,234</p>
            <p className="text-sm text-gray-600">전체 사용자</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">통계 2</h3>
            <p className="text-3xl font-bold text-green-600">5,678</p>
            <p className="text-sm text-gray-600">월간 활성 사용자</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">통계 3</h3>
            <p className="text-3xl font-bold text-purple-600">91.2%</p>
            <p className="text-sm text-gray-600">서비스 가동률</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600">
              여기에 최근 활동 내역이 표시됩니다...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}