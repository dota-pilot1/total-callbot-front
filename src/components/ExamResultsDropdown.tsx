import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

interface ExamResultsDropdownProps {
  /** 시험 결과 메시지 */
  examResultText: string;
  /** 드롭다운 표시 여부 */
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
        const totalMatch = line.match(/Total:\s*(\d+\/30)/);
        if (totalMatch) {
          result.total = totalMatch[1];
        }
      }

      // 레벨 파싱
      if (line.includes('Level:')) {
        const levelMatch = line.match(/Level:\s*(.+)/);
        if (levelMatch) {
          result.level = levelMatch[1].trim();
        }
      }

      // Key phrases 파싱
      if (line.startsWith('- ') && !result.keyPhrases.length && !result.references.length) {
        result.keyPhrases.push(line.substring(2));
      } else if (line.startsWith('- ') && result.keyPhrases.length > 0) {
        if (line.toLowerCase().includes('http') || line.toLowerCase().includes('reference')) {
          result.references.push(line.substring(2));
        } else {
          result.keyPhrases.push(line.substring(2));
        }
      }
    }

    return result;
  } catch (error) {
    console.error('시험 결과 파싱 실패:', error);
    return null;
  }
};

export default function ExamResultsDropdown({
  examResultText,
  isVisible,
  onClose,
}: ExamResultsDropdownProps) {
  const parsedResult = parseExamResult(examResultText);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* 시험 결과 드롭다운 패널 */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3,
            }}
            className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-500">
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">시험 결과</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* 결과 내용 */}
            <div className="p-4 space-y-4">
              {parsedResult ? (
                <>
                  {/* 점수 섹션 */}
                  {parsedResult.scores.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">문항별 점수</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {parsedResult.scores.map((score, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 text-center border"
                          >
                            <div className="text-sm text-gray-600">{score.question}</div>
                            <div className="text-lg font-bold text-blue-600">{score.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 총점 & 레벨 */}
                  <div className="grid grid-cols-2 gap-4">
                    {parsedResult.total && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">총점</div>
                        <div className="text-2xl font-bold text-green-600">{parsedResult.total}</div>
                      </div>
                    )}

                    {parsedResult.level && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">레벨</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {parsedResult.level}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 학습할 주요 표현 */}
                  {parsedResult.keyPhrases.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        📚 학습할 주요 표현
                      </h4>
                      <ul className="space-y-2">
                        {parsedResult.keyPhrases.map((phrase, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            • {phrase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 참고 자료 */}
                  {parsedResult.references.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        🔗 참고 자료
                      </h4>
                      <ul className="space-y-2">
                        {parsedResult.references.map((ref, index) => (
                          <li key={index} className="text-sm text-blue-700">
                            • {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                // 파싱 실패 시 원본 텍스트 표시
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">시험 결과</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {examResultText}
                  </div>
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-colors"
              >
                확인
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
