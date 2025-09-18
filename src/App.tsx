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
import { News } from "./features/news";
import { QuestionBank } from "./features/question-bank";
import {
  ListeningTest,
  ListeningTestList,
} from "./features/english-listening-test";
import {
  AdminDashboard,
  ListeningTestAdmin,
  ListeningTestForm,
  QuestionManagement,
} from "./features/admin";
import ErrorBoundary from "./components/ErrorBoundary";

function ProtectedApp() {
  const location = useLocation();

  // 간단한 인증 체크: accessToken이 있는지만 확인
  const isAuthenticated = !!localStorage.getItem("accessToken");

  // 로그인 페이지들은 인증 없이 접근 가능
  const publicPaths = ["/", "/login", "/welcome", "/signup"];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  return (
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
      <Route path="/news" element={<News />} />
      <Route path="/question-bank" element={<QuestionBank />} />
      <Route path="/quiz-list" element={<ListeningTestList />} />
      <Route path="/quiz" element={<ListeningTest />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chat/rooms" element={<ChatRoomList />} />
      <Route path="/chat/room/:roomId" element={<Chat />} />
      <Route path="/chat/bot/:botId" element={<CallbotChat />} />
      <Route path="/chat/:chatRoomId" element={<CallbotChat />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/listening-tests" element={<ListeningTestAdmin />} />
      <Route
        path="/admin/listening-tests/new"
        element={<ListeningTestForm />}
      />
      <Route
        path="/admin/listening-tests/:id/edit"
        element={<ListeningTestForm />}
      />
      <Route
        path="/admin/listening-tests/:id/questions"
        element={<QuestionManagement />}
      />
    </Routes>
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
