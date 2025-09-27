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
import CallbotChat from "./pages/CallbotChat";
import { CharacterChatbotMobilePage } from "./features/character-chatbot-mobile";
import { CharacterChatbotWebPage } from "./features/character-chatbot-web";
import { RolePlayChat } from "./features/role-play";
import Practice, { IntervalEnglishReadingFeature } from "./pages/Practice";
import { IntervalEnglishReadingMobile } from "./features/interval-english-reading-mobile";
import IntervalEnglishReadingTest from "./features/interval-english-reading-mobile/pages/IntervalEnglishReadingTest";
import { IntervalEnglishReadingWeb } from "./features/interval-english-reading-web";
import Chat from "./pages/Chat";
import ChatRoomList from "./pages/ChatRoomList";
import { Study } from "./features/study";
import { UserManagementPage } from "./features/user-management/ui/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppHeader from "./components/layout/AppHeader";
import { useAuthStore } from "./features/auth";

import { ExamManagement, QuestionManagement } from "./features/exam-management";
import { MemberManagement } from "./features/admin";
import AdminScenarios from "./pages/AdminScenarios";
import { ListeningTest } from "./features/english-listening-test";
import { MathPage } from "./features/math";
import {
  DailyEnglish,
  DailyEnglishExam,
  DailyEnglishConversation,
} from "./features/daily-english";
import {
  PersonalDailyEnglish,
  CreateScenario,
  EditScenario,
} from "./features/personal-daily-english";
import { ConversationScenarioTemplateList } from "./features/english-conversation-senario-template";
import { DailyMath } from "./features/daily-math";
import { GroupQuiz } from "./features/group-quiz/web";
import { GroupQuizMobile } from "./features/group-quiz/mobile";
import { BoardList, BoardDetail, BoardWrite } from "./features/board";

import { TestCenter as TestCenterMobile } from "./features/test-center-mobile";
import { TestCenter as TestCenterWeb } from "./features/test-center-web";
import TestRoomDetailMobile from "./features/test-center-mobile/pages/TestRoomDetail";
import TestRoomDetailWeb from "./features/test-center-web/pages/TestRoomDetail";
import {
  MyStudyRedirect,
  MyStudyWebDashboard,
  MyStudyMobileDashboard,
} from "./features/my-study";
import {
  IntervalEnglishListening as IntervalEnglishListeningMobile,
  IntervalEnglishListeningTest,
  IntervalEnglishListeningResult,
  CreateListeningTest,
} from "./features/interval-english-listening-mobile";
import { IntervalEnglishListening as IntervalEnglishListeningWeb } from "./features/interval-english-listening-web";

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
    "/character-chatbot-mobile",
    "/character-chatbot-web",
    "/role-play",
    "/chat",
    "/quiz",
    "/quiz-list",
    "/exam-management",
    "/admin",
    "/admin-scenarios",
    "/user-admin",
    "/study",
    "/daily-english",
    "/personal-daily-english",
    "/conversation-scenario-templates",
    "/daily-math",
    "/group-quiz",
    "/daily-english-exam",
    "/daily-english-conversation",

    "/test-center-mobile",
    "/test-center-web",
    "/my-study",
    "/my-study-web",
    "/my-study-mobile",
    "/interval-english-reading",
    "/interval-english-reading-mobile",
    "/interval-english-reading-web",
    "/interval-listening",
    "/interval-listening-mobile",
    "/interval-listening-web",
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
        <Route
          path="/character-chatbot-mobile"
          element={<CharacterChatbotMobilePage />}
        />
        <Route
          path="/character-chatbot-web"
          element={<CharacterChatbotWebPage />}
        />
        <Route path="/role-play" element={<RolePlayChat />} />
        <Route path="/interval-english-reading" element={<Practice />} />
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
        <Route path="/admin/scenarios" element={<AdminScenarios />} />

        <Route path="/quiz" element={<ListeningTest />} />
        <Route path="/math" element={<MathPage />} />
        <Route path="/daily-english" element={<DailyEnglish />} />
        <Route
          path="/personal-daily-english"
          element={<PersonalDailyEnglish />}
        />
        <Route
          path="/personal-daily-english/create"
          element={<CreateScenario />}
        />
        <Route
          path="/personal-daily-english/edit/:id"
          element={<EditScenario />}
        />
        <Route
          path="/conversation-scenario-templates"
          element={<ConversationScenarioTemplateList />}
        />
        <Route path="/daily-math" element={<DailyMath />} />
        <Route path="/group-quiz-web" element={<GroupQuiz />} />
        <Route path="/group-quiz-mobile" element={<GroupQuizMobile />} />
        <Route path="/daily-english-exam" element={<DailyEnglishExam />} />
        <Route
          path="/daily-english-conversation"
          element={<DailyEnglishConversation />}
        />
        <Route path="/board" element={<BoardList />} />
        <Route path="/board/:postId" element={<BoardDetail />} />
        <Route path="/board/write" element={<BoardWrite />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/rooms" element={<ChatRoomList />} />
        <Route path="/chat/room/:roomId" element={<Chat />} />
        <Route path="/chat/bot/:botId" element={<CallbotChat />} />
        <Route path="/chat/:chatRoomId" element={<CallbotChat />} />

        <Route path="/test-center-mobile" element={<TestCenterMobile />} />
        <Route
          path="/test-center-mobile/room/:roomId"
          element={<TestRoomDetailMobile />}
        />
        <Route path="/test-center-web" element={<TestCenterWeb />} />
        <Route
          path="/test-center-web/room/:roomId"
          element={<TestRoomDetailWeb />}
        />
        <Route path="/my-study" element={<MyStudyRedirect />} />
        <Route path="/my-study-web" element={<MyStudyWebDashboard />} />
        <Route path="/my-study-mobile" element={<MyStudyMobileDashboard />} />
        <Route
          path="/interval-english-reading"
          element={<IntervalEnglishReadingFeature />}
        />
        <Route
          path="/interval-english-reading-mobile"
          element={<IntervalEnglishReadingMobile />}
        />
        <Route
          path="/interval-english-reading-mobile/test/:testId"
          element={<IntervalEnglishReadingTest />}
        />
        <Route
          path="/interval-english-reading-web"
          element={<IntervalEnglishReadingWeb />}
        />
        <Route
          path="/interval-english-reading-web/test/:testId"
          element={<IntervalEnglishReadingTest />}
        />
        <Route
          path="/interval-listening-mobile"
          element={<IntervalEnglishListeningMobile />}
        />
        <Route
          path="/interval-listening-mobile/test/:testId"
          element={<IntervalEnglishListeningTest />}
        />
        <Route
          path="/interval-listening/test/:testId"
          element={<IntervalEnglishListeningTest />}
        />
        <Route
          path="/interval-listening/create"
          element={<CreateListeningTest />}
        />
        <Route
          path="/interval-listening-mobile/result/:sessionUuid"
          element={<IntervalEnglishListeningResult />}
        />
        <Route
          path="/interval-listening/result/:sessionUuid"
          element={<IntervalEnglishListeningResult />}
        />
        <Route
          path="/interval-listening-web"
          element={<IntervalEnglishListeningWeb />}
        />
        <Route
          path="/interval-listening"
          element={<IntervalEnglishListeningMobile />}
        />
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
