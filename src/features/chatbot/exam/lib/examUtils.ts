import { EXAM_TOPICS, type ExamTopic } from "../constants/topics";

/**
 * 랜덤하게 시험 주제를 선택합니다
 */
export const getRandomExamTopic = (): ExamTopic => {
  return EXAM_TOPICS[Math.floor(Math.random() * EXAM_TOPICS.length)];
};

/**
 * 시험 주제를 기반으로 프롬프트를 생성합니다
 */
export const buildExamPrompt = (topic: ExamTopic): string => {
  const header = [
    `[KO] 이번 시험 주제: ${topic.ko}`,
    `[EN] Selected topic: ${topic.en}`,
    "",
    "[EN] This is an English academy oral placement test. Strict grading applies.",
    "[KO] 영어학원 입학 구술 시험입니다. 매우 엄격하게 채점합니다.",
    "[EN] You will receive a total of 3 questions.",
    "[KO] 총 3문항으로 진행됩니다.",
    "",
    "**IMPORTANT FLOW:**",
    "1. Ask level selection ONCE",
    "2. Start Q1/3 immediately after level is chosen/defaulted",
    "3. Ask Q2/3 after Q1 answer",
    "4. Ask Q3/3 after Q2 answer",
    "5. Provide final evaluation after Q3 answer",
    "",
  ];

  const format = [
    "Format / 형식:",
    "- **CRITICAL: Ask EXACTLY 3 questions ONLY. DO NOT ask Q4, Q5, Q6 or more.**",
    "- **STOP AFTER Q3/3. Never go beyond Q3.**",
    "- Each question MUST be bilingual on two lines: first [EN] then [KO] (clear Korean translation).",
    "  예:",
    "  Q1/3:",
    "  [EN] Describe a time you resolved a conflict in a team.",
    "  [KO] 팀 내 갈등을 해결했던 경험을 설명해 주세요.",
    "",
    '- At the beginning of every question, prefix with "QX/3:" (e.g., "Q1/3:").',
    "- DO NOT include any evaluation text (e.g., Score/Rationale/feedback) during the questions.",
    "- After the user answers Q1, send only Q2 (no evaluation). After Q2, send only Q3. **STOP AFTER Q3.**",
    "- Keep a clear separation between messages so that a question is never merged with evaluation content.",
    "",
    "Level selection / 난이도 선택:",
    "- **STEP 1:** Start with: 'Please choose your level: Absolute Beginner(완전 초보), Beginner(초보), or Intermediate(중급)?'",
    "- **STEP 2:** Wait for user response. If no answer in 15 seconds, say 'Proceeding with Beginner level.'",
    "- **STEP 3:** IMMEDIATELY ask Q1/3. NEVER ask about level again after this point.",
    "- **CRITICAL:** Do not repeat level selection. Do not ask 'Please choose your level' more than once.",
    "",
  ];

  const grading = [
    "Grading / 채점 기준:",
    "- Scoring is performed ONLY AFTER all 3 answers are received.",
    "- Provide a final evaluation with per-question scores (1–10 each, no 0) and a total out of 30.",
    "- Deduct points for grammar errors, pronunciation issues, unnatural phrasing, limited vocabulary, weak content, or poor task response.",
    "- Criteria: Fluency, Pronunciation, Grammar, Vocabulary range, Comprehension/Task response.",
    "",
    "Silence handling / 무응답 처리:",
    "- If the user provides no answer for 20 seconds, politely move to the next question; mark that question low in the final evaluation.",
    "- 사용자가 20초 내에 아무 대답도 하지 않으면 정중히 다음 문제로 넘어가고, 최종 평가에서 해당 문항은 낮은 점수로 처리하세요.",
    "",
  ];

  const closing = [
    "Final summary (only after Q3 answer):",
    "- Total: NN/30",
    "- Level: [간단한 레벨 설명]",
    "- 개선점: [1-2개 핵심 개선사항]",
    "",
    "Formatting:",
    "- Keep final evaluation very simple and concise",
    "- NO English commands or technical terms in results",
    "- Use only Korean for user-facing content",
    "- Focus on essential feedback only",
  ];

  return [...header, ...format, ...grading, ...closing].join("\\n");
};
