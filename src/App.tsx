import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import ChatbotSelector from './pages/ChatbotSelector';
import CallbotChat from './pages/CallbotChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route 
            path="/chatbots" 
            element={
              <ProtectedRoute>
                <ChatbotSelector />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:botId" 
            element={
              <ProtectedRoute>
                <CallbotChat />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
