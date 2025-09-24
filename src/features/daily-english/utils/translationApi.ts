import { useAuthStore } from "../../auth";

/**
 * 영어 텍스트를 한국어로 번역하는 함수
 */
export async function translateToKorean(
  englishText: string,
): Promise<string | null> {
  if (!englishText.trim()) return null;

  try {
    const token = useAuthStore.getState().getAccessToken();

    // OpenAI API 키 가져오기
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

    // OpenAI API로 번역 요청
    const translateResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a professional translator. Translate the following English text to natural Korean. Provide only the translation result.",
            },
            {
              role: "user",
              content: englishText,
            },
          ],
          max_tokens: 150,
          temperature: 0.1,
        }),
      },
    );

    if (translateResponse.ok) {
      const result = await translateResponse.json();
      const translation = result.choices[0]?.message?.content?.trim();
      return translation || null;
    } else {
      throw new Error(`번역 API 요청 실패: ${translateResponse.status}`);
    }
  } catch (error) {
    console.error("번역 실패:", error);
    return null;
  }
}
