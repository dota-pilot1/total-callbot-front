/**
 * 공통 번역 유틸리티 - OpenAI API 사용
 */

export const translateWithOpenAI = async (
  text: string,
  targetLanguage: "ko" | "en" = "ko",
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    return targetLanguage === "ko" ? "[번역 불가]" : "[Translation unavailable]";
  }

  try {
    const translationPrompt = targetLanguage === "ko"
      ? `Translate this English text to Korean. Provide only the translation without any explanations: "${text}"`
      : `Translate this Korean text to English. Provide only the translation without any explanations: "${text}"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: translationPrompt }],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Translation API failed");
    }
  } catch (error) {
    console.error("번역 오류:", error);
    return targetLanguage === "ko" ? "[번역 오류]" : "[Translation error]";
  }
};

/**
 * 언어 감지 유틸리티
 */
export const detectLanguage = (text: string): "ko" | "en" => {
  // 한글이 포함되어 있으면 한국어로 판단
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  return koreanRegex.test(text) ? "ko" : "en";
};

/**
 * 자동 번역 (언어 감지 후 반대 언어로 번역)
 */
export const autoTranslate = async (text: string, apiKey?: string): Promise<string> => {
  const sourceLanguage = detectLanguage(text);
  const targetLanguage = sourceLanguage === "ko" ? "en" : "ko";
  return translateWithOpenAI(text, targetLanguage, apiKey);
};
