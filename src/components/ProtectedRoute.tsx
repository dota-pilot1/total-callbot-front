import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthed = useAuthStore.getState().isAuthenticated();
    console.log('ProtectedRoute - checking token:', isAuthed);
    
    if (!isAuthed) {
      console.log('No token found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [navigate]);
  
  // 토큰이 있으면 렌더링
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  
  if (!isAuthenticated) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
}
