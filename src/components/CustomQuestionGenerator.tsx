import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useCharacterStore } from "../features/chatbot/character/store";
import { useAuthStore } from "../features/auth";
import { CHARACTER_LIST } from "../features/chatbot/character/characters";

interface CustomQuestionGeneratorProps {
  open: boolean;
  onClose: () => void;
  onInputText?: (text: string) => void;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  answers: string[];
}

export default function CustomQuestionGenerator({
  open,
  onClose,
  onInputText,
}: CustomQuestionGeneratorProps) {
  const [speaker, setSpeaker] = useState("");
  const [listener, setListener] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [questionCount, setQuestionCount] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [questionStyle, setQuestionStyle] = useState<
    "일상" | "비즈니스" | "학술" | "역할"
  >("역할");

  // 번역 상태 관리
  const [translatedTexts, setTranslatedTexts] = useState<{
    [key: string]: {
      translated: string;
      original: string;
      isTranslated: boolean;
    };
  }>({});

  // 현재 선택된 캐릭터 정보
  const { personaCharacter } = useCharacterStore();
  const currentCharacter = CHARACTER_LIST.find(
    (c) => c.id === personaCharacter.id,
  );

  const generateCharacterQuestions = async () => {
    if (!currentCharacter) {
      alert("캐릭터가 선택되지 않았습니다.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. 토큰 가져오기
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 2. API 키 가져오기
      const apiUrl =
        window.location.hostname === "localhost"
          ? "/api/config/openai-key"
          : "https://api.total-callbot.cloud/api/config/openai-key";

      const keyResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keyResponse.ok) {
        throw new Error(`API 키 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // 3. 스타일에 따른 프롬프트 설정
      const getStylePrompt = () => {
        switch (questionStyle) {
          case "일상":
            return "일상적이고 친근한 대화에서 나올 수 있는";
          case "비즈니스":
            return "비즈니스나 업무 상황에서 유용한 전문적이고 정중한";
          case "학술":
            return "학술적이고 교육적인 내용을 다루는 깊이 있는";
          case "역할":
            return `${currentCharacter.name}의 역할과 캐릭터 설정에 맞는 상황에서 나올 수 있는 적절하고 전문적인`;
          default:
            return "자연스러운";
        }
      };

      // 4. OpenAI API 직접 호출
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `당신은 ${currentCharacter.name}(${currentCharacter.emoji})입니다.

성격: ${currentCharacter.personality}
배경: ${currentCharacter.background}

사용자가 ${currentCharacter.name}에게 물어볼 수 있는 ${getStylePrompt()} 질문 ${questionCount}개를 생성하고, 각 질문에 대한 ${currentCharacter.name}의 특성을 반영한 적절한 답변 2개를 만들어주세요.

${
  questionStyle === "역할"
    ? `[중요] 역할 기반 질문 생성 시 주의사항:
- ${currentCharacter.name}의 직업이나 역할과 관련된 전문적인 질문을 생성하세요
- 개인적이고 사적인 질문(주말계획, 취미, 개인사 등)은 피하세요
- 업무나 서비스와 관련된 적절한 질문을 만드세요
- 고객-서비스 제공자 관계에 맞는 질문을 우선하세요`
    : ""
}

출력 형식:
Q1: [질문]
A1-1: [${currentCharacter.name}의 답변1]
A1-2: [${currentCharacter.name}의 답변2]

Q2: [질문]
A2-1: [${currentCharacter.name}의 답변1]
A2-2: [${currentCharacter.name}의 답변2]

...이런 식으로 Q${questionCount}까지 생성해주세요.`,
              },
            ],
            max_tokens: questionCount * 400,
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsedQuestions = parseGPTResponse(content, questionCount);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error("질문 생성 실패:", error);
      alert("질문 생성에 실패했습니다. 다시 시도해주세요.");
    }

    setIsGenerating(false);
  };

  const generateQuestions = async () => {
    if (!speaker.trim() || !listener.trim()) {
      alert("화자와 청자를 모두 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. 토큰 가져오기
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 2. API 키 가져오기
      const apiUrl =
        window.location.hostname === "localhost"
          ? "/api/config/openai-key"
          : "https://api.total-callbot.cloud/api/config/openai-key";

      const keyResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keyResponse.ok) {
        throw new Error(`API 키 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // 3. 스타일에 따른 프롬프트 설정
      const getStylePrompt = () => {
        switch (questionStyle) {
          case "일상":
            return "일상적이고 친근한 대화에서 나올 수 있는";
          case "비즈니스":
            return "비즈니스나 업무 상황에서 유용한 전문적이고 정중한";
          case "학술":
            return "학술적이고 교육적인 내용을 다루는 깊이 있는";
          case "역할":
            return `${speaker}와 ${listener}의 역할에 맞는 업무적이고 상황에 적절한`;
          default:
            return "자연스러운";
        }
      };

      // 4. OpenAI API 직접 호출
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `당신은 대화 질문 생성기입니다. ${speaker}(화자)가 ${listener}(청자)에게 물어볼 수 있는 ${getStylePrompt()} 대화 질문 ${questionCount}개를 생성하고, 각 질문에 대한 적절한 답변 2개를 만들어주세요.

${
  questionStyle === "역할"
    ? `[중요] 역할 기반 질문 생성 시 주의사항:
- ${speaker}와 ${listener}의 역할과 직업에 맞는 전문적인 질문을 생성하세요
- 개인적이고 사적인 질문(주말계획, 취미, 개인사, 연애, 가족 등)은 피하세요
- 업무, 서비스, 거래와 관련된 적절한 질문을 만드세요
- 고객-직원, 손님-점원 등의 관계에 맞는 예의바른 질문을 우선하세요
- 해당 업종에서 실제로 나올 수 있는 현실적인 질문을 만드세요`
    : ""
}

출력 형식:
Q1: [질문]
A1-1: [답변1]
A1-2: [답변2]

Q2: [질문]
A2-1: [답변1]
A2-2: [답변2]

...이런 식으로 Q${questionCount}까지 생성해주세요.`,
              },
            ],
            max_tokens: questionCount * 400,
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsedQuestions = parseGPTResponse(content, questionCount);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error("질문 생성 실패:", error);
      alert("질문 생성에 실패했습니다. 다시 시도해주세요.");
    }

    setIsGenerating(false);
  };

  const parseGPTResponse = (
    content: string,
    maxQuestions: number = 5,
  ): GeneratedQuestion[] => {
    const questions: GeneratedQuestion[] = [];
    const lines = content.split("\n").filter((line) => line.trim());

    let currentQuestion = "";
    let currentAnswers: string[] = [];
    let questionId = 1;

    for (const line of lines) {
      if (line.match(/^Q\d+:/)) {
        if (currentQuestion && currentAnswers.length === 2) {
          questions.push({
            id: `q-${questionId}`,
            question: currentQuestion,
            answers: [...currentAnswers],
          });
          questionId++;
        }
        currentQuestion = line.replace(/^Q\d+:\s*/, "");
        currentAnswers = [];
      } else if (line.match(/^A\d+-\d+:/)) {
        const answer = line.replace(/^A\d+-\d+:\s*/, "");
        if (currentAnswers.length < 2) {
          currentAnswers.push(answer);
        }
      }
    }

    // 마지막 질문 처리
    if (currentQuestion && currentAnswers.length === 2) {
      questions.push({
        id: `q-${questionId}`,
        question: currentQuestion,
        answers: [...currentAnswers],
      });
    }

    return questions.slice(0, maxQuestions);
  };

  const handlePlayQuestion = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    await playTTS(question.question);
  };

  const handlePlayAnswer = async (questionId: string, answerIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.answers[answerIndex]) return;

    await playTTS(question.answers[answerIndex]);
  };

  const playTTS = async (text: string) => {
    try {
      // 1. 토큰 가져오기
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 2. API 키 가져오기
      const apiUrl =
        window.location.hostname === "localhost"
          ? "/api/config/openai-key"
          : "https://api.total-callbot.cloud/api/config/openai-key";

      const keyResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keyResponse.ok) {
        throw new Error(`API 키 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // 3. 언어 감지 (한국어 vs 영어)
      const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

      // 4. OpenAI TTS API 직접 호출
      const ttsResponse = await fetch(
        "https://api.openai.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: text,
            voice: isKorean ? "nova" : "alloy",
            response_format: "mp3",
            speed: 1.0,
          }),
        },
      );

      if (!ttsResponse.ok) {
        throw new Error(`TTS API 요청 실패: ${ttsResponse.status}`);
      }

      // 5. 오디오 재생
      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS 재생 실패:", error);
    }
  };

  const handleTranslateQuestion = async (questionId: string) => {
    const key = `question-${questionId}`;
    const currentState = translatedTexts[key];

    if (currentState?.isTranslated) {
      // 이미 번역된 상태면 원본으로 되돌리기
      setTranslatedTexts((prev) => ({
        ...prev,
        [key]: { ...currentState, isTranslated: false },
      }));
    } else {
      // 번역하기
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      const translated = await translateText(question.question);
      if (translated) {
        setTranslatedTexts((prev) => ({
          ...prev,
          [key]: {
            translated,
            original: question.question,
            isTranslated: true,
          },
        }));
      }
    }
  };

  const handleTranslateAnswer = async (
    questionId: string,
    answerIndex: number,
  ) => {
    const key = `answer-${questionId}-${answerIndex}`;
    const currentState = translatedTexts[key];

    if (currentState?.isTranslated) {
      // 이미 번역된 상태면 원본으로 되돌리기
      setTranslatedTexts((prev) => ({
        ...prev,
        [key]: { ...currentState, isTranslated: false },
      }));
    } else {
      // 번역하기
      const question = questions.find((q) => q.id === questionId);
      if (!question || !question.answers[answerIndex]) return;

      const translated = await translateText(question.answers[answerIndex]);
      if (translated) {
        setTranslatedTexts((prev) => ({
          ...prev,
          [key]: {
            translated,
            original: question.answers[answerIndex],
            isTranslated: true,
          },
        }));
      }
    }
  };

  const translateText = async (text: string): Promise<string | null> => {
    try {
      // 1. 토큰 가져오기
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 2. API 키 가져오기
      const apiUrl =
        window.location.hostname === "localhost"
          ? "/api/config/openai-key"
          : "https://api.total-callbot.cloud/api/config/openai-key";

      const keyResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keyResponse.ok) {
        throw new Error(`API 키 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // 3. 언어 감지 및 번역
      const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
      const targetLang = isKorean ? "영어" : "한국어";

      // 4. OpenAI API로 번역
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `다음 텍스트를 ${targetLang}로 번역해주세요. 번역 결과만 출력하세요.`,
              },
              {
                role: "user",
                content: text,
              },
            ],
            max_tokens: 500,
            temperature: 0.3,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`번역 API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("번역 실패:", error);
      alert("번역에 실패했습니다.");
      return null;
    }
  };

  const handleSaveQuestion = (questionId: string) => {
    console.log("Save question:", questionId);
  };

  const handleSaveAnswer = (questionId: string, answerIndex: number) => {
    console.log("Save answer:", questionId, answerIndex);
  };

  const handleInputText = async (text: string, key: string) => {
    if (!onInputText) return;

    try {
      // 현재 번역 상태 확인
      const translationState = translatedTexts[key];
      let englishText = "";

      // 이미 번역된 상태이고 원본이 한국어라면 번역된 텍스트 사용
      if (
        translationState?.isTranslated &&
        /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(translationState.original)
      ) {
        englishText = translationState.translated;
      }
      // 원본이 이미 영어라면 그대로 사용
      else if (!/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
        englishText = text;
      }
      // 한국어라면 영어로 번역
      else {
        const translated = await translateText(text);
        englishText = translated || text;
      }

      // 영어 텍스트를 입력창에 입력하고 창 닫기
      onInputText(englishText);
      handleClose();
    } catch (error) {
      console.error("텍스트 입력 실패:", error);
      // 실패해도 원본 텍스트는 입력
      onInputText(text);
      handleClose();
    }
  };

  const resetForm = () => {
    setSpeaker("");
    setListener("");
    setQuestions([]);
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <motion.div
            className="absolute inset-0 bg-white md:rounded-t-xl md:top-auto md:bottom-0 md:h-[90vh] shadow-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">커스텀 질문 생성기</div>
              <button
                onClick={handleClose}
                className="p-2 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-7rem)]">
              {/* 질문 개수와 스타일 선택 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 개수 선택 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">개수:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          onClick={() =>
                            setQuestionCount(count as 1 | 2 | 3 | 4 | 5)
                          }
                          className={`px-2 py-1 text-xs border rounded transition-colors ${
                            questionCount === count
                              ? "border-slate-700 bg-slate-700 text-white"
                              : "border-slate-300 text-slate-600 hover:border-slate-400"
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 스타일 선택 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">스타일:</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setQuestionStyle("역할")}
                        className={`px-2 py-1 text-xs border rounded transition-colors ${
                          questionStyle === "역할"
                            ? "border-slate-700 bg-slate-700 text-white"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        역할
                      </button>
                      <button
                        onClick={() => setQuestionStyle("일상")}
                        className={`px-2 py-1 text-xs border rounded transition-colors ${
                          questionStyle === "일상"
                            ? "border-slate-700 bg-slate-700 text-white"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        일상
                      </button>
                      <button
                        onClick={() => setQuestionStyle("비즈니스")}
                        className={`px-2 py-1 text-xs border rounded transition-colors ${
                          questionStyle === "비즈니스"
                            ? "border-slate-700 bg-slate-700 text-white"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        비즈니스
                      </button>
                      <button
                        onClick={() => setQuestionStyle("학술")}
                        className={`px-2 py-1 text-xs border rounded transition-colors ${
                          questionStyle === "학술"
                            ? "border-slate-700 bg-slate-700 text-white"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        학술
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 현재 캐릭터 정보 및 질문 생성 */}
              {currentCharacter && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{currentCharacter.emoji}</span>
                    <div>
                      <div className="font-medium text-slate-900">
                        {currentCharacter.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        현재 선택된 캐릭터
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => generateCharacterQuestions()}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isGenerating
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-700 hover:bg-slate-800 text-white"
                    }`}
                  >
                    질문 생성
                  </button>
                </div>
              )}

              {/* 화자/청자 입력 (가로 배치) */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      화자 (Speaker)
                    </label>
                    <input
                      type="text"
                      value={speaker}
                      onChange={(e) => setSpeaker(e.target.value)}
                      placeholder="질문하는 사람"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      청자 (Listener)
                    </label>
                    <input
                      type="text"
                      value={listener}
                      onChange={(e) => setListener(e.target.value)}
                      placeholder="답변하는 사람"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* 생성 버튼 */}
                <button
                  onClick={generateQuestions}
                  disabled={isGenerating || !speaker.trim() || !listener.trim()}
                  className={`w-full py-3 rounded-md font-medium transition-colors ${
                    isGenerating
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-slate-700 hover:bg-slate-800 text-white"
                  }`}
                >
                  {isGenerating ? "질문 생성 중..." : "질문 생성하기"}
                </button>
              </div>

              {/* 로딩 스켈레톤 */}
              {isGenerating && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    질문 생성 중...
                  </h3>
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="border border-gray-200 rounded-lg p-3 space-y-2"
                    >
                      {/* 질문 스켈레톤 */}
                      <div className="bg-slate-50 rounded-md p-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-slate-300 rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-3 bg-slate-300 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-slate-300 rounded animate-pulse w-1/2"></div>
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-6 h-6 bg-slate-300 rounded animate-pulse"></div>
                            <div className="w-6 h-6 bg-slate-300 rounded animate-pulse"></div>
                            <div className="w-6 h-6 bg-slate-300 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* 답변 스켈레톤 */}
                      <div className="space-y-1">
                        {[...Array(2)].map((_, answerIndex) => (
                          <div
                            key={answerIndex}
                            className="bg-slate-50 rounded-md p-2"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 bg-slate-300 rounded-full animate-pulse"></div>
                              <div className="flex-1 space-y-1">
                                <div className="h-3 bg-slate-300 rounded animate-pulse w-5/6"></div>
                                <div className="h-3 bg-slate-300 rounded animate-pulse w-2/3"></div>
                              </div>
                              <div className="flex space-x-1">
                                <div className="w-6 h-6 bg-slate-300 rounded animate-pulse"></div>
                                <div className="w-6 h-6 bg-slate-300 rounded animate-pulse"></div>
                                <div className="w-6 h-6 bg-slate-300 rounded animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 생성된 질문들 */}
              {!isGenerating && questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    생성된 질문 ({questions.length}개)
                  </h3>

                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="border border-gray-200 rounded-lg p-3 space-y-2"
                    >
                      {/* 질문 */}
                      <div className="bg-blue-50 rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {speaker.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              {(() => {
                                const key = `question-${q.id}`;
                                const translationState = translatedTexts[key];

                                if (translationState?.isTranslated) {
                                  return (
                                    <div>
                                      <div className="text-blue-800 text-sm">
                                        {translationState.translated}
                                      </div>
                                      <div className="text-blue-500 text-xs mt-1 opacity-70">
                                        {translationState.original}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="text-blue-800 text-sm">
                                      {q.question}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1 ml-2">
                            <button
                              onClick={() => handlePlayQuestion(q.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="재생"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTranslateQuestion(q.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded text-sm"
                              title="번역"
                            >
                              🌐
                            </button>
                            <button
                              onClick={() => handleSaveQuestion(q.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded text-sm"
                              title="저장"
                            >
                              💾
                            </button>
                            <button
                              onClick={() => {
                                const question = questions.find(
                                  (qu) => qu.id === q.id,
                                );
                                if (question) {
                                  handleInputText(
                                    question.question,
                                    `question-${q.id}`,
                                  );
                                }
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded text-sm"
                              title="영어로 입력"
                            >
                              📝
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 답변들 */}
                      <div className="space-y-1">
                        {q.answers.map((answer, answerIndex) => (
                          <div
                            key={answerIndex}
                            className="bg-green-50 rounded-md p-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {listener.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  {(() => {
                                    const key = `answer-${q.id}-${answerIndex}`;
                                    const translationState =
                                      translatedTexts[key];

                                    if (translationState?.isTranslated) {
                                      return (
                                        <div>
                                          <div className="text-green-800 text-sm">
                                            {translationState.translated}
                                          </div>
                                          <div className="text-green-500 text-xs mt-1 opacity-70">
                                            {translationState.original}
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div className="text-green-800 text-sm">
                                          {answer}
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1 ml-2">
                                <button
                                  onClick={() =>
                                    handlePlayAnswer(q.id, answerIndex)
                                  }
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  title="재생"
                                >
                                  <PlayIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleTranslateAnswer(q.id, answerIndex)
                                  }
                                  className="p-1 text-green-600 hover:bg-green-100 rounded text-sm"
                                  title="번역"
                                >
                                  🌐
                                </button>
                                <button
                                  onClick={() =>
                                    handleSaveAnswer(q.id, answerIndex)
                                  }
                                  className="p-1 text-green-600 hover:bg-green-100 rounded text-sm"
                                  title="저장"
                                >
                                  💾
                                </button>
                                <button
                                  onClick={() => {
                                    const question = questions.find(
                                      (qu) => qu.id === q.id,
                                    );
                                    if (
                                      question &&
                                      question.answers[answerIndex]
                                    ) {
                                      handleInputText(
                                        question.answers[answerIndex],
                                        `answer-${q.id}-${answerIndex}`,
                                      );
                                    }
                                  }}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded text-sm"
                                  title="영어로 입력"
                                >
                                  📝
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
