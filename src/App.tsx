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
import ChatbotSelector from "./pages/ChatbotSelector";
import CallbotChat from "./pages/CallbotChat";
import MobileChat from "./pages/MobileChat";
import MobileExam from "./pages/MobileExam";
import Practice from "./pages/Practice";
import Chat from "./pages/Chat";
import ChatRoomList from "./pages/ChatRoomList";

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
      <Route path="/exam" element={<MobileExam />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chat/rooms" element={<ChatRoomList />} />
      <Route path="/chat/room/:roomId" element={<Chat />} />
      <Route path="/chat/bot/:botId" element={<CallbotChat />} />
      <Route path="/chat/:chatRoomId" element={<CallbotChat />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ProtectedApp />
    </Router>
  );
}

export default App;
