import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ChatbotSelector } from "./features/chatbot";
import CallbotChat from "./pages/CallbotChat";
import MobileChat from "./pages/MobileChat";
import { ExamChat } from "./features/exam";
import Practice from "./pages/Practice";
import Chat from "./pages/Chat";
import ChatRoomList from "./pages/ChatRoomList";
import { Study } from "./features/study";
import { UserManagementPage } from "./features/user-management/ui/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppHeader from "./components/layout/AppHeader";
import { useAuthStore } from "./features/auth";

import { ExamManagement, QuestionManagement } from "./features/exam-management";
import { MemberManagement } from "./features/admin";
import {
  ListeningTest,
  ListeningTestList,
} from "./features/english-listening-test";
import { MathPage } from "./features/math";
import { HistoryPage } from "./features/history";
import { BoardList, BoardDetail, BoardWrite } from "./features/board";
import { TestCenter } from "./features/test-center";

import ErrorBoundary from "./components/ErrorBoundary";

function ProtectedApp() {
  const location = useLocation();

  // 간단한 인증 체크: authStore에서 확인
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  // 로그인 페이지들은 인증 없이 접근 가능
  const publicPaths = ["/", "/login", "/welcome", "/signup"];
  const isPublicPath = publicPaths.includes(location.pathname);
  // 전용 헤더를 사용하는 경로들: 공통 헤더(AppHeader) 숨김
  const dedicatedHeaderPrefixes = [
    "/board",
    "/mobile",
    "/exam",
    "/chat",
    "/chatbots",
    "/quiz",
    "/quiz-list",
    "/exam-management",
    "/admin",
    "/study",
    "/practice",
    "/missions",
    "/test-center",
  ];
  const usesDedicatedHeader = dedicatedHeaderPrefixes.some((p) =>
    location.pathname.startsWith(p),
  );

  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {!isPublicPath && !usesDedicatedHeader && <AppHeader />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/chatbots" element={<ChatbotSelector />} />
        <Route path="/mobile" element={<MobileChat />} />
        <Route path="/exam" element={<ExamChat />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/study" element={<Study />} />
        <Route
          path="/user-admin"
          element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/exam-management" element={<ExamManagement />} />
        <Route
          path="/exam-management/:id/questions"
          element={<QuestionManagement />}
        />
        <Route path="/admin/members" element={<MemberManagement />} />
        <Route path="/quiz-list" element={<ListeningTestList />} />
        <Route path="/quiz" element={<ListeningTest />} />
        <Route path="/math" element={<MathPage />} />
        <Route path="/missions" element={<HistoryPage />} />
        <Route path="/board" element={<BoardList />} />
        <Route path="/board/:postId" element={<BoardDetail />} />
        <Route path="/board/write" element={<BoardWrite />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/rooms" element={<ChatRoomList />} />
        <Route path="/chat/room/:roomId" element={<Chat />} />
        <Route path="/chat/bot/:botId" element={<CallbotChat />} />
        <Route path="/chat/:chatRoomId" element={<CallbotChat />} />
        <Route path="/test-center" element={<TestCenter />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ProtectedApp />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
