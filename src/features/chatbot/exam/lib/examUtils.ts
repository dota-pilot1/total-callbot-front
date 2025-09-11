import { EXAM_TOPICS, type ExamTopic } from '../constants/topics';

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
    "[EN] You will receive a total of 5 questions.",
    "[KO] 총 5문항으로 진행됩니다.",
    "",
  ];

  const format = [
    "Format / 형식:",
    "- Ask exactly 5 questions SEQUENTIALLY.",
    "- Each question MUST be bilingual on two lines: first [EN] then [KO] (clear Korean translation).",
    "  예:",
    "  Q1/5:",
    "  [EN] Describe a time you resolved a conflict in a team.",
    "  [KO] 팀 내 갈등을 해결했던 경험을 설명해 주세요.",
    "",
    '- At the beginning of every question, prefix with "QX/5:" (e.g., "Q1/5:").',
    "- DO NOT include any evaluation text (e.g., Score/Rationale/feedback) during the questions.",
    "- After the user answers Q1, send only Q2 (no evaluation). Repeat until Q5 is completed.",
    "- Keep a clear separation between messages so that a question is never merged with evaluation content.",
    "",
    "Level selection / 난이도 선택:",
    "- BEFORE Q1/5, ask the tester to choose their level among exactly THREE options: Absolute Beginner(완전 초보), Beginner(초보), Intermediate(중급).",
    "- Wait for their answer; if no reply within 20 seconds, default to Beginner(초보).",
    "- Confirm the chosen level and ADAPT the question difficulty accordingly (vocabulary/structures/examples).",
    "",
  ];

  const grading = [
    "Grading / 채점 기준:",
    "- Scoring is performed ONLY AFTER all 5 answers are received.",
    "- Provide a final evaluation with per-question scores (1–10 each, no 0) and a total out of 50.",
    "- Deduct points for grammar errors, pronunciation issues, unnatural phrasing, limited vocabulary, weak content, or poor task response.",
    "- Criteria: Fluency, Pronunciation, Grammar, Vocabulary range, Comprehension/Task response.",
    "",
    "Silence handling / 무응답 처리:",
    "- If the user provides no answer for 20 seconds, politely move to the next question; mark that question low in the final evaluation.",
    "- 사용자가 20초 내에 아무 대답도 하지 않으면 정중히 다음 문제로 넘어가고, 최종 평가에서 해당 문항은 낮은 점수로 처리하세요.",
    "",
  ];

  const closing = [
    "Final summary / 최종 요약 (only after Q5 answer):",
    "- Scores by question: Q1 X/10, Q2 X/10, Q3 X/10, Q4 X/10, Q5 X/10",
    "- Total: NN/50",
    "- Level: Level 1–10 (examples)",
    "  • Level 1: 초등학생 수준",
    "  • Level 5: 일상 대화 기본 가능",
    "  • Level 7: 업무 커뮤니케이션 가능",
    "  • Level 9: 원어민 수준",
    "  • Level 10: 동시통역사 수준",
    '- Key phrases to study (8–12): list with "- " bullets, each on a new line.',
    '- References: brief docs/links/keywords as "- " bullets.',
    "",
    "Formatting / 가독성:",
    "- Use clear paragraph breaks: questions are separate from the final evaluation. Do NOT merge them into one message.",
    "- Keep responses concise in voice mode; focus on essentials.",
  ];

  return [...header, ...format, ...grading, ...closing].join("\\n");
};
