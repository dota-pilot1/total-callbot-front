import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  XMarkIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface ExamResultsFullscreenProps {
  isVisible: boolean;
  examResultText: string;
  onClose: () => void;
}

interface ParsedExamResult {
  total: string;
  level: string;
  improvements: string[];
  englishSentences: string[];
  usefulExpressions: string[];
  individualScores: string[]; // Q1, Q2, Q3 개별 점수
  examQuestions: string[]; // 시험에서 출제된 질문 3개
}

interface ModelAnswer {
  question: string;
  answer: string;
}

export default function ExamResultsFullscreen({
  isVisible,
  examResultText,
  onClose,
}: ExamResultsFullscreenProps) {
  const [modelAnswers, setModelAnswers] = useState<ModelAnswer[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 시험 결과 텍스트 파싱
  const parseExamResult = (text: string): ParsedExamResult => {
    const result: ParsedExamResult = {
      total: "",
      level: "",
      improvements: [],
      englishSentences: [],
      usefulExpressions: [],
      individualScores: ["0", "0", "0"], // 기본값
      examQuestions: [], // 실제 출제된 질문들
    };

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Total 점수 추출 (더 유연한 패턴)
      if (line.includes("Total:") || line.includes("총점:")) {
        const totalMatch = line.match(/(\d+)\/30|(\d+)점/);
        if (totalMatch) {
          result.total = totalMatch[1] || totalMatch[2] + "/30";
        }
      }

      // 개별 점수 추출 (더 유연한 패턴)
      const q1Match = line.match(/(?:Q1|1번|첫\s?번째)[:\s]*(\d+)(?:\/10|점)/i);
      const q2Match = line.match(/(?:Q2|2번|두\s?번째)[:\s]*(\d+)(?:\/10|점)/i);
      const q3Match = line.match(/(?:Q3|3번|세\s?번째)[:\s]*(\d+)(?:\/10|점)/i);

      if (q1Match) result.individualScores[0] = q1Match[1];
      if (q2Match) result.individualScores[1] = q2Match[1];
      if (q3Match) result.individualScores[2] = q3Match[1];

      // 전체 텍스트에서 한번에 점수 추출 시도
      const allScoresMatch = text.match(
        /(?:Q1|1번)[:\s]*(\d+)(?:\/10|점).*?(?:Q2|2번)[:\s]*(\d+)(?:\/10|점).*?(?:Q3|3번)[:\s]*(\d+)(?:\/10|점)/is,
      );
      if (allScoresMatch) {
        result.individualScores = [
          allScoresMatch[1],
          allScoresMatch[2],
          allScoresMatch[3],
        ];
      }

      // Level 추출
      if (line.includes("Level:")) {
        result.level = line.replace("Level:", "").trim();
      }

      // 개선점 추출
      if (line.includes("개선점:")) {
        const improvement = line.replace("개선점:", "").trim();
        if (improvement) {
          result.improvements.push(improvement);
        }
        // 다음 줄들도 개선점일 수 있음
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (
            nextLine.startsWith("-") &&
            !nextLine.includes("공부할") &&
            !nextLine.includes("유용한")
          ) {
            result.improvements.push(nextLine.replace("-", "").trim());
          } else {
            break;
          }
        }
      }

      // 공부할 영어 문장 추출
      if (line.includes("공부할 영어 문장:")) {
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (nextLine.startsWith("-") && !nextLine.includes("유용한")) {
            const sentence = nextLine.replace("-", "").trim();
            if (sentence && !sentence.includes("예:")) {
              result.englishSentences.push(sentence);
            }
          } else if (nextLine.includes("유용한 영어 표현:")) {
            break;
          }
        }
      }

      // 유용한 영어 표현 추출
      if (line.includes("유용한 영어 표현:")) {
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (nextLine.startsWith("-")) {
            const expression = nextLine.replace("-", "").trim();
            if (expression && !expression.includes("예:")) {
              result.usefulExpressions.push(expression);
            }
          } else {
            break;
          }
        }
      }
    }

    return result;
  };

  const parsedResult = parseExamResult(examResultText);

  // 모범 답변 생성 요청
  const generateModelAnswers = async () => {
    if (parsedResult.englishSentences.length === 0) return;

    setIsLoadingAnswers(true);
    try {
      const questions = parsedResult.englishSentences;
      const answers: ModelAnswer[] = [];

      for (const question of questions) {
        // 간단한 모범 답변 생성 (실제로는 API 호출)
        const modelAnswer = await generateSingleAnswer(question);
        answers.push({
          question: question,
          answer: modelAnswer,
        });
      }

      setModelAnswers(answers);
    } catch (error) {
      console.error("모범 답변 생성 실패:", error);
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  // 단일 질문에 대한 모범 답변 생성
  const generateSingleAnswer = async (question: string): Promise<string> => {
    // 실제로는 OpenAI API 호출, 여기서는 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const sampleAnswers: { [key: string]: string } = {
          describe:
            "I would approach this by first analyzing the situation carefully. In my experience, effective communication is key. I would listen to all parties involved and try to understand their perspectives before proposing a solution.",
          hobby:
            "My favorite hobby is reading because it allows me to continuously learn and expand my knowledge. I particularly enjoy fiction books as they help me develop empathy and creativity.",
          project:
            "In my previous role, I worked on a challenging project where I had to coordinate with multiple teams. I learned the importance of clear communication and setting realistic deadlines.",
          strengths:
            "One of my key strengths is my ability to adapt quickly to new situations. I'm also detail-oriented and work well under pressure.",
          weakness:
            "I sometimes focus too much on perfectionism, but I've been working on finding the right balance between quality and efficiency.",
        };

        const lowerQuestion = question.toLowerCase();
        for (const [key, answer] of Object.entries(sampleAnswers)) {
          if (lowerQuestion.includes(key)) {
            resolve(answer);
            return;
          }
        }

        resolve(
          "This is a great question that requires thoughtful consideration. I would approach it by breaking it down into smaller components and addressing each systematically.",
        );
      }, 1000);
    });
  };

  // TTS 기능
  const speakText = (text: string) => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  // 개별 질문 저장 기능
  const saveQuestion = (questionNumber: number, question: string) => {
    const data = {
      timestamp: new Date().toISOString(),
      questionNumber: questionNumber,
      question: question,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question-${questionNumber}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 개별 모범 답변 저장 기능
  const saveModelAnswer = (questionNumber: number, answer: string) => {
    const data = {
      timestamp: new Date().toISOString(),
      questionNumber: questionNumber,
      modelAnswer: answer,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-answer-${questionNumber}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 컴포넌트 마운트 시 모범 답변 생성
  useEffect(() => {
    if (
      isVisible &&
      parsedResult.englishSentences.length > 0 &&
      modelAnswers.length === 0
    ) {
      generateModelAnswers();
    }
  }, [isVisible, parsedResult.englishSentences.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* 풀화면 시험 결과 슬라이드 */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.5,
            }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h1 className="text-xl font-bold text-foreground">시험 결과</h1>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* 결과 내용 */}
            <div className="p-6 space-y-8">
              {/* 점수 테이블 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  시험 점수
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                        <th className="border border-purple-300 px-4 py-3 text-center font-semibold text-purple-700">
                          1번
                        </th>
                        <th className="border border-purple-300 px-4 py-3 text-center font-semibold text-purple-700">
                          2번
                        </th>
                        <th className="border border-purple-300 px-4 py-3 text-center font-semibold text-purple-700">
                          3번
                        </th>
                        <th className="border border-purple-300 px-4 py-3 text-center font-semibold text-purple-700">
                          총점
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-purple-300 px-4 py-4 text-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {parsedResult.individualScores[0]}/10
                          </span>
                        </td>
                        <td className="border border-purple-300 px-4 py-4 text-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {parsedResult.individualScores[1]}/10
                          </span>
                        </td>
                        <td className="border border-purple-300 px-4 py-4 text-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {parsedResult.individualScores[2]}/10
                          </span>
                        </td>
                        <td className="border border-purple-300 px-4 py-4 text-center">
                          <span className="text-3xl font-bold text-purple-700">
                            {parsedResult.total || "0/30"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {parsedResult.level && (
                  <div className="mt-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">레벨</h3>
                    <p className="text-lg font-semibold text-gray-800">
                      {parsedResult.level}
                    </p>
                  </div>
                )}
              </div>

              {/* 개선점 */}
              {parsedResult.improvements.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    개선점
                  </h3>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <ul className="space-y-2">
                      {parsedResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span className="text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 공부할 영어 문장 */}
              {parsedResult.englishSentences.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    공부할 영어 문장
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <ul className="space-y-3">
                      {parsedResult.englishSentences.map((sentence, index) => (
                        <li
                          key={index}
                          className="bg-white rounded-md p-3 shadow-sm"
                        >
                          <span className="text-blue-700 font-medium">
                            {sentence.replace(/['"`]/g, "")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 유용한 영어 표현 */}
              {parsedResult.usefulExpressions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    유용한 영어 표현
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <ul className="space-y-3">
                      {parsedResult.usefulExpressions.map(
                        (expression, index) => (
                          <li
                            key={index}
                            className="bg-white rounded-md p-3 shadow-sm"
                          >
                            <span className="text-green-700 font-medium">
                              {expression.replace(/['"`]/g, "")}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* 모범 답변 섹션 */}
              {parsedResult.englishSentences.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    모범 답변
                  </h3>
                  <div className="space-y-6">
                    {parsedResult.englishSentences.map((question, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
                      >
                        {/* 질문 */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-semibold text-indigo-700">
                              질문 {index + 1}
                            </h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => speakText(question)}
                                className="flex items-center px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                                듣기
                              </button>
                              <button
                                onClick={() =>
                                  saveQuestion(index + 1, question)
                                }
                                className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                저장
                              </button>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <p className="text-gray-800 font-medium">
                              {question.replace(/['"`]/g, "")}
                            </p>
                          </div>
                        </div>

                        {/* 모범 답변 */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-md font-semibold text-purple-700">
                              모범 답변
                            </h5>
                            {modelAnswers[index] && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    speakText(modelAnswers[index].answer)
                                  }
                                  className="flex items-center px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                                  듣기
                                </button>
                                <button
                                  onClick={() =>
                                    saveModelAnswer(
                                      index + 1,
                                      modelAnswers[index].answer,
                                    )
                                  }
                                  className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                  저장
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-purple-100">
                            {isLoadingAnswers ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <span className="ml-2 text-gray-600">
                                  모범 답변 생성 중...
                                </span>
                              </div>
                            ) : modelAnswers[index] ? (
                              <p className="text-gray-800 leading-relaxed">
                                {modelAnswers[index].answer}
                              </p>
                            ) : (
                              <p className="text-gray-500 italic">
                                모범 답변을 불러올 수 없습니다.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 하단 여백 */}
              <div className="h-8"></div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                시험 결과 닫기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
