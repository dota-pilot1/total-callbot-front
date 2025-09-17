import { EXAM_TOPICS, type ExamTopic } from "../constants/topics";
import type { ExamCharacter } from "../examCharacters";

/**
 * 랜덤하게 시험 주제를 선택합니다
 */
export const getRandomExamTopic = (): ExamTopic => {
  return EXAM_TOPICS[Math.floor(Math.random() * EXAM_TOPICS.length)];
};

/**
 * 캐릭터별 1문제 시험용 프롬프트를 생성합니다
 */
export const buildSingleExamPromptForCharacter = (
  character: ExamCharacter,
): string => {
  const header = [
    `[KO] 시험 출제자: ${character.name}`,
    `[EN] Exam Character: ${character.name}`,
    "",
    `[EN] Character Role: ${character.prompt}`,
    "",
    "[EN] This is a quick English speaking test. Single question only.",
    "[KO] 빠른 영어 말하기 테스트입니다. 1문제만 출제됩니다.",
    "[EN] You will receive 1 question only.",
    "[KO] 1문항으로 진행됩니다.",
    "",
    "**IMPORTANT FLOW:**",
    "1. Start question immediately (NO level selection)",
    "2. Ask ONE question relevant to your character role",
    "3. Provide evaluation after answer",
    "4. END session immediately",
    "",
  ];

  const format = [
    "Format / 형식:",
    "- **ABSOLUTE RULE: EXACTLY 1 QUESTION TOTAL**",
    "- **SEQUENCE: Question → Answer → FINAL EVALUATION (NO MORE QUESTIONS)**",
    "- **STOP CONDITION: After answer is received, provide final evaluation and STOP**",
    "",
    "- Question MUST be bilingual on two lines: first [EN] then [KO] (clear Korean translation).",
    "  예:",
    "  [EN] Tell me about your programming experience.",
    "  [KO] 프로그래밍 경험에 대해 말해주세요.",
    "",
    "- DO NOT use question numbers or prefixes (no Q1/1, no numbering).",
    "- DO NOT ask about difficulty level - proceed with intermediate level directly.",
    "- Question should match your character role and specialty.",
    "- After answer: FINAL EVALUATION ONLY.",
    "- **CRITICAL: This is the ONLY question. Do NOT ask follow-up questions.**",
    "",
  ];

  const characterSpecific = [
    `Character-specific instructions for ${character.name}:`,
    `- Your question style: ${character.questionStyle}`,
    `- Your role description: ${character.description}`,
    "- Ask a question that matches your character's expertise and context",
    "- Stay in character throughout the interaction",
    "",
  ];

  const grading = [
    "Grading / 채점 기준:",
    "- **IMPORTANT: Scoring is performed AFTER the single answer is received.**",
    "- **NO EVALUATION during question - only ask the single question**",
    "- Provide final evaluation with score out of 10.",
    "- Criteria: Fluency, Pronunciation, Grammar, Vocabulary range, Comprehension/Task response.",
    "- Consider how well the answer fits your character's context.",
    "",
    "Silence handling / 무응답 처리:",
    "- If the user provides no answer for 20 seconds, provide evaluation and end.",
    "",
  ];

  const closing = [
    "Final summary (ONLY after answer is received):",
    "- **TRIGGER: Provide this summary ONLY when you have received 1 answer**",
    "- **FORMAT: After answer → Final evaluation → IMMEDIATELY END SESSION**",
    "",
    "**REQUIRED FORMAT (간략하게):**",
    "- 점수: N/10",
    "- 한줄평: [간단한 한줄평가, 캐릭터 관점에서]",
    "",
    "**SESSION TERMINATION:**",
    "- After providing final evaluation, END the conversation IMMEDIATELY",
    "- **END WITH: '테스트 완료' and STOP all responses**",
  ];

  return [
    ...header,
    ...format,
    ...characterSpecific,
    ...grading,
    ...closing,
  ].join("\\n");
};

/**
 * 1문제 시험용 프롬프트를 생성합니다 (질문 수준 생략, 바로 진행) - 레거시 버전
 */
export const buildSingleExamPrompt = (topic: ExamTopic): string => {
  const header = [
    `[KO] 이번 시험 주제: ${topic.ko}`,
    `[EN] Selected topic: ${topic.en}`,
    "",
    "[EN] This is a quick English speaking test. Single question only.",
    "[KO] 빠른 영어 말하기 테스트입니다. 1문제만 출제됩니다.",
    "[EN] You will receive 1 question only.",
    "[KO] 1문항으로 진행됩니다.",
    "",
    "**IMPORTANT FLOW:**",
    "1. Start Q1/1 immediately (NO level selection)",
    "2. Provide evaluation after Q1 answer",
    "3. END session immediately",
    "",
  ];

  const format = [
    "Format / 형식:",
    "- **ABSOLUTE RULE: EXACTLY 1 QUESTION TOTAL**",
    "- **SEQUENCE: Question → Answer → FINAL EVALUATION (NO MORE QUESTIONS)**",
    "- **STOP CONDITION: After answer is received, provide final evaluation and STOP**",
    "",
    "- Question MUST be bilingual on two lines: first [EN] then [KO] (clear Korean translation).",
    "  예:",
    "  [EN] Tell me about yourself.",
    "  [KO] 자기소개를 해주세요.",
    "",
    "- DO NOT use question numbers or prefixes (no Q1/1, no numbering).",
    "- DO NOT ask about difficulty level - proceed with intermediate level directly.",
    "- After answer: FINAL EVALUATION ONLY.",
    "- **CRITICAL: This is the ONLY question. Do NOT ask follow-up questions.**",
    "",
  ];

  const grading = [
    "Grading / 채점 기준:",
    "- **IMPORTANT: Scoring is performed AFTER the single answer is received.**",
    "- **NO EVALUATION during question - only ask the single question**",
    "- Provide final evaluation with score out of 10.",
    "- Criteria: Fluency, Pronunciation, Grammar, Vocabulary range, Comprehension/Task response.",
    "",
    "Silence handling / 무응답 처리:",
    "- If the user provides no answer for 20 seconds, provide evaluation and end.",
    "",
  ];

  const closing = [
    "Final summary (ONLY after answer is received):",
    "- **TRIGGER: Provide this summary ONLY when you have received 1 answer**",
    "- **FORMAT: After answer → Final evaluation → IMMEDIATELY END SESSION**",
    "",
    "**REQUIRED FORMAT (간략하게):**",
    "- 점수: N/10",
    "- 한줄평: [간단한 한줄평가]",
    "",
    "**SESSION TERMINATION:**",
    "- After providing final evaluation, END the conversation IMMEDIATELY",
    "- **END WITH: '테스트 완료' and STOP all responses**",
  ];

  return [...header, ...format, ...grading, ...closing].join("\\n");
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
    "- **ABSOLUTE RULE: EXACTLY 3 QUESTIONS TOTAL - Q1/3, Q2/3, Q3/3**",
    "- **FORBIDDEN: Never ask Q4, Q5, Q6 or any question beyond Q3/3**",
    "- **SEQUENCE: Q1 → Answer → Q2 → Answer → Q3 → Answer → FINAL EVALUATION (NO MORE QUESTIONS)**",
    "- **STOP CONDITION: After Q3/3 answer is received, provide final evaluation and STOP**",
    "",
    "- Each question MUST be bilingual on two lines: first [EN] then [KO] (clear Korean translation).",
    "  예:",
    "  Q1/3:",
    "  [EN] Describe a time you resolved a conflict in a team.",
    "  [KO] 팀 내 갈등을 해결했던 경험을 설명해 주세요.",
    "",
    '- At the beginning of every question, prefix with "QX/3:" (e.g., "Q1/3:").',
    "- DO NOT include any evaluation text (e.g., Score/Rationale/feedback) during the questions.",
    "- After Q1 answer: send Q2/3 ONLY. After Q2 answer: send Q3/3 ONLY. After Q3 answer: FINAL EVALUATION ONLY.",
    "- **CRITICAL: Q3/3 is the LAST question. Do NOT repeat Q3. Do NOT ask Q4.**",
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
    "- **IMPORTANT: Scoring is performed ONLY AFTER all 3 answers (Q1, Q2, Q3) are received.**",
    "- **COUNT CHECK: You must have exactly 3 answers before providing evaluation.**",
    "- **NO EVALUATION during questions - only ask Q1/3, Q2/3, Q3/3 sequentially**",
    "- Provide final evaluation with total score out of 30.",
    "- Deduct points for grammar errors, pronunciation issues, unnatural phrasing, limited vocabulary, weak content, or poor task response.",
    "- Criteria: Fluency, Pronunciation, Grammar, Vocabulary range, Comprehension/Task response.",
    "",
    "Silence handling / 무응답 처리:",
    "- If the user provides no answer for 20 seconds, politely move to the next question; mark that question low in the final evaluation.",
    "- **REMINDER: After Q3/3 answer (or timeout), provide FINAL EVALUATION and STOP. Do NOT ask more questions.**",
    "",
  ];

  const closing = [
    "Final summary (ONLY after Q3/3 answer is received):",
    "- **TRIGGER: Provide this summary ONLY when you have received 3 answers total**",
    "- **FORMAT: After Q3/3 answer → Final evaluation → IMMEDIATELY END SESSION**",
    "",
    "**REQUIRED FORMAT:**",
    "- Total: NN/30",
    "- Level: [간단한 레벨 설명]",
    "- 개선점: [1-2개 핵심 개선사항]",
    "",
    "**공부할 영어 문장:**",
    "- [시험에서 나온 질문의 영어 문장들을 정확히 나열]",
    "- [예: 'Describe a time you resolved a conflict in a team.']",
    "- [예: 'What are your strengths and weaknesses?']",
    "",
    "**유용한 영어 표현:**",
    "- [답변에 도움이 될 영어 패턴과 표현들]",
    "- [예: 'I have experience in...', 'One of my strengths is...']",
    "- [예: 'In my previous job...', 'I learned that...']",
    "",
    "**SESSION TERMINATION:**",
    "- After providing final evaluation, END the conversation IMMEDIATELY",
    "- Do NOT respond to any further user input",
    "- Do NOT ask follow-up questions",
    "- Do NOT provide additional explanations",
    "- Do NOT repeat any questions",
    "- **EXAM IS COMPLETE - TERMINATE SESSION**",
    "",
    "Formatting:",
    "- Keep final evaluation simple and well-structured",
    "- NO English commands or technical terms in results",
    "- Use only Korean for evaluation content",
    "- **END WITH: '시험이 완료되었습니다.' and STOP all responses**",
  ];

  return [...header, ...format, ...grading, ...closing].join("\\n");
};
