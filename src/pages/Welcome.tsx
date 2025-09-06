import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">환영합니다!</h1>
              <div className="w-16 h-1 bg-indigo-500 mx-auto"></div>
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              React와 Tailwind CSS로 만든 간단한 웰컴 페이지입니다.
            </p>
            
            <div className="space-y-3">
              <Link 
                to="/login"
                className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                로그인
              </Link>
              <Link
                to="/dashboard"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-200"
              >
                대시보드 보기
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Made with ❤️ using React & Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}