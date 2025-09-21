import { Button } from '../../../components/ui';
import {
  SpeakerWaveIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import type { Question } from '../types/exam';

interface QuestionSectionProps {
  question: Question;
  selectedAnswer: string;
  isPlaying: boolean;
  onAnswerSelect: (answer: string) => void;
  onPlayAudio: () => void;
  onSubmitAnswer: () => void;
}

export default function QuestionSection({
  question,
  selectedAnswer,
  isPlaying,
  onAnswerSelect,
  onPlayAudio,
  onSubmitAnswer
}: QuestionSectionProps) {

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '초급';
      case 'INTERMEDIATE': return '중급';
      case 'ADVANCED': return '고급';
      default: return '중급';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'ENGLISH_LISTENING': return '영어 듣기';
      case 'ENGLISH_CONVERSATION': return '영어 회화';
      case 'ENGLISH_VOCABULARY': return '영어 단어';
      case 'MATHEMATICS': return '수학';
      default: return '일반';
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Question Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
              문제 {question.questionNumber}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {getDifficultyText(question.difficulty)}
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {getCategoryText(question.category)}
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {question.content}
          </h2>
        </div>

        {/* Audio Section */}
        {question.audioText && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
                오디오 듣기
              </h3>
              <Button
                onClick={onPlayAudio}
                disabled={isPlaying}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="w-4 h-4" />
                    재생 중...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    재생하기
                  </>
                )}
              </Button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-gray-600 mb-2">💬 대화 내용:</div>
              <div className="text-gray-800 italic font-medium">
                "{question.audioText}"
              </div>
            </div>
          </div>
        )}

        {/* Answer Options */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            정답을 선택하세요
          </h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index);
              return (
                <label
                  key={optionKey}
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    selectedAnswer === optionKey
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={optionKey}
                    checked={selectedAnswer === optionKey}
                    onChange={(e) => onAnswerSelect(e.target.value)}
                    className="mt-1 mr-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold text-sm mr-3 min-w-[24px] text-center">
                      {optionKey}
                    </span>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={onSubmitAnswer}
            disabled={!selectedAnswer}
            className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            정답 제출하기
          </Button>
        </div>
      </div>
    </div>
  );
}
