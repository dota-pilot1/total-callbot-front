export function getChatbotHomeRoute() {
  if (typeof window !== "undefined") {
    const isMobile =
      window.innerWidth <= 768 || /Mobi|Android/i.test(window.navigator.userAgent);
    return isMobile ? "/character-chatbot-mobile" : "/character-chatbot-web";
  }

  return "/character-chatbot-web";
}
