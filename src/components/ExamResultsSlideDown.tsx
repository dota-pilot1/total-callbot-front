import { useState, useEffect } from "react";
import { XMarkIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

interface ExamResultsSlideDownProps {
  /** 시험 결과 메시지 */
  examResultText: string;
  /** 슬라이드 다운 표시 여부 */
  isVisible: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
}

interface ParsedExamResult {
  scores: Array<{ question: string; score: string }>;
  total: string;
  level: string;
  keyPhrases: string[];
  references: string[];
}

/**
 * 시험 결과를 파싱하여 구조화된 데이터로 변환
 */
const parseExamResult = (text: string): ParsedExamResult | null => {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const result: ParsedExamResult = {
      scores: [],
      total: '',
      level: '',
      keyPhrases: [],
      references: []
    };

    let currentSection = '';

    for (const line of lines) {
      // 점수 파싱 (Q1 X/10, Q2 X/10 형태)
      if (line.includes('Scores by question:') || line.match(/Q\d+\s+\d+\/10/)) {
        const scoreMatches = line.match(/Q(\d+)\s+(\d+\/10)/g);
        if (scoreMatches) {
          scoreMatches.forEach(match => {
            const [, questionNum, score] = match.match(/Q(\d+)\s+(\d+\/10)/) || [];
            if (questionNum && score) {
              result.scores.push({ question: `Q${questionNum}`, score });
            }
          });
        }
      }

      // 총점 파싱
      if (line.includes('Total:')) {
        const totalMatch = line.match(/Total:\s*(\d+\/\d+)/);
        if (totalMatch) {
          result.total = totalMatch[1];
        }
      }

      // 레벨 파싱
      if (line.includes('Level:') && line.includes('Level ')) {
        const levelMatch = line.match(/Level (\d+)/);
        if (levelMatch) {
          result.level = `Level ${levelMatch[1]}`;
          // 레벨 설명도 포함
          const descMatch = line.match(/Level \d+[:\s]*(.+)/);
          if (descMatch) {
            result.level += `: ${descMatch[1]}`;
          }
        }
      }

      // 섹션 감지
      if (line.includes('Key phrases to study')) {
        currentSection = 'phrases';
        continue;
      }
      if (line.includes('References:')) {
        currentSection = 'references';
        continue;
      }

      // 리스트 아이템 파싱
      if (line.startsWith('- ')) {
        const item = line.substring(2).trim();
        if (currentSection === 'phrases') {
          result.keyPhrases.push(item);
        } else if (currentSection === 'references') {
          result.references.push(item);
        }
      }
    }

    // 유효한 결과인지 확인
    if (result.total || result.level || result.scores.length > 0) {
      return result;
    }

    return null;
  } catch (error) {
    console.error('Exam result parsing error:', error);
    return null;
  }
};

export default function ExamResultsSlideDown({
  examResultText,
  isVisible,
  onClose
}: ExamResultsSlideDownProps) {
  const [parsedResult, setParsedResult] = useState<ParsedExamResult | null>(null);

  useEffect(() => {
    if (isVisible && examResultText) {
      const parsed = parseExamResult(examResultText);
      setParsedResult(parsed);
    }
  }, [isVisible, examResultText]);

  if (!isVisible || !parsedResult) {
    return null;
  }

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* 슬라이드 다운 컨테이너 */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-white shadow-lg border-b border-gray-200 mx-4 mt-4 rounded-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-6 w-6" />
                <h2 className="text-lg font-bold">시험 결과</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 결과 내용 */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* 점수 섹션 */}
            {parsedResult.scores.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">문제별 점수</h3>
                <div className="grid grid-cols-5 gap-2">
                  {parsedResult.scores.map((score, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600">{score.question}</div>
                        <div className="text-sm font-bold text-blue-600">{score.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 총점과 레벨 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {parsedResult.total && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">총점</div>
                  <div className="text-xl font-bold text-green-600">{parsedResult.total}</div>
                </div>
              )}

              {parsedResult.level && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">수준</div>
                  <div className="text-sm font-semibold text-purple-600">{parsedResult.level}</div>
                </div>
              )}
            </div>

            {/* 학습 키워드 */}
            {parsedResult.keyPhrases.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">학습 키워드</h3>
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="space-y-1">
                    {parsedResult.keyPhrases.map((phrase, index) => (
                      <div key={index} className="text-sm text-amber-800">
                        • {phrase}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 참고 자료 */}
            {parsedResult.references.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">참고 자료</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-1">
                    {parsedResult.references.map((reference, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {reference}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 원본 텍스트가 파싱되지 않은 경우 폴백 */}
            {parsedResult.scores.length === 0 && !parsedResult.total && !parsedResult.level && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">시험 결과</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {examResultText}
                </div>
              </div>
            )}
          </div>

          {/* 하단 액션 */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
