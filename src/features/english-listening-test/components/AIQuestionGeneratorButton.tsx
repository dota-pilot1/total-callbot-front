import { useState } from 'react';
import { Button } from '../../../components/ui';
import { SparklesIcon } from '@heroicons/react/24/outline';
import AIQuestionGeneratorDialog from './AIQuestionGeneratorDialog';

interface QuestionFormData {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  explanation?: string;
}

interface AIQuestionGeneratorButtonProps {
  onGenerated: (questionData: QuestionFormData) => void;
  currentCategory?: string;
  currentDifficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export default function AIQuestionGeneratorButton({
  onGenerated,
  currentCategory = 'listening',
  currentDifficulty = 'BEGINNER',
  size = 'sm',
  variant = 'outline',
  className = ''
}: AIQuestionGeneratorButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleGenerated = (questionData: QuestionFormData) => {
    onGenerated(questionData);
    setShowDialog(false);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        className={`flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 ${className}`}
        title="AI가 자동으로 문제를 생성합니다"
      >
        <SparklesIcon className="h-4 w-4" />
        <span>AI 생성</span>
      </Button>

      <AIQuestionGeneratorDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onGenerated={handleGenerated}
        currentCategory={currentCategory}
        currentDifficulty={currentDifficulty}
      />
    </>
  );
}
