import { Link } from 'react-router-dom';

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/admin/listening-tests"
              className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-8 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">듣기 시험 관리</h3>
              <p className="text-gray-600">듣기 시험과 문제를 생성, 수정, 삭제할 수 있습니다.</p>
            </Link>

            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8 opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">성적 관리</h3>
              <p className="text-gray-400">학생들의 시험 결과와 성적을 관리합니다. (준비중)</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8 opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">사용자 관리</h3>
              <p className="text-gray-400">학생과 교사 계정을 관리합니다. (준비중)</p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">시스템 활동 로그는 추후 구현 예정입니다.</span>
                <span className="text-sm text-gray-400">곧 출시</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
