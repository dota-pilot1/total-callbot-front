// Admin related types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  lastLoginAt: string;
  createdAt: string;
}

// Question Bank types
export interface Question {
  id: number;
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionFormData {
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
}

// Listening Test Admin types
export interface ListeningTest {
  id: number;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  questionCount: number;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningTestFormData {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  questionCount: number;
  timeLimit: number;
  isActive: boolean;
}

// Admin Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalTests: number;
  totalQuestions: number;
  totalSessions: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: 'USER_SIGNUP' | 'TEST_CREATED' | 'TEST_COMPLETED' | 'QUESTION_ADDED';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors<T> {
  [K in keyof T]?: string;
}
