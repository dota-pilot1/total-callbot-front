import { useState } from 'react';
import { Button, Dialog, DialogActions } from '../../../components/ui';
import { GPTQuestionService } from '../services/gptService';
import type { QuestionFormData } from '../types';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AIQuestionGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (questionData: QuestionFormData) => void;
  currentCategory?: string;
  currentDifficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export default function AIQuestionGeneratorDialog({
  isOpen,
  onClose,
  onGenerated,
  currentCategory = 'listening',
  currentDifficulty = 'BEGINNER'
}: AIQuestionGeneratorDialogProps) {
  const [options, setOptions] = useState({
    topic: '',
    difficulty: currentDifficulty,
    category: currentCategory,
    language: 'korean' as const
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const difficulties = [
    { id: 'BEGINNER', name: '초급', description: '기초적인 단어와 문장' },
    { id: 'INTERMEDIATE', name: '중급', description: '일반적인 대화 수준' },
    { id: 'ADVANCED', name: '고급', description: '복잡한 문장과 어휘' }
  ] as const;

  const categories = [
    { id: 'listening', name: '듣기', description: 'TTS 음성이 포함된 문제' },
    { id: 'vocabulary', name: '단어', description: '어휘력 테스트' },
    { id: 'grammar', name: '문법', description: '문법 규칙 확인' },
    { id: 'conversation', name: '회화', description: '일상 대화 표현' }
  ];

  const topicSuggestions = [
    '일상 대화', '날씨', '음식', '여행', '쇼핑',
    '업무', '취미', '가족', '친구', '학교',
    '건강', '운동', '기술', '뉴스', '문화'
  ];

  const handleGenerate = async () => {
    if (!options.topic.trim()) {
      alert('주제를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      const generatedQuestion = await GPTQuestionService.generateQuestion(options);

      // 생성된 데이터를 폼 데이터 형식으로 변환
      const formData: QuestionFormData = {
        audioText: generatedQuestion.audioText,
        questionContent: generatedQuestion.questionContent,
        optionA: generatedQuestion.optionA,
        optionB: generatedQuestion.optionB,
        optionC: generatedQuestion.optionC,
        optionD: generatedQuestion.optionD,
        correctAnswer: generatedQuestion.correctAnswer,
        category: options.category,
        difficulty: options.difficulty,
        explanation: generatedQuestion.explanation
      };

      onGenerated(formData);
      onClose();

    } catch (error) {
      console.error('문제 생성 오류:', error);
      alert('문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSuggestionClick = (topic: string) => {
    setOptions({ ...options, topic });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI 문제 생성"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* 헤더 설명 */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">AI가 자동으로 문제를 생성합니다</h3>
          </div>
          <p className="text-sm text-blue-700">
            원하는 주제와 난이도를 선택하면 GPT가 영어 문제를 자동으로 만들어드립니다.
          </p>
        </div>

        {/* 주제 입력 */}
        <div>
          <label className="block text-sm font-medium mb-2">주제 *</label>
          <input
            type="text"
            value={options.topic}
            onChange={(e) => setOptions({ ...options, topic: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="예: 날씨, 음식, 여행, 업무 등"
          />

          {/* 주제 제안 버튼들 */}
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">주제 제안:</p>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicSuggestionClick(topic)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full border text-gray-700 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 난이도 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">난이도</label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.id}
                type="button"
                onClick={() => setOptions({ ...options, difficulty: difficulty.id })}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  options.difficulty === difficulty.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="font-medium text-sm">{difficulty.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {difficulty.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">카테고리</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setOptions({ ...options, category: category.id })}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  options.category === category.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="font-medium text-sm">{category.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {category.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 생성 예상 시간 안내 */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">💡 알림:</span> AI 문제 생성에는 5-10초 정도 소요됩니다.
          </p>
        </div>
      </div>

      <DialogActions>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isGenerating}
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !options.topic.trim()}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>문제 생성</span>
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
