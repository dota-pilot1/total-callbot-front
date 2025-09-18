interface QuestionGenerationOptions {
  topic?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  language?: 'korean' | 'english';
}

interface GeneratedQuestion {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export class GPTQuestionService {
  private static readonly API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  // Keep references to avoid TS noUnusedLocals while mock is used
  static {
    void this.API_ENDPOINT;
    void this.buildPrompt;
  }

  static async generateQuestion(options: QuestionGenerationOptions): Promise<GeneratedQuestion> {
    try {
      // TODO: 실제 GPT API 호출 (현재는 mock)
      // const response = await this.callGPTAPI(prompt);

      // Mock 응답 (실제 구현 시 위 주석 해제하고 아래 제거)
      return this.getMockResponse(options);

    } catch (error) {
      console.error('GPT API Error:', error);
      throw new Error('문제 생성 중 오류가 발생했습니다.');
    }
  }

  private static buildPrompt(options: QuestionGenerationOptions): string {
    const difficultyMap = {
      BEGINNER: '초급 (기초적인)',
      INTERMEDIATE: '중급 (중간 수준의)',
      ADVANCED: '고급 (어려운)'
    };

    return `
당신은 영어 시험 문제 출제 전문가입니다. 다음 조건에 맞는 영어 듣기 문제를 JSON 형식으로 생성해주세요.

**조건:**
- 난이도: ${difficultyMap[options.difficulty]}
- 카테고리: ${options.category}
- 주제: ${options.topic || '일반적인 일상 대화'}

**출력 형식 (JSON):**
{
  "audioText": "영어 문장 (TTS로 읽힐 텍스트)",
  "questionContent": "한국어 문제 (예: 화자가 날씨에 대해 뭐라고 했나요?)",
  "optionA": "선택지 A",
  "optionB": "선택지 B",
  "optionC": "선택지 C",
  "optionD": "선택지 D",
  "correctAnswer": "A|B|C|D 중 정답",
  "explanation": "정답 해설 (선택사항)"
}

**주의사항:**
1. audioText는 자연스러운 영어 문장으로 작성
2. questionContent는 한국어로 명확한 질문
3. 4개 선택지 중 1개만 정답, 나머지는 그럴듯한 오답
4. 난이도에 맞는 어휘와 문법 사용
5. JSON 형식을 정확히 지켜주세요

지금 문제를 생성해주세요:
`;
  }

  // 실제 GPT API를 사용할 때는 위 buildPrompt를 이용해
  // API 호출 로직을 추가하세요.

  private static getMockResponse(options: QuestionGenerationOptions): GeneratedQuestion {
    // 난이도와 카테고리에 따른 mock 데이터
    const mockData: Record<string, GeneratedQuestion> = {
      'BEGINNER_listening': {
        audioText: "Good morning! How are you today?",
        questionContent: "화자가 인사할 때 뭐라고 말했나요?",
        optionA: "Good morning! How are you today?",
        optionB: "Good evening! How are you today?",
        optionC: "Good afternoon! How are you today?",
        optionD: "Good night! How are you today?",
        correctAnswer: "A",
        explanation: "화자가 'Good morning! How are you today?'라고 말했습니다."
      },
      'INTERMEDIATE_listening': {
        audioText: "I'm planning to visit the museum this weekend. Would you like to join me?",
        questionContent: "화자가 주말에 무엇을 할 계획이라고 했나요?",
        optionA: "영화관에 가기",
        optionB: "박물관에 가기",
        optionC: "공원에 가기",
        optionD: "쇼핑몰에 가기",
        correctAnswer: "B",
        explanation: "화자가 'visit the museum this weekend'라고 말했습니다."
      },
      'ADVANCED_listening': {
        audioText: "The economic implications of this policy could significantly impact the global market dynamics.",
        questionContent: "이 정책이 무엇에 영향을 줄 수 있다고 했나요?",
        optionA: "지역 경제에만",
        optionB: "개인 투자에만",
        optionC: "글로벌 시장 역학에",
        optionD: "국내 정치에만",
        correctAnswer: "C",
        explanation: "'global market dynamics'에 영향을 줄 수 있다고 했습니다."
      }
    };

    const key = `${options.difficulty}_${options.category}`;
    return mockData[key] || mockData['BEGINNER_listening'];
  }

  static async generateMultipleQuestions(
    options: QuestionGenerationOptions,
    count: number = 5
  ): Promise<GeneratedQuestion[]> {
    const promises = Array(count).fill(null).map(() => this.generateQuestion(options));
    return Promise.all(promises);
  }
}
